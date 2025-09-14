import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CodeEditor from "./CodeEditor";
import GitHubCallback from "./GitHubCallback";
import "./App.css";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CodeEditor />} />
        <Route path="/github-callback" element={<GitHubCallback />} />
      </Routes>
    </Router>
  );
}

export default App;
