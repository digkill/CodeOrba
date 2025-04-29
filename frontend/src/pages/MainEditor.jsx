import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaskForm from "../components/TaskForm";
import CodeEditor from "../components/CodeEditor";
import FileList from "../components/FileList";
import { toast } from "react-hot-toast";

export default function MainEditor() {
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState(null);
  const iframeRef = useRef(null);
  const navigate = useNavigate();

  const handleProjectGenerated = ({ files }) => {
    const normalizedFiles = Array.isArray(files)
      ? Object.fromEntries(files.map(file => [file.filename, file.content]))
      : files;

    setFiles(normalizedFiles);

    const firstFile = Object.keys(normalizedFiles)[0];
    if (firstFile) {
      setActiveFile(firstFile);
    }

    localStorage.setItem("sandbox-files", JSON.stringify(normalizedFiles));
    toast.success("✅ Проект успешно сгенерирован!");
  };

  const handleFileChange = (filename, newCode) => {
    setFiles(prevFiles => {
      const updated = { ...prevFiles, [filename]: newCode };
      localStorage.setItem("sandbox-files", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRunProject = () => {
    if (Object.keys(files).length === 0) {
      toast.error("😥 Нет файлов для запуска");
      return;
    }

    const transformed = transformToReactViteProject(files);
    localStorage.setItem("sandbox-files", JSON.stringify(transformed));
    navigate("/sandbox");
  };

  const generatePreviewHTML = () => {
    const html = files["index.html"] || "<h1>Файл index.html не найден</h1>";
    const css = files["style.css"] || "";
    const js = files["script.js"] || "";

    let libraries = "";
    if (html.includes("react") || js.includes("React")) {
      libraries += `
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
      `;
    }
    if (html.includes("vue") || js.includes("Vue")) {
      libraries += `<script src="https://unpkg.com/vue@3"></script>`;
    }

    const consoleScript = `
      <script>
        (function() {
          const oldLog = console.log;
          console.log = function(...args) {
            parent.postMessage({ source: 'iframe', type: 'log', args }, '*');
            oldLog.apply(console, args);
          };
          const oldError = console.error;
          console.error = function(...args) {
            parent.postMessage({ source: 'iframe', type: 'error', args }, '*');
            oldError.apply(console, args);
          };
        })();
      </script>
    `;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Preview</title>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        ${libraries}
        ${consoleScript}
        <script>${js}</script>
      </body>
      </html>
    `;
  };

  useEffect(() => {
    if (Object.keys(files).length > 0) {
      const timeout = setTimeout(() => {
        const iframe = iframeRef.current;
        if (iframe) {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (doc) {
            doc.open();
            doc.write(generatePreviewHTML());
            doc.close();
          }
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [files]);

  useEffect(() => {
    const handleMessage = event => {
      if (event.data?.source === "iframe") {
        if (event.data.type === "log") {
          console.log("[Preview]", ...event.data.args);
        } else if (event.data.type === "error") {
          console.error("[Preview Error]", ...event.data.args);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-dark text-white">
      <header className="bg-gray-900 p-6 text-center text-3xl font-extrabold shadow-md">
        CodeOrba 🛸 — AI Dev Sandbox
      </header>

      <main className="flex-1 flex flex-col md:flex-row p-4 gap-6">
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          {Object.keys(files).length === 0 ? (
            <TaskForm onProjectGenerated={handleProjectGenerated} />
          ) : (
            <>
              <FileList
                files={files}
                activeFile={activeFile}
                setActiveFile={setActiveFile}
              />
              <button
                onClick={handleRunProject}
                className="rounded-md bg-slate-800 py-2 px-4 text-sm text-white shadow-md hover:bg-slate-700 active:bg-slate-700 transition-all"
              >
                🚀 Запустить в Sandbox
              </button>
              <div className="mt-4 border rounded-xl overflow-hidden h-[500px]">
                <iframe
                  ref={iframeRef}
                  className="w-full h-full bg-white"
                  sandbox="allow-scripts allow-same-origin"
                  title="Live Preview"
                />
              </div>
            </>
          )}
        </div>

        <div className="w-full md:w-2/3 bg-gray-900 rounded-xl shadow-inner p-4">
          {activeFile ? (
            <CodeEditor
              filename={activeFile}
              code={files[activeFile]}
              onChange={newCode => handleFileChange(activeFile, newCode)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              📂 Выберите файл для редактирования
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function transformToReactViteProject(files) {
  const newFiles = { ...files };

  if (newFiles["app.js"]) {
    newFiles["src/main.jsx"] = `
import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div className="container">
      <h1>Hello from React</h1>
      <button onClick={() => alert("Clicked!")}>Click me</button>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
    `.trim();
    delete newFiles["app.js"];
  }

  newFiles["index.html"] = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>React App</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
  `.trim();

  newFiles["package.json"] = `
{
  "name": "react-sandbox",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^4.5.0",
    "@vitejs/plugin-react": "^4.1.0"
  }
}
  `.trim();

  newFiles["vite.config.js"] = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    host: true
  }
});
  `.trim();

  return newFiles;
}
