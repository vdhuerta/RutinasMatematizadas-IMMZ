/**
 * Verifica (sin navegador) las fórmulas IM1–IM10, la apropiación y el contrato IMMZ 4.0 de Rutinas Matematizadas.
 * Uso: npx tsx scripts/verify-calc.ts
 * Para cada escenario: calcula → genera el HTML → lo lee con el parser del Diario (copia exacta) → compara cada indicador,
 * índice, clase, APP, nombre, apropiación y métricas.
 */
import { ROUTINES } from '../src/data/rutinas';
import { isCoherent } from '../src/data/didactics';
import { computeIndicators, computeStats, indicesOf, type HistoryEvent, type Session } from '../src/lib/metrics';
import { buildReport, selfCheck } from '../src/lib/immzReport';
import { INITIAL_PLAN, INITIAL_REFLECTION, INITIAL_SLOTS } from '../src/lib/storage';
import { computeDesign } from '../src/lib/design';
import { INDICATORS } from '../src/config';

let fail = 0; const ok = (c: boolean, m: string) => { console.log(`${c ? '  ✓' : '  ✗'} ${m}`); if (!c) { fail++; } };
const R = (id: string) => ROUTINES.find((r) => r.id === id)!;
const T0 = 1_780_000_000_000;
const sess = (assign: [number, string, string | null][]): Session => ({ plan: INITIAL_PLAN, slots: INITIAL_SLOTS.map((s) => { const a = assign.find((x) => x[0] === s.id); return a ? { ...s, routine: R(a[1]), mathSituationId: a[2] } : s; }) });
const move = (t: number, slot: number, rid: string, sit: string, phase: 'inicio' | 'desarrollo' | 'cierre'): HistoryEvent => ({ type: 'move', kind: 'situation', cardId: rid, slotId: slot, from: null, to: sit, phase, isCorrect: isCoherent(rid, sit), timestamp: T0 + t * 1000 });
const an = (t: number, kind: 'rutina' | 'situacion', rid: string): HistoryEvent => ({ type: 'analysis', kind, cardId: rid, phase: null, timestamp: T0 + t * 1000 });
const val = (h: HistoryEvent[], s: Session, code: string) => computeIndicators(h, s).find((x) => x.code === code)!.value;

console.log('\n[1] Sin evidencia → todos null (nunca 100 por defecto)');
{ const s = sess([]); const r = computeIndicators([], s); ok(r.every((x) => x.value === null), 'IM1–IM10 = null'); const i = indicesOf(r); ok(i.immz === null && i.idcd === null && i.immg === null, 'índices = null'); ok(computeStats([], s).appropriation === null, 'apropiación = null'); }

