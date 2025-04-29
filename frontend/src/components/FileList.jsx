export default function FileList({files, activeFile, setActiveFile}) {
    console.log("📁 files:", files);
    console.log("🔑 fileNames:", Object.keys(files));

    const fileNames = Object.keys(files);

    function getFileIcon(filename) {
        if (filename.endsWith('.html')) return "🌐";
        if (filename.endsWith('.css')) return "🎨";
        if (filename.endsWith('.js')) return "⚙️";
        if (filename.endsWith('.png') || filename.endsWith('.jpg')) return "🖼️";
        return "📄";
    }

    return (
        <ul className="space-y-2">
            {fileNames.map((filename) => (
                <li
                    key={filename}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                        activeFile === filename
                            ? "rounded-md bg-green-600 py-2.5 px-5 border border-transparent text-center text-base text-white transition-all shadow-sm hover:shadow-lg focus:bg-green-700 focus:shadow-none active:bg-green-700 hover:bg-green-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2"
                            : "rounded-md bg-slate-800 py-2.5 px-5 border border-transparent text-center text-base text-white transition-all shadow-sm hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2"
 
                    }`}
                    onClick={() => setActiveFile(filename)}
                >
                    {getFileIcon(filename)} {filename}
                </li>
            ))}
        </ul>
    );
}
