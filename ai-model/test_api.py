import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print("🧪 Health Check:", response.json())
    except Exception as e:
        print(f"❌ Health check failed: {e}")

def test_model_info():
    """Test model info endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/model-info")
        print("🔧 Model Info:", response.json())
    except Exception as e:
        print(f"❌ Model info failed: {e}")

def test_prediction():
    """Test prediction endpoint"""
    sample_data = {
        "temp_max": 20.5,
        "temp_min": 10.1,
        "precip": 0.5,
        "rain": 1.0,
        "snowfall": 0.0,
        "humidity": 75.0,
        "windspeed": 5.5,
        "pressure": 1012,
        "cloud_cover": 50,
        "elevation": 150,
        "season": 2
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json=sample_data,
            headers={'Content-Type': 'application/json'}
        )
        print("🎯 Prediction Test:", response.json())
    except Exception as e:
        print(f"❌ Prediction test failed: {e}")

def test_invalid_data():
    """Test with invalid data"""
    invalid_data = {
        "temp_max": "invalid",  # Wrong data type
        "temp_min": 10.1,
        "precip": 0.5,
        "rain": 1.0,
        "snowfall": 0.0,
        "humidity": 75.0,
        # Missing other fields
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json=invalid_data,
            headers={'Content-Type': 'application/json'}
        )
        print("🚫 Invalid Data Test:", response.json())
    except Exception as e:
        print(f"❌ Invalid data test failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting API tests...\n")
    
    test_health()
    print()
    
    test_model_info() 
    print()
    
    test_prediction()
    print()
    
    test_invalid_data()