import { INDICATORS } from '../config';
import { ROUTINES } from '../data/rutinas';
import { isCoherent } from '../data/didactics';
import type { AppReportIndicator, PhaseKey, PlannerData, TimelineSlot } from '../types';
import { categorize, computeIndices, diagnose } from './immz/scoring';

/** Estado de la planificación que evalúan las métricas. */
export interface Session { slots: TimelineSlot[]; plan: PlannerData }

/**
 * Traza cruda de la sesión (una observación de conducta por evento).
 *  · place    → una rutina se ubica en la línea de tiempo (aún sin situación: NO se evalúa).
 *  · move     → decisión didáctica evaluable: asignar/cambiar la situación matemática de una rutina (kind 'situation')
 *               o reubicar la rutina en una fase de la clase (kind 'phase'). isCorrect = coherencia rutina↔situación.
 *  · remove   → se quita una rutina o una situación (se registra, no se evalúa).
 *  · analysis → se abre una devolución didáctica (rutina · situación · fase). Una por clave, como en la app original.
 */
export type HistoryEvent =
  | { type: 'place'; cardId: string; slotId: number; phase: PhaseKey; timestamp: number }
  | { type: 'move'; kind: 'situation' | 'phase'; cardId: string; slotId: number; from: string | null; to: string; phase: PhaseKey; isCorrect: boolean; timestamp: number }
  | { type: 'remove'; kind: 'routine' | 'situation'; cardId: string; slotId: number; timestamp: number }
  | { type: 'analysis'; kind: 'rutina' | 'situacion' | 'fase'; cardId: string; phase: PhaseKey | null; timestamp: number };
export type MoveEvent = Extract<HistoryEvent, { type: 'move' }>;

export interface IndicatorResult {
  code: string; value: number | null; numerator: number | null; denominator: number; formula: string; feedback: string;
}
export interface SessionStats {
  totalMoves: number; currentHits: number; currentErrors: number; analyses: number;
  appropriation: number | null; accuracy: number; efficiency: number; reflectionFactor: number;
  totalCards: number; itemsAssigned: number; hasEvidence: boolean;
  feedbackConsulted: number; feedbackAvailable: number;
}

const pct = (n: number, d: number) => Math.round((n / d) * 100);
export const slotPhase = (slot: TimelineSlot, plan: PlannerData): PhaseKey => {
  if (plan.slotPhases?.[slot.id]) return plan.slotPhases[slot.id];
  const l = slot.timeLabel.toLowerCase();
  if (l.includes('inicio')) return 'inicio';
  if (l.includes('cierre') || slot.id >= 4) return 'cierre';
  return 'desarrollo';
};

