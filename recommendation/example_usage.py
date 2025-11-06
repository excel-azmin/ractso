"""
Example usage script for the Post Recommendation API
This script demonstrates how to use the recommendation API endpoints
"""

import requests
import json

# API base URL
BASE_URL = "http://localhost:8000"

def health_check():
    """Check if the API is running"""
    response = requests.get(f"{BASE_URL}/health")
    print("Health Check:", json.dumps(response.json(), indent=2))

def train_model(epochs=10, batch_size=1024, embedding_dim=32):
    """Train the recommendation model"""
    print("\n=== Training Model ===")
    payload = {
        "epochs": epochs,
        "batch_size": batch_size,
        "embedding_dim": embedding_dim
    }
    response = requests.post(
        f"{BASE_URL}/api/v1/train",
        json=payload
    )
    print("Training Response:", json.dumps(response.json(), indent=2))
    return response.json()

def get_model_status():
    """Get model status"""
    print("\n=== Model Status ===")
    response = requests.get(f"{BASE_URL}/api/v1/model/status")
    print("Status:", json.dumps(response.json(), indent=2))
    return response.json()

def get_recommendations(user_id, limit=10):
    """Get recommendations for a user"""
    print(f"\n=== Getting Recommendations for User: {user_id} ===")
    response = requests.get(
        f"{BASE_URL}/api/v1/recommendations/{user_id}",
        params={"limit": limit}
    )
    print("Recommendations:", json.dumps(response.json(), indent=2))
    return response.json()

def get_batch_recommendations(user_ids, limit=10):
    """Get recommendations for multiple users"""
    print(f"\n=== Getting Batch Recommendations ===")
    payload = {
        "user_ids": user_ids,
        "limit": limit
    }
    response = requests.post(
        f"{BASE_URL}/api/v1/recommendations/batch",
        json=payload
    )
    print("Batch Recommendations:", json.dumps(response.json(), indent=2))
    return response.json()

if __name__ == "__main__":
    # Example usage flow
    
    # 1. Check health
    try:
        health_check()
    except requests.exceptions.ConnectionError:
        print("Error: API server is not running. Please start it with: python app.py")
        exit(1)
    
    # 2. Check model status
    status = get_model_status()
    
    # 3. Train model if not loaded
    if not status.get('data', {}).get('model_loaded'):
        print("\nModel not loaded. Training model...")
        train_model(epochs=5, batch_size=512, embedding_dim=32)
    
    # 4. Get recommendations (replace with actual user_id from your database)
    # user_id = "your_user_id_here"
    # get_recommendations(user_id, limit=10)
    
    # 5. Get batch recommendations
    # user_ids = ["user1", "user2", "user3"]
    # get_batch_recommendations(user_ids, limit=10)

