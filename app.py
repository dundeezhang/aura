from flask import Flask, render_template, url_for, request, redirect, jsonify
import os
from dotenv import load_dotenv
from openai import OpenAI

app = Flask(__name__)
load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)

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
        store=False,
        messages=[
            {
            "role": "user", 
            "content": f"Write {name} an email replying to {reply_to} with a {tone} tone. Output only the reply email, do not include a subject."
            }
        ]
    )
    return completion.choices[0].message.content

def gen_post(name, link, technologies, purpose, other_information, github):
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        store=False,
        messages=[
            {
            "role": "user", 
            "content": f"Write a linkedin post with emojis for a project called: {name}. The purpose of the project is {purpose}, and it was built with {technologies}. Other information about the project is that: {other_information}. If there is a link, it would be found here: {link}. If there is a github repository, it is: {github}."
            }
        ]
    )
    return completion.choices[0].message.content

# Default image URL
current_image_url = "./static/images/tempimage.jpg"

@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html")

@app.route("/signature", methods=["GET", "POST"])
def signature_page():
    return render_template("signature.html", image_url=current_image_url)

@app.route("/update-image", methods=["POST"])
def update_image():
    global current_image_url
    sig_name = request.form.get("name")
    new_url = gen_signature(sig_name)
        
    return jsonify({"success": True, "new_url": new_url})

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

if __name__ == "__main__":
    app.run(debug=True)

    