import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GRAPHS_DIR = path.join(__dirname, "graphs");
const PORT = 3001;

// graphs 폴더 없으면 생성
await fs.mkdir(GRAPHS_DIR, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ─── 그래프 목록 조회 ─────────────────────────────────────────────────────────
app.get("/api/graphs", async (_req, res) => {
  const files = await fs.readdir(GRAPHS_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));
  const items = await Promise.all(
    jsonFiles.map(async (f) => {
      const name = f.replace(".json", "");
      try {
        const data = JSON.parse(await fs.readFile(path.join(GRAPHS_DIR, f), "utf-8"));
        return {
          name,
          thumbnail: data.thumbnail ?? null,
          savedAt: data.savedAt ?? null,
          nodeCount: data.nodeCount ?? null,
          edgeCount: data.edgeCount ?? null,
          nodeKinds: data.nodeKinds ?? null,
        };
      } catch {
        return { name, thumbnail: null, savedAt: null, nodeCount: null, edgeCount: null, nodeKinds: null };
      }
    })
  );
  res.json(items);
});

// ─── 그래프 불러오기 ──────────────────────────────────────────────────────────
app.get("/api/graphs/:name", async (req, res) => {
  const filePath = path.join(GRAPHS_DIR, `${req.params.name}.json`);
  try {
    const data = await fs.readFile(filePath, "utf-8");
    res.json(JSON.parse(data));
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

// ─── 그래프 저장 ─────────────────────────────────────────────────────────────
app.post("/api/graphs/:name", async (req, res) => {
  const filePath = path.join(GRAPHS_DIR, `${req.params.name}.json`);
  const payload = { ...req.body, name: req.params.name, savedAt: new Date().toISOString() };
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2));
  res.json({ ok: true });
});

// ─── 그래프 이름 변경 ────────────────────────────────────────────────────────
app.patch("/api/graphs/:name/rename", async (req, res) => {
  const oldPath = path.join(GRAPHS_DIR, `${req.params.name}.json`);
  const { newName } = req.body as { newName: string };
  if (!newName?.trim()) { res.status(400).json({ error: "newName required" }); return; }
  const newPath = path.join(GRAPHS_DIR, `${newName.trim()}.json`);
  try {
    const data = JSON.parse(await fs.readFile(oldPath, "utf-8"));
    data.name = newName.trim();
    await fs.writeFile(newPath, JSON.stringify(data, null, 2));
    await fs.unlink(oldPath);
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

// ─── 그래프 삭제 ─────────────────────────────────────────────────────────────
app.delete("/api/graphs/:name", async (req, res) => {
  const filePath = path.join(GRAPHS_DIR, `${req.params.name}.json`);
  try {
    await fs.unlink(filePath);
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

app.listen(PORT, () => {
  console.log(`PrismDesign server → http://localhost:${PORT}`);
});
