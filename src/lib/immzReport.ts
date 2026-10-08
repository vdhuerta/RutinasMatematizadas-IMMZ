import { APP_META, APP_VERSION, COMPAT_4_0_IDS, INDICATORS, INSTITUTION } from '../config';
import { MATH_SITUATIONS, OAS_BCEP_COMPLETO, getForma } from '../data/rutinas';
import { COHERENCE_PAIRS, PHASES, PHASE_TITLE, isCoherent } from '../data/didactics';
import { categorize } from './immz/scoring';
import { parseReportText } from './immz/parser';
import { ICON_SVG } from './reportIcons';
import { buildAnalysisModel } from '../analysis/model';
import type { IndicatorView } from '../analysis/standard';
import { computeIndicators, computeStats, formulacionModo, indicesOf, slotPhase, type HistoryEvent, type IndicatorResult, type Session, type SessionStats } from './metrics';
import { ENGINE_VERSION } from '../immz-core/constants';
import { computeDesign } from './design';
import { REPORT_CSS } from './reportCss';
import type { ImmzCategory, SelfReflection } from '../types';

/**
 * CONTRATO DE REPORTE IMMZ (payload 4.1, compat 4.0) — Diario de Campo ⇄ Rutinas Matematizadas
 * ───────────────────────────────────────────────────────────────────────────────────────────
 * 1. El PRIMER <script type="application/json"> del archivo es el payload canónico (id "bct-report-payload").
 *    Las trazas crudas van DESPUÉS (id "tsd-report-raw-data": el parser del Diario también lo reconoce, pero solo si el primero falta).
 * 2. Códigos IM1–IM10 del esquema 4.0 (nunca nombres): el parser los empareja por código.
 *    IM11 NO viaja en `indicators`/`immz`/`idcd`/`immg` del payload raíz (el Diario de hoy no lo
 *    conoce): vive aparte en el bloque `immz41`, que el Diario simplemente ignora.
 * 3. Claves duplicadas en camelCase y snake_case (classNumber, participant.name, apropiacion, aciertos, errores, reflexiones, schemaVersion, scenarioName).
 * 4. Valores 0–100; null = sin evidencia. Índices con el mismo scoring del Diario (filtrados a
 *    COMPAT_4_0_IDS). ICMR (Dim. 2) viaja como `idcd`.
 * 5. Nombre de archivo: <prefijo><Nombre>_<ID>.html con prefijo = DEFAULT_APP_CONFIGS.filenamePrefix (Reporte_Rutinas_).
 * 6. schema_version/schemaVersion = '4.1' en la raíz: el parser del Diario detecta la GENERACIÓN
 *    del esquema por el entero mayor ('>=4' → '4.0', sin re-mapeo de códigos), así que un '4.1'
 *    se comporta exactamente igual que '4.0' ante el Diario de hoy. compat_schema = '4.0' declara,
 *    aparte, que el bloque de compatibilidad (indicators/immz/immz_ao/immz_ac/idcd/immg de la raíz)
 *    conserva la forma EXACTA 4.0 (IM1–IM10). `nrc` (TAREA 4) y `form_id/content_level/content_id`
 *    (la Forma A/B/C activa, ver getForma) también viajan en la raíz; el Diario de hoy los ignora sin romperse.
 */
export { REPORT_CSS };
export const CATEGORY_CLASS: Record<ImmzCategory, string> = { Inicial: 'c-ini', 'En Desarrollo': 'c-dev', Competente: 'c-com', Avanzado: 'c-adv' };
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
const f1 = (v: number | null) => (v === null ? '—' : `${Math.round(v)}%`);
const routineLabel = (id: string, s: Session) => s.slots.find((x) => x.routine?.id === id)?.routine?.label ?? id;
const sitLabel = (id: string) => MATH_SITUATIONS.find((m) => m.id === id)?.label ?? id;

