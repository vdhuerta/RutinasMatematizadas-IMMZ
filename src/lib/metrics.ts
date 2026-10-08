import { INDICATORS } from '../config';
import { isCoherent } from '../data/didactics';
import { evaluateAnswer } from '../data/expected';
import type { AppReportIndicator, PhaseKey, PlannerData, TimelineSlot } from '../types';
import { categorize, computeIndices, diagnose } from './immz/scoring';
import { REDUNDANCY_THRESHOLD } from '../immz-core/constants';
import { computeIndicators as computeIndicatorsCore, type IndicatorResult as CoreIndicatorResult } from '../immz-core/compute';
import type { ImmzEvent } from '../immz-core/events';

/** Estado de la planificación que evalúan las métricas. */
export interface Session { slots: TimelineSlot[]; plan: PlannerData }

/**
 * Traza cruda de la sesión (una observación de conducta por evento).
 *  · place     → una rutina se ubica en la línea de tiempo (aún sin situación: NO se evalúa).
 *  · move      → decisión didáctica evaluable: asignar/cambiar la situación matemática de una rutina (kind 'situation')
 *                o reubicar la rutina en una fase de la clase (kind 'phase'). isCorrect = coherencia rutina↔situación.
 *  · remove    → se quita una rutina o una situación (se registra, no se evalúa).
 *  · analysis  → se abre una devolución didáctica (rutina · situación · fase). Una por clave, como en la app original.
 *  · judgment  → solo se registra si la estudiante respondió el modal de juicio (IM11): «¿crees que esta
 *                secuencia es coherente?» antes de confirmar. Cerrar el modal sin responder no genera 'judgment'.
 */
export type HistoryEvent =
  | { type: 'place'; cardId: string; slotId: number; phase: PhaseKey; timestamp: number }
  | { type: 'move'; kind: 'situation' | 'phase'; cardId: string; slotId: number; from: string | null; to: string; phase: PhaseKey; isCorrect: boolean; justification?: string; timestamp: number }
  | { type: 'remove'; kind: 'routine' | 'situation'; cardId: string; slotId: number; timestamp: number }
  | { type: 'analysis'; kind: 'rutina' | 'situacion' | 'fase'; cardId: string; phase: PhaseKey | null; timestamp: number }
  | { type: 'judgment'; cardId: string; declared: boolean; real: boolean; timestamp: number };
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

export const slotPhase = (slot: TimelineSlot, plan: PlannerData): PhaseKey => {
  if (plan.slotPhases?.[slot.id]) return plan.slotPhases[slot.id];
  const l = slot.timeLabel.toLowerCase();
  if (l.includes('inicio')) return 'inicio';
  if (l.includes('cierre') || slot.id >= 4) return 'cierre';
  return 'desarrollo';
};

