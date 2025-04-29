import {useState, useEffect, useRef} from "react";
import {useParams} from "react-router-dom";
import {getProjectById, saveProjectFiles, downloadProject} from "../api";
import FileList from "../components/FileList";
import CodeEditor from "../components/CodeEditor";

export default function Sandbox() {
    const {projectId} = useParams();
    const [files, setFiles] = useState({});
    const [activeFile, setActiveFile] = useState("");
    const [content, setContent] = useState("");
    const [previewMode, setPreviewMode] = useState(false);
    const [history, setHistory] = useState([]);
    const [future, setFuture] = useState([]);
    const autosaveTimer = useRef(null);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        async function fetchProject() {
            try {
                const response = await getProjectById(projectId);
                setFiles(response.files);
                const firstFile = Object.keys(response.files)[0];
                setActiveFile(firstFile);
                setContent(response.files[firstFile]);
            } catch (error) {
                console.error("Ошибка загрузки проекта:", error);
            }
        }

        fetchProject();
    }, [projectId]);
    const handleAutoSave = async () => {
        try {
            setSaving(true);
            await saveProjectFiles(projectId, files);
        } catch (error) {
            console.error("Ошибка автосохранения:", error);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (autosaveTimer.current) {
            clearInterval(autosaveTimer.current);
        }
        autosaveTimer.current = setInterval(() => {
            handleAutoSave();
        }, 5000);

        return () => clearInterval(autosaveTimer.current);
    }, [files]);

    const pushToHistory = (newFiles) => {
        setHistory(prev => [...prev, files]);
        setFuture([]); // сбрасываем redo
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const prevFiles = history[history.length - 1];
        setFuture(f => [files, ...f]);
        setFiles(prevFiles);
        setHistory(h => h.slice(0, -1));
    };

    const handleRedo = () => {
        if (future.length === 0) return;
        const nextFiles = future[0];
        setHistory(h => [...h, files]);
        setFiles(nextFiles);
        setFuture(f => f.slice(1));
    };

    const handleFileSelect = (filename) => {
        setActiveFile(filename);
        setContent(files[filename]);
    };

    const handleContentChange = (newContent) => {
        pushToHistory(files);
        setContent(newContent);
        setFiles(prev => ({
            ...prev,
            [activeFile]: newContent
        }));
    };

    const handleAddFile = (filename) => {
        if (files[filename]) {
            alert("⚠️ Файл уже существует.");
            return;
        }
        setFiles(prev => ({
            ...prev,
            [filename]: ""
        }));
        setActiveFile(filename);
        setContent("");
    };

    const handleDeleteFile = (filename) => {
        if (!window.confirm(`Удалить файл ${filename}?`)) return;
        setFiles(prev => {
            const updated = {...prev};
            delete updated[filename];
            return updated;
        });
        if (filename === activeFile) {
            const remaining = Object.keys(files).filter(f => f !== filename);
            if (remaining.length > 0) {
                setActiveFile(remaining[0]);
                setContent(files[remaining[0]]);
            } else {
                setActiveFile("");
                setContent("");
            }
        }
    };

    const handleRenameFile = (oldName, newName) => {
        if (!newName.trim() || files[newName]) {
            alert("⚠️ Неверное новое имя файла или файл уже есть.");
            return;
        }
        setFiles(prev => {
            const updated = {...prev};
            updated[newName] = updated[oldName];
            delete updated[oldName];
            return updated;
        });
        if (activeFile === oldName) {
            setActiveFile(newName);
            setContent(files[oldName]);
        }
    };

    const handleReorderFiles = (newOrder) => {
        const reordered = {};
        newOrder.forEach(filename => {
            reordered[filename] = files[filename];
        });
        setFiles(reordered);
    };


    const handleDownload = async () => {
        try {
            await downloadProject(projectId);
        } catch (error) {
            console.error("Ошибка скачивания:", error);
        }
    };

    const generatePreviewHTML = () => {
        const html = files["index.html"] || "<h1>Файл index.html отсутствует</h1>";
        const css = files["style.css"] || "";
        const js = files["script.js"] || "";

        const usesVue = html.includes("vue") || js.includes("Vue");
        const usesReact = html.includes("react") || js.includes("React");

        let libraries = "";

        if (usesVue) {
            libraries += `<script src="https://unpkg.com/vue@3"></script>\n`;
        }
        if (usesReact) {
            libraries += `
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
      `;
        }

        return `
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          ${libraries}
          <script>${js}</script>
        </body>
      </html>
    `;
    };

    return (
        <div className="flex flex-col min-h-screen bg-dark text-white">
            <div className="flex justify-between items-center p-4 bg-gray-900">
                {saving && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary animate-pulse"></div>
                )}

                <div className="flex gap-2">
                    <button onClick={handleUndo}
                            className="px-4 py-2 bg-primary hover:bg-secondary text-dark rounded-full">
                        ↩️ Undo
                    </button>
                    <button onClick={handleRedo}
                            className="px-4 py-2 bg-primary hover:bg-secondary text-dark rounded-full">
                        ↪️ Redo
                    </button>
                    <button onClick={handleDownload}
                            className="px-4 py-2 bg-primary hover:bg-secondary text-dark rounded-full">
                        📥 Скачать
                    </button>
                    <button
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/sandbox/${projectId}`)}
                        className="px-4 py-2 bg-primary hover:bg-secondary text-dark rounded-full">
                        🔗 Поделиться
                    </button>
                    <button onClick={() => setPreviewMode(!previewMode)}
                            className="px-4 py-2 bg-primary hover:bg-secondary text-dark rounded-full">
                        {previewMode ? "📝 Редактировать" : "👁️‍🗨️ Live Preview"}
                    </button>
                </div>
            </div>

            <div className="flex flex-1">
                {!previewMode ? (
                    <>
                        <FileList
                            files={files}
                            onSelect={handleFileSelect}
                            activeFile={activeFile}
                            onAddFile={handleAddFile}
                            onDeleteFile={handleDeleteFile}
                            onRenameFile={handleRenameFile}
                            onReorderFiles={handleReorderFiles}
                        />
                        <CodeEditor filename={activeFile} code={content} onChange={handleContentChange}/>
                    </>
                ) : (
                    <iframe
                        className="flex-1 bg-white"
                        srcDoc={generatePreviewHTML()}
                        title="Live Preview"
                        sandbox="allow-scripts allow-same-origin"
                    />
                )}
            </div>
        </div>
    );
}
