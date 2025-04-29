import { useEffect, useRef, useState } from "react";
import { WebContainer } from '@webcontainer/api';
import files from '../utils/files-template'; // мы подключим это ниже 👇

export default function Sandbox() {
  const iframeRef = useRef(null);
  const webcontainerRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState("Загрузка WebContainer...");

  useEffect(() => {
    (async () => {
      setStatus("🚀 Загружаем WebContainer...");
      const webcontainer = await WebContainer.boot();
      webcontainerRef.current = webcontainer;

      setStatus("📦 Монтируем файлы проекта...");
      await webcontainer.mount(files);

      setStatus("📥 Устанавливаем зависимости...");
      const install = await webcontainer.spawn('npm', ['install']);

      install.output.pipeTo(new WritableStream({
        write(data) {
          const text = new TextDecoder().decode(data);
          console.log('[npm install]', text);
        }
      }));

      await install.exit;

      setStatus("🔄 Запускаем Vite сервер...");
      const server = await webcontainer.spawn('npm', ['run', 'dev']);

      server.output.pipeTo(new WritableStream({
        write(data) {
          const text = new TextDecoder().decode(data);
          console.log('[vite]', text);

          const match = text.match(/http:\/\/localhost:\d+/);
          if (match) {
            const url = match[0].replace("localhost", webcontainer.url.hostname);
            console.log('[Vite URL]', url);
            setPreviewUrl(url);
            setStatus("✅ Сервер запущен!");
          }
        }
      }));
    })();
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-gray-900 text-white text-xl p-4">
        WebContainer Sandbox 🛸
      </header>

      {status && (
        <div className="text-white bg-gray-800 text-sm px-4 py-2">{status}</div>
      )}

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
            🧠 Инициализация среды...
          </div>
        )}
      </main>
    </div>
  );
}
