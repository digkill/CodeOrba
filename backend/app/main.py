from fastapi import FastAPI, HTTPException
from app.models import CodeRequest, CodeResponse, ProjectRequest, ProjectResponse
from app.agent import generate_project
from app.project_manager import save_project_files, load_project
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


@app.post("/generate_project")
async def generate_project_endpoint(request: ProjectRequest):
    try:
        project_name, generated_code = generate_project(request.task_description, request.language)
        return {
            "project_name": project_name,
            "generated_code": generated_code
        }
    except Exception as e:
        return {"error": str(e)}


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

@app.post("/generate_project")
async def generate_project_endpoint(request: ProjectRequest):
    try:
        project_id = generate_project(request.task_description, request.language)
        return {"project_id": project_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sandbox/{project_id}")
async def get_project(project_id: str):
    project = load_project(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    return project