/**
 * Verifica (sin navegador) las fórmulas IM1–IM10, la apropiación y el contrato IMMZ 4.0 de Rutinas Matematizadas.
 * Uso: npx tsx scripts/verify-calc.ts
 * Para cada escenario: calcula → genera el HTML → lo lee con el parser del Diario (copia exacta) → compara cada indicador,
 * índice, clase, APP, nombre, apropiación y métricas.
 */
import { FORMAS, ROUTINES } from '../src/data/rutinas';
import { isCoherent } from '../src/data/didactics';
import { computeIndicators, computeStats, indicesOf, type HistoryEvent, type Session } from '../src/lib/metrics';
import { buildReport, selfCheck } from '../src/lib/immzReport';
import { INITIAL_PLAN, INITIAL_REFLECTION, INITIAL_SLOTS } from '../src/lib/storage';
import { computeDesign } from '../src/lib/design';
import { COMPAT_4_0_IDS } from '../src/config';

let fail = 0; const ok = (c: boolean, m: string) => { console.log(`${c ? '  ✓' : '  ✗'} ${m}`); if (!c) { fail++; } };
const R = (id: string) => ROUTINES.find((r) => r.id === id)!;
const T0 = 1_780_000_000_000;
const sess = (assign: [number, string, string | null][]): Session => ({ plan: INITIAL_PLAN, slots: INITIAL_SLOTS.map((s) => { const a = assign.find((x) => x[0] === s.id); return a ? { ...s, routine: R(a[1]), mathSituationId: a[2] } : s; }) });
const move = (t: number, slot: number, rid: string, sit: string, phase: 'inicio' | 'desarrollo' | 'cierre', justification?: string): HistoryEvent => ({ type: 'move', kind: 'situation', cardId: rid, slotId: slot, from: null, to: sit, phase, isCorrect: isCoherent(rid, sit), justification, timestamp: T0 + t * 1000 });
const an = (t: number, kind: 'rutina' | 'situacion', rid: string): HistoryEvent => ({ type: 'analysis', kind, cardId: rid, phase: null, timestamp: T0 + t * 1000 });
const val = (h: HistoryEvent[], s: Session, code: string) => computeIndicators(h, s).find((x) => x.code === code)!.value;
const jd = (t: number, rid: string, declared: boolean, real: boolean): HistoryEvent => ({ type: 'judgment', cardId: rid, declared, real, timestamp: T0 + t * 1000 });

console.log('\n[1] Sin evidencia → todos null (nunca 100 por defecto)');
{ const s = sess([]); const r = computeIndicators([], s); ok(r.every((x) => x.value === null), 'IM1–IM10 = null'); const i = indicesOf(r); ok(i.immz === null && i.idcd === null && i.immg === null, 'índices = null'); ok(computeStats([], s).appropriation === null, 'apropiación = null'); }

console.log('\n[2] Jornada ideal (5 decisiones coherentes, pausas de 10 s, devoluciones leídas)');
{
  const plan: [number, string, string][] = [[1, 'llegada', 'secuencia'], [2, 'higiene', 'espacio'], [3, 'colacion', 'correspondencia'], [4, 'orden', 'clasificacion'], [5, 'despedida', 'secuencia']];
  const s = sess(plan);
  const h: HistoryEvent[] = [an(1, 'rutina', 'llegada'), move(10, 1, 'llegada', 'secuencia', 'inicio'), move(20, 2, 'higiene', 'espacio', 'desarrollo'), move(30, 3, 'colacion', 'correspondencia', 'desarrollo'), move(40, 4, 'orden', 'clasificacion', 'cierre'), move(50, 5, 'despedida', 'secuencia', 'cierre'), an(55, 'situacion', 'llegada')];
  ok(val(h, s, 'IM1') === 100, 'IM1 vigilancia = 100'); ok(val(h, s, 'IM2') === 100, 'IM2 reflexiva = 5/5 (motor 4.1: cada rutina tiene devolución o pausa larga asociada)'); ok(val(h, s, 'IM3') === null, 'IM3 sin errores = null (no hay autocorrección que medir)');
  ok(val(h, s, 'IM5') === null, 'IM5 sin errores = null (no hubo ocasión de reajustar)'); ok(val(h, s, 'IM6') === 100, 'IM6 secuencia = 100'); ok(val(h, s, 'IM7') === 100, 'IM7 carga = 100');
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
  const h2 = [...h, move(30, 3, 'colacion', 'espacio', 'desarrollo'), move(40, 3, 'colacion', 'seriacion', 'desarrollo')]; ok(val(h2, s, 'IM7') === 75, 'IM7 con 4 decisiones sobre la misma rutina (umbral 3) = 100 × (1 − 1/4) = 75 (proporción, sin coeficiente fijo)');
}

