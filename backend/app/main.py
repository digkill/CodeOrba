from fastapi import FastAPI
from app.agent_code import generate_code
from app.git_manager import save_code_to_git
from app.models import CodeRequest, CodeResponse, ProjectRequest, ProjectResponse
from app.agent import generate_project


from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import glob
import os

app = FastAPI()

# Добавляем CORS-мидлвар
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Dev Agent is alive!"}


@app.post("/generate", response_model=CodeResponse)
async def generate_code_endpoint(request: CodeRequest):
    code = generate_code(request.task_description, request.language)
    file_path = save_code_to_git(code, request.language, request.commit_message)
    return CodeResponse(code=code, file_path=file_path)


@app.post("/generate_project", response_model=ProjectResponse)
async def generate_project_endpoint(request: ProjectRequest):
    project_name = generate_project(request.task_description, request.language)
    return ProjectResponse(project_name=project_name)


@app.get("/files")
async def list_generated_files():
    files = glob.glob(os.path.join(os.getenv("GIT_REPO_PATH"), "*"))
    return [{"filename": os.path.basename(f)} for f in files]


@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(os.getenv("GIT_REPO_PATH"), filename)
    if os.path.exists(file_path):
        return FileResponse(path=file_path, filename=filename, media_type='application/octet-stream')
    return {"error": "File not found"}
