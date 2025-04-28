import os
import git
from datetime import datetime

REPO_PATH = os.getenv("GIT_REPO_PATH", "./repo")

def save_code_to_git(code: str, language: str, commit_message: str) -> str:
    if not os.path.exists(REPO_PATH):
        os.makedirs(REPO_PATH)
        repo = git.Repo.init(REPO_PATH)
    else:
        repo = git.Repo(REPO_PATH)

    # Initial commit если пусто
    if not repo.head.is_valid():
        dummy_file = os.path.join(REPO_PATH, ".init")
        with open(dummy_file, "w") as f:
            f.write("initial commit")
        repo.git.add(".init")
        repo.index.commit("Initial commit")

    # Определяем расширение файла
    ext = {
        "python": "py",
        "javascript": "js",
        "go": "go"
    }.get(language.lower(), "txt")

    filename = f"generated_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{ext}"
    filepath = os.path.join(REPO_PATH, filename)

    # Сохраняем код
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(code)

    # 🛠 ВАЖНО: только имя файла, без папки
    repo.git.add(filename)
    repo.index.commit(commit_message or f"Generated {filename}")

    return filepath