console.log('\n[2] Jornada ideal (5 decisiones coherentes, pausas de 10 s, devoluciones leídas)');
{
  const plan: [number, string, string][] = [[1, 'llegada', 'secuencia'], [2, 'higiene', 'espacio'], [3, 'colacion', 'correspondencia'], [4, 'orden', 'clasificacion'], [5, 'despedida', 'secuencia']];
  const s = sess(plan);
  const h: HistoryEvent[] = [an(1, 'rutina', 'llegada'), move(10, 1, 'llegada', 'secuencia', 'inicio'), move(20, 2, 'higiene', 'espacio', 'desarrollo'), move(30, 3, 'colacion', 'correspondencia', 'desarrollo'), move(40, 4, 'orden', 'clasificacion', 'cierre'), move(50, 5, 'despedida', 'secuencia', 'cierre'), an(55, 'situacion', 'llegada')];
  ok(val(h, s, 'IM1') === 100, 'IM1 vigilancia = 100'); ok(val(h, s, 'IM2') === 40, 'IM2 reflexiva = 2/5 = 40'); ok(val(h, s, 'IM3') === 20, 'IM3 sin errores = verificación proactiva 1/5 = 20 (ya no null)');
  ok(val(h, s, 'IM5') === 100, 'IM5 sin errores = 100 (ya no null)'); ok(val(h, s, 'IM6') === 100, 'IM6 secuencia = 100'); ok(val(h, s, 'IM7') === 100, 'IM7 carga = 100');
  ok(val(h, s, 'IM8') === 100, 'IM8 = 100'); ok(val(h, s, 'IM9') === 100, 'IM9 = 100'); ok(val(h, s, 'IM10') === 100, 'IM10 (desarrollo) = 100');
  const st = computeStats(h, s); ok(st.currentHits === 5 && st.currentErrors === 0, 'aciertos 5 / errores 0'); ok(st.accuracy === 100 && st.efficiency === 100 && st.reflectionFactor === 40, 'exactitud 100 · eficiencia 100 · reflexión 40');
  ok(st.appropriation === Math.round(100 * 0.5 + 100 * 0.3 + 40 * 0.2), `apropiación 50/30/20 = ${st.appropriation}`);
  const d = computeDesign(s.slots, s.plan, INITIAL_REFLECTION); ok(d.parts.length === 9 && Math.abs(d.parts.reduce((a, p, i) => a + p.score * [0.12, 0.12, 0.12, 0.12, 0.10, 0.12, 0.10, 0.10, 0.10][i], 0) - d.imd) < 0.5, 'IMD: 9 criterios, pesos suman 1');
}

console.log('\n[3] Error, lectura de devolución y corrección (IM3/IM5/IM9/IM8/IM7)');
{
  const s = sess([[3, 'colacion', 'cuantificadores']]);
  const h: HistoryEvent[] = [move(0, 3, 'colacion', 'seriacion', 'desarrollo'), an(8, 'situacion', 'colacion'), move(20, 3, 'colacion', 'cuantificadores', 'desarrollo')];
  ok(val(h, s, 'IM3') === 100, 'IM3 = 50 (leyó) + 50 (corrigió) = 100'); ok(val(h, s, 'IM5') === 100, 'IM5 error seguido de acierto = 100'); ok(val(h, s, 'IM9') === 0, 'IM9 primer intento fallido = 0');
  ok(val(h, s, 'IM8') === 50, 'IM8 = 1/2 = 50'); ok(val(h, s, 'IM7') === 100, 'IM7: 2 decisiones sobre la misma rutina no penalizan');
  const h2 = [...h, move(30, 3, 'colacion', 'espacio', 'desarrollo'), move(40, 3, 'colacion', 'seriacion', 'desarrollo')]; ok(val(h2, s, 'IM7') === 70, 'IM7 con 4 decisiones = 100 − 15·2 = 70');
}

console.log('\n[3b] Sin indicadores «sin evidencia» cuando hay una jornada trabajada');
{
  const s = sess([[1, 'llegada', 'secuencia'], [5, 'despedida', 'secuencia']]);
  const h: HistoryEvent[] = [{ type: 'place', cardId: 'llegada', slotId: 1, phase: 'inicio', timestamp: T0 }, move(10, 1, 'llegada', 'secuencia', 'inicio'), move(20, 5, 'despedida', 'secuencia', 'cierre')];
  const r = computeIndicators(h, s); ok(r.every((x) => x.value !== null), 'IM1–IM10 todos con valor: ' + r.map((x) => x.value).join(', '));
  ok(val(h, s, 'IM10') === 0, 'IM10 con Desarrollo vacío = 0 (fase central omitida)');
  const one: HistoryEvent[] = [{ type: 'place', cardId: 'llegada', slotId: 1, phase: 'inicio', timestamp: T0 }, move(8, 1, 'llegada', 'secuencia', 'inicio')]; ok(val(one, sess([[1, 'llegada', 'secuencia']]), 'IM1') === 100, 'IM1 con solo ubicar + 1 decisión ya tiene valor (100)');
  // IM5: error sin corregir
  const bad = sess([[3, 'colacion', 'seriacion']]);
  const e1: HistoryEvent[] = [move(0, 3, 'colacion', 'seriacion', 'desarrollo')]; ok(val(e1, bad, 'IM5') === 0, 'IM5 error final sin leer devolución ni corregir = 0');
  const e2: HistoryEvent[] = [move(0, 3, 'colacion', 'seriacion', 'desarrollo'), an(9, 'situacion', 'colacion')]; ok(val(e2, bad, 'IM5') === 50, 'IM5 error + lee la devolución (sin corregir aún) = 50');
  const e3: HistoryEvent[] = [move(0, 3, 'colacion', 'seriacion', 'desarrollo'), move(10, 1, 'llegada', 'secuencia', 'inicio')]; ok(val(e3, bad, 'IM5') === 100, 'IM5 error seguido de decisión acertada = 100');
}

