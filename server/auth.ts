import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, "users.json");
const JWT_SECRET = process.env.JWT_SECRET ?? "prismdesign-dev-secret";
const JWT_EXPIRES = "7d";

type User = { id: string; email: string; passwordHash: string; name: string };
type PublicUser = { id: string; email: string; name: string };

async function readUsers(): Promise<User[]> {
  try {
    return JSON.parse(await fs.readFile(USERS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

async function writeUsers(users: User[]): Promise<void> {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

function toPublic(u: User): PublicUser {
  return { id: u.id, email: u.email, name: u.name };
}

const router = Router();

// ─── 회원가입 ──────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body as {
    email: string;
    password: string;
    name: string;
  };

  if (!email?.trim() || !password || !name?.trim()) {
    res.status(400).json({ error: "이메일, 비밀번호, 이름이 필요합니다" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "비밀번호는 6자 이상이어야 합니다" });
    return;
  }

  const users = await readUsers();
  if (users.find((u) => u.email === email.toLowerCase().trim())) {
    res.status(409).json({ error: "이미 사용 중인 이메일입니다" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: User = {
    id: crypto.randomUUID(),
    email: email.toLowerCase().trim(),
    passwordHash,
    name: name.trim(),
  };

  users.push(user);
  await writeUsers(users);

  const token = jwt.sign(toPublic(user), JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ token, user: toPublic(user) });
});

// ─── 로그인 ───────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ error: "이메일과 비밀번호가 필요합니다" });
    return;
  }

  const users = await readUsers();
  const user = users.find((u) => u.email === email.toLowerCase().trim());

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다" });
    return;
  }

  const token = jwt.sign(toPublic(user), JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ token, user: toPublic(user) });
});

// ─── 토큰 검증 (/me) ──────────────────────────────────────────────────────
router.get("/me", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "인증이 필요합니다" });
    return;
  }

  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as PublicUser;
    res.json({ id: payload.id, email: payload.email, name: payload.name });
  } catch {
    res.status(401).json({ error: "유효하지 않은 토큰입니다" });
  }
});

export default router;
