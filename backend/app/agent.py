from openai import OpenAI
import os
from dotenv import load_dotenv
from app.project_manager import save_project_files

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_project(task_description: str, language: str) -> tuple[str, str]:
    prompt = (
        f"You are a professional {language} developer. "
        f"Create a full project for this task:\n\n"
        f"{task_description}\n\n"
        "Split the code into multiple files.\n"
        "Format response as:\n"
        "### filename.extension\n"
        "<code>\n"
        "### filename.extension\n"
        "<code>\n\n"
        "Important: no explanations, only the code blocks."
    )

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )

    content = response.choices[0].message.content
    project_name = save_project_files(content)
    return project_name, content