type Band = { t: [number, number]; basis: string; description: string; hi: string; mid: string; low: string; none: string };
const NONE = 'Sin evidencia registrada en esta sesión.';
/** Textos por indicador (de Rutinas Matematizadas; el código es el canónico 4.0). t = umbrales [alto, medio]. */
export const IM_TEXT: Record<string, Band> = {
  IM1: { t: [80, 40], basis: 'Zimmerman & Moylan (2009) — Fase de Ejecución: Autoobservación', description: 'Mide la atención reflexiva evaluando la cantidad de decisiones consecutivas separadas por un intervalo óptimo de deliberación (entre 5 y 60 segundos). Previene el arrastre impulsivo de tarjetas.', none: NONE,
    hi: 'Ritmo deliberado y consciente. La estudiante se detiene a analizar cada rutina antes de asignarle una situación matemática, lo que indica supervisión activa de la pertinencia pedagógica de cada combinación.', mid: 'Ritmo irregular. La estudiante alterna entre análisis reflexivo y asignaciones aceleradas, lo que sugiere que el monitoreo se activa solo ante rutinas que percibe como difíciles de matematizar.', low: 'Asignación impulsiva. La estudiante arrastra las situaciones matemáticas a las rutinas sin detenerse a evaluar la coherencia pedagógica. No hay evidencia de supervisión consciente del proceso.' },
  IM2: { t: [50, 20], basis: 'Zimmerman & Moylan (2009) — Fase de Ejecución: Autoobservación', description: 'La tasa de consulta teórica (devoluciones abiertas) respecto a las decisiones de diseño. Indica una disposición hacia la autoobservación reflexiva antes del diseño final.', none: NONE,
    hi: 'Equilibrio reflexivo sólido. La estudiante alterna entre asignar situaciones y consultar las devoluciones didácticas, lo que indica una práctica de planificación reflexiva: actuar, evaluar la pertinencia y ajustar.', mid: 'Reflexión incipiente. Consulta algunas devoluciones pero predomina la tendencia a asignar sin detenerse a contrastar su razonamiento con la retroalimentación disponible.', low: 'Planificación sin reflexión. La estudiante asigna mecánicamente sin consultar las devoluciones didácticas.' },
  IM3: { t: [80, 40], basis: 'Zimmerman & Moylan (2009) — Fase de Ejecución: Autocontrol', description: 'Evalúa la capacidad de identificar incongruencias didácticas mediante la devolución del sistema y su enmienda posterior: por cada rutina con error, 50 puntos por consultar la devolución y 50 por reasignarla luego de forma coherente.', none: NONE,
    hi: 'Capacidad madura de autodiagnóstico. La estudiante consulta activamente las devoluciones didácticas tras una asignación incorrecta y utiliza esa información para reasignar la situación matemática de manera coherente.', mid: 'Autodiagnóstico parcial. La estudiante corrige algunas asignaciones tras leer la devolución, pero en otros casos persiste en combinaciones forzadas sin consultar la retroalimentación disponible.', low: 'Dificultad para procesar la retroalimentación. La estudiante no consulta las devoluciones didácticas tras asignaciones incorrectas, o las consulta sin lograr traducirlas en una reasignación coherente.' },
  IM4: { t: [80, 40], basis: 'Zimmerman & Moylan (2009) — Fase de Ejecución: Autocontrol', description: 'Determina en qué medida la estudiante consulta las devoluciones efectivamente disponibles (de rutina, de situación y por fase).', none: NONE,
    hi: 'Uso activo y sistemático de la retroalimentación. La estudiante consulta las devoluciones didácticas para la mayoría de las rutinas, utilizando esta información para supervisar y ajustar la coherencia de su planificación.', mid: 'Consulta selectiva de retroalimentación. La estudiante accede a las devoluciones solo para algunas rutinas, lo que limita su capacidad de monitorear la coherencia global de la jornada matematizada.', low: 'Retroalimentación desaprovechada. La estudiante planifica sin consultar las devoluciones didácticas disponibles, perdiendo la oportunidad de supervisar si sus asignaciones son pedagógicamente pertinentes.' },
  IM5: { t: [80, 40], basis: 'Panadero & Alonso-Tapia (2014) — Ciclo Adaptativo post-error', description: 'Tasa en la que un conflicto didáctico es corregido inmediatamente en la decisión siguiente, reflejando una respuesta adaptativa constructiva ante el error.', none: NONE,
    hi: 'Resiliencia cognitiva sólida. Tras una asignación incorrecta, la estudiante reorganiza su razonamiento y logra acertar en la siguiente decisión, lo que indica capacidad de reajuste inmediato.', mid: 'Reajuste gradual. El error genera cierta desestabilización, pero la estudiante logra recuperarse tras varios intentos.', low: 'Cascada de errores. Una asignación incorrecta desencadena errores consecutivos, lo que sugiere que el error no funciona como señal reguladora sino como factor de bloqueo en la planificación.' },
  IM6: { t: [80, 40], basis: 'BCEP (2018) — Progresión de la jornada pedagógica', description: 'Evalúa si la estudiante respeta la progresión natural de la jornada (inicio, desarrollo, cierre) antes de decidir sobre el cierre. Penaliza decidir el cierre sin haber consolidado antes las fases previas.', none: NONE,
    hi: 'Respeto consistente por la progresión de la jornada. La estudiante construye la planificación de manera progresiva, consolidando las rutinas de inicio y desarrollo antes de asignar situaciones matemáticas al cierre.', mid: 'Progresión parcialmente respetada. La estudiante muestra comprensión general de la jornada pero intenta asignar situaciones matemáticas complejas al cierre sin haber consolidado las fases previas.', low: 'Ruptura de la secuencia. Se asignan situaciones matemáticas al cierre de la jornada sin haber matematizado las rutinas de inicio y desarrollo, lo que sugiere una lectura no progresiva de la jornada pedagógica.' },
  IM7: { t: [80, 40], basis: 'Zimmerman & Moylan (2009) — Fase de Ejecución: Autoobservación', description: 'Mide la eficiencia cognitiva penalizando las modificaciones redundantes sobre una misma rutina, indicador de duda sistemática o sobrecarga cognitiva.', none: NONE,
    hi: 'Decisiones firmes y estables. La estudiante asigna cada situación matemática con seguridad, sin movimientos redundantes, lo que indica un modelo mental claro de la articulación rutina-matemática.', mid: 'Vacilación moderada. Algunas situaciones matemáticas son movidas entre rutinas antes de encontrar su ubicación definitiva, lo que sugiere inseguridad en la distinción entre combinaciones pertinentes y forzadas.', low: 'Sobrecarga cognitiva detectada. La estudiante mueve las mismas situaciones repetidamente entre rutinas, lo que refleja confusión sobre qué aprendizaje matemático surge orgánicamente de cada momento de cuidado.' },
  IM8: { t: [75, 50], basis: 'Freudenthal (1991) — Matematización realista', description: 'Proporción de decisiones didácticas idóneas e intencionadas sobre el total de decisiones en el espacio de diseño didáctico.', none: NONE,
    hi: 'Asignación racional y fundamentada. La mayoría de las combinaciones rutina-situación resultan coherentes, lo que indica que la estudiante aplica criterios pedagógicos al seleccionar qué matematizar en cada momento.', mid: 'Asignación mixta. La estudiante combina decisiones fundamentadas con tanteos que carecen de criterio pedagógico claro.', low: 'Asignación aleatoria. Las combinaciones no siguen una lógica de pertinencia pedagógica consistente.' },
  IM9: { t: [70, 40], basis: 'BCEP (2018) — Modelo mental de coherencia rutina-matemática', description: 'Porcentaje de rutinas matematizadas correctamente en su primera decisión, lo que demuestra anticipación didáctica previa a la acción.', none: NONE,
    hi: 'Modelo mental robusto. La estudiante acierta en su primera asignación para la mayoría de las rutinas, lo que indica comprensión previa sólida de qué situaciones matemáticas son orgánicas a cada momento de cuidado.', mid: 'Modelo mental parcial. Acierta en primer intento para algunas rutinas pero falla en otras, posiblemente domina las combinaciones más intuitivas (colación-correspondencia) pero confunde las menos evidentes.', low: 'Modelo mental frágil. La mayoría de las asignaciones iniciales son incorrectas.' },
  IM10: { t: [80, 50], basis: 'Brousseau (1997) — Teoría de Situaciones Didácticas: Formulación', description: 'Evalúa la efectividad de las decisiones tomadas en la fase central de Desarrollo, donde se formulan las situaciones matemáticas del núcleo de la experiencia.', none: NONE,
    hi: 'Dominio preciso de la fase de desarrollo. La estudiante asigna con claridad las situaciones matemáticas pertinentes al núcleo de la experiencia pedagógica diaria.', mid: 'Apropiación parcial. Reconoce algunas situaciones pertinentes para el desarrollo pero presenta confusiones con situaciones que corresponden a otros momentos.', low: 'Confusión en la fase de desarrollo. No logra diferenciar qué situaciones matemáticas son pertinentes al momento de desarrollo vs. inicio o cierre.' },
};
export const IM_SHORT: Record<string, string> = { IM1: 'Vigilancia', IM2: 'Detención reflexiva', IM3: 'Autocorrección', IM4: 'Retroalimentación', IM5: 'Resiliencia', IM6: 'Secuencia jornada', IM7: 'Carga cognitiva', IM8: 'Ensayo y error', IM9: 'Predicción', IM10: 'Formulación' };
const band = (code: string, v: number | null) => { const t = IM_TEXT[code]; return v === null ? t.none : v >= t.t[0] ? t.hi : v >= t.t[1] ? t.mid : t.low; };