type Band = { description: string; hi: string; mid: string; low: string; none: string };
const band = (v: number | null, t: Band) => (v === null ? t.none : v >= 80 ? t.hi : v >= 50 ? t.mid : t.low);
/** Textos por indicador (de Rutinas Matematizadas; el código es el canónico 4.0/4.1). */
export const IM_TEXT: Record<string, Band> = {
  IM1: { description: 'Mide la autorregulación del tiempo entre decisiones: proporción de decisiones consecutivas separadas por un intervalo deliberado (entre 5 y 60 segundos). Previene el arrastre impulsivo de tarjetas.', none: 'Sin evidencia suficiente para medir el ritmo reflexivo.',
    hi: 'Ritmo deliberado y consciente. La estudiante se detiene a analizar cada rutina antes de asignarle una situación matemática, lo que indica supervisión activa de la pertinencia pedagógica de cada combinación.', mid: 'Ritmo irregular. La estudiante alterna entre análisis reflexivo y asignaciones aceleradas, lo que sugiere que el monitoreo se activa solo ante rutinas que percibe como difíciles de matematizar.', low: 'Asignación impulsiva. La estudiante arrastra las situaciones matemáticas a las rutinas sin detenerse a evaluar la coherencia pedagógica. No hay evidencia de supervisión consciente del proceso.' },
  IM2: { description: 'Proporción de rutinas abordadas en las que hubo al menos un acto de detención reflexiva (una devolución consultada o una pausa larga asociada a esa rutina).', none: 'Sin evidencia de rutinas abordadas aún.',
    hi: 'Equilibrio reflexivo sólido. La estudiante alterna entre asignar situaciones y consultar las devoluciones didácticas, lo que indica una práctica de planificación reflexiva: actuar, evaluar la pertinencia y ajustar.', mid: 'Reflexión incipiente. Consulta algunas devoluciones pero predomina la tendencia a asignar sin detenerse a contrastar su razonamiento con la retroalimentación disponible.', low: 'Planificación sin reflexión. La estudiante asigna mecánicamente sin consultar las devoluciones didácticas.' },
  IM3: { description: 'Evalúa la capacidad de identificar incongruencias didácticas mediante la devolución del sistema y su enmienda posterior: por cada rutina con error, 50 puntos por consultar la devolución después del error y 50 por acertar en una decisión posterior sobre esa misma rutina.', none: 'Sin errores en esta sesión: no hubo incongruencias que corregir, por lo que no hay autocorrección que evaluar.',
    hi: 'Capacidad madura de autodiagnóstico. La estudiante consulta activamente las devoluciones didácticas tras una asignación incorrecta y utiliza esa información para reasignar la situación matemática de manera coherente.', mid: 'Autodiagnóstico parcial. La estudiante corrige algunas asignaciones tras leer la devolución, pero en otros casos persiste en combinaciones forzadas sin consultar la retroalimentación disponible.', low: 'Dificultad para procesar la retroalimentación. La estudiante no consulta las devoluciones didácticas tras asignaciones incorrectas, o las consulta sin lograr traducirlas en una reasignación coherente.' },
  IM4: { description: 'Proporción de devoluciones consultadas que fueron efectivamente aprovechadas: seguidas de una nueva decisión sobre la misma rutina dentro de los 5 minutos siguientes.', none: 'Sin evidencia de devoluciones consultadas aún.',
    hi: 'Uso activo y sistemático de la retroalimentación. La estudiante consulta las devoluciones didácticas y vuelve sobre la rutina para aplicar lo leído casi siempre.', mid: 'Consulta selectiva de retroalimentación. A veces vuelve sobre la rutina tras leer la devolución, pero no siempre.', low: 'Retroalimentación desaprovechada. La estudiante consulta la devolución pero rara vez vuelve sobre esa rutina después.' },
  IM5: { description: 'Proporción de errores seguidos por un acierto en la decisión inmediatamente siguiente sobre esa misma rutina.', none: 'Sin errores en esta sesión: no hubo ocasión para demostrar resiliencia ante un conflicto didáctico.',
    hi: 'Resiliencia cognitiva sólida. Tras una asignación incorrecta, la estudiante reorganiza su razonamiento y logra acertar en la siguiente decisión, lo que indica capacidad de reajuste inmediato.', mid: 'Reajuste gradual. El error genera cierta desestabilización, pero la estudiante logra recuperarse tras varios intentos.', low: 'Cascada de errores. Una asignación incorrecta desencadena errores consecutivos, lo que sugiere que el error no funciona como señal reguladora sino como factor de bloqueo en la planificación.' },
  IM6: { description: 'Proporción de transiciones de fase que respetan la progresión natural de la jornada (inicio, desarrollo, cierre), sin «saltos»: decidir sobre el cierre sin haber consolidado antes el inicio y el desarrollo.', none: 'Sin evidencia de transiciones de fase aún.',
    hi: 'Respeto consistente por la progresión de la jornada. La estudiante construye la planificación de manera progresiva, consolidando las rutinas de inicio y desarrollo antes de asignar situaciones matemáticas al cierre.', mid: 'Progresión parcialmente respetada. La estudiante muestra comprensión general de la jornada pero intenta asignar situaciones matemáticas complejas al cierre sin haber consolidado las fases previas.', low: 'Ruptura de la secuencia. Se asignan situaciones matemáticas al cierre de la jornada sin haber matematizado las rutinas de inicio y desarrollo, lo que sugiere una lectura no progresiva de la jornada pedagógica.' },
  IM7: { description: 'Proporción de decisiones sin redundancia: evalúa la ausencia de modificaciones repetidas sobre una misma rutina más allá de lo esperable, indicador de duda sistemática o sobrecarga cognitiva.', none: 'Sin evidencia de decisiones realizadas aún.',
    hi: 'Decisiones firmes y estables. La estudiante asigna cada situación matemática con seguridad, sin movimientos redundantes, lo que indica un modelo mental claro de la articulación rutina-matemática.', mid: 'Vacilación moderada. Algunas situaciones matemáticas son movidas entre rutinas antes de encontrar su ubicación definitiva, lo que sugiere inseguridad en la distinción entre combinaciones pertinentes y forzadas.', low: 'Sobrecarga cognitiva detectada. La estudiante mueve las mismas situaciones repetidamente entre rutinas, lo que refleja confusión sobre qué aprendizaje matemático surge orgánicamente de cada momento de cuidado.' },
  IM8: { description: 'Proporción de decisiones didácticas idóneas e intencionadas sobre el total de decisiones en el espacio de diseño didáctico.', none: 'Sin evidencia de decisiones realizadas aún.',
    hi: 'Asignación racional y fundamentada. La mayoría de las combinaciones rutina-situación resultan coherentes, lo que indica que la estudiante aplica criterios pedagógicos al seleccionar qué matematizar en cada momento.', mid: 'Asignación mixta. La estudiante combina decisiones fundamentadas con tanteos que carecen de criterio pedagógico claro.', low: 'Asignación aleatoria. Las combinaciones no siguen una lógica de pertinencia pedagógica consistente.' },
  IM9: { description: 'Porcentaje de rutinas matematizadas correctamente en su primera decisión, lo que demuestra anticipación didáctica previa a la acción.', none: 'Sin evidencia de rutinas abordadas aún.',
    hi: 'Modelo mental robusto. La estudiante acierta en su primera asignación para la mayoría de las rutinas, lo que indica comprensión previa sólida de qué situaciones matemáticas son orgánicas a cada momento de cuidado.', mid: 'Modelo mental parcial. Acierta en primer intento para algunas rutinas pero falla en otras, posiblemente domina las combinaciones más intuitivas (colación-correspondencia) pero confunde las menos evidentes.', low: 'Modelo mental frágil. La mayoría de las asignaciones iniciales son incorrectas.' },
  IM10: { description: 'Evalúa la efectividad de las decisiones tomadas en la fase central de Desarrollo, donde se formulan las situaciones matemáticas del núcleo de la experiencia.', none: 'La fase de Desarrollo no fue trabajada en esta sesión: no hay decisiones que evaluar en el núcleo de la experiencia.',
    hi: 'Dominio preciso de la fase de desarrollo. La estudiante asigna con claridad las situaciones matemáticas pertinentes al núcleo de la experiencia pedagógica diaria.', mid: 'Apropiación parcial. Reconoce algunas situaciones pertinentes para el desarrollo pero presenta confusiones con situaciones que corresponden a otros momentos.', low: 'Confusión en la fase de desarrollo. No logra diferenciar qué situaciones matemáticas son pertinentes al momento de desarrollo vs. inicio o cierre.' },
  IM11: { description: 'Mide la correspondencia entre el juicio que la estudiante emite sobre la coherencia de una rutina, antes de confirmarla, y el resultado real: juicios acertados ÷ juicios emitidos.', none: 'Sin evidencia de juicios registrados aún (el modal de calibración estuvo apagado o no se respondió ninguno).',
    hi: 'Calibración metacognitiva sobresaliente. La estudiante anticipa con precisión si su combinación es coherente antes de confirmarla.', mid: 'Calibración en desarrollo. El juicio previo acierta en la mayoría de los casos, pero persisten sobreestimaciones o dudas.', low: 'Calibración inicial. El juicio declarado coincide poco con el resultado real: hay sobreconfianza o subestimación sistemática.' },
};
export const IM_SHORT: Record<string, string> = { IM1: 'Vigilancia', IM2: 'Detención reflexiva', IM3: 'Autocorrección', IM4: 'Retroalimentación', IM5: 'Resiliencia', IM6: 'Secuencia jornada', IM7: 'Carga cognitiva', IM8: 'Ensayo y error', IM9: 'Predicción', IM10: 'Formulación', IM11: 'Calibración del juicio' };

