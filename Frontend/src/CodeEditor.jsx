import { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

export default function CodeEditor() {
  const editorRef = useRef(null);
  const [output, setOutput] = useState("");
  const [editorWidth, setEditorWidth] = useState(0.6); // 60% editor, 40% output
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  /** =================== MONACO EDITOR =================== **/
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  /** =================== RUN JS =================== **/
  const runCode = () => {
    const code = editorRef.current.getValue();
    try {
      const logs = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => logs.push(args.join(" "));
      const result = eval(code);
      if (result !== undefined) logs.push(result);
      setOutput(logs.join("\n"));
      console.log = originalConsoleLog;
    } catch (err) {
      setOutput(err.message);
    }
  };

  /** =================== DRAG RESIZE =================== **/
  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newWidth = (e.clientX - rect.left) / rect.width;
    if (newWidth > 0.2 && newWidth < 0.8) setEditorWidth(newWidth);
  };

  /** =================== GITHUB LOGIN & PUSH =================== **/
  const pushToGitHub = async (token) => {
    const code = editorRef.current.getValue();
    const repo = "your-username/your-repo"; // <-- CHANGE THIS
    const path = "sandbox.js"; // file name in repo

    try {
      let sha = null;

      // Check if file exists
      try {
        const res = await axios.get(`https://api.github.com/repos/${repo}/contents/${path}`, {
          headers: { Authorization: `token ${token}` },
        });
        sha = res.data.sha;
      } catch {
        console.log("File does not exist, will create new.");
      }

      await axios.put(`https://api.github.com/repos/${repo}/contents/${path}`, {
        message: "Update from sandbox",
        content: btoa(code),
        sha,
      }, {
        headers: { Authorization: `token ${token}` },
      });

      alert("Code pushed to GitHub!");
    } catch (err) {
      console.error(err);
      alert("Failed to push code. Check console for details.");
    }
  };

  const handleGitHubLogin = () => {
    const token = localStorage.getItem("github_token");
    if (token) {
      pushToGitHub(token); // push code if already logged in
      return;
    }

    // Redirect to GitHub OAuth
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;
    window.location.href = githubAuthUrl;
  };

  return (
    <div
      className="flex h-screen bg-gray-100"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* =================== EDITOR =================== */}
      <div style={{ width: `${editorWidth * 100}%` }} className="relative border-r border-gray-300">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Write your JS code here"
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
          }}
        />
        <div className="absolute bottom-4 left-4 flex gap-2">
          <button
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={runCode}
          >
            Run JS
          </button>
{/*           <button
            className="p-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
            onClick={handleGitHubLogin}
          >
            Save to GitHub
          </button> */}
        </div>
      </div>

      {/* =================== DRAG SEPARATOR =================== */}
      <div
        onMouseDown={handleMouseDown}
        className="w-1 cursor-col-resize bg-gray-400 hover:bg-gray-600"
      />

      {/* =================== OUTPUT =================== */}
      <div style={{ width: `${(1 - editorWidth) * 100}%` }} className="p-4 bg-gray-800 text-white overflow-auto font-mono">
        <strong>Output:</strong>
        <pre className="whitespace-pre-wrap mt-2">{output || "No output yet"}</pre>
      </div>
    </div>
  );
}
