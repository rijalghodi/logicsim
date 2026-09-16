import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { NewProjectPage } from "./pages/NewProjectPage";
import { ProjectsListPage } from "./pages/ProjectsListPage";
import { ProjectPage } from "./pages/ProjectPage";
import { ExamplesListPage } from "./pages/ExamplesListPage";
import { ExamplePage } from "./pages/ExamplePage";
import { AboutPage } from "./pages/AboutPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/new-project" element={<NewProjectPage />} />
      <Route path="/projects" element={<ProjectsListPage />} />
      <Route path="/projects/:projectId" element={<ProjectPage />} />
      <Route path="/examples" element={<ExamplesListPage />} />
      <Route path="/examples/:exampleId" element={<ExamplePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
