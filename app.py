from flask import Flask, render_template, url_for, request, redirect
import os
from dotenv import load_dotenv
from openai import OpenAI

app = Flask(__name__)
load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)

def gen_page(resume_text):
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        store=True,
        messages=[
            {
            "role": "user", 
            "content": f"Write an HTML webpage with zero CSS that takes in this following resume text and turns the contents into a webpage. Make all headings h3 tags and all subheading content into tables. Bold the first row of the table and label it accordingly. Do not hallucinate: {resume_text}. Make the table widths fit the width of the content and do not use a custom font. Output in only HTML without the markdown tags. Make the skills and interests and similar sections have the first column as the subtitle name and the second column be the contents, all still in the same table. DO NOT HAVE ANY CSS. DO NOT INCLUDE THE MARKDOWN TAGS."
            }
        ]
    )
    return completion.choices[0].message.content

@app.route("/", methods=['POST', 'GET'])
def index():
    if request.method == 'POST':
        resume_content = request.form['content']
        page = gen_page(resume_content)
        
        return render_template("index.html", page=page)
    else:
        return render_template("index.html", page=None)

if __name__ == "__main__":
    app.run(debug=True)