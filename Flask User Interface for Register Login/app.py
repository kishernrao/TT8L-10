from flask import Flask, render_template, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'RegisterLogin' 

db = SQLAlchemy(app)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key= True)
    email = db.Column(db.String(90), nullable=False, unique=True)
    username = db.Column(db.String(30),  nullable=False, unique=True)
    password = db.Column(db.String(90), nullable=False)
    is_lecturer= db.Column(db.Boolean(), default=False)



# Creates all tables from db.Model
with app.app_context():
    db.create_all()

@app.route('/register') #leading to register page after click localhost5000/register
def register():
    return render_template('register.html')


@app.route('/login') #leading to login page after click localhost5000/login
def login():
    return render_template('login.html')

if __name__ == '__main__': #running the localhost5000 for Register and Login
    app.run(debug=True)
