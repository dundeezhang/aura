from flask import Flask, render_template, url_for, request, redirect, make_response, session, abort, jsonify
import requests
import secrets
from functools import wraps
import firebase_admin
from firebase_admin import credentials, firestore, auth
from datetime import timedelta
import os
from dotenv import load_dotenv
from openai import OpenAI

app = Flask(__name__)
load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)

# firebase
app.secret_key = os.getenv('SECRET_KEY')

# Configure session cookie settings
app.config['SESSION_COOKIE_SECURE'] = True  # Ensure cookies are sent over HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent JavaScript access to cookies
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)  # Adjust session expiration as needed
app.config['SESSION_REFRESH_EACH_REQUEST'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Can be 'Strict', 'Lax', or 'None'


# Firebase Admin SDK setup
cred = credentials.Certificate("firebase-auth.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def gen_signature(sig_name):
    completion = client.images.generate(
        model="dall-e-3",
        prompt=f"I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: Generate a signature for this name: {sig_name}. Write it in a cursive-like font. Display on a plain white background with NO decoration, no stationery, ONLY TEXT IN THE ReSULT.",
        size="1024x1024",
        quality="standard",
        n=1,
    )
    return completion.data[0].url

def gen_page(resume_text):
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        store=False,
        messages=[
            {
            "role": "user", 
            "content": f"Convert this resume: {resume_text} (END OF RESUME) to HTML with zero CSS that takes in this following resume text and turns the contents into a webpage. DO NOT HAVE ANY MARKDOWN. Make all headings h3 tags and all subheading content into tables. Bold the first row of the table and label it accordingly. Do not hallucinate: . Make the table widths fit the width of the content and do not use a custom font. Output in only HTML without the markdown tags. Make the skills and interests and similar sections have the first column as the subtitle name and the second column be the contents, all still in the same table. DO NOT HAVE ANY CSS. Output without the ```HTML and ``` at the start and end of the output."
            }
        ]
    )
    return completion.choices[0].message.content

def gen_email(reply_to, tone, name):
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        store=True,
        messages=[
            {
            "role": "user", 
            "content": f"Write me an email replying to {reply_to} with a {tone} tone. My name is {name}. Output only the reply email, do not include a subject. Add a <br /> tag after the greeting. Add another <br /> tag before and after the farewell."
            }
        ]
    )
    return completion.choices[0].message.content

def gen_post(name, link, technologies, purpose, other_information, github):
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        store=True,
        messages=[
            {
            "role": "user", 
            "content": f"Write a linkedin post with emojis for a project called: {name}. The purpose of the project is {purpose}, and it was built with {technologies}. Other information about the project is that: {other_information}. If there is a link, it would be found here: {link}. If there is a github repository, it is: {github}."
            }
        ]
    )
    return completion.choices[0].message.content

def gen_cover(resume, job_title, company, job_description, other_info):
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        store=True,
        messages=[
            {
            "role": "user", 
            "content": f"Write a cover letter for this job title: {job_title} with this resume: {resume}. Company name is {company}, and the job description is {job_description}. The company name and job description might not be given, so in that case, write the cover letter with just the resume and job title. Other information may be included here: {other_info}. Do not hallucinate. Do not exaggerate. DO NOT INCLUDE THE HEADER. Output in markdown. Keep it within 500 words. Begin with 'Dear Hiring Manager,' and end off with, 'Warm Regards, my name.' Always put a new line after the greeting and a new line before the salutation."
            }
        ]
    )
    return completion.choices[0].message.content


# Decorator for routes that require authentication
def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if user is authenticated
        if 'user' not in session:
            return redirect(url_for('login'))
        
        else:
            return f(*args, **kwargs)
        
    return decorated_function


@app.route('/auth', methods=['POST'])
def authorize():
    token = request.headers.get('Authorization')
    if not token or not token.startswith('Bearer '):
        return "Unauthorized", 401

    token = token[7:]  # Strip off 'Bearer ' to get the actual token

    try:
        decoded_token = auth.verify_id_token(token, check_revoked=True, clock_skew_seconds=60) # Validate token here
        session['user'] = decoded_token # Add user to session
        return redirect(url_for('signature_page'))
    
    except:
        return "Unauthorized", 401

