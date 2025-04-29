import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainEditor from "./pages/MainEditor";
import Sandbox from "./pages/Sandbox";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainEditor />} />
        <Route path="/sandbox" element={<Sandbox />} />
      </Routes>
    </BrowserRouter>
  );
}
