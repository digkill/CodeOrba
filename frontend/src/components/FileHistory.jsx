import { useEffect, useState } from "react";
import { getFiles, downloadFile } from "../services/api";

export default function FileHistory() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const { data } = await getFiles();
    setFiles(data);
  };

  const handleDownload = async (filename) => {
    const response = await downloadFile(filename);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Generated Files</h2>
      <ul className="space-y-3">
        {files.map((file) => (
          <li key={file.filename} className="flex justify-between items-center bg-white p-3 rounded-lg shadow">
            <span>{file.filename}</span>
            <button onClick={() => handleDownload(file.filename)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Download
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
