# main.py - UPDATED WITH DUPLICATE HANDLING

import os
import json
import uuid
from datetime import datetime
import pandas as pd
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List, Dict, Any
from dotenv import load_dotenv
import asyncio

from sqlalchemy import create_engine, Column, String, Integer, Float, Text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

from sklearn.ensemble import IsolationForest
from pydantic import BaseModel, ConfigDict # <-- Import ConfigDict
from openai import AsyncOpenAI

# --- Setup (Database, etc.) ---
DATABASE_URL = "sqlite:///../database/aml.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DBTransaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, index=True)
    amount = Column(Float)
    currency = Column(String, default="USD")
    transaction_date = Column(String)
    customer_id = Column(String, default="Unknown")
    counterparty_name = Column(String, default="N/A")
    risk_score = Column(Integer)
    risk_level = Column(String)
    flags = Column(Text)
    ai_analysis = Column(Text)

Base.metadata.create_all(bind=engine)

class Transaction(BaseModel):
    # This resolves the 'orm_mode' warning
    model_config = ConfigDict(from_attributes=True)
    
    transaction_id: str; amount: float; currency: str; transaction_date: str
    customer_id: str; counterparty_name: str; risk_score: int
    risk_level: str; flags: List[str]; ai_analysis: str

# --- OpenAI & ML Model Setup (Same as before) ---
load_dotenv()
client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
anomaly_model = IsolationForest(contamination=0.1, random_state=42)
is_model_trained = False

def train_initial_model(db: Session):
    global is_model_trained
    print("Attempting to train anomaly detection model...")
    normal_transactions = db.query(DBTransaction).filter(DBTransaction.risk_level.in_(['low', 'medium'])).all()
    if len(normal_transactions) < 50:
        print("Not enough data to train model. Will use rule-based approach.")
        is_model_trained = False
        return
    df = pd.DataFrame([tx.__dict__ for tx in normal_transactions])
    features = df[['amount']]
    anomaly_model.fit(features)
    is_model_trained = True
    print(f"✅ Model trained successfully on {len(normal_transactions)} transactions.")

# In main.py, replace the existing function with this one

async def analyze_high_risk_with_ai(transactions_to_check: List[Dict]) -> Dict[str, Any]:
    """Sends only high-risk transactions to OpenAI for deep analysis."""
    if not transactions_to_check:
        return {}

    # --- THIS PROMPT IS NOW CORRECTED ---
    system_prompt = """
    You are an expert Anti-Money Laundering (AML) analyst. Analyze each transaction in the provided list.
    Your response MUST be a single, valid JSON object. The main key should be "analyses",
    which contains an array of objects. Each object must correspond to an input transaction and include:
    - "transaction_id": The original transaction_id.
    - "risk_score": An integer from 0 to 100, boosting the original score if suspicious.
    - "reasoning": A brief, clear explanation for the score.
    """
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(transactions_to_check, indent=2)}
            ],
            response_format={"type": "json_object"}
        )
        response_data = json.loads(response.choices[0].message.content)
        # Convert list of analyses to a dictionary for easy lookup
        return {item['transaction_id']: item for item in response_data.get('analyses', [])}
    except Exception as e:
        print(f"Error during OpenAI API call: {e}")
        return {}

# --- FastAPI App & Endpoints ---
app = FastAPI()

# Get allowed origins from environment variable
allowed_origins_str = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")]

# Add wildcard pattern for all Vercel preview deployments
allowed_origins_patterns = [
    r"^https://yield-farming.*\.vercel\.app$"
]

def is_origin_allowed(origin: str) -> bool:
    """Check if origin is allowed using exact match or regex pattern"""
    if origin in allowed_origins:
        return True
    import re
    for pattern in allowed_origins_patterns:
        if re.match(pattern, origin):
            return True
    return False

# Configure CORS with dynamic origin checking
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Base list
    allow_origin_regex=r"^https://yield-farming.*\.vercel\.app$",  # Pattern for all Vercel deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    train_initial_model(db)
    db.close()

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# Get current directory for serving static files
current_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dir = os.path.join(os.path.dirname(current_dir), "frontend")

