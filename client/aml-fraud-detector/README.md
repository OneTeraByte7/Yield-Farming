# AML Fraud Detector

Complete Anti-Money Laundering (AML) fraud detection system with ML-powered analysis and AI insights.

## Structure

```
aml-fraud-detector/
├── backend/              # FastAPI Python backend
│   ├── main.py          # Main API server
│   ├── fake_data_generator.py
│   ├── requirements.txt # Python dependencies
│   └── .env            # Environment variables
├── frontend/            # Vanilla JS frontend
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   └── bg-dotted-vector-3-BeHbXC8Q.svg
├── database/           # SQLite database
│   └── aml.db
└── data/               # Sample data
    └── transactions_with_footprints.json
```

## Backend Deployment (Render.com)

### Prerequisites
- Python 3.9+
- OpenAI API Key

### Render Configuration

1. **Root Directory:**
   ```
   client/aml-fraud-detector/backend
   ```

2. **Build Command:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start Command:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

4. **Python Version:**
   - Specified in `runtime.txt` (Python 3.11.9)

5. **Environment Variables:**
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
     ```
     https://yield-farming-flax-projects.vercel.app,https://yield-farming-flax.vercel.app,http://localhost:5173,http://localhost:5174
     ```

### Local Development

1. Navigate to backend folder:
   ```bash
   cd client/aml-fraud-detector/backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create .env file:
   ```env
   OPENAI_API_KEY=your_api_key_here
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
   ```

5. Run server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

6. Access at: http://localhost:8000

## Frontend Integration

The React client integrates this via `src/pages/AMLFraudDetector.tsx`.

### API Endpoint Configuration

In `client/.env`:
```env
VITE_AML_API_URL=https://yield-aml-detector.onrender.com
```

For local development:
```env
VITE_AML_API_URL=http://localhost:8000
```

## Features

- **Transaction Analysis**: Upload CSV/JSON files for batch analysis
- **ML Anomaly Detection**: Isolation Forest algorithm
- **AI Deep Analysis**: GPT-4o-mini powered risk assessment
- **Risk Scoring**: 0-100 risk scores with categorization
- **Real-time Monitoring**: Dashboard with transaction overview
- **Alert System**: High/Medium/Low risk alerts

## API Endpoints

- `POST /analyze-transactions/` - Upload and analyze transactions
- `GET /transactions/` - Retrieve all analyzed transactions
- `GET /` - Serve frontend (standalone mode)
- `GET /{file_name:path}` - Serve static assets

## Database Schema

SQLite database with transactions table:
- transaction_id (unique)
- amount, currency
- transaction_date
- customer_id, counterparty_name
- risk_score (0-100)
- risk_level (high/medium/low)
- flags (JSON array)
- ai_analysis (text)

## Deployment Checklist

- [ ] Backend deployed on Render.com
- [ ] `OPENAI_API_KEY` environment variable set
- [ ] `ALLOWED_ORIGINS` includes your Vercel domain
- [ ] Root directory set to `client/aml-fraud-detector/backend`
- [ ] Client `.env` has correct `VITE_AML_API_URL`
- [ ] Database directory is writable (Render persistent disk)
