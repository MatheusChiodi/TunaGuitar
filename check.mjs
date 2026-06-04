import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "d:/PROJETOS/Sites/TunaGuitar/.shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`[console] ${m.text()}`);
});
page.on("pageerror", (e) => errors.push(`[pageerror @ ${page.url()}] ${e.message}\n${(e.stack || "").split("\n").slice(0, 4).join("\n")}`));

const base = "http://localhost:4173";
const routes = [
  ["home", "/"],
  ["diario", "/diario"],
  ["conquistas", "/conquistas"],
  ["ouvido", "/ouvido"],
  ["cifrador", "/cifrador"],
  ["metronomo", "/metronomo"],
  ["capotraste", "/capotraste"],
];

for (const [name, path] of routes) {
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

// Checagens estruturais na home (limpa storage p/ não cair no "restaurar última rota")
await page.goto(base + "/");
await page.evaluate(() => localStorage.clear());
await page.goto(base + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const checks = {
  particlesCanvas: await page.locator("#tsparticles canvas").count(),
  tunerTour: await page.locator('[data-tour="tuner"]').count(),
  stringsTour: await page.locator('[data-tour="strings"]').count(),
  powerTour: await page.locator('[data-tour="power"]').count(),
  driverPopover: await page.locator(".driver-popover").count(),
};

await page.goto(base + "/diario", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
checks.practiceCanvases = await page.locator("canvas").count();
checks.splitChars = await page.locator("[data-splitting] .char").count();

await page.goto(base + "/ouvido", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
checks.earCanvases = await page.locator("canvas").count();

console.log("CHECKS=" + JSON.stringify(checks, null, 2));
console.log("ERRORS(" + errors.length + ")=" + JSON.stringify(errors, null, 2));

await browser.close();
