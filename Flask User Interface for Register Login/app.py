from flask import Flask, render_template, url_for, redirect, request, flash
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Email
from flask_login import UserMixin, login_user, LoginManager
from flask_bcrypt import Bcrypt
from datetime import datetime, timezone


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'RegisterLogin'
bcrypt = Bcrypt(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

db = SQLAlchemy(app) # Creates all tables from db.Model

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key= True)
    email = db.Column(db.String(90), nullable=False, unique=True)
    username = db.Column(db.String(30),  nullable=False, unique=True)
    password = db.Column(db.String(90), nullable=False)
    is_lecturer= db.Column(db.Boolean(), default=False)

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), nullable=False)
    question = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=False)
    date_posted = db.Column(db.DateTime, default=datetime.now(timezone.utc))

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), nullable=False)
    question = db.relationship('Question', backref=db.backref('comments', lazy=True))
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    comment = db.Column(db.Text, nullable=False)
    date_posted = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    

class QuestionForm(FlaskForm): #Used FlaskForm to create the text box for Question
    email = StringField('Email', validators=[DataRequired(), Email()])
    question = StringField('Question', validators=[DataRequired()])
    description = TextAreaField('Description', validators=[DataRequired()])
    submit = SubmitField('Submit')

class CommentForm(FlaskForm): #Used FlaskForm to create the text box for Comment
    email = StringField('Email', validators=[DataRequired(), Email()])
    comment = TextAreaField('Comment', validators=[DataRequired()])
    submit = SubmitField('Submit')


with app.app_context():
    db.create_all()

@app.route('/register', methods=['GET', 'POST']) #leading to register page after click localhost5000/register
def register():
    message = "Please enter your details to create an account."
    
    if request.method == 'POST':
        email = request.form.get('email')
        username = request.form.get('username')
        password = request.form.get('psw')
        password_reconfirm = request.form.get('psw-reconfirm')
        
        email_split = email.split('@') #split email to get domain
        domain = email_split[1]
        if domain!="mmu.edu.my" and domain!="student.mmu.edu.my":
            message = 'Not MMU Email'
            return render_template('register.html',message=message)
        
        if password != password_reconfirm: #password and password reconfirm must be same
            message = 'Passwords do not match!'
            return render_template('register.html', message=message)

        existing_user_email = User.query.filter_by(email=email).first() # If user is already register, message is displayed
        existing_user_username = User.query.filter_by(username=username).first()
        if existing_user_email or existing_user_username:
            message = 'Username or email already exists!'
            return render_template('register.html', message=message)

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')#make the password hasshed
        if(domain=="mmu.edu.my"):
            new_user = User(email=email, username=username, password=hashed_password, is_lecturer=True)
        else:
            new_user = User(email=email, username=username, password=hashed_password)

        db.session.add(new_user)
        db.session.commit()

        return redirect(url_for('login'))#redirect from register to login page

    return render_template('register.html', message=message)

@app.route('/lecturerforum', methods=['GET', 'POST'])
def lecturerforum():
    form = CommentForm()
    questions = Question.query.all()
    if form.validate_on_submit():
        question_id = request.form.get('question_id')
        if question_id:
            comment = Comment(email=form.email.data, comment=form.comment.data, question_id=question_id)
            db.session.add(comment)
            db.session.commit()
            flash('Your comment has been posted!', 'success')
        else:
            flash('Failed to post comment. Question ID missing.', 'danger')
        return redirect(url_for('lecturerforum'))
    return render_template('lecturerforum.html', form=form, questions=questions)

@app.route('/studentforum', methods=['GET', 'POST'])
def studentforum():
    form = QuestionForm()
    if form.validate_on_submit():
        question = Question(email=form.email.data, question=form.question.data, description=form.description.data)
        db.session.add(question)
        db.session.commit()
        flash('Your question has been posted!', 'success')
        return redirect(url_for('studentforum'))
    questions = Question.query.all()
    return render_template('studentforum.html', form=form, questions=questions)

@app.route('/question_forum')
def question_forum():
    questions = Question.query.all()
    return render_template('question_forum.html', questions=questions)

@app.route('/help_forum/<int:question_id>', methods=['GET', 'POST'])
def help_forum(question_id):
    question = Question.query.get_or_404(question_id)
    form = CommentForm()
    if form.validate_on_submit():
        comment = Comment(email=form.email.data, comment=form.comment.data, question_id=question.id)
        db.session.add(comment)
        db.session.commit()
        flash('Your comment has been posted!', 'success')
        return redirect(url_for('help_forum', question_id=question.id))
    comments = Comment.query.filter_by(question_id=question.id).all()
    return render_template('help_forum.html', question=question, comments=comments, form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    message = "Please enter your login details."
    
    if request.method == 'POST':
        username_email = request.form.get('username_email')
        password = request.form.get('psw')
        
        user = User.query.filter((User.username == username_email) | (User.email == username_email)).first()
        
        if user and bcrypt.check_password_hash(user.password, password):
            login_user(user)
            if user.is_lecturer==True:
                return redirect(url_for('lecturerforum')) #redirect to lecturerforum
            else :
                return redirect(url_for('studentforum')) #redirect to studentforum
        else:
            message = 'Invalid username/email or password!'
            return render_template('login.html', message=message)
    
    return render_template('login.html', message=message)

if __name__ == '__main__': #running the localhost5000 for Register and Login
    app.run(debug=True)
