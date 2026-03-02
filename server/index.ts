import express from "express";
import type { Request } from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import authRouter from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GRAPHS_BASE = path.join(__dirname, "graphs");
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET ?? "prismdesign-dev-secret";

// ─── JWT에서 userId 추출 ──────────────────────────────────────────────────
function getUserId(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { id: string };
    return payload.id;
  } catch {
    return null;
  }
}

// ─── 유저별 graphs 폴더 경로 ─────────────────────────────────────────────
async function userGraphsDir(userId: string): Promise<string> {
  const dir = path.join(GRAPHS_BASE, userId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ─── 인증 ─────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);

// ─── 그래프 목록 조회 ─────────────────────────────────────────────────────────
app.get("/api/graphs", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ error: "인증이 필요합니다" }); return; }
  const dir = await userGraphsDir(userId);
  const files = await fs.readdir(dir);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));
  const items = await Promise.all(
    jsonFiles.map(async (f) => {
      const name = f.replace(".json", "");
      try {
        const data = JSON.parse(await fs.readFile(path.join(dir, f), "utf-8"));
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
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ error: "인증이 필요합니다" }); return; }
  const dir = await userGraphsDir(userId);
  const filePath = path.join(dir, `${req.params.name}.json`);
  try {
    const data = await fs.readFile(filePath, "utf-8");
    res.json(JSON.parse(data));
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

// ─── 그래프 저장 ─────────────────────────────────────────────────────────────
app.post("/api/graphs/:name", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ error: "인증이 필요합니다" }); return; }
  const dir = await userGraphsDir(userId);
  const filePath = path.join(dir, `${req.params.name}.json`);
  const payload = { ...req.body, name: req.params.name, savedAt: new Date().toISOString() };
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2));
  res.json({ ok: true });
});

// ─── 그래프 이름 변경 ────────────────────────────────────────────────────────
app.patch("/api/graphs/:name/rename", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ error: "인증이 필요합니다" }); return; }
  const dir = await userGraphsDir(userId);
  const oldPath = path.join(dir, `${req.params.name}.json`);
  const { newName } = req.body as { newName: string };
  if (!newName?.trim()) { res.status(400).json({ error: "newName required" }); return; }
  const newPath = path.join(dir, `${newName.trim()}.json`);
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
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ error: "인증이 필요합니다" }); return; }
  const dir = await userGraphsDir(userId);
  const filePath = path.join(dir, `${req.params.name}.json`);
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
