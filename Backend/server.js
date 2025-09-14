// server.js
import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Endpoint to exchange GitHub OAuth code for access token
app.post("/github/token", async (req, res) => {
  const { code } = req.body;

  if (!code) return res.status(400).json({ error: "Code is required" });

  try {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    res.json(tokenRes.data); // { access_token, scope, token_type }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
