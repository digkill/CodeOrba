export default function FileList({ files, activeFile, setActiveFile }) {
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
              ? "bg-primary text-dark font-bold"
              : "bg-gray-800 text-white hover:bg-primary hover:text-dark"
          }`}
          onClick={() => setActiveFile(filename)}
        >
          {getFileIcon(filename)} {filename}
        </li>
      ))}
    </ul>
  );
}
