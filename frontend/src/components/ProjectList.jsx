export default function ProjectList({ projects }) {
    if (projects.length === 0) {
        return (
            <p className="text-gray-400 text-center mt-8">
                No projects yet. Create your first one! 🚀
            </p>
        );
    }

    return (
        <div className="w-full mt-8">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
                Your Projects
            </h2>

            <ul className="flex flex-col gap-4">
                {projects.map((project, index) => (
                    <li
                        key={index}
                        className="bg-gray-900 rounded-xl p-4 flex justify-between items-center text-white shadow hover:shadow-orbital transition"
                    >
                        <span className="truncate">{project}</span>
                        <a
                            href={`/projects/${project}`} // Здесь ссылка на страницу проекта
                            className="text-primary hover:text-secondary font-semibold"
                        >
                            View →
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
