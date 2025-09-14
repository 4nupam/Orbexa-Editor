import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function GitHubCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    // Call backend to get access token
    axios.post("http://localhost:4000/github/token", { code })
      .then(res => {
        const token = res.data.access_token;
        localStorage.setItem("github_token", token);
        alert("GitHub login successful! You can now save code.");
        window.location.href = "/"; // go back to editor
      })
      .catch(err => {
        console.error(err);
        alert("GitHub login failed.");
      });
  }, []);

  return <div>Logging in with GitHub...</div>;
}
