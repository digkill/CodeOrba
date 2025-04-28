from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_code(task_description: str, language: str) -> str:
    prompt = f"You are a senior {language} developer. Write clean, production-ready code for the following task:\n\n{task_description}\n\nInclude comments and structure the code properly."

    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )

    return response.choices[0].message.content
