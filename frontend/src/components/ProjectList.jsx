import { Badge, Button } from "@material-tailwind/react";

export default function ProjectList({ projects }) {
  if (projects.length === 0) {
    return (
      <p className="text-gray-400 text-center mt-8">
        No projects yet. Create your first one! 🚀
      </p>
    );
  }

  return (
    <div className="w-full mt-8 space-y-8">
      {projects.map((project, index) => (
        <div key={index} className="bg-gray-900 p-6 rounded-xl shadow text-white">
          <h3 className="text-xl font-bold mb-4">
            {project.projectName}
          </h3>

          {Array.isArray(project.files) ? (
            <ul className="space-y-2">
              {project.files.map((file, idx) => (
                <li
                  key={idx}
                  className="bg-gray-800 rounded p-3 flex justify-between items-center"
                >
                  <span className="font-mono">{file.filename}</span>
                  <button
                    className="rounded-md bg-blue-600 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-blue-700 focus:shadow-none active:bg-blue-700 hover:bg-blue-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2"
                    onClick={() => navigator.clipboard.writeText(file.content)}
                  >
                    Copy
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-red-500">⚠️ Invalid file format</p>
          )}
        </div>
      ))}
    </div>
  );
}
