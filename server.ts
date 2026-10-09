import dotenv from "dotenv";
import express from "express";
import { createServer } from "vite";
import submit from "./api/submit";
import challenge from "./api/challenge";
dotenv.config({ path: ".env.local" });
dotenv.config();
const app = express();
app.use(express.json({ limit: "16kb" }));
app.all("/api/submit", (req, res) => {
  void submit(req, res);
});
app.all("/api/challenge", (req, res) => {
  challenge(req, res);
});
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (err) return res.status(400).json({ error: "Invalid request." });
    next();
  },
);
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "spa",
});
app.use(vite.middlewares);
app.listen(3000, "0.0.0.0", () =>
  console.log("MAIM pressure test: http://localhost:3000"),
);
