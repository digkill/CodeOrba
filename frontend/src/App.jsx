import {useState} from "react";
import TaskForm from "./components/TaskForm";
import ProjectList from "./components/ProjectList";
import logo from './assets/logo-ligth.png';

export default function App() {
    const [projects, setProjects] = useState([]);

    const handleProjectGenerated = (projectName) => {
        setProjects((prev) => [...prev, projectName]);
    };

    return (
        <div className="relative bg-dark min-h-screen overflow-hidden flex flex-col items-center">


            <header className="w-full text-center p-8 z-10">

                <img src={logo} alt="CodeOrba Logo" className="w-32 mb-6 m-auto"/>
                <h1 className="text-5xl font-sans font-bold text-dark">
                    <span className="text-primary">Code</span><span className="text-secondary">Orba</span>
                </h1>
                <p className="text-gray-400 text-lg mt-4">
                    Your AI-powered orbit for crafting and building projects effortlessly.
                </p>
            </header>


            <main className="w-full max-w-3xl p-6 flex flex-col items-center gap-8 z-10">


                <TaskForm onProjectGenerated={handleProjectGenerated}/>


                <ProjectList projects={projects}/>

            </main>


            <div className="mt-12 z-10">
                <button
                    className="px-8 py-4 bg-primary text-dark rounded-full font-bold text-lg shadow-orbital hover:bg-secondary hover:text-white transition">
                    Get Started
                </button>
            </div>
        </div>
    );
}
