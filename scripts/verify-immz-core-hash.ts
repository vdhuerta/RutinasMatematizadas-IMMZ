/**
 * Verifica que src/immz-core/ sigue siendo una copia IDÉNTICA (byte a byte) del módulo portable
 * del Simulador TSD-IMMZ. Estos 4 archivos no deben editarse en esta app: si Simulador TSD
 * cambia sus fórmulas, se vuelve a copiar íntegro desde ahí y se actualizan los hashes de abajo
 * (nunca se parchea aquí directamente — ver TAREA 2).
 * Hashes tomados de Simulador-TSD-IMMZ-main el 2026-10-05.
 * Uso: npx tsx scripts/verify-immz-core-hash.ts
 */
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EXPECTED: Record<string, string> = {
  'constants.ts': '90bdd196f127ac8b5c53d35912804da05d1520e60e32483e6edba68ffc909476',
  'events.ts': 'a466da22ff2190f13600db015d736904f4d121825900d0aa71f8a9b35481249a',
  'compute.ts': '364265c3841950e0c81b5fc9d6c7554f56ae6e29f58cb88bda7a0efb9330b571',
  'indices.ts': '3370529b8da9bf04ca34d2c03185f40d41b485fffc9cfc6be63b6d0131591f79',
};

let fail = 0;
for (const [file, expected] of Object.entries(EXPECTED)) {
  const p = path.join(__dirname, '..', 'src', 'immz-core', file);
  const got = createHash('sha256').update(readFileSync(p)).digest('hex');
  const ok = got === expected;
  if (!ok) fail++;
  console.log(`${ok ? '  ✓' : '  ✗'} ${file}: ${ok ? 'idéntico al Simulador TSD-IMMZ' : `DIFIERE (esperado ${expected}, got ${got})`}`);
}
console.log(fail ? `\n✗ ${fail} archivo(s) de immz-core difieren del original` : '\n✓ src/immz-core/ es una copia íntegra del Simulador TSD-IMMZ');
process.exit(fail ? 1 : 0);
