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

# Default image URL
current_image_url = "./static/images/tempimage.jpg"

@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html", image_url=current_image_url)

@app.route("/update-image", methods=["POST"])
def update_image():
    global current_image_url
    sig_name = request.form.get("name")
    new_url = gen_signature(sig_name)
        
    return jsonify({"success": True, "new_url": new_url})     

if __name__ == "__main__":
    app.run(debug=True)

    