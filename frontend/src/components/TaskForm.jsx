import {useState} from "react";
import {generateProject} from "../api/api";
import {parseGeneratedCode} from "../utils/parser.jsx";

export default function TaskForm({onProjectGenerated}) {
    const [taskDescription, setTaskDescription] = useState("");
    const [language, setLanguage] = useState("JavaScript");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!taskDescription.trim()) return;

        try {
            setLoading(true);
            const response = await generateProject(taskDescription, language);

            const parsedFiles = parseGeneratedCode(response.generated_code);

            onProjectGenerated({
                projectName: response.project_name,
                files: parsedFiles,
            });

            setTaskDescription("");
        } catch (error) {
            console.error("Error generating project:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-dark p-6 rounded-2xl shadow-orbital flex flex-col gap-4 w-full"
        >
            <h2 className="text-2xl font-bold text-white text-center mb-2">
                Create a New Project
            </h2>

            <textarea
                className="w-full p-4 rounded-xl bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe your project idea..."
                rows="4"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
            />

            <select
                className="w-full p-3 rounded-xl bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
            >
                <option>JavaScript</option>
                <option>Python</option>
                <option>PHP</option>
                <option>Go</option>
            </select>

            {/* Кнопка в твоём стиле */}
            <button
                type="submit"
                disabled={loading}
                className="rounded-md cursor-pointer bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
                {loading ? "Generating..." : "Generate Project"}
            </button>
        </form>
    );
}
