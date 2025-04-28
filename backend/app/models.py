from pydantic import BaseModel

class CodeRequest(BaseModel):
    task_description: str
    language: str
    commit_message: str

class CodeResponse(BaseModel):
    code: str
    file_path: str

from pydantic import BaseModel

class ProjectRequest(BaseModel):
    task_description: str
    language: str

class ProjectResponse(BaseModel):
    project_name: str
