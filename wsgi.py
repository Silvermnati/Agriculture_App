import os
from server import create_app

# Get configuration from environment
config_name = os.environ.get('FLASK_CONFIG', 'production')
app = create_app(config_name)

if __name__ == '__main__':
    app.run()