console.log('\n[3b] Nulos correctos: sin errores (IM3/IM5), con un solo intento (IM1) o con Desarrollo vacío (IM10) es «sin evidencia», no un valor por defecto');
{
  const s = sess([[1, 'llegada', 'secuencia'], [5, 'despedida', 'secuencia']]);
  const h: HistoryEvent[] = [{ type: 'place', cardId: 'llegada', slotId: 1, phase: 'inicio', timestamp: T0 }, move(10, 1, 'llegada', 'secuencia', 'inicio'), move(20, 5, 'despedida', 'secuencia', 'cierre')];
  ok(val(h, s, 'IM3') === null, 'IM3 sin errores = null'); ok(val(h, s, 'IM5') === null, 'IM5 sin errores = null'); ok(val(h, s, 'IM10') === null, 'IM10 con Desarrollo vacío = null (no 0)');
  ok([val(h, s, 'IM1'), val(h, s, 'IM2'), val(h, s, 'IM6'), val(h, s, 'IM7'), val(h, s, 'IM8'), val(h, s, 'IM9')].every((v) => v !== null), 'el resto de indicadores sí tiene valor con esta actividad (2 decisiones)');
  // IM1 necesita al menos dos intentos para formar un intervalo: con uno solo, no hay pausa que medir.
  const one: HistoryEvent[] = [{ type: 'place', cardId: 'llegada', slotId: 1, phase: 'inicio', timestamp: T0 }, move(8, 1, 'llegada', 'secuencia', 'inicio')]; ok(val(one, sess([[1, 'llegada', 'secuencia']]), 'IM1') === null, 'IM1 con una sola decisión = null (no hay intervalo entre intentos que evaluar)');
  // IM5 exige que el intento siguiente sea sobre la MISMA unidad: leer la devolución o decidir sobre otra rutina no cuenta.
  const bad = sess([[3, 'colacion', 'seriacion']]);
  const e1: HistoryEvent[] = [move(0, 3, 'colacion', 'seriacion', 'desarrollo')]; ok(val(e1, bad, 'IM5') === null, 'IM5 error sin un intento posterior en la misma unidad = null (no 0: no hubo ocasión de reajustar)');
  const e2: HistoryEvent[] = [move(0, 3, 'colacion', 'seriacion', 'desarrollo'), an(9, 'situacion', 'colacion')]; ok(val(e2, bad, 'IM5') === null, 'IM5 error + lee la devolución pero sin volver a decidir sobre esa rutina = null (leer no es reajustar)');
  const e3: HistoryEvent[] = [move(0, 3, 'colacion', 'seriacion', 'desarrollo'), move(10, 1, 'llegada', 'secuencia', 'inicio')]; ok(val(e3, bad, 'IM5') === null, 'IM5 error seguido de una decisión acertada en OTRA rutina = null (el reajuste tiene que ser en la misma unidad)');
  const e4: HistoryEvent[] = [move(0, 3, 'colacion', 'seriacion', 'desarrollo'), move(10, 3, 'colacion', 'cuantificadores', 'desarrollo')]; ok(val(e4, bad, 'IM5') === 100, 'IM5 error seguido de un acierto en la MISMA unidad = 100');
}

