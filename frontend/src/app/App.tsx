import { BrowserRouter, Routes, Route } from "react-router-dom";
import CinematicIntro from "../pages/CinematicIntro";
import VisualizerPage from "../pages/VisualizerPage";
import ListPage from "../pages/ListPage";
import ProtectedRoute from "../components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CinematicIntro />} />
        <Route path="/list" element={<ProtectedRoute><ListPage /></ProtectedRoute>} />
        <Route path="/visualizer/:id" element={<ProtectedRoute><VisualizerPage /></ProtectedRoute>} />
        <Route path="/visualizer" element={<ProtectedRoute><VisualizerPage /></ProtectedRoute>} />
        <Route path="/demo" element={<VisualizerPage demoMode />} />
      </Routes>
    </BrowserRouter>
  );
}
