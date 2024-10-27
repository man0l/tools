from flask_migrate import Migrate
from flask import Flask
from app import app, db

migrate = Migrate(app, db)

if __name__ == '__main__':
    app.run()
