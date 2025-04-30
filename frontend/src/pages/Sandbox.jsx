import { useEffect, useRef, useState } from 'react';
import { getWebContainer } from '../utils/webcontainer-singleton';

/* ---------- helpers ---------- */
const decode = (c) =>
  c instanceof Uint8Array || ArrayBuffer.isView(c)
    ? new TextDecoder().decode(c)
    : typeof c === 'string'
      ? c
      : '';

const toTree = (files) => {
  const root = {};
  for (const [path, code] of Object.entries(files)) {
    const parts = path.split('/');
    const file = parts.pop();
    let cur = root;
    parts.forEach((p) => (cur[p] ??= { directory: {} }, (cur = cur[p].directory)));
    cur[file] = { file: { contents: code } };
  }
  return root;
};

/* ---------- component ---------- */
export default function Sandbox() {
  /* refs */
  const wcRef = useRef(null);
  const procRef = useRef(null);
  const readerRef = useRef(null);
  const hasTornDown = useRef(false);

  /* state */
  const [status, setStatus] = useState('⏳ Запуск WebContainer…');
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(null);
  const [url, setUrl] = useState('');

  const push = (l) =>
    l && setLogs((prev) => (prev.length > 198 ? [...prev.slice(1), l] : [...prev, l]));

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const wc = await getWebContainer();
        if (!mounted) return;
        wcRef.current = wc;

        const raw = localStorage.getItem('sandbox-files');
        const files = raw ? JSON.parse(raw) : {};
        if (!Object.keys(files).length) {
          setStatus('❌ Нет файлов проекта');
          return;
        }

        const proj = toTree(files);
        proj['package.json'] ??= {
          file: {
            contents: JSON.stringify({
              name: 'sandbox-app',
              private: true,
              scripts: { dev: 'vite' },
              dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0' },
              devDependencies: { vite: '^4.5.0', '@vitejs/plugin-react': '^4.1.0' }
            }, null, 2)
          }
        };
        proj['vite.config.js'] ??= {
          file: {
            contents: `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: false, host: true }
});`.trim()
          }
        };

        setStatus('📦 Монтируем проект…');
        await wc.mount(proj);

        setStatus('📥 Установка зависимостей…');
        const inst = await wc.spawn('npm', ['install']);
        let bytes = 0;
        inst.output.pipeTo(new WritableStream({
          write: (c) => {
            if (!mounted) return;
            const t = decode(c);
            bytes += t.length;
            setProgress(Math.min(99, Math.floor((bytes / 180000) * 100)));
            push(t.trim());
          }
        }));
        await inst.exit;
        if (!mounted) return;
        setProgress(null);

        setStatus('🚀 Запуск Vite…');
        const dev = await wc.spawn('npm', ['run', 'dev']);
        procRef.current = dev;
        const rd = dev.output.getReader();
        readerRef.current = rd;

        let port = 5173;
        while (mounted) {
          const { value, done } = await rd.read();
          if (done) break;
          const line = decode(value).trim();
          push(line);

          const portMatch = line.match(/localhost:(\d+)/) || line.match(/Local.*?:(\d+)/);
          if (portMatch) port = portMatch[1];

          if (line.includes('ready in')) {
            try {
              const { url: publicURL } = await wc.portManager.open(port);
              if (publicURL) {
                setUrl(publicURL);
                setStatus('✅ Сервер: ' + publicURL);
                break;
              }
            } catch {}

            if (wc.url?.origin) {
              const u = new URL(wc.url.origin);
              u.port = port;
              const uStr = u.toString();
              setUrl(uStr);
              setStatus('✅ Сервер: ' + uStr);
              break;
            }

            const rawURL = line.match(/http:\/\/localhost:\d+\//)?.[0];
            if (rawURL) {
              const origin = rawURL.replace('localhost', window.location.hostname);
              setUrl(origin);
              setStatus('✅ Сервер: ' + origin);
              break;
            }

            const fallbackUrl = `http://${window.location.hostname}:${port}/`;
            setUrl(fallbackUrl);
            setStatus('⚡ Сервер (фолбэк): ' + fallbackUrl);
            break;
          }
        }
      } catch (e) {
        console.error(e);
        if (mounted) setStatus('❌ Ошибка Sandbox');
      }
    })();

    return () => {
      mounted = false;

      if (hasTornDown.current) return;
      hasTornDown.current = true;

      (async () => {
        try { await readerRef.current?.cancel(); } catch {}
        try { await procRef.current?.kill(); } catch {}
        try { await wcRef.current?.teardown(); } catch {}
      })();
    };
  }, []);

  /* ---------------- UI ---------------- */
  const isLoading = status.startsWith('⏳') || status.startsWith('📦') || status.startsWith('📥') || status.startsWith('🚀');

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-gray-900 text-white text-xl p-4">WebContainer Sandbox 🛸</header>

      <div className={`bg-gray-800 text-white text-sm px-4 py-2 ${isLoading ? 'animate-pulse' : ''}`}>
        {status}
      </div>

      {progress !== null && (
        <div className="h-1 bg-gray-700">
          <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}

      <main className="flex-1 flex flex-col bg-black">
        <div className="flex-1">
          {url ? (
            <iframe
              src={url}
              className="w-full h-full"
              title="preview"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-white">
              ⏳ {status}
            </div>
          )}
        </div>
        <pre className="h-40 overflow-auto bg-gray-900 text-green-400 text-xs p-2 whitespace-pre-wrap">
          {logs.join('\n')}
        </pre>
      </main>
    </div>
  );
}
