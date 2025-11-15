from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import logging
from config import Config

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variable to store the model
model = None

def load_model():
    """Load the ML model from PKL file"""
    global model
    try:
        with open(Config.MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        logger.info("✅ Model loaded successfully!")
        return True
    except Exception as e:
        logger.error(f"❌ Error loading model: {str(e)}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Check if API and model are working"""
    model_status = "loaded" if model is not None else "not loaded"
    return jsonify({
        'status': 'healthy', 
        'message': 'Flood Prediction API is running',
        'model_status': model_status
    })

@app.route('/predict', methods=['POST'])
def predict_flood():
    """Main prediction endpoint"""
    try:
        # Check if model is loaded
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500

        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Extract features in exact order
        features = [
            float(data['temp_max']),
            float(data['temp_min']), 
            float(data['precip']),
            float(data['rain']),
            float(data['snowfall']),
            float(data['humidity']),
            float(data['windspeed']),
            float(data['pressure']),
            float(data['cloud_cover']),
            float(data['elevation']),
            float(data['season'])
        ]

        # Convert to numpy array and make prediction
        input_array = np.array([features])
        
        # Check if model has predict_proba (classification) or predict (regression)
        if hasattr(model, 'predict_proba'):
            # Classification model - get probability
            prediction = model.predict(input_array)[0]
            probability = model.predict_proba(input_array)[0][1]
            
            # Determine risk level
            if probability > 0.8:
                risk_level = "veryHigh"
            elif probability > 0.5:
                risk_level = "high" 
            elif probability > 0.3:
                risk_level = "moderate"
            else:
                risk_level = "Low"
                
            result = {
                'prediction': int(prediction),
                'probability': float(probability),
                'risk_level': risk_level,
                'message': 'Flood predicted' if prediction == 1 else 'No flood predicted'
            }
        else:
            # Regression model - direct prediction
            prediction = model.predict(input_array)[0]
            result = {
                'prediction': float(prediction),
                'message': 'Flood risk score'
            }

        logger.info(f"✅ Prediction made: {result}")
        return jsonify(result)

    except KeyError as e:
        error_field = str(e).strip("'")
        return jsonify({'error': f'Missing field: {error_field}'}), 400
    except ValueError as e:
        return jsonify({'error': f'Invalid data type: {str(e)}'}), 400
    except Exception as e:
        logger.error(f"❌ Prediction error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    model_type = type(model).__name__
    model_features = getattr(model, 'n_features_in_', 'Unknown')
    
    return jsonify({
        'model_type': model_type,
        'features_count': model_features,
        'input_format': {
            'temp_max': 'float',
            'temp_min': 'float', 
            'precip': 'float',
            'rain': 'float',
            'snowfall': 'float',
            'humidity': 'float',
            'windspeed': 'float',
            'pressure': 'float',
            'cloud_cover': 'float',
            'elevation': 'float',
            'season': 'float (0-3)'
        }
    })

# Load model when module is imported
load_model()

if __name__ == '__main__':
    # Check if model loaded successfully
    if model is not None:
        logger.info("🚀 Starting Flood Prediction API...")
        app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
    else:
        logger.error("❌ Failed to load model. Cannot start API.")