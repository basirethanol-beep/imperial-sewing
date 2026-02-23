import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

// fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ serve frontend
app.use(express.static(path.join(__dirname, "../client")));

// test route
app.get("/api", (req, res) => {
  res.send("OK ✅ Imperial Sewing API is running");
});

// fallback to homepage
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/home.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});