/** Devoluciones consultadas / disponibles (rutina · situación · fase). Fuente única para IM4 y para la UI. */
export function feedbackCounts(history: HistoryEvent[], s: Session) {
  const an = history.filter((h): h is Extract<HistoryEvent, { type: 'analysis' }> => h.type === 'analysis');
  const read = (k: 'rutina' | 'situacion', id: string) => an.some((a) => a.kind === k && a.cardId === id);
  let avail = 0, cons = 0;
  s.slots.forEach((sl) => {
    if (!sl.routine) return;
    avail++; if (read('rutina', sl.routine.id)) cons++;
    if (sl.mathSituationId) { avail++; if (read('situacion', sl.routine.id)) cons++; }
  });
  (['inicio', 'desarrollo', 'cierre'] as PhaseKey[]).forEach((p) => {
    if (!s.slots.some((sl) => sl.routine && slotPhase(sl, s.plan) === p)) return;
    avail++; if (an.some((a) => a.kind === 'fase' && a.phase === p)) cons++;
  });
  return { available: avail, consulted: cons };
}

/** Las 10 fórmulas de Rutinas Matematizadas con el estándar de las 5 apps (null = sin evidencia; nunca 100 por defecto). */
export function computeIndicators(history: HistoryEvent[], s: Session): IndicatorResult[] {
  const moves = history.filter((h): h is MoveEvent => h.type === 'move');
  const analyses = history.filter((h) => h.type === 'analysis');
  const byCard: Record<string, boolean[]> = {};
  moves.forEach((m) => { (byCard[m.cardId] ||= []).push(m.isCorrect); });

  // IM1: intervalos entre TODAS las acciones registradas (ubicar, decidir, quitar, consultar devolución)
  let vig = 0, vigDen = 0;
  for (let i = 1; i < history.length; i++) { const d = history[i].timestamp - history[i - 1].timestamp; vigDen++; if (d >= 5000 && d <= 60000) vig++; }
  let errCards = 0, errScore = 0;
  Object.entries(byCard).forEach(([id, st]) => {
    const fe = st.indexOf(false); if (fe === -1) return;
    errCards++;
    if (analyses.some((a) => a.cardId === id)) errScore += 50;
    if (st.slice(fe + 1).includes(true)) errScore += 50;
  });
  // IM3 sin errores: detección proactiva = situaciones asignadas cuya devolución fue consultada
  const assignedSit = s.slots.filter((x) => x.routine && x.mathSituationId);
  const verified = assignedSit.filter((x) => analyses.some((a) => a.type === 'analysis' && a.kind === 'situacion' && a.cardId === x.routine!.id)).length;
  // IM5: por cada error → 100 si el siguiente movimiento acierta o la misma rutina se corrige después; 50 si lee la devolución de esa rutina tras el error; 0 si no
  let errN = 0, resScore = 0;
  moves.forEach((m, i) => {
    if (m.isCorrect) return; errN++;
    const recovered = (moves[i + 1]?.isCorrect === true) || moves.slice(i + 1).some((x) => x.cardId === m.cardId && x.isCorrect);
    if (recovered) resScore += 100;
    else if (history.some((h) => h.type === 'analysis' && h.cardId === m.cardId && h.timestamp > m.timestamp)) resScore += 50;
  });
  // IM6: decisión sobre el cierre sin decisiones previas en inicio Y desarrollo
  let premature = 0; const seen = new Set<string>();
  moves.forEach((m) => { if (m.phase === 'cierre' && !(seen.has('inicio') && seen.has('desarrollo'))) premature++; seen.add(m.phase); });
  let redundant = 0; Object.values(byCard).forEach((st) => { if (st.length > 2) redundant += st.length - 2; });
  const fb = feedbackCounts(history, s);
  const cardsMoved = Object.keys(byCard).length;
  const firstOk = Object.values(byCard).filter((st) => st[0] === true).length;
  const form = moves.filter((m) => m.phase === 'desarrollo'); const formOk = form.filter((m) => m.isCorrect).length;
  // IM10 sin decisiones registradas en Desarrollo: se evalúa el estado final de esa fase; si está vacía, 0 (omisión de la fase central)
  const devSlots = assignedSit.filter((x) => slotPhase(x, s.plan) === 'desarrollo'); const devOk = devSlots.filter((x) => isCoherent(x.routine!.id, x.mathSituationId)).length;
  const hits = moves.filter((m) => m.isCorrect).length;

  const rows: Omit<IndicatorResult, 'feedback'>[] = [
    { code: 'IM1', value: vigDen > 0 ? pct(vig, vigDen) : null, numerator: vig, denominator: vigDen, formula: 'decisiones con pausa de 5–60 s ÷ intervalos entre decisiones' },
    { code: 'IM2', value: moves.length > 0 ? Math.min(100, pct(analyses.length, moves.length)) : null, numerator: analyses.length, denominator: moves.length, formula: 'devoluciones consultadas ÷ decisiones (tope 100)' },
    { code: 'IM3', value: errCards > 0 ? Math.round(errScore / errCards) : assignedSit.length > 0 ? pct(verified, assignedSit.length) : null, numerator: errCards > 0 ? errScore : verified, denominator: errCards > 0 ? errCards : assignedSit.length, formula: 'por rutina con error: 50 si consultó la devolución + 50 si luego acertó; sin errores: situaciones verificadas con la devolución ÷ situaciones asignadas' },
    { code: 'IM4', value: fb.available > 0 ? pct(fb.consulted, fb.available) : null, numerator: fb.consulted, denominator: fb.available, formula: 'devoluciones leídas ÷ devoluciones disponibles (rutina, situación, fase)' },
    { code: 'IM5', value: errN > 0 ? Math.round(resScore / errN) : moves.length > 0 ? 100 : null, numerator: resScore, denominator: errN, formula: 'por error: 100 si el siguiente movimiento acierta o la rutina se corrige después, 50 si lee su devolución sin corregir; promedio (sin errores: 100)' },
    { code: 'IM6', value: moves.length > 0 ? Math.max(0, 100 - premature * 25) : null, numerator: premature, denominator: moves.length, formula: '100 − 25 × decisiones de cierre sin inicio y desarrollo previos' },
    { code: 'IM7', value: moves.length > 0 ? Math.max(0, 100 - redundant * 15) : null, numerator: redundant, denominator: moves.length, formula: '100 − 15 × decisiones redundantes (más de 2 por rutina)' },
    { code: 'IM8', value: moves.length > 0 ? pct(hits, moves.length) : null, numerator: hits, denominator: moves.length, formula: 'decisiones coherentes ÷ decisiones totales' },
    { code: 'IM9', value: cardsMoved > 0 ? pct(firstOk, cardsMoved) : null, numerator: firstOk, denominator: cardsMoved, formula: 'rutinas acertadas en la primera decisión ÷ rutinas decididas' },
    { code: 'IM10', value: form.length > 0 ? pct(formOk, form.length) : moves.length > 0 ? (devSlots.length > 0 ? pct(devOk, devSlots.length) : 0) : null, numerator: form.length > 0 ? formOk : devOk, denominator: form.length > 0 ? form.length : devSlots.length, formula: 'decisiones coherentes en Desarrollo ÷ decisiones en Desarrollo (sin decisiones: estado final de la fase; fase vacía = 0)' },
  ];
  const noErr = errN === 0 && moves.length > 0;
  return rows.map((r) => ({ ...r, feedback: r.code === 'IM5' && noErr ? 'Sin conflictos didácticos en esta sesión: no hubo errores que reajustar, por lo que no se penaliza la resiliencia.' : r.code === 'IM3' && errCards === 0 && r.value !== null ? `Sin errores que corregir. Verificación proactiva: ${verified} de ${assignedSit.length} situaciones contrastadas con su devolución didáctica.` : band(r.code, r.value) }));
}