export interface ReportInput {
  participantName: string; classNumber: number | null; session: Session; history: HistoryEvent[]; reflection: SelfReflection; now?: Date; certificateId?: string;
  /** Modal de calibración del juicio (IM11) activo durante la sesión. Default true (ver storage.ts). */
  judgmentEnabled?: boolean;
  /**
   * TAREA 3 (formas paralelas): tres conjuntos completos y estadísticamente equivalentes —
   * Forma A (2do Tramo: Niveles Medios, contenido original), Forma B (1er Tramo: Sala Cuna) y
   * Forma C (3er Tramo: Niveles de Transición) — cada uno con sus propias 7 rutinas sobre las
   * 6 Situaciones Matemáticas universales y la misma distribución de 11 pares de coherencia
   * (1-2-2-2-2-1-1). Ver getForma(formId) en data/rutinas.ts. `formId` default Forma A.
   */
  formId?: string | null; contentLevel?: number | null; contentId?: string | null;
  /** NRC del curso (TAREA 4): lo declara la docente una sola vez al abrir la app; viaja en la raíz del payload 4.1. */
  nrc?: string | null;
}
/** Compat: Forma A (valores por defecto cuando el llamador no declara formId). Preferir getForma(formId). */
export const DEFAULT_FORM_ID = getForma(null).id;
export const DEFAULT_CONTENT_LEVEL = getForma(null).contentLevel;
export const DEFAULT_CONTENT_ID = getForma(null).contentId;
/** Índices 4.0 de compatibilidad (IM1–IM10, lo que entiende el Diario hoy). */
export interface CompatIndices { immzAO: number | null; immzAC: number | null; immz: number | null; idcd: number | null; immg: number | null; category: ImmzCategory | null }
export interface BuiltReport {
  html: string; bodyHtml: string; css: string; fileName: string; certificateId: string;
  payload: Record<string, unknown>; indicators: IndicatorResult[]; stats: SessionStats; indices: CompatIndices; imd: number;
}