console.log('\n[4] Secuencia: cierre decidido antes de inicio/desarrollo (IM6)');
{ const s = sess([[5, 'despedida', 'secuencia']]); const h = [move(0, 5, 'despedida', 'secuencia', 'cierre')]; ok(val(h, s, 'IM6') === 75, 'IM6 = 100 − 25 = 75'); }

console.log('\n[5] Contrato: el parser del Diario lee exactamente lo calculado');
const now = new Date(T0 + 120_000);
const scenarios: [string, Session, HistoryEvent[]][] = [
  ['vacío', sess([]), []],
  ['ideal', sess([[1, 'llegada', 'secuencia'], [2, 'higiene', 'espacio'], [3, 'colacion', 'correspondencia'], [4, 'orden', 'clasificacion'], [5, 'despedida', 'secuencia']]), [an(1, 'rutina', 'llegada'), move(10, 1, 'llegada', 'secuencia', 'inicio'), move(20, 2, 'higiene', 'espacio', 'desarrollo'), move(30, 3, 'colacion', 'correspondencia', 'desarrollo'), move(40, 4, 'orden', 'clasificacion', 'cierre'), move(50, 5, 'despedida', 'secuencia', 'cierre')]],
  ['mixto', sess([[3, 'colacion', 'cuantificadores'], [5, 'siesta', 'seriacion']]), [move(0, 3, 'colacion', 'seriacion', 'desarrollo'), an(8, 'situacion', 'colacion'), move(20, 3, 'colacion', 'cuantificadores', 'desarrollo'), move(22, 5, 'siesta', 'seriacion', 'cierre')]],
];
for (const cls of [2, null]) for (const [n, s, h] of scenarios) {
  const r = buildReport({ participantName: 'Ana María Pérez', classNumber: cls, session: s, history: h, reflection: { ...INITIAL_REFLECTION, reflexionEscrita: 'Aprendí <b>mucho</b> & más' }, now });
  const c = selfCheck(r, cls, 'Ana María Pérez');
  ok(c.ok, `${n} · clase ${cls ?? 'no declarada'}: ${c.ok ? 'calza (10 IM, 5 índices, APP, clase, nombre, apropiación)' : c.issues.join(' | ')}`);
  ok(r.html.indexOf('bct-report-payload') < r.html.indexOf('tsd-report-raw-data'), `${n}: el payload canónico va primero`);
  ok(r.fileName.startsWith('Reporte_Rutinas_Ana_Maria_Perez_'), `${n}: archivo ${r.fileName}`);
  const p = c.parsed; ok(!p.warnings.some((w) => /re-mapeados|nombre \(sin código|rescatados|no contiene|no declara/.test(w)), `${n}: sin avisos de re-mapeo/rescate`);
  ok(INDICATORS.every((d) => (p.indicators.find((i) => i.id === d.id)?.value ?? null) === (r.indicators.find((x) => x.code === d.id)?.value ?? null)), `${n}: IM1–IM10 por código`);
}
console.log(fail ? `\n✗ ${fail} verificación(es) fallaron` : '\n✓ Fórmulas y contrato verificados');
process.exit(fail ? 1 : 0);
