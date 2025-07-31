from flask import Flask

app = Flask(__name__)

if __name__ == '__main__':
    # Run the Flask application
    app.run(host='0.0.0.0', port=5001, debug=True)