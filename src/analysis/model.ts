import { INDICATORS } from '../config';
import { computeIndicators, computeStats, feedbackCounts, indicesOf, type HistoryEvent, type Session } from '../lib/metrics';
import type { AnalysisModel, AppAnalysisConfig, Verdict } from './standard';
import { RUTINAS_ANALYSIS } from './rutinasConfig';

export const verdictA = (v: number | null): Verdict => v === null
  ? { status: 'Sin evidencia suficiente', desc: 'Aún no se registran suficientes interacciones de diseño didáctico para evaluar la dimensión de Monitoreo Metacognitivo.' }
  : v >= 80 ? { status: 'Monitoreo metacognitivo maduro', desc: 'La estudiante supervisa activamente su comprensión durante el proceso de asignación de situaciones matemáticas a las rutinas, detecta errores mediante las devoluciones didácticas y ajusta sus decisiones en tiempo real.' }
  : v >= 50 ? { status: 'Monitoreo metacognitivo en desarrollo', desc: 'La estudiante muestra indicios de supervisión consciente, pero alterna entre momentos de monitoreo reflexivo y episodios de asignación impulsiva. Se recomienda consultar las devoluciones didácticas antes de cada decisión.' }
  : { status: 'Monitoreo metacognitivo inicial', desc: 'Predomina la asignación por ensayo y error sin supervisión consciente. La estudiante no aprovecha las devoluciones didácticas para ajustar la coherencia entre rutinas y situaciones matemáticas.' };

export const verdictB = (v: number | null): Verdict => v === null
  ? { status: 'Sin evidencia suficiente', desc: 'Aún no se registran suficientes interacciones de diseño didáctico para evaluar la dimensión de Competencia en Matematización.' }
  : v >= 80 ? { status: 'Dominio disciplinar maduro', desc: 'La estudiante demuestra comprensión sólida de la articulación entre rutinas de cuidado y situaciones matemáticas, respetando la progresión de la jornada y seleccionando con coherencia las experiencias de matematización según el momento pedagógico.' }
  : v >= 50 ? { status: 'Dominio disciplinar en desarrollo', desc: 'Se observa comprensión parcial de la articulación rutina-matemática. La estudiante reconoce algunas combinaciones pertinentes pero presenta confusiones entre situaciones que son orgánicas a la rutina y situaciones forzadas.' }
  : { status: 'Dominio disciplinar inicial', desc: 'Dificultad para distinguir qué situaciones matemáticas son pertinentes para cada rutina. Se observan asignaciones que descontextualizan el aprendizaje matemático del momento de cuidado cotidiano.' };

export const globalVerdict = (v: number | null) => (v === null ? 'Sin evidencia suficiente' : v >= 80 ? 'Autorregulación y Dominio Maduros' : v >= 50 ? 'Nivel en Desarrollo' : 'Nivel Inicial / En Construcción');

export function buildAnalysisModel(history: HistoryEvent[], session: Session, cfg: AppAnalysisConfig = RUTINAS_ANALYSIS): AnalysisModel {
  const raw = computeIndicators(history, session);
  const idx = indicesOf(raw);
  const st = computeStats(history, session);
  const fb = feedbackCounts(history, session);
  const indicators = INDICATORS.map((d) => {
    const r = raw.find((x) => x.code === d.id)!; const m = cfg.indicators[d.id];
    return { ...m, code: d.id, dimension: d.dimension, subdimension: d.sub === 'IDCD' ? null : (d.sub as 'AO' | 'AC'), value: r.value, hasEvidence: r.value !== null, formula: r.formula, feedback: r.value === null ? 'Sin evidencia registrada en esta sesión.' : r.feedback, n: r.denominator,
      breakdown: d.id === 'IM4' && fb.available > 0 ? `${fb.consulted} de ${fb.available} devoluciones consultadas` : undefined };
  });
  return { cfg, indicators, raw, appropriation: { value: st.appropriation, accuracy: st.accuracy, efficiency: st.efficiency, reflectionFactor: st.reflectionFactor, hasEvidence: st.hasEvidence },
    immz: idx.immz, immzAO: idx.immzAO, immzAC: idx.immzAC, idcd: idx.idcd, immg: idx.immg, verdictA: verdictA(idx.immz), verdictB: verdictB(idx.idcd), verdictGlobal: globalVerdict(idx.immg) };
}
