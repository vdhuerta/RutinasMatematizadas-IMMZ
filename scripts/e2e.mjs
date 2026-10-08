// Prueba E2E: juega Rutinas Matematizadas en un navegador real, descarga el reporte y lo deja para verify-immz.
// Uso: npm run build && npx vite preview --port 4173 &  →  node scripts/e2e.mjs /tmp/e2e
import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT = process.argv[2] || '/tmp/e2e'; fs.mkdirSync(OUT, { recursive: true });
const exe = process.env.CHROME_BIN || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const errors = []; page.on('pageerror', (e) => errors.push(String(e))); page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(process.env.URL || 'http://localhost:4173');
// Identificación inicial (NRC + Forma), bloqueante en el primer inicio (sin datos guardados en este perfil de navegador).
await page.waitForSelector('[data-testid="nrc-input"]');
await page.fill('[data-testid="nrc-input"]', '12345');
await page.selectOption('[data-testid="forma-input"]', 'A');
await page.click('[data-testid="identification-submit"]');
await page.waitForSelector('[data-testid="palette"]');
await page.click('button:has-text("Comenzar a planificar")').catch(() => {});

async function dragTo(fromSel, toSel) {
  const a = await page.locator(fromSel).first().boundingBox(); const b = await page.locator(toSel).first().boundingBox();
  const ox = Math.min(30, a.width / 2), oy = Math.min(15, a.height / 2);
  await page.mouse.move(a.x + ox, a.y + oy); await page.mouse.down(); await page.mouse.move(a.x + ox + 20, a.y + oy + 15, { steps: 4 });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 14 }); await page.mouse.up(); await page.waitForTimeout(250);
}
const place = async (rid, slot) => { await dragTo(`[data-routine-id="${rid}"]`, `[data-zone="slot-${slot}"]`); };
const pick = async (sit) => { await page.click(`[data-testid="sit-${sit}"]`); await page.waitForTimeout(5300); };

// Paso 1-2: guion con aciertos, un error, lectura de devolución y corrección
await place('llegada', 1); await pick('secuencia');
await place('colacion', 3); await pick('seriacion');                       // error
await page.click('[data-card-slot="3"] [data-analysis-btn]'); await page.waitForSelector('[data-testid="analysis-text"]'); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
await pick('correspondencia');                                              // corrección
await place('higiene', 2); await pick('espacio');
await place('orden', 4); await pick('clasificacion');
await place('despedida', 5); await pick('secuencia');
// Rutinas únicas: la tarjeta colocada deja el hueco punteado y vacío en el mazo
const empties = await page.locator('[data-empty-slot]').count(); if (empties !== 5) errors.push('mazo: se esperaban 5 huecos vacíos, hay ' + empties);
// Lupa → modal de devolución (formato TSD)
await page.click('[data-card-slot="1"] [data-analysis-btn]'); await page.waitForSelector('[data-testid="analysis-text"]'); await page.screenshot({ path: `${OUT}/01b-lupa.png` }); await page.keyboard.press('Escape');
await page.click('[data-testid="btn-dev"]'); const hint = await page.textContent('[data-testid="dev-hint"]'); if (!/Presiona sobre la/.test(hint)) errors.push('mensaje de devolución ausente');
await page.screenshot({ path: `${OUT}/01-disenador.png` });
// Sacar arrastrando al mazo y volver a ubicar
await dragTo('[data-card-slot="5"]', '[data-zone="deck"]'); const back = await page.locator('[data-empty-slot]').count(); if (back !== 4) errors.push('al sacar la rutina debe volver al mazo (huecos=' + back + ')');
await place('despedida', 5); await pick('secuencia');

// Paso 3
await page.click('[data-testid="tab-plan"]'); await page.waitForTimeout(300);
await page.click('[data-testid="oa"]').catch(() => {});
await page.fill('[data-testid="objetivo"]', 'Distinguir nociones de tiempo y cantidad en los niños durante las rutinas de la jornada.');
await page.fill('[data-testid="competencia"]', 'Situación problemática: ¿cómo repartimos los platos para que alcance para todos? Los niños enfrentan el desafío con una pregunta y formulan su estrategia.');
await page.fill('[data-testid="just-1"]', 'Desde Brousseau, la rutina de llegada es un contexto de matematización con andamiaje docente.');
await page.click('[data-testid="btn-fase-inicio"]'); await page.click('[data-testid="btn-dev-fase-3"]');
await dragTo('[data-drag-handle="4"]', '[data-zone="phase-desarrollo"]');
await page.screenshot({ path: `${OUT}/02-planificador.png`, fullPage: false });

// Análisis
await page.click('[data-testid="tab-analysis"]'); await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/03-analisis-resumen.png` });
for (const k of ['DIM1', 'DIM2', 'MARCO', 'TRABAJO']) { await page.click(`[data-testid="atab-${k}"]`); await page.waitForTimeout(250); await page.screenshot({ path: `${OUT}/04-${k}.png`, fullPage: k === 'TRABAJO' }); }
await page.fill('[data-testid="reflexion"]', 'Aprendí que colación se articula mejor con correspondencia y que debo leer la devolución antes de corregir.');
await page.click('[data-testid="btn-save-refl"]');
const compat = await page.textContent('[data-testid="compat"]');
await page.click('[data-testid="btn-html"]'); await page.waitForSelector('#pname'); await page.screenshot({ path: `${OUT}/03b-nombre.png` });
await page.fill('#pname', 'Ana María Pérez');
const [dl] = await Promise.all([page.waitForEvent('download'), page.getByText('Descarga ahora').click()]);
const file = `${OUT}/${dl.suggestedFilename()}`; await dl.saveAs(file);
const [pdf] = await Promise.all([page.waitForEvent('download', { timeout: 90000 }), page.getByRole('button', { name: 'PDF' }).click()]);
await pdf.saveAs(`${OUT}/${pdf.suggestedFilename()}`);
const rp = await ctx.newPage(); await rp.goto('file://' + file); await rp.waitForTimeout(500);
await rp.screenshot({ path: `${OUT}/05-reporte.png`, fullPage: true });
console.log(JSON.stringify({ file, pdf: pdf.suggestedFilename(), compat: compat.replace(/\s+/g, ' ').trim(), errors }, null, 1));
await browser.close();
