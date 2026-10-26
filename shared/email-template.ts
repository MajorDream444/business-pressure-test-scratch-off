import type { Submission } from "./diagnostic.js";
import { diagnose } from "./diagnostic.js";
export function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
export function safeUrl(value: string | undefined) {
  try {
    const u = new URL(value ?? "");
    return u.protocol === "https:" ? u.href : "";
  } catch {
    return "";
  }
}
export function buildEmail(input: Submission, bookingUrl?: string) {
  const d = diagnose(input.answers),
    e = escapeHtml,
    url = safeUrl(bookingUrl);
  const subject = `${input.firstName}, your MAIM pressure test results`;
  const text = `${input.firstName}, your score is ${d.totalScore}/100 (${d.band.title}).\n\n${d.signals.map((s) => `${s.category}: ${s.evidence}\nNext move: ${s.action}`).join("\n\n")}\n\n${url ? `Discuss your next move: ${url}` : "Keep this as your starting map."}\n\nBased on your answers, not a forecast or guarantee.\nMajor AI Mindset — AI is the tool. You are the future.`;
  const html = `<!doctype html><html lang="en"><body style="margin:0;background:#050505;color:#F7F4EA;font-family:Arial,sans-serif"><main style="max-width:600px;margin:auto;padding:40px 24px"><p style="color:#D8AF55;letter-spacing:2px">MAJOR AI MINDSET</p><h1>Your next move starts here, ${e(input.firstName)}.</h1><p style="font-size:48px;color:#D8AF55;margin:24px 0">${d.totalScore}<span style="font-size:18px"> / 100</span></p><h2>${e(d.band.title)}</h2><p style="line-height:1.7;color:#B8B8B8">${e(d.diagnosisSummary)}</p>${d.signals.map((s) => `<section style="border-top:1px solid #27272A;padding:24px 0"><h3 style="color:#D8AF55">${e(s.category)}</h3><p>You said: ${e(s.evidence)}</p><p style="line-height:1.7">${e(s.action)}</p></section>`).join("")}${url ? `<p><a href="${e(url)}" style="display:inline-block;background:#F58426;color:#050505;padding:16px 24px;text-decoration:none;font-weight:bold">Discuss my next move</a></p>` : ""}<p style="font-size:13px;color:#B8B8B8">This is a starting map based on your answers, not a forecast or guarantee.</p><p style="color:#D8AF55;margin-top:40px">AI is the tool. You are the future.</p></main></body></html>`;
  return { subject, text, html };
}
