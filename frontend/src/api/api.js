import axios from "axios";

const API_URL = "http://127.0.0.1:8000"; // замени если нужно на свой бекенд

export const generateProject = async (taskDescription, language) => {
  const response = await axios.post(`${API_URL}/generate_project`, {
    task_description: taskDescription,
    language: language,
  });
  return response.data;
};

export const getProjectById = async (projectId) => {
  const response = await axios.get(`${API_URL}/project/${projectId}`);
  return response.data;
};

export const saveProjectFiles = async (projectId, files) => {
  await axios.post(`${API_URL}/save_project/${projectId}`, { files });
};

export const downloadProject = async (projectId) => {
  const response = await axios.get(`${API_URL}/download_project/${projectId}`, {
    responseType: "blob",
  });
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${projectId}.zip`;
  a.click();
  window.URL.revokeObjectURL(url);
};