@app.post("/analyze-transactions/", response_model=List[Transaction])
async def create_upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    raw_transactions = json.loads(contents)
    
    # --- FIX: FETCH EXISTING IDS FIRST ---
    existing_ids_query = db.query(DBTransaction.transaction_id).all()
    existing_ids = {result[0] for result in existing_ids_query}
    print(f"Found {len(existing_ids)} existing transactions in the database.")

    # Filter out transactions that already exist
    new_raw_transactions = [tx for tx in raw_transactions if tx.get('transaction_id') not in existing_ids]
    
    if not new_raw_transactions:
        print("No new transactions to process in this file.")
        return []

    print(f"Processing {len(new_raw_transactions)} new transactions...")
    new_df = pd.DataFrame(new_raw_transactions)

    high_risk_candidates = []
    initial_analysis = {}

    for index, tx_data in enumerate(new_raw_transactions):
        tx_id = tx_data.get('transaction_id', str(uuid.uuid4()))
        amount = tx_data.get('amount', 0)
        risk_score = min(int(amount * 0.005), 100) if amount < 15000 else 90
        flags = []
        if risk_score > 75: flags.append("High Amount Flag")
        
        is_anomaly = False
        if is_model_trained and 'amount' in new_df.columns:
            prediction = anomaly_model.predict(new_df.iloc[[index]][['amount']])
            if prediction[0] == -1:
                is_anomaly = True
                flags.append("ML Anomaly Detected")
                risk_score = min(risk_score + 15, 100)

        initial_analysis[tx_id] = {"risk_score": risk_score, "flags": flags, "data": tx_data}
        if is_anomaly or risk_score > 85:
             high_risk_candidates.append({
                 "transaction_id": tx_id, "amount": amount,
                 "customer_id": tx_data.get("customer_id"),
                 "counterparty_name": tx_data.get("counterparty_name")
             })

    print(f"Sending {len(high_risk_candidates)} transactions to OpenAI for deep analysis...")
    deep_analyses = await analyze_high_risk_with_ai(high_risk_candidates)
    print("Deep analysis complete.")

    final_results = []
    for tx_id, analysis_data in initial_analysis.items():
        if tx_id in deep_analyses:
            deep_info = deep_analyses[tx_id]
            final_score = deep_info['risk_score']
            final_reasoning = deep_info['reasoning']
            analysis_data['flags'].append("Deep AI Analyzed")
        else:
            final_score = analysis_data['risk_score']
            final_reasoning = "Standard transaction, passed initial checks."
        
        risk_level = 'high' if final_score >= 75 else 'medium' if final_score >= 40 else 'low'
        tx_data = analysis_data['data']

        validated_tx = Transaction(
            transaction_id=tx_id, amount=tx_data.get('amount', 0),
            currency=tx_data.get('currency', 'USD'),
            transaction_date=tx_data.get('transaction_date', datetime.now().isoformat()),
            customer_id=tx_data.get('customer_id', 'Unknown'),
            counterparty_name=tx_data.get('counterparty_name', 'N/A'),
            risk_score=final_score, risk_level=risk_level,
            flags=analysis_data['flags'], ai_analysis=final_reasoning
        )
        db_tx = DBTransaction(**validated_tx.dict(exclude={'flags'}), flags=json.dumps(validated_tx.flags))
        db.add(db_tx)
        final_results.append(validated_tx)

    db.commit()
    return final_results
# In main.py, REPLACE the old read_transactions function with this one

@app.get("/transactions/", response_model=List[Transaction])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieves all transactions from the database, correctly handling data types.
    """
    transactions_db = db.query(DBTransaction).order_by(DBTransaction.id.desc()).offset(skip).limit(limit).all()
    
    results = []
    for tx_from_db in transactions_db:
        # --- THIS IS THE FIX ---
        # Manually create the Pydantic object and convert the flags string to a list first.
        
        flags_list = json.loads(tx_from_db.flags) # Convert string '[]' to list []

        validated_tx = Transaction(
            transaction_id=tx_from_db.transaction_id,
            amount=tx_from_db.amount,
            currency=tx_from_db.currency,
            transaction_date=tx_from_db.transaction_date,
            customer_id=tx_from_db.customer_id,
            counterparty_name=tx_from_db.counterparty_name,
            risk_score=tx_from_db.risk_score,
            risk_level=tx_from_db.risk_level,
            flags=flags_list, # Use the converted list
            ai_analysis=tx_from_db.ai_analysis
        )
        results.append(validated_tx)

    return results

# --- Static File Serving (MUST BE LAST) ---
# These routes should be defined last to avoid conflicts with API routes

@app.get("/")
async def read_root():
    """Serve the main HTML page"""
    index_path = os.path.join(frontend_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "AML Fraud Detector API is running", "status": "ok"}

@app.get("/{file_name:path}")
async def serve_static_file(file_name: str):
    """Serve static files like CSS, JS, SVG (catch-all route)"""
    # Only serve specific file extensions to prevent security issues
    allowed_extensions = ['.js', '.css', '.svg', '.png', '.jpg', '.jpeg', '.ico', '.woff', '.woff2', '.ttf', '.json']

    if not any(file_name.endswith(ext) for ext in allowed_extensions):
        raise HTTPException(status_code=404, detail="File not found")

    file_path = os.path.join(frontend_dir, file_name)

    # Security check: prevent directory traversal
    if not os.path.abspath(file_path).startswith(os.path.abspath(frontend_dir)):
        raise HTTPException(status_code=403, detail="Access denied")

    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)

    raise HTTPException(status_code=404, detail="File not found")