console.log('\n[4] Secuencia: cierre decidido antes de inicio/desarrollo (IM6)');
{ const s = sess([[5, 'despedida', 'secuencia']]); const h = [move(0, 5, 'despedida', 'secuencia', 'cierre')]; ok(val(h, s, 'IM6') === 0, 'IM6 = 100 × (1 − 1/1) = 0 (único movimiento y es un salto: cierre sin inicio ni desarrollo previos)'); }

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
  ok(COMPAT_4_0_IDS.every((code) => (p.indicators.find((i) => i.id === code)?.value ?? null) === (r.indicators.find((x) => x.code === code)?.value ?? null)), `${n}: IM1–IM10 por código`);
  // IM11 (motor 4.1) no viaja en el payload 4.0 que lee el Diario — vive aparte en immz41.
  const payloadObj = (r.payload as Record<string, unknown>);
  ok(!(payloadObj.indicators as { code: string }[]).some((i) => i.code === 'IM11'), `${n}: IM11 no aparece en el payload 4.0 (indicators)`);
  ok(typeof payloadObj.immz41 === 'object' && payloadObj.immz41 !== null, `${n}: el bloque immz41 existe`);
}
console.log('\n[6] TAREA 4: IM11 — calibración del juicio metacognitivo (modal tras confirmar)');
{
  const s = sess([[1, 'llegada', 'secuencia'], [3, 'colacion', 'seriacion']]);
  const h: HistoryEvent[] = [move(0, 1, 'llegada', 'secuencia', 'inicio'), jd(1, 'llegada', true, true), move(10, 3, 'colacion', 'seriacion', 'desarrollo'), jd(11, 'colacion', true, false)];
  ok(val(h, s, 'IM11') === 50, 'IM11 = 1 de 2 juicios calibrados (declarado=real) = 50');
  const none = sess([[1, 'llegada', 'secuencia']]); ok(val([move(0, 1, 'llegada', 'secuencia', 'inicio')], none, 'IM11') === null, 'IM11 sin juicios emitidos = null (modal apagado o no respondido)');
  const r = buildReport({ participantName: 'Ana María Pérez', classNumber: 2, session: s, history: h, reflection: { ...INITIAL_REFLECTION, reflexionEscrita: '' }, now, judgmentEnabled: true });
  const immz41 = (r.payload as Record<string, unknown>).immz41 as Record<string, unknown>;
  const im11 = immz41.im11 as Record<string, unknown>;
  ok(im11.value === 50, `immz41.im11.value = 50 (got ${im11.value})`);
  ok(immz41.judgment_prompt === 'on', 'immz41.judgment_prompt refleja judgmentEnabled');
  const r2 = buildReport({ participantName: 'Ana María Pérez', classNumber: 2, session: s, history: h, reflection: { ...INITIAL_REFLECTION, reflexionEscrita: '' }, now, judgmentEnabled: false });
  ok((r2.payload as Record<string, unknown>).immz41 as unknown && ((r2.payload.immz41 as Record<string, unknown>).judgment_prompt === 'off'), 'judgmentEnabled=false → judgment_prompt="off"');
}

console.log('\n[7] TAREA 3: Forma A declarada por defecto en el payload, y las 3 Formas (A/B/C) son estadísticamente paralelas (11 pares, 7 rutinas cada una)');
{
  const r = buildReport({ participantName: 'Ana María Pérez', classNumber: 2, session: sess([]), history: [], reflection: INITIAL_REFLECTION, now });
  const p = r.payload as Record<string, unknown>;
  ok(p.form_id === 'A', `form_id = 'A' por defecto (got ${p.form_id})`);
  ok(p.content_level === 1, `content_level = 1 (got ${p.content_level})`);
  ok(p.content_id === 'rutinas_cuidado_completo_7x6', `content_id = 'rutinas_cuidado_completo_7x6' (got ${p.content_id})`);
  const ot = p.opportunity_target as Record<string, number>;
  ok(ot.pares_coherencia === 11, `opportunity_target.pares_coherencia = 11 (got ${ot.pares_coherencia})`);
  ok(ot.devoluciones_disponibles === ROUTINES.length * 2 + 3, `opportunity_target.devoluciones_disponibles = ${ROUTINES.length * 2 + 3} (got ${ot.devoluciones_disponibles})`);
  ok(ot.formulaciones_disponibles_max === ROUTINES.length, `opportunity_target.formulaciones_disponibles_max = ${ROUTINES.length} (got ${ot.formulaciones_disponibles_max})`);
  for (const forma of FORMAS) {
    const rf = buildReport({ participantName: 'Ana María Pérez', classNumber: 2, session: sess([]), history: [], reflection: INITIAL_REFLECTION, now, formId: forma.id, contentLevel: forma.contentLevel, contentId: forma.contentId });
    const pf = rf.payload as Record<string, unknown>;
    const otf = pf.opportunity_target as Record<string, number>;
    ok(pf.form_id === forma.id && pf.content_id === forma.contentId, `Forma ${forma.id}: form_id/content_id = ${forma.id}/${forma.contentId} (got ${pf.form_id}/${pf.content_id})`);
    ok(forma.routines.length === 7 && otf.pares_coherencia === 11 && otf.devoluciones_disponibles === 17 && otf.formulaciones_disponibles_max === 7, `Forma ${forma.id}: 7 rutinas, 11 pares, 17 devoluciones, 7 formulaciones (paralela a las otras 2 formas)`);
  }
}