@app.route('/login')
def login():
    if 'user' in session:
        return redirect(url_for('signature_page'))
    else:
        return render_template('login.html')

@app.route('/signup')
def signup():
    if 'user' in session:
        return redirect(url_for('signature_page'))
    else:
        return render_template('signup.html')


@app.route('/reset-password')
def reset_password():
    if 'user' in session:
        return redirect(url_for('signature_page'))
    else:
        return render_template('forgot_password.html')
    
@app.route('/logout')
def logout():
    session.pop('user', None)  # Remove the user from session
    response = make_response(redirect(url_for('login')))
    response.set_cookie('session', '', expires=0)  # Optionally clear the session cookie
    return response

# Default image URL
current_image_url = "./static/images/trans.png"

@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html")

@app.route("/signature", methods=["GET", "POST"])
@auth_required
def signature_page():
    return render_template("signature.html", image_url=current_image_url)

import requests
from flask import request, jsonify

@app.route("/update-image", methods=["POST"])
def update_image():
    # Get reCAPTCHA response from the form
    recaptcha_response = request.form.get('g-recaptcha-response')
    
    # Replace with your actual secret key obtained from the reCAPTCHA admin console
    secret_key = ''

    # Verify the CAPTCHA by sending a request to Google's reCAPTCHA verification endpoint
    payload = {
        'secret': secret_key,
        'response': recaptcha_response
    }
    verify_url = "https://www.google.com/recaptcha/api/siteverify"
    response = requests.post(verify_url, data=payload)
    result = response.json()

    # Check if the CAPTCHA verification was successful
    if result.get('success'):
        # CAPTCHA passed, proceed with generating the signature
        sig_name = request.form.get("name")
        new_url = gen_signature(sig_name)
        
        return jsonify({"success": True, "new_url": new_url})
    else:
        # CAPTCHA failed
        return jsonify({"success": False, "error": "CAPTCHA verification failed. Please try again."})


@app.route("/webgen", methods=['POST', 'GET'])
def web_gen():
    if request.method == 'POST':
        resume_content = request.form['content']
        page = gen_page(resume_content)
        
        return render_template("webgen.html", page=page)
    else:
        return render_template("webgen.html", page=None)
    
@app.route("/linkedingen", methods=['POST', 'GET'])
def linkedin_gen():
    # name, link, technologies, purpose, other_information
    if request.method == 'POST':
        project_link = request.form['project-link'] or "NONE"
        github = request.form['github'] or "NONE"
        tech = request.form['tech']
        project = request.form['project']
        purpose = request.form['purpose']
        other_info = request.form['other-information'] or "NONE"
        result = gen_post(project, project_link, tech, purpose, other_info, github)
        
        return render_template("linkedingen.html", result=result)
    else:
        return render_template("linkedingen.html", result=None)
    
@app.route("/emailgen", methods=['POST', 'GET'])
def email_gen():
    # reply_to, tone, name
    if request.method == 'POST':
        old_email = request.form['old-email']
        tone = request.form['tone']
        name = request.form['name']
        result = gen_email(old_email, tone, name)
        
        return render_template("emailgen.html", result=result)
    else:
        return render_template("emailgen.html", result=None)

@app.route("/covergen", methods=['POST', 'GET'])
def cover_gen():
    # resume, job_title, company, job_description
    if request.method == 'POST':
        resume = request.form['resume']
        job_title = request.form['job-title']
        company = request.form['company'] or "NONE"
        job_description = request.form['job-description'] or "NONE"
        other_info = request.form['other-information'] or "NONE"
        result = gen_cover(resume, job_title, company, job_description, other_info)
        
        return render_template("covergen.html", result=result)
    else:
        return render_template("covergen.html", result=None)
    
if __name__ == "__main__":
    app.run(debug=True)

    