export const makeCertificateId = (now: Date) => `${now.getFullYear()}${now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(':', '')}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
export const safeFileName = (name: string) => name.trim().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Participante';
export const reportFileName = (name: string, id: string) => `${APP_META.filenamePrefix}${safeFileName(name)}_${id}.html`;

const badge = (c: ImmzCategory | null) => `<span class="pill ${c ? CATEGORY_CLASS[c] : 'c-none'}">${c ?? 'Sin evidencia'}</span>`;

/** Descripción legible de un evento de la traza (pantalla y reporte). */
export function describeEvent(e: HistoryEvent, s: Session): { action: string; detail: string } {
  const r = 'cardId' in e ? routineLabel(e.cardId, s) : '';
  if (e.type === 'place') return { action: 'Rutina ubicada', detail: `«${r}» en la línea de tiempo (${PHASE_TITLE[e.phase]}).` };
  if (e.type === 'remove') return { action: e.kind === 'routine' ? 'Rutina quitada' : 'Situación quitada', detail: `«${r}»${e.kind === 'routine' ? ' retirada de la línea de tiempo.' : ': se retiró la situación matemática.'}` };
  if (e.type === 'move') return e.kind === 'situation'
    ? { action: e.isCorrect ? 'Decisión coherente' : 'Decisión con conflicto didáctico', detail: `«${r}» ← ${sitLabel(e.to)} (${e.isCorrect ? 'óptima' : 'desajuste de coherencia'}).` }
    : { action: e.isCorrect ? 'Fase coherente' : 'Fase con conflicto didáctico', detail: `«${r}» reubicada en ${PHASE_TITLE[e.to as keyof typeof PHASE_TITLE] ?? e.to}.` };
  if (e.type === 'judgment') return { action: e.declared === e.real ? 'Juicio calibrado' : 'Juicio con desajuste', detail: `«${r}»: la estudiante declaró que ${e.declared ? 'sí' : 'no'} era coherente antes de confirmar; el resultado real fue ${e.real ? 'coherente' : 'incoherente'}.` };
  return { action: 'Devolución consultada', detail: e.kind === 'rutina' ? `Devolución de la rutina «${r}».` : e.kind === 'situacion' ? `Devolución de la situación en «${r}».` : `Orientación de fase (${e.phase ? PHASE_TITLE[e.phase] : '—'}).` };
}

export function buildReport(input: ReportInput): BuiltReport {
  const now = input.now ?? new Date();
  const certificateId = input.certificateId ?? makeCertificateId(now);
  const name = input.participantName.trim();
  const { session, history, reflection } = input;
  const judgmentEnabled = input.judgmentEnabled ?? true;
  const indicators = computeIndicators(history, session);
  const stats = computeStats(history, session);
  const design = computeDesign(session.slots, session.plan, reflection);
  const duration = history.length ? Math.max(0, Math.round((now.getTime() - history[0].timestamp) / 1000)) : 0;
  const cls = input.classNumber;
  const nrc = input.nrc ?? null;
  const plan = session.plan;
  const forma = getForma(input.formId);

  // Índices 4.1 (11 indicadores, incluye IM11) — para la pantalla y el bloque immz41.
  const idxFull = indicesOf(indicators);
  // Índices 4.0 de compatibilidad (IM1–IM10 únicamente): el Diario no conoce IM11, así que se
  // excluye SIEMPRE de este cálculo (nunca como "sin evidencia", sino fuera del grupo entero).
  const meanOfCompat = (codes: string[]) => {
    const v = codes.map((c) => indicators.find((r) => r.code === c)?.value).filter((x): x is number => typeof x === 'number');
    return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : null;
  };
  const idxCompat: CompatIndices = (() => {
    const immzAO = meanOfCompat(['IM1', 'IM2']);
    const immzAC = meanOfCompat(['IM3', 'IM4', 'IM5']);
    const immz = meanOfCompat(['IM1', 'IM2', 'IM3', 'IM4', 'IM5']);
    const idcd = meanOfCompat(['IM6', 'IM7', 'IM8', 'IM9', 'IM10']);
    const immg = meanOfCompat(COMPAT_4_0_IDS);
    return { immzAO, immzAC, immz, idcd, immg, category: categorize(immg) };
  })();

  const payloadIndicators = COMPAT_4_0_IDS.map((code) => {
    const d = INDICATORS.find((x) => x.id === code)!;
    const r = indicators.find((x) => x.code === d.id)!;
    return { code: d.id, name: d.label, dimension: d.dimension, subdimension: d.sub, value: r.value, level: categorize(r.value), has_evidence: r.value !== null, evidence_n: r.denominator, feedback: r.feedback };
  });
  const im11 = indicators.find((x) => x.code === 'IM11')!;

  const payload: Record<string, unknown> = {
    // schema_version '4.1' (motor 4.1): el Diario detecta la GENERACIÓN del esquema por el major
    // ('>=4' → '4.0', sin re-mapeo de códigos — ver detectSchema() en su parser), así que '4.1' se
    // lee exactamente igual que '4.0' hoy. compat_schema declara, aparte, que indicators/immz/
    // immz_ao/immz_ac/idcd/immg de la raíz mantienen EXACTAMENTE la forma 4.0 (IM1–IM10, sin IM11).
    schema_version: '4.1', schemaVersion: '4.1', compat_schema: '4.0',
    nrc,
    app: { id: APP_META.id, name: APP_META.name, version: APP_VERSION },
    scenarioName: APP_META.scenarioName,
    class_number: cls, classNumber: cls,
    participant: { name }, participant_name: name, participantName: name,
    certificate_id: certificateId,
    generatedAt: now.toISOString(), duration_seconds: duration,
    indicators: payloadIndicators,
    immz: idxCompat.immz, immz_ao: idxCompat.immzAO, immz_ac: idxCompat.immzAC, idcd: idxCompat.idcd, icmr: idxCompat.idcd, immg: idxCompat.immg, category: idxCompat.category, imd: design.imd,
    apropiacion: stats.appropriation, aciertos: stats.currentHits, errores: stats.currentErrors, reflexiones: stats.analyses, movimientos: stats.totalMoves,
    appropriation: { value: stats.appropriation, has_evidence: stats.hasEvidence, components: { accuracy: stats.accuracy, efficiency: stats.efficiency, reflection: stats.reflectionFactor }, weights: { accuracy: 0.5, efficiency: 0.3, reflection: 0.2 } },
    activity: { total_moves: stats.totalMoves, hits: stats.currentHits, errors: stats.currentErrors, analyses: stats.analyses, items_assigned: stats.itemsAssigned, items_total: stats.totalCards, feedback_consulted: stats.feedbackConsulted, feedback_available: stats.feedbackAvailable },
    self_reflection: { oportunidad: reflection.oportunidad, especificidad: reflection.especificidad, mejora: reflection.mejora, written: reflection.reflexionEscrita },
    design_quality: { imd: design.imd, parts: design.parts.map((p) => ({ key: p.key, score: p.score })) },
    form_id: forma.id, content_level: forma.contentLevel, content_id: forma.contentId,
    session_seq: null,
    // Capacidad estructural del contenido (NO el desempeño de esta sesión): cuántos pares de
    // coherencia, devoluciones y formulaciones admite la Forma ACTIVA completa (ver
    // getForma(formId) — las 3 formas comparten la misma distribución de 11 pares, pero el
    // cálculo se ciñe a las 7 rutinas de esta forma, no a las 21 de las 3 formas juntas). No se
    // pasa como `target` a computeIndicatorsCore (IM10 sigue evaluándose contra lo que el
    // estudiante efectivamente formuló, no contra un máximo curricular) — es solo declarativo.
    opportunity_target: {
      pares_coherencia: forma.routines.reduce((a, r) => a + (COHERENCE_PAIRS[r.id]?.length ?? 0), 0),
      devoluciones_disponibles: forma.routines.length * 2 + PHASES.length,
      formulaciones_disponibles_max: forma.routines.length,
    },
    engine_version: ENGINE_VERSION,
    // Bloque 4.1: todo lo que el Diario de hoy no lee (IM11 + índices completos), para cuando
    // el Diario adopte el motor 4.1. El payload raíz de arriba sigue siendo 100% 4.0-compatible.
    immz41: {
      im11: { value: im11.value, has_evidence: im11.value !== null, evidence_n: im11.denominator, feedback: im11.feedback, formula: im11.formula },
      immz_ao: idxFull.immzAO, immz_ac: idxFull.immzAC, immz: idxFull.immz, idcd: idxFull.idcd, immg: idxFull.immg, category: idxFull.category,
      engine_version: ENGINE_VERSION, judgment_prompt: judgmentEnabled ? 'on' : 'off', im10_modo: formulacionModo(history),
    },
  };

  let prev: number | null = null;
  const trace = history.map((h, i) => {
    const dt = prev === null ? null : h.timestamp - prev; prev = h.timestamp;
    return { seq: i + 1, t: new Date(h.timestamp).toISOString(), ms: h.timestamp, dt_ms: dt, ...h };
  });
  const raw = {
    schema: 'immz-trace/1', app: payload.app, certificate_id: certificateId, class_number: cls, participant_name: name,
    started_at: history.length ? new Date(history[0].timestamp).toISOString() : null, ended_at: now.toISOString(), duration_seconds: duration,
    indicator_evidence: indicators.map((r) => ({ code: r.code, value: r.value, numerator: r.numerator, denominator: r.denominator, formula: r.formula })),
    final_timeline: session.slots.map((sl) => ({ slot_id: sl.id, time_label: sl.timeLabel, phase: slotPhase(sl, plan), routine_id: sl.routine?.id ?? null, situation_id: sl.mathSituationId, is_coherent: sl.routine && sl.mathSituationId ? isCoherent(sl.routine.id, sl.mathSituationId) : null })),
    planning: { niveles: plan.niveles, ambitos: plan.ambitos, nucleos: plan.nucleos, objetivos_bcep: plan.objetivosBCEP, objetivo_especifico: plan.objetivoEspecifico, situacion_problematica: plan.competencia, justifications: plan.justifications, phase_justifications: plan.phaseJustifications },
    trace,
  };
  const json = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

  const m = buildAnalysisModel(history, session);
  const cfg = m.cfg;
  const card = (i: IndicatorView, tone: string) => {
    const cat = categorize(i.value);
    return `<div class="card" data-variable="${i.code}" data-value="${i.value ?? ''}"><div class="top"><div><h4>${esc(i.name)}</h4><span class="basis">${esc(i.authors)}</span></div><div><div class="val">${f1(i.value)}</div>${badge(cat)}</div></div>
      <p>${esc(i.description)}</p>${i.breakdown ? `<div class="chip">${esc(i.breakdown)}</div>` : ''}
      <div class="bar"><i style="width:${i.value ?? 0}%;background:${tone}"></i></div>
      <div class="diag"><span class="micro">Diagnóstico cualitativo:</span>${esc(i.feedback)}</div>
      <div class="ev">n=${i.n} · ${esc(i.formula)}</div></div>`;
  };
  const subhead = (code: string, title: string, blurb: string, label: string, v: number | null, dv: string) => `<div class="subhead"><div><h3>Subdimensión ${code} — ${title}</h3><p>${blurb}</p></div><div class="subval"><b data-variable="${dv}" data-value="${v ?? ''}">${label}: ${f1(v)}</b><span class="micro">${esc(categorize(v) ?? 'Sin evidencia')}</span></div></div>`;
  const ind = (sub: string) => m.indicators.filter((i) => (sub === 'B' ? i.dimension === 'B' : i.subdimension === sub));
  const ap = m.appropriation;
  const list = (xs: string[], empty: string) => xs.length ? `<ul>${xs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : `<span class="micro" style="text-transform:none;letter-spacing:0">${empty}</span>`;
  const selOAs = Object.keys(OAS_BCEP_COMPLETO).flatMap((nv) => plan.niveles.includes(nv) ? Object.entries(OAS_BCEP_COMPLETO[nv]).flatMap(([nu, oas]) => plan.nucleos.includes(nu) ? oas.filter((o) => plan.objetivosBCEP.includes(o)).map((o) => `[${nv} · ${nu}] ${o}`) : []) : []);
  const bySlotPhase = (p: string) => session.slots.filter((sl) => sl.routine && slotPhase(sl, plan) === p);

  const bodyHtml = `<div class="wrap"><div class="sheet">
    <div class="head"><div class="ttl"><span class="ico">${ICON_SVG.activity(22)}</span><div><span class="micro" style="color:var(--brand)">${esc(cfg.moduleLabel)}</span><h1>Análisis Metacognitivo</h1><p>Evaluación del proceso de autorregulación y desempeño didáctico TSD</p></div></div>
      <div style="text-align:right"><span class="pill cid">${esc(certificateId)}</span><p>Generado el ${esc(now.toLocaleDateString('es-CL'))} ${esc(now.toLocaleTimeString('es-CL'))}</p></div></div>

    <div class="tiles" id="rm-summary-container" data-activity-total-moves="${stats.totalMoves}" data-activity-hits="${stats.currentHits}" data-activity-errors="${stats.currentErrors}" data-activity-analyses="${stats.analyses}">
      <div class="tile plain"><span class="micro">Participante / Diseñador</span><div class="v" style="font-size:15px;color:var(--brand)" id="rm-participant-name" data-value="${esc(name)}">${esc(name) || 'No especificado'}</div><div class="s">${esc(INSTITUTION)}</div></div>
      <div class="tile w" data-variable="appropriation" data-value="${ap.value ?? ''}"><span class="micro" style="color:var(--brand)">Apropiación teórica</span><div class="v" style="color:var(--brand)">${ap.hasEvidence ? f1(ap.value) : 'Sin evidencia'}</div><div class="s">Exactitud ${ap.accuracy} % · Eficiencia ${ap.efficiency} % · Reflexión ${ap.reflectionFactor} %</div></div>
      <div class="tile w" data-variable="immg" data-value="${m.immg ?? ''}"><span class="micro" style="color:var(--brand)">Índice global (IMMG)</span><div class="v" style="color:var(--brand)">${f1(m.immg)}</div>${badge(idxFull.category)}</div>
      <div class="tile w"><span class="micro">Sub-índices metacognitivos</span><div class="mini"><div class="m1"><i>AO</i><b data-variable="IMMZ-AO" data-value="${m.immzAO ?? ''}">${f1(m.immzAO)}</b></div><div class="m1"><i>AC</i><b data-variable="IMMZ-AC" data-value="${m.immzAC ?? ''}">${f1(m.immzAC)}</b></div><div class="m1 g"><i>IMMZ</i><b data-variable="IMMZ" data-value="${m.immz ?? ''}">${f1(m.immz)}</b></div><div class="m1 e"><i>ICMR</i><b data-variable="IDCD" data-value="${m.idcd ?? ''}">${f1(m.idcd)}</b></div></div></div>
      <div class="tile w e" data-variable="imd" data-value="${design.imd}"><span class="micro" style="color:#0284c7">Madurez del Diseño (IMD)</span><div class="v" style="color:#0369a1">${design.imd}%</div><div class="s">${esc(design.state)}</div></div>
    </div>
    <div class="contract"><span class="micro" style="color:#8a5a0a">Datos de lectura para el Diario de Campo</span><br/>APP <b>${esc(APP_META.name)}</b> · Clase <b>${cls ?? 'no declarada'}</b> · Esquema <b>4.1 (compat. 4.0)</b>${nrc ? ` · NRC <b>${esc(nrc)}</b> · Forma <b>${esc(forma.id)}</b>` : ''} · Archivo <b>${esc(reportFileName(name, certificateId))}</b><br/>Adjunta este archivo <u>sin modificarlo</u> en tu entrada del Diario de Campo (elige la APP «${esc(APP_META.name)}»${cls ? ` y la Clase ${cls}` : ''}). Las trazas de la sesión van incluidas en el mismo archivo.</div>

    <div class="sec"><h2><i style="background:#4f46e5"></i>1. DIMENSIÓN 1: Monitoreo Metacognitivo (Zimmerman &amp; Moylan, 2009)<span class="pill c-none" style="margin-left:auto" data-variable="IMMZ" data-value="${m.immz ?? ''}">IMMZ: ${f1(m.immz)}</span></h2>
      <div class="kpis3" data-testid="kpis-dim1"><div class="kpi3"><i>IMMZ-AO</i><b>${f1(m.immzAO)}</b></div><div class="kpi3"><i>IMMZ-AC</i><b>${f1(m.immzAC)}</b></div><div class="kpi3 g"><i>IMMZ Global</i><b>${f1(m.immz)}</b></div></div>
      <div class="verdict a"><span class="t">Veredicto Dimensión 1: ${esc(m.verdictA.status)}</span><em>${esc(m.verdictA.desc)}</em></div>
      <div class="sub">${subhead('A1', 'Autoobservación', 'Procesos de atención reflexiva, vigilancia cognitiva y detención deliberada previa a la acción (Zimmerman &amp; Moylan, 2009).', 'IMMZ-AO', m.immzAO, 'IMMZ-AO')}<div class="grid2">${ind('AO').map((i) => card(i, '#4f46e5')).join('')}</div></div>
      <div class="sub">${subhead('A2', 'Autocontrol', 'Estrategias de autorregulación activa durante la tarea: detección y autocorrección de errores, retroalimentación y resiliencia.', 'IMMZ-AC', m.immzAC, 'IMMZ-AC')}<div class="grid2">${ind('AC').map((i) => card(i, '#4f46e5')).join('')}</div></div></div>

    <div class="sec"><h2><i style="background:#0ea5e9"></i>2. ${esc(cfg.dimB.title)}<span class="pill c-none" style="margin-left:auto" data-variable="IDCD" data-value="${m.idcd ?? ''}">ICMR: ${f1(m.idcd)}</span></h2>
      <div class="kpis3"><div class="kpi3 e"><i>${esc(cfg.dimB.subIndexLabel)}</i><b>${f1(m.idcd)}</b></div></div>
      <div class="verdict b"><span class="t">Veredicto Dimensión 2: ${esc(m.verdictB.status)}</span><em>${esc(m.verdictB.desc)}</em></div>
      <div class="grid2">${ind('B').map((i) => card(i, '#0ea5e9')).join('')}</div></div>

    <div class="sec"><h2><i style="background:var(--brand)"></i>3. Mapeo DigCompEdu — Área 4: Evaluación y Retroalimentación</h2>
      <table><thead><tr><th>Competencia DigCompEdu</th><th>Descripción</th><th>Implementación en la App</th></tr></thead><tbody>
      <tr><td><b class="bt">4.1 Estrategias de evaluación</b></td><td>Diseño de instrumentos de evaluación diagnóstica, formativa y sumativa mediados digitalmente.</td><td>${esc(cfg.digcomp.implement41)}</td></tr>
      <tr><td><b class="bt">4.2 Analíticas de aprendizaje</b></td><td>Análisis de datos y evidencias sobre el desempeño del estudiantado para informar la enseñanza.</td><td>${esc(cfg.digcomp.implement42)}</td></tr>
      <tr><td><b class="bt">4.3 Retroalimentación y toma de decisiones</b></td><td>Ofrecer retroalimentación oportuna y usar la información para adaptar la enseñanza y apoyar la toma de decisiones del estudiante.</td><td>${esc(cfg.digcomp.implement43)}</td></tr></tbody></table></div>

    <div class="sec"><h2><i style="background:#64748b"></i>4. Hoja de trabajo y clasificación didáctica<span class="pill c-none" style="margin-left:auto">${stats.currentHits} / ${stats.itemsAssigned} aciertos</span></h2>
      <div class="kpis5" data-testid="kpis-trabajo">${([['Apropiación', ap.hasEvidence ? f1(ap.value) : 'Sin evidencia', `Exactitud ${ap.accuracy}% · Efic. ${ap.efficiency}%`, ICON_SVG.grad, 'k-brand'], ['Aciertos (hoy)', String(stats.currentHits), 'Rutinas con situación coherente', ICON_SVG.check, 'k-ok'], ['Errores (hoy)', String(stats.currentErrors), 'Combinaciones con desajuste', ICON_SVG.x, 'k-no'], ['Decisiones', String(stats.totalMoves), 'Situaciones y fases decididas', ICON_SVG.click, 'k-sky'], ['Devoluciones', String(stats.analyses), 'Consultas de devolución didáctica', ICON_SVG.search, 'k-amber']] as [string, string, string, (s?: number) => string, string][]).map(([l, v, h, ic, c]) => `<div class="kpi5 ${c}"><div><span class="micro">${l}</span><div class="kv">${v}</div><div class="kh">${h}</div></div><span class="kic">${ic(20)}</span></div>`).join('')}</div>
      <div class="tl" data-testid="report-timeline">${session.slots.map((sl) => { const ok = sl.routine && sl.mathSituationId ? isCoherent(sl.routine.id, sl.mathSituationId) : null; return `<div class="tls ${ok === true ? 'ok' : ok === false ? 'no' : ''}" data-slot-id="${sl.id}"><div class="h">${esc(sl.timeLabel)} · ${esc(PHASE_TITLE[slotPhase(sl, plan)])}</div><div class="r">${esc(sl.routine?.label ?? '— sin rutina —')}</div><div>${sl.mathSituationId ? esc(sitLabel(sl.mathSituationId)) : sl.routine ? '<i>falta matematizar</i>' : ''}</div>${ok !== null ? `<span class="pill ${ok ? 'c-adv' : 'c-ini'}" style="font-size:8px;padding:0 6px;margin-top:4px">${ok ? 'Coherente' : 'Desajuste'}</span>` : ''}</div>`; }).join('')}</div>
      <div class="phases" style="grid-template-columns:repeat(3,1fr)">${PHASES.map((p) => `<div class="phase" data-phase-id="${p}"><h3>${esc(PHASE_TITLE[p])}</h3>${bySlotPhase(p).map((sl) => { const ok = sl.mathSituationId ? isCoherent(sl.routine!.id, sl.mathSituationId) : null; return `<div class="pc ${ok === false ? 'no' : 'ok'}"><div class="k">${esc(sl.timeLabel)}</div><b class="bt">${esc(sl.routine!.label)}</b><br/>${esc(sl.mathSituationId ? sitLabel(sl.mathSituationId) : 'Sin situación')}<div class="j">${esc(plan.justifications[sl.id] || 'Sin justificación.')}</div></div>`; }).join('') || `<p class="micro" style="text-align:center">Sin rutinas</p>`}${plan.phaseJustifications[p] ? `<div class="pc ok"><div class="k">Justificación del momento</div><div class="j" style="border:none;margin:0;padding:0">${esc(plan.phaseJustifications[p])}</div></div>` : ''}</div>`).join('')}</div></div>

    <div class="sec"><h2><i style="background:var(--accent)"></i>5. Planificación de clase (Bases Curriculares)</h2>
      <div class="plan"><h4>Niveles · Ámbitos · Núcleos</h4>${list([...plan.niveles, ...plan.ambitos, ...plan.nucleos], 'Sin componentes seleccionados.')}</div>
      <div class="plan"><h4>Objetivos de Aprendizaje (BCEP)</h4>${list(selOAs, 'Ningún objetivo seleccionado.')}</div>
      <div class="plan"><h4>Objetivo de aprendizaje específico</h4><div class="txt">${esc(plan.objetivoEspecifico) || '<i>No especificado</i>'}</div></div>
      <div class="plan"><h4>Competencia / Situación problemática</h4><div class="txt">${esc(plan.competencia) || '<i>No especificado</i>'}</div></div></div>

    <div class="sec"><h2><i style="background:#059669"></i>6. Desglose de Calidad Didáctica (IMD)<span class="pill c-none" style="margin-left:auto">IMD: ${design.imd}%</span></h2>
      <div class="imd">${design.parts.map((p) => `<div class="imdc" data-imd="${p.key}"><div class="t"><span>${esc(p.label)}</span><b class="bt">${p.score}%</b></div><div class="bar"><i style="width:${p.score}%;background:#059669"></i></div><p>${esc(p.feedback ? `Feedback: ${p.feedback}` : p.note)}</p></div>`).join('')}</div></div>

    <div class="sec"><h2><i style="background:var(--accent)"></i>7. Autodiagnóstico de Calidad Didáctica (Modelo Zimmerman)</h2>
      <div class="kpis3"><div class="kpi3"><i>Oportunidad</i><b>${reflection.oportunidad} / 5</b></div><div class="kpi3"><i>Especificidad</i><b>${reflection.especificidad} / 5</b></div><div class="kpi3"><i>Mejora didáctica</i><b>${reflection.mejora} / 5</b></div></div>
      <div class="note"><h3>Reflexión metacognitiva escrita</h3><span style="white-space:pre-wrap;font-style:italic">${esc(reflection.reflexionEscrita.trim() || 'Sin reflexión escrita registrada.')}</span></div></div>

    <div class="sec"><h2><i style="background:var(--brand)"></i>8. Bitácora de Monitoreo Activo</h2><p class="micro" style="text-transform:none;letter-spacing:0;margin:-4px 0 10px">Historial secuencial de vigilancia cognitiva capturado en tiempo real durante la toma de decisiones curriculares.</p>
      <table><thead><tr><th style="width:90px">Hora</th><th style="width:170px">Acción registrada</th><th>Detalle del evento</th></tr></thead><tbody>${history.length ? history.slice().reverse().map((e) => { const d = describeEvent(e, session); return `<tr><td class="mono">${esc(new Date(e.timestamp).toLocaleTimeString('es-CL'))}</td><td><b class="bt">${esc(d.action)}</b></td><td>${esc(d.detail)}</td></tr>`; }).join('') : '<tr><td colspan="3" style="text-align:center;font-style:italic;color:var(--mut)">No se han registrado interacciones aún.</td></tr>'}</tbody></table></div>

    <div class="sec note"><h3>Fundamentación teórica del diagnóstico</h3>${esc(cfg.foundation)}</div>
    <div class="foot"><span>© 2026 ${esc(INSTITUTION)}</span><span>${esc(APP_META.name)} v${APP_VERSION}</span></div>
  </div></div>`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Informe de Rutinas Matematizadas · ${esc(name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
<script id="bct-report-payload" type="application/json">${json(payload)}</script>
<script id="tsd-report-raw-data" type="application/json">${json(raw)}</script>
<style>${REPORT_CSS}</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
  return { html, bodyHtml, css: REPORT_CSS, fileName: reportFileName(name, certificateId), certificateId, payload, indicators, stats, indices: idxCompat, imd: design.imd };
}

/** Autovalidación: lee el HTML generado con el parser del Diario y compara contra lo calculado. */
export function selfCheck(r: BuiltReport, expectedClass: number | null, expectedName: string): { ok: boolean; issues: string[]; parsed: ReturnType<typeof parseReportText> } {
  const p = parseReportText(r.html, r.fileName);
  const issues: string[] = [];
  const eq = (a: number | null | undefined, b: number | null | undefined) => (a ?? null) === (b ?? null);
  // Solo IM1–IM10: el Diario de hoy no conoce IM11 (vive en el bloque immz41, fuera del contrato 4.0).
  COMPAT_4_0_IDS.forEach((code) => { const got = p.indicators.find((i) => i.id === code)?.value ?? null; const exp = r.indicators.find((i) => i.code === code)?.value ?? null; if (!eq(got, exp)) issues.push(`${code}: el Diario leería ${got} y la app calculó ${exp}`); });
  (['immz', 'immzAO', 'immzAC', 'idcd', 'immg'] as const).forEach((k) => { const exp = ({ immz: r.indices.immz, immzAO: r.indices.immzAO, immzAC: r.indices.immzAC, idcd: r.indices.idcd, immg: r.indices.immg })[k]; if (!eq(p[k], exp)) issues.push(`${k}: ${p[k]} ≠ ${exp}`); });
  if (p.classNumber !== expectedClass) issues.push(`Clase leída ${p.classNumber} ≠ ${expectedClass}`);
  if (p.simulator !== APP_META.name) issues.push(`APP leída «${p.simulator}» ≠ «${APP_META.name}»`);
  if (p.studentName !== expectedName.trim()) issues.push(`Nombre leído «${p.studentName}» ≠ «${expectedName.trim()}»`);
  if (p.sourceVersion !== '4.0') issues.push(`Esquema leído ${p.sourceVersion} ≠ 4.0`);
  if (!eq(p.apropiacion, r.stats.appropriation)) issues.push(`Apropiación leída ${p.apropiacion} ≠ ${r.stats.appropriation}`);
  if (!r.fileName.toLowerCase().startsWith(APP_META.filenamePrefix.toLowerCase())) issues.push('El nombre de archivo no comienza con el prefijo esperado');
  return { ok: issues.length === 0, issues, parsed: p };
}