/**
 * Traduce la traza de Rutinas Matematizadas al vocabulario canónico immz-core (ver src/immz-core/).
 * Una rutina es una "unidad". 'move' → 'intento'; 'analysis' → 'devolucion'.
 * 'pausa' se deriva entre 'move' consecutivos (el ritmo de decisión no se contamina con el
 * tiempo que toma leer una devolución, ubicar una rutina sin situación o responder el juicio).
 * 'redundante' se emite desde la decisión que supera REDUNDANCY_THRESHOLD sobre la misma rutina.
 * 'fase' se emite en cada 'move' con esSalto = true cuando se decide sobre el cierre sin haber
 * decidido antes sobre el inicio Y el desarrollo (la regla original de IM6 de esta app).
 * 'formulacion' (IM10, en el sentido de Brousseau: registro del saber verificable): cada decisión
 * tomada en la fase de Desarrollo emite un acto con modo 'accion' — correcta = la combinación
 * rutina-situación es coherente.
 * 'revision' (IM4) NO se emite aquí: immz-core la deriva internamente de 'intento' + 'devolucion'
 * (ver events.ts/compute.ts) para que ninguna app tenga que reinventarla.
 * 'juicio' viene directo de los eventos 'judgment' (modal de calibración, IM11).
 */
export function toImmzEvents(history: HistoryEvent[]): ImmzEvent[] {
  const events: ImmzEvent[] = [];
  const movesPerCard: Record<string, number> = {};
  let prevMoveTs: number | null = null;
  const seenPhase = new Set<PhaseKey>();
  const seenUnit = new Set<string>();

  for (const h of history) {
    if (h.type === 'move') {
      const primerIntento = !seenUnit.has(h.cardId); seenUnit.add(h.cardId);
      events.push({ type: 'intento', unidad: h.cardId, objetivo: h.to, acierto: h.isCorrect, primerIntento, ts: h.timestamp });

      if (prevMoveTs !== null) events.push({ type: 'pausa', duracionMs: h.timestamp - prevMoveTs, eventoSiguiente: h.cardId, ts: h.timestamp });
      prevMoveTs = h.timestamp;

      movesPerCard[h.cardId] = (movesPerCard[h.cardId] ?? 0) + 1;
      if (movesPerCard[h.cardId] > REDUNDANCY_THRESHOLD) events.push({ type: 'redundante', unidad: h.cardId, repeticiones: movesPerCard[h.cardId], ts: h.timestamp });

      const esSalto = h.phase === 'cierre' && !(seenPhase.has('inicio') && seenPhase.has('desarrollo'));
      events.push({ type: 'fase', fase: h.phase, orden: events.filter((e) => e.type === 'fase').length + 1, esSalto, ts: h.timestamp });
      seenPhase.add(h.phase);

      if (h.phase === 'desarrollo') {
        // Rúbrica de grupos de términos (IM10, igual que en Laboratorio TSD): si la estudiante
        // escribió una justificación, el acto de formulación se evalúa contra esa rúbrica (modo
        // 'texto'); si no escribió nada, el acto se registra igual por acción, con la coherencia
        // de la decisión (modo 'accion', como antes). La justificación nunca condiciona el Paso 2.
        if (h.kind === 'situation' && h.justification?.trim()) {
          const ev = evaluateAnswer(h.cardId, h.justification);
          events.push({ type: 'formulacion', referencia: h.cardId, modo: 'texto', correcta: ev.correcta, caracteres: ev.caracteres, palabras: ev.palabras, ts: h.timestamp });
        } else {
          events.push({ type: 'formulacion', referencia: h.cardId, modo: 'accion', correcta: h.isCorrect, ts: h.timestamp });
        }
      }
    } else if (h.type === 'analysis') {
      events.push({ type: 'devolucion', unidad: h.cardId, origen: h.kind, ts: h.timestamp });
    } else if (h.type === 'judgment') {
      events.push({ type: 'juicio', unidad: h.cardId, declarado: h.declared, real: h.real, ts: h.timestamp });
    }
  }
  return events;
}