console.log('\n[8] IM10 con justificación escrita (rúbrica de grupos de términos, igual que en Laboratorio)');
{
  const s = sess([[3, 'colacion', 'correspondencia'], [4, 'orden', 'clasificacion']]);
  const buena = move(0, 3, 'colacion', 'correspondencia', 'desarrollo', 'Reparto una fruta por persona, verificando si alcanza para todos y si las porciones iguales caben en la bandeja.');
  const sinTexto = move(10, 4, 'orden', 'clasificacion', 'desarrollo');
  ok(val([buena, sinTexto], s, 'IM10') === 100, 'IM10 = 2/2 (justificación evaluada por rúbrica + acto por acción sin texto)');
  const parcial = move(0, 3, 'colacion', 'correspondencia', 'desarrollo', 'Reparto una fruta para todos.');
  ok(val([parcial, sinTexto], s, 'IM10') === 50, 'IM10 = 1/2 (justificación no toca 3 grupos → formulación incorrecta, aunque la decisión sea coherente)');
}

console.log('\n[9] TAREA 4/5: NRC en la raíz del payload, y esquema 4.1 (compat. 4.0) sin romper el contrato del Diario');
{
  const r = buildReport({ participantName: 'Ana María Pérez', classNumber: 2, session: sess([]), history: [], reflection: INITIAL_REFLECTION, now, nrc: '12345' });
  const p = r.payload as Record<string, unknown>;
  ok(p.nrc === '12345', `nrc = '12345' (got ${p.nrc})`);
  ok(p.schema_version === '4.1' && p.schemaVersion === '4.1', `schema_version/schemaVersion = '4.1' (got ${p.schema_version}/${p.schemaVersion})`);
  ok(p.compat_schema === '4.0', `compat_schema = '4.0' (got ${p.compat_schema})`);
  const c = selfCheck(r, 2, 'Ana María Pérez');
  ok(c.parsed.sourceVersion === '4.0', `el Diario sigue leyendo esquema 4.0 aunque la raíz declare 4.1 (got ${c.parsed.sourceVersion})`);
  ok(c.ok, `el contrato 4.0 sigue intacto con schema_version 4.1 en la raíz (${c.issues.join(' · ')})`);

  const r2 = buildReport({ participantName: 'Ana María Pérez', classNumber: 2, session: sess([]), history: [], reflection: INITIAL_REFLECTION, now });
  ok((r2.payload as Record<string, unknown>).nrc === null, 'nrc = null cuando no se declara (sin NRC falso)');
}

console.log('\n[10] TAREA 5: medias del bloque immz41 (IM1–IM11) calzan con la fórmula declarada');
{
  const s = sess([[3, 'colacion', 'correspondencia'], [4, 'orden', 'clasificacion']]);
  const a = move(0, 3, 'colacion', 'correspondencia', 'desarrollo');
  const b = move(10, 4, 'orden', 'clasificacion', 'desarrollo');
  const judged = { type: 'judgment' as const, cardId: 'colacion', declared: true, real: true, timestamp: 20 };
  const r = buildReport({ participantName: 'Ana María Pérez', classNumber: 2, session: s, history: [a, b, judged], reflection: INITIAL_REFLECTION, now, judgmentEnabled: true });
  const p = r.payload as Record<string, unknown>;
  const m = p.immz41 as Record<string, unknown>;
  const byCode = new Map(r.indicators.map((i) => [i.code, i.value]));
  const mean = (codes: string[]) => { const vs = codes.map((c) => byCode.get(c)).filter((v): v is number => typeof v === 'number'); return vs.length ? Math.round((vs.reduce((x, y) => x + y, 0) / vs.length) * 10) / 10 : null; };
  ok(m.immz === mean(['IM1', 'IM2', 'IM3', 'IM4', 'IM5', 'IM11']), `immz41.immz = media(IM1,IM2,IM3,IM4,IM5,IM11) (got ${m.immz})`);
  ok(m.immz_ao === mean(['IM1', 'IM2', 'IM11']), `immz41.immz_ao = media(IM1,IM2,IM11) (got ${m.immz_ao})`);
  ok(m.immz_ac === mean(['IM3', 'IM4', 'IM5']), `immz41.immz_ac = media(IM3,IM4,IM5) (got ${m.immz_ac})`);
  ok(m.idcd === mean(['IM6', 'IM7', 'IM8', 'IM9', 'IM10']), `immz41.idcd = media(IM6..IM10) (got ${m.idcd})`);
  ok(m.immg === mean(['IM1', 'IM2', 'IM3', 'IM4', 'IM5', 'IM6', 'IM7', 'IM8', 'IM9', 'IM10', 'IM11']), `immz41.immg = media(IM1..IM11) (got ${m.immg})`);
}

console.log(fail ? `\n✗ ${fail} verificación(es) fallaron` : '\n✓ Fórmulas y contrato verificados');
process.exit(fail ? 1 : 0);
