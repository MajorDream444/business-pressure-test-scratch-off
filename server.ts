import dotenv from "dotenv";
import express from "express";
import { createServer } from "vite";
import submit from "./api/submit";
import challenge from "./api/challenge";
import followup from "./api/follow-up";
import unsubscribe from "./api/unsubscribe";
import continuity from "./api/continuity";
import shop from "./api/shop";
import stripeWebhook from "./api/stripe-webhook";
dotenv.config({ path: ".env.local" });
dotenv.config();
const app = express();
app.all("/api/stripe-webhook", express.raw({type:"application/json",limit:"1mb"}), (req,res) => { void stripeWebhook(req,res); });
app.use(express.json({ limit: "16kb" }));
app.all("/api/follow-up", (req,res) => { void followup(req,res); });
app.all("/api/unsubscribe", (req,res) => { void unsubscribe(req,res); });
app.all("/api/continuity", (req,res) => { void continuity(req,res); });
app.all("/api/shop", (req,res) => { void shop(req,res); });
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