/** Delega el cálculo en immz-core y le pone el texto cualitativo de esta app (IM_TEXT/band, sin cambios). */
export function computeIndicators(history: HistoryEvent[], _s: Session): IndicatorResult[] {
  const rows: CoreIndicatorResult[] = computeIndicatorsCore(toImmzEvents(history));
  return rows.map((r) => ({ ...r, feedback: band(r.value, IM_TEXT[r.code]) }));
}

/** Modo(s) de los actos de formulación (IM10) emitidos en la sesión — para el campo im10_modo del payload 4.1. */
export function formulacionModo(history: HistoryEvent[]): 'accion' | 'texto' | 'mixto' | null {
  const modos = new Set(toImmzEvents(history).filter((e) => e.type === 'formulacion').map((e) => e.modo));
  if (modos.size === 0) return null;
  if (modos.size > 1) return 'mixto';
  return [...modos][0];
}

export function toReportIndicators(res: IndicatorResult[]): AppReportIndicator[] {
  return INDICATORS.map((d) => { const v = res.find((r) => r.code === d.id)?.value ?? null; const level = categorize(v); return { id: d.id, value: v, level, diagnosis: diagnose(v, level) }; });
}
/** Índices con el MISMO scoring que usa el Diario. Como config.ts ahora declara IM11 (sub 'AO'),
 *  este cálculo YA incluye IM11 — es el que se usa para la pantalla (motor 4.1). El payload de
 *  compatibilidad 4.0 usa una versión filtrada, ver computeCompatIndices() en immzReport.ts. */
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
  const an = history.filter((h): h is Extract<HistoryEvent, { type: 'analysis' }> => h.type === 'analysis');
  const read = (k: 'rutina' | 'situacion', id: string) => an.some((a) => a.kind === k && a.cardId === id);
  let avail = 0, cons = 0;
  s.slots.forEach((sl) => { if (!sl.routine) return; avail++; if (read('rutina', sl.routine.id)) cons++; if (sl.mathSituationId) { avail++; if (read('situacion', sl.routine.id)) cons++; } });
  return {
    totalMoves: moves.length, currentHits: hits, currentErrors: errors, analyses: analyses.length,
    appropriation: hasEvidence ? Math.round(accuracy * 0.5 + efficiency * 0.3 + reflection * 0.2) : null,
    accuracy: Math.round(accuracy), efficiency: Math.round(efficiency), reflectionFactor: Math.round(reflection),
    totalCards: total, itemsAssigned: assigned, hasEvidence, feedbackConsulted: cons, feedbackAvailable: avail,
  };
}
