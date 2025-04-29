import { useState, useRef, useEffect } from "react";
import TaskForm from "./components/TaskForm";
import CodeEditor from "./components/CodeEditor";
import FileList from "./components/FileList";
import { Toaster, toast } from "react-hot-toast";
import { WebContainer } from "@webcontainer/api";

export default function App() {
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [webcontainer, setWebcontainer] = useState(null);
  const [status, setStatus] = useState("Ready");

  const iframeRef = useRef(null);

  // Автоматически стартуем WebContainer при генерации проекта
  const handleProjectGenerated = async ({ files }) => {
    const normalizedFiles = Array.isArray(files)
      ? Object.fromEntries(files.map(file => [file.filename, file.content]))
      : files;

    setFiles(normalizedFiles);

    const firstFile = Object.keys(normalizedFiles)[0];
    if (firstFile) setActiveFile(firstFile);

    toast.success("✅ Project generated successfully!");

    setStatus("🚀 Booting WebContainer...");
    const instance = await WebContainer.boot();
    setWebcontainer(instance);

    setStatus("📦 Mounting project files...");
    const structured = {};
    for (const [filename, content] of Object.entries(normalizedFiles)) {
      if (filename.includes("/")) {
        const [dir, name] = filename.split("/");
        if (!structured[dir]) structured[dir] = { directory: {} };
        structured[dir].directory[name] = { file: { contents: content } };
      } else {
        structured[filename] = { file: { contents: content } };
      }
    }
    await instance.mount(structured);

    setStatus("📥 Installing dependencies...");
    const install = await instance.spawn("npm", ["install"]);
    install.output.pipeTo(new WritableStream({
      write(data) {
        console.log("[npm]", new TextDecoder().decode(data));
      }
    }));
    await install.exit;

    setStatus("⚡ Starting dev server...");
    const server = await instance.spawn("npm", ["run", "dev"]);
    server.output.pipeTo(new WritableStream({
      write(data) {
        const text = new TextDecoder().decode(data);
        console.log("[vite]", text);
        const match = text.match(/http:\/\/localhost:\d+/);
        if (match) {
          const url = match[0].replace("localhost", instance.url.hostname);
          setPreviewUrl(url);
          setStatus("✅ Dev server running");
        }
      }
    }));
  };

  const handleFileChange = (filename, newCode) => {
    setFiles(prev => ({
      ...prev,
      [filename]: newCode
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark text-white">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-gray-900 p-6 text-center text-3xl font-extrabold shadow-md">
        CodeOrba 🛸 — AI Dev Sandbox
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row p-4 gap-6">
        {/* Left column */}
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

              <div className="mt-4 border rounded-xl overflow-hidden h-[500px]">
                {previewUrl ? (
                  <iframe
                    ref={iframeRef}
                    src={previewUrl}
                    className="w-full h-full bg-white"
                    sandbox="allow-scripts allow-same-origin"
                    title="Sandbox Preview"
                  />
                ) : (
                  <div className="text-center text-sm text-gray-400 p-4">{status}</div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right column */}
        <div className="w-full md:w-2/3 bg-gray-900 rounded-xl shadow-inner p-4">
          {activeFile ? (
            <CodeEditor
              filename={activeFile}
              code={files[activeFile]}
              onChange={(newCode) => handleFileChange(activeFile, newCode)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              📂 Select a file to edit
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
