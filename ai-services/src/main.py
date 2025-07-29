import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.ai_services import ai_bp
from src.routes.swiss_data import swiss_bp
from src.routes.tco_calculator import tco_bp
from src.routes.customer_insights import insights_bp
from config import config

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = config.app.secret_key

# Enable CORS for all routes
CORS(app, origins=config.app.cors_origins, supports_credentials=True)

# Register blueprints
app.register_blueprint(ai_bp, url_prefix='/api/ai')
app.register_blueprint(swiss_bp, url_prefix='/api/swiss')
app.register_blueprint(tco_bp, url_prefix='/api/tco')
app.register_blueprint(insights_bp, url_prefix='/api/insights')

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
with app.app_context():
    db.create_all()

@app.route('/health')
def health_check():
    return {
        'status': 'healthy',
        'service': 'CADILLAC EV CIS AI Services',
        'version': '1.0.0'
    }

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return {
                'message': 'CADILLAC EV CIS AI Services API',
                'endpoints': [
                    '/api/ai/*',
                    '/api/swiss/*',
                    '/api/tco/*',
                    '/api/insights/*',
                    '/health'
                ]
            }

if __name__ == '__main__':
    app.run(
        host=config.app.host, 
        port=config.app.port, 
        debug=config.app.debug
    )

