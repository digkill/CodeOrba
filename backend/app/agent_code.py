import os
from dotenv import load_dotenv
from openai import OpenAI
from app.project_manager import save_project_files

# Загружаем переменные окружения
load_dotenv()

# Инициализируем клиента OpenAI
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_project(task_description: str, language: str) -> tuple[str, str]:
    """
    Генерирует проект на основе описания задачи и языка программирования.

    :param task_description: Описание задачи
    :param language: Язык программирования
    :return: Название созданного проекта
    """
    prompt = (
        f"You are a professional {language} developer.\n"
        f"Create a full project for this task:\n\n"
        f"{task_description}\n\n"
        "Split the code into multiple files.\n"
        "Format response strictly as:\n"
        "### filename.extension\n"
        "<code>\n"
        "### filename.extension\n"
        "<code>\n\n"
        "Important: no explanations, only the code blocks. No comments, no additional text."
    )

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )

        content = response.choices[0].message.content
        project_name = save_project_files(content)
        return project_name, content

    except Exception as e:
        print(f"❌ Ошибка при генерации проекта: {e}")
        raise
