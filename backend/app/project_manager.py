import os
import re
import git
from datetime import datetime

BASE_DIR = os.getenv("GIT_REPO_PATH", "./generated_projects")

def clean_code_block(code_block: str) -> str:
    """Удаляет ```язык и ``` вокруг кода."""
    lines = code_block.strip().splitlines()

    if lines and lines[0].startswith("```"):
        lines = lines[1:]

    if lines and lines[-1].strip() == "```":
        lines = lines[:-1]

    return "\n".join(lines).strip()

def save_project_files(response_text: str) -> str:
    if not os.path.exists(BASE_DIR):
        os.makedirs(BASE_DIR)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    project_name = f"project_{timestamp}"
    project_path = os.path.join(BASE_DIR, project_name)
    os.makedirs(project_path)

    if response_text.startswith('```') and response_text.endswith('```'):
        trimmed_response_text = response_text[3:-3]
    else:
        trimmed_response_text = response_text

    # Парсим файлы
    files = re.split(r'###\s+', trimmed_response_text)
    for file_block in files:
        if not file_block.strip():
            continue

        lines = file_block.strip().split('\n')
        filename = lines[0].strip()
        code_block = '\n'.join(lines[1:])
        cleaned_code = clean_code_block(code_block)

        filepath = os.path.join(project_path, filename)

        # 🛠 Создаём папки, если нужно
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(cleaned_code)

    # Инициализация Git
    repo = git.Repo.init(project_path)
    repo.git.add(all=True)
    repo.index.commit("Initial commit: generated project")

    return project_name
