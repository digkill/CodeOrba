import {useEffect, useRef, useState} from "react";
import {getWebContainer} from "../utils/webcontainer-singleton";

export default function Sandbox() {
    const iframeRef = useRef(null);
    const webcontainerRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [status, setStatus] = useState("Загрузка WebContainer...");

    useEffect(() => {
        (async () => {
            try {
                setStatus("🚀 Инициализация среды...");
                const webcontainer = await getWebContainer();
                webcontainerRef.current = webcontainer;

                const raw = localStorage.getItem("sandbox-files");
                let files = {};
                try {
                    files = JSON.parse(raw || "{}");
                } catch (e) {
                    setStatus("❌ Ошибка чтения проекта");
                    return;
                }

                const project = convertFilesToWebContainerFormat(files);

                if (!project["package.json"]) {
                    project["package.json"] = {
                        file: {
                            contents: JSON.stringify({
                                name: "sandbox-app",
                                version: "0.0.1",
                                private: true,
                                scripts: {
                                    dev: "vite"
                                },
                                dependencies: {
                                    react: "^18.2.0",
                                    "react-dom": "^18.2.0"
                                },
                                devDependencies: {
                                    vite: "^4.5.0",
                                    "@vitejs/plugin-react": "^4.1.0"
                                }
                            }, null, 2)
                        }
                    };
                }

                if (!project["vite.config.js"]) {
                    project["vite.config.js"] = {
                        file: {
                            contents: `
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
              `.trim()
                        }
                    };
                }

                setStatus("📦 Монтируем проект...");
                await webcontainer.mount(project);

                setStatus("📥 Устанавливаем зависимости...");
                const install = await webcontainer.spawn("npm", ["install"]);
                const decoder = new TextDecoder();

                install.output.pipeTo(new WritableStream({
                    write(data) {
                        const text = typeof data === "string" ? data : decoder.decode(data);
                        console.log("[npm install]", text);
                    }
                }));

                await install.exit;

                setStatus("🔄 Запускаем сервер...");
                const server = await webcontainer.spawn("npm", ["run", "dev"]);
                const reader = server.output.getReader();

                const handleServerOutput = async () => {
                    let lastKnownPort = 5173;

                    while (true) {
                        const {value, done} = await reader.read();
                        if (done) break;

                        const text = typeof value === "string" ? value : decoder.decode(value);
                        console.log("[vite]", text);

                        const portMatch = text.match(/localhost:(\d+)/);
                        if (portMatch) {
                            lastKnownPort = portMatch[1];
                            console.log("[sandbox] Найден порт:", lastKnownPort);
                        }

                        if (text.includes("ready in")) {
                            const wcUrl = webcontainer.url;

                            if (!wcUrl || !wcUrl.hostname || !wcUrl.protocol) {
                                console.error("❌ Не удалось получить URL WebContainer:", wcUrl);
                                setStatus("❌ WebContainer не предоставляет URL. Возможно, не в WebContainer среде?");
                                return;
                            }

                            const url = `${wcUrl.protocol}//${wcUrl.hostname}:${lastKnownPort}/`;
                            console.log("[sandbox] Сервер готов на:", url);

                            setPreviewUrl(url);
                            setStatus(`✅ Сервер запущен на ${url}`);
                            break;
                        }
                    }
                };

                await handleServerOutput();
            } catch (err) {
                console.error("❌ Общая ошибка:", err);
                setStatus("❌ Не удалось запустить WebContainer");
            }
        })();
    }, []);

    return (
        <div className="h-screen flex flex-col">
            <header className="bg-gray-900 text-white text-xl p-4">
                WebContainer Sandbox 🛸
            </header>

            <div className="text-white bg-gray-800 text-sm px-4 py-2">{status}</div>

            <main className="flex-1 bg-black">
                {previewUrl ? (
                    <iframe
                        ref={iframeRef}
                        src={previewUrl}
                        className="w-full h-full"
                        title="WebContainer Preview"
                        sandbox="allow-scripts allow-same-origin"
                    />
                ) : (
                    <div className="text-white flex items-center justify-center h-full">
                        ⏳ {status}
                    </div>
                )}
            </main>
        </div>
    );
}

function convertFilesToWebContainerFormat(files) {
    const result = {};
    for (const [filename, content] of Object.entries(files)) {
        if (filename.includes("/")) {
            const parts = filename.split("/");
            const file = parts.pop();
            let current = result;
            for (const dir of parts) {
                if (!current[dir]) current[dir] = {directory: {}};
                current = current[dir].directory;
            }
            current[file] = {file: {contents: content}};
        } else {
            result[filename] = {file: {contents: content}};
        }
    }
    return result;
}
