import { useState } from "react";
import TaskForm from "./components/TaskForm";
import CodeEditor from "./components/CodeEditor";
import FileList from "./components/FileList";
import { Toaster, toast } from "react-hot-toast";

export default function App() {
  const [projectId, setProjectId] = useState(null);
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState(null);

  // Обработка успешной генерации проекта
  const handleProjectGenerated = ({ project_name, files }) => {
    setProjectId(project_name);
    setFiles(files);

    const firstFile = Object.keys(files)[0];
    if (firstFile) {
      setActiveFile(firstFile);
    }

    toast.success("✅ Проект успешно сгенерирован!");
  };

  // Обработка изменений кода в файле
  const handleFileChange = (filename, newCode) => {
    setFiles((prev) => ({
      ...prev,
      [filename]: newCode,
    }));
  };

  // Запуск проекта в новой вкладке
  const handleRunProject = () => {
    if (!files || Object.keys(files).length === 0) {
      alert("Нет файлов для запуска 😥");
      return;
    }

    const htmlFileName = Object.keys(files).find(name => name.endsWith(".html"));
    if (!htmlFileName) {
      alert("Файл index.html не найден 😥");
      return;
    }

    let finalHTML = files[htmlFileName];

    // Вставляем CSS стили
    Object.keys(files).forEach(filename => {
      if (filename.endsWith(".css")) {
        const styleTag = `<style>\n${files[filename]}\n</style>`;
        finalHTML = finalHTML.replace("</head>", `${styleTag}\n</head>`);
      }
    });

    // Вставляем JS скрипты
    Object.keys(files).forEach(filename => {
      if (filename.endsWith(".js")) {
        const scriptTag = `<script>\n${files[filename]}\n</script>`;
        finalHTML = finalHTML.replace("</body>", `${scriptTag}\n</body>`);
      }
    });

    const previewWindow = window.open("", "_blank");
    if (previewWindow) {
      previewWindow.document.open();
      previewWindow.document.write(finalHTML);
      previewWindow.document.close();
    } else {
      alert("Не удалось открыть окно 😥 Проверьте настройки браузера!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark text-white">
      <Toaster position="top-center" />

      {/* Хедер */}
      <header className="bg-gray-900 p-6 text-center text-3xl font-extrabold shadow-md">
        CodeOrba 🛸 — AI Dev Sandbox
      </header>

      {/* Основная часть */}
      <main className="flex-1 flex flex-col md:flex-row p-4 gap-6">

        {/* Левая колонка */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          {!projectId ? (
            <TaskForm onProjectGenerated={handleProjectGenerated} />
          ) : (
            <>
              {/* Список файлов */}
              <FileList
                files={files}
                activeFile={activeFile}
                setActiveFile={setActiveFile}
              />

              {/* Кнопка запуска */}
              <button
                onClick={handleRunProject}
                className="bg-primary text-dark px-6 py-3 rounded-full shadow-glow-primary hover:animate-glowPulse"
              >
                🚀 Запустить в песочнице
                <span className="absolute inset-0 bg-white opacity-10 blur-md"></span>
              </button>
            </>
          )}
        </div>

        {/* Правая колонка */}
        <div className="w-full md:w-2/3 bg-gray-900 rounded-xl shadow-inner p-4">
          {activeFile ? (
            <CodeEditor
              filename={activeFile}
              code={files[activeFile]}
              onChange={(newCode) => handleFileChange(activeFile, newCode)}
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
