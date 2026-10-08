/**
 * Igual que en Laboratorio TSD: confirma que ninguna devolución didáctica regala términos de la
 * rúbrica de su propia rutina (eso volvería trivial escribir una justificación "correcta" con
 * copiar-pegar). Uso: npx tsx scripts/check-devoluciones.ts
 */
import { DEVOLUCION_TEXTS } from '../src/data/didactics';
import { RUBRICAS, terminosEncontrados } from '../src/data/expected';

let choques = 0;
for (const r of RUBRICAS) {
  const devs = Object.values(DEVOLUCION_TEXTS[r.routineId] ?? {});
  devs.forEach((d, i) => {
    const c = terminosEncontrados(r.routineId, d);
    if (c.length) { choques++; console.log(`CHOQUE ${r.routineId} devolución ${i + 1}: ${c.map((x) => `${x.grupo}«${x.termino}»`).join(', ')}`); }
  });
}
console.log(choques ? `\n${choques} devolución(es) con choques` : 'Sin choques: ninguna devolución contiene términos de su rúbrica.');
process.exit(choques ? 1 : 0);