export function toReportIndicators(res: IndicatorResult[]): AppReportIndicator[] {
  return INDICATORS.map((d) => { const v = res.find((r) => r.code === d.id)?.value ?? null; const level = categorize(v); return { id: d.id, value: v, level, diagnosis: diagnose(v, level) }; });
}
export const indicesOf = (res: IndicatorResult[]) => computeIndices(toReportIndicators(res));

/** Apropiación teórica 50/30/20: exactitud (jornadas coherentes) · eficiencia (coherentes ÷ decisiones) · reflexión (devoluciones ÷ decisiones). */
export function computeStats(history: HistoryEvent[], s: Session): SessionStats {
  const moves = history.filter((h) => h.type === 'move'); const analyses = history.filter((h) => h.type === 'analysis');
  let hits = 0, errors = 0;
  s.slots.forEach((sl) => { if (sl.routine && sl.mathSituationId) (isCoherent(sl.routine.id, sl.mathSituationId) ? hits++ : errors++); });
  const total = s.slots.length; const assigned = s.slots.filter((x) => x.routine).length;
  const accuracy = total ? Math.min(100, (hits / total) * 100) : 0;
  const efficiency = moves.length > 0 ? Math.min(100, (hits / moves.length) * 100) : 0;
  const reflection = moves.length > 0 ? Math.min(100, (analyses.length / moves.length) * 100) : analyses.length > 0 ? 100 : 0;
  const hasEvidence = moves.length > 0 || analyses.length > 0 || assigned > 0;
  const fb = feedbackCounts(history, s);
  return {
    totalMoves: moves.length, currentHits: hits, currentErrors: errors, analyses: analyses.length,
    appropriation: hasEvidence ? Math.round(accuracy * 0.5 + efficiency * 0.3 + reflection * 0.2) : null,
    accuracy: Math.round(accuracy), efficiency: Math.round(efficiency), reflectionFactor: Math.round(reflection),
    totalCards: total, itemsAssigned: assigned, hasEvidence, feedbackConsulted: fb.consulted, feedbackAvailable: fb.available,
  };
}
export const totalRoutines = ROUTINES.length;
