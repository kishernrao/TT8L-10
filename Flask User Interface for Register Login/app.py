from flask import Flask, render_template

app = Flask(__name__)

@app.route('/register') #leading to register page after click localhost5000/register
def register():
    return render_template('register.html')

@app.route('/login') #leading to login page after click localhost5000/login
def login():
    return render_template('login.html')

if __name__ == '__main__': #running the localhost5000 for Register and Login
    app.run(debug=True)
