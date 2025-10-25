import json
import random
import uuid
from datetime import datetime, timedelta
from faker import Faker

# --- You may need to install faker: pip install Faker ---
fake = Faker()

# --- Configuration ---
NUM_USERS = 50
NUM_TRANSACTIONS = 200
OUTPUT_FILENAME = "transactions_with_footprints.json"
ANOMALY_RATE = 0.2 # 20% of transactions will be suspicious

# --- Realistic Data Pools ---
COUNTERPARTIES = [
    "crypto-exchange-alpha", "wallet-invest-zeta", "gaming-platform-x",
    "nft-marketplace-io", "offshore-svc-ltd", "darkweb-market-gamma"
]

# --- Main Functions ---

def create_user_profiles(num_users):
    """Creates a set of users, each with their own trusted devices and locations."""
    profiles = []
    for _ in range(num_users):
        profile = {
            "customer_id": f"user_{fake.user_name()}",
            "trusted_devices": [str(uuid.uuid4()) for _ in range(random.randint(1, 3))],
            "trusted_ips": [fake.ipv4() for _ in range(random.randint(1, 2))],
            "typical_amount_range": (100, 2500)
        }
        profiles.append(profile)
    return profiles

def generate_transactions(profiles, num_transactions):
    """Generates a list of transactions, including normal and anomalous ones."""
    transactions = []
    for i in range(num_transactions):
        user_profile = random.choice(profiles)
        is_anomaly = random.random() < ANOMALY_RATE

        # Base transaction details
        txn_id = f"TXN{uuid.uuid4().hex[:6].upper()}"
        timestamp = (datetime.now() - timedelta(minutes=random.randint(1, 60 * 24 * 7))).isoformat()
        counterparty = random.choice(COUNTERPARTIES)

        footprint = {}
        if not is_anomaly:
            # NORMAL TRANSACTION
            amount = round(random.uniform(*user_profile["typical_amount_range"]), 2)
            footprint = {
                "ip_address": random.choice(user_profile["trusted_ips"]),
                "user_agent": fake.user_agent(),
                "device_fingerprint_id": random.choice(user_profile["trusted_devices"]),
                "device_status": "Trusted Device",
                "ip_risk_score": random.randint(0, 10),
                "is_vpn": False
            }
        else:
            # ANOMALOUS TRANSACTION
            amount = round(random.uniform(5000, 25000), 2) # Unusually high amount
            footprint = {
                "ip_address": fake.ipv4(), # New, untrusted IP
                "user_agent": fake.user_agent(),
                "device_fingerprint_id": str(uuid.uuid4()), # New, untrusted device
                "device_status": "New Device",
                "ip_risk_score": random.randint(70, 100), # High risk IP
                "is_vpn": random.choice([True, False])
            }

        transaction = {
            "transaction_id": txn_id,
            "amount": amount,
            "currency": "USD",
            "transaction_date": timestamp,
            "customer_id": user_profile["customer_id"],
            "counterparty_name": counterparty,
            "digital_footprint": footprint
        }
        transactions.append(transaction)

    return transactions

if __name__ == "__main__":
    print("Generating fake user profiles...")
    user_profiles = create_user_profiles(NUM_USERS)

    print(f"Generating {NUM_TRANSACTIONS} fake transactions...")
    all_transactions = generate_transactions(user_profiles, NUM_TRANSACTIONS)

    with open(OUTPUT_FILENAME, 'w') as f:
        json.dump(all_transactions, f, indent=2)

    print(f"\n✅ Success! Fake data has been written to '{OUTPUT_FILENAME}'")