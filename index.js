const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const FormData = require("form-data");

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.post("/proxy", async (req, res) => {
  const { endpoint } = req.query;
  const { api_key, ...fields } = req.body;
  if (!endpoint) return res.status(400).json({ error: "endpoint manquant" });
  if (!api_key) return res.status(400).json({ error: "api_key manquant" });
  const tnbUrl = `https://thenewblack.ai/api/1.1/wf/${endpoint}?api_key=${api_key}`;
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null && value !== "") fd.append(key, String(value));
  }
  try {
    const response = await fetch(tnbUrl, { method: "POST", body: fd });
    const text = await response.text();
    res.status(response.status).send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/imgbb", async (req, res) => {
  const { key } = req.query;
  const { image } = req.body;
  if (!key || !image) return res.status(400).json({ error: "key ou image manquant" });
  const fd = new FormData();
  fd.append("image", image);
  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { method: "POST", body: fd });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (_, res) => res.send("TNB proxy OK"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy démarré sur port", PORT));
