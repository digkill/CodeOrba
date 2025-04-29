import uuid
import json
import os
import re

SANDBOX_DIR = "./sandbox_projects"

def parse_code_blocks(content: str) -> dict:
    """
    Парсит текст OpenAI в структуру { filename: code }
    """
    files = {}
    blocks = re.split(r"###\s+", content)
    for block in blocks:
        if not block.strip():
            continue
        lines = block.strip().splitlines()
        filename = lines[0].strip()
        code = "\n".join(lines[1:])
        files[filename] = code
    return files

def save_project_files(content: str) -> str:
    """
    Сохраняет проект: отдельные файлы + ID проекта
    """
    if not os.path.exists(SANDBOX_DIR):
        os.makedirs(SANDBOX_DIR)

    project_id = str(uuid.uuid4())
    files = parse_code_blocks(content)

    project_path = os.path.join(SANDBOX_DIR, f"{project_id}.json")
    with open(project_path, "w", encoding="utf-8") as f:
        json.dump({
            "project_id": project_id,
            "files": files
        }, f, indent=2, ensure_ascii=False)

    return project_id

def load_project(project_id: str) -> dict:
    """
    Загружает проект по ID
    """
    project_path = os.path.join(SANDBOX_DIR, f"{project_id}.json")
    if not os.path.exists(project_path):
        return None

    with open(project_path, "r", encoding="utf-8") as f:
        return json.load(f)
