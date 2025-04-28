import { useState } from "react";
import { generateProject } from "../services/api"; // твой API-запрос на бэкенд

export default function TaskForm({ onProjectGenerated }) {
    const [taskDescription, setTaskDescription] = useState("");
    const [language, setLanguage] = useState("JavaScript");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!taskDescription.trim()) return;

        try {
            const projectName = await generateProject(taskDescription, language);
            onProjectGenerated(projectName);
            setTaskDescription("");
        } catch (error) {
            console.error("Error generating project:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-dark p-6 rounded-2xl shadow-orbital flex flex-col gap-4 w-full">

            <h2 className="text-2xl font-bold text-white text-center mb-2">
                Create a New Project
            </h2>

            <textarea
                className="w-full p-4 rounded-xl bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe your project idea..."
                rows="4"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
            ></textarea>

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

            <button
                type="submit"
                className="mt-4 px-6 py-3 bg-primary text-dark rounded-full font-bold text-lg shadow-orbital hover:bg-secondary hover:text-white transition"
            >
                Generate Project
            </button>

        </form>
    );
}
