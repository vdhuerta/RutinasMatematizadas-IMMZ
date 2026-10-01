import { MATH_SITUATIONS } from '../data/rutinas';
import { isCoherent } from '../data/didactics';
import type { PlannerData, SelfReflection, TimelineSlot } from '../types';

export interface DesignPart { key: string; label: string; score: number; note: string; feedback?: string; tip: string }
export interface DesignQuality { parts: DesignPart[]; imd: number; state: string; tips: DesignPart[] }

/** Índice de Madurez del Diseño (IMD): réplica de los 9 criterios de Rutinas Matematizadas. No forma parte de IM1–IM10. */
export function computeDesign(slots: TimelineSlot[], plan: PlannerData, refl: SelfReflection): DesignQuality {
  const active = slots.filter((s) => s.routine); const math = slots.filter((s) => s.routine && s.mathSituationId);
  const curricular = (plan.niveles.length ? 25 : 0) + (plan.ambitos.length ? 25 : 0) + (plan.nucleos.length ? 25 : 0) + (plan.objetivosBCEP.length ? 25 : 0);

  const txt = plan.objetivoEspecifico.trim(); let obj = 0; let objFb = 'No se ha redactado el objetivo específico aún.';
  if (txt) {
    const w = txt.split(/\s+/); obj = 20;
    if (/(ar|er|ir)$/i.test(w[0]?.toLowerCase() || '')) obj += 30;
    if (w.length >= 10) obj += 30; else if (w.length >= 5) obj += 15;
    if (/(niño|niña|párvulo|parvulo|alumno|estudiante|curso)/i.test(txt)) obj += 20;
    objFb = obj === 100 ? 'Excelente estructura. Cumple rigurosamente con la fórmula de diseño pedagógico.' : obj >= 70 ? 'Buen objetivo, pero revisa si explicitaste con total claridad el contexto o la unidad de análisis.' : 'El objetivo debe iniciar con un verbo en infinitivo (ej: Clasificar, Distinguir) y contener variable, unidad y contexto.';
  }
  const ct = plan.competencia.trim(); let bro = 0; let broFb = 'No se ha detallado la situación problemática.';
  if (ct) {
    bro = 30; const keys = ['problema', 'obstaculo', 'obstáculo', 'juego', 'consigna', 'desafío', 'desafio', 'error', 'pregunta', 'acción', 'accion', 'formulación', 'formulacion'];
    bro += Math.min(keys.filter((k) => ct.toLowerCase().includes(k)).length * 15, 45); if (ct.split(/\s+/).length >= 25) bro += 25;
    broFb = bro >= 85 ? 'Planteamiento robusto. Se nota una intención clara de movilizar el aprendizaje mediante el conflicto cognitivo.' : bro >= 50 ? 'Identifica adecuadamente el desafío, pero podrías vincularlo más con las fases de Brousseau (Acción o Formulación).' : 'Intenta describir el rol del párvulo frente al obstáculo didáctico para robustecer el desafío cognitivo.';
  }
  const density = active.length ? Math.round((math.length / active.length) * 100) : 0;
  const concepts = new Set<string>(); math.forEach((s) => { const m = MATH_SITUATIONS.find((x) => x.id === s.mathSituationId); if (m) concepts.add(m.concept); });
  const diversity = active.length ? Math.round((concepts.size / 4) * 100) : 0;
  const justs = [...Object.values(plan.justifications || {}), ...Object.values(plan.phaseJustifications || {})].filter((j) => j.trim().length > 0);
  let just = 0;
  if (justs.length) {
    const kws = ['brousseau', 'freudenthal', 'didáctica', 'didactica', 'matematización', 'matematizacion', 'andamiaje', 'mediación', 'mediacion', 'juego', 'aprendizaje', 'cognitivo', 'cognitiva', 'rutina', 'pensamiento', 'concepto', 'bcep'];
    let len = 0, k = 0; justs.forEach((t) => { len += t.split(/\s+/).length; kws.forEach((kw) => { if (t.toLowerCase().includes(kw)) k++; }); });
    const avg = len / justs.length; just = 20 + (avg >= 30 ? 40 : avg >= 15 ? 20 : 0) + Math.min(k * 10, 40); just = Math.min(just, 100);
  }
  const coherence = math.length ? Math.round((math.filter((s) => isCoherent(s.routine!.id, s.mathSituationId)).length / math.length) * 100) : 0;
  const selfScore = Math.round(((refl.oportunidad + refl.especificidad + refl.mejora) / 3 / 5) * 100);
  const nSlotJ = Object.keys(plan.justifications || {}).length; const nPhaseJ = Object.values(plan.phaseJustifications || {}).filter((j) => j.trim().length > 0).length;
  const monitor = (nSlotJ > 0 ? 30 : 0) + (nPhaseJ > 0 ? 40 : 0) + (refl.reflexionEscrita.trim().length > 10 ? 30 : 0);

  const parts: DesignPart[] = [
    { key: 'curricular', label: 'Alineación Curricular BCEP', score: curricular, note: 'Niveles, Ámbitos, Núcleos y Objetivos pedagógicos seleccionados de las Bases Curriculares.', tip: 'Completa todos los componentes del Paso 3: Niveles, Ámbitos, Núcleos y OAs de las Bases Curriculares para asegurar el sustento formal.' },
    { key: 'objetivo', label: 'Estructuración del Objetivo', score: obj, note: 'Verbo en infinitivo + variable + unidad de análisis + contexto.', feedback: objFb, tip: 'Asegúrate de que tu objetivo específico comience con un verbo en infinitivo y contenga una variable, unidad de análisis y contexto claros.' },
    { key: 'brousseau', label: 'Desafío de Brousseau', score: bro, note: 'Situación problemática, obstáculo y rol del párvulo.', feedback: broFb, tip: 'Describe con más detalle la situación de conflicto cognitivo. ¿Cómo desafía la rutina cotidiana al pensamiento lógico del párvulo?' },
    { key: 'densidad', label: 'Densidad de Matematización', score: density, note: 'Frecuencia de situaciones de matemática aplicadas sobre las rutinas de la jornada.', tip: 'Agrega situaciones matemáticas a más momentos de tu línea de tiempo. Cada momento cotidiano es una oportunidad de aprendizaje.' },
    { key: 'diversidad', label: 'Diversidad Conceptual', score: diversity, note: 'Cobertura y diversidad de conceptos del Pensamiento Matemático abordados.', tip: 'Cubre más conceptos (Tiempo, Número, Espacio, Lógica) a lo largo de la jornada.' },
    { key: 'justificacion', label: 'Monitoreo Teórico (Justificación)', score: just, note: 'Riqueza pedagógica y asimilación de teorías de mediación y andamiaje en tus textos.', tip: 'Enriquece tus justificaciones teóricas utilizando conceptos clave del marco didáctico (mediación, andamiaje, Brousseau, Freudenthal, etc.).' },
    { key: 'coherencia', label: 'Consistencia Didáctica', score: coherence, note: 'Armonía y compatibilidad didáctica entre rutinas de vida diaria y contenidos asignados.', tip: 'Alinea las rutinas con situaciones matemáticas afines (por ejemplo, «Colación» armoniza de forma óptima con «Correspondencia uno a uno»).' },
    { key: 'autorreflexion', label: 'Autorreflexión (Autocalibrado)', score: selfScore, note: 'Autocalibración formativa de calidad realizada conforme al modelo de Zimmerman.', tip: 'Registra tu autodiagnóstico con criterio: calibra qué tan oportuna, específica y mejorable es tu propuesta.' },
    { key: 'monitoreo', label: 'Monitoreo Activo (Logs)', score: monitor, note: 'Justificaciones por rutina y por fase, más reflexión metacognitiva escrita.', tip: 'Justifica cada rutina y cada fase, y escribe tu reflexión metacognitiva.' },
  ];
  const w = [0.12, 0.12, 0.12, 0.12, 0.10, 0.12, 0.10, 0.10, 0.10];
  const imd = Math.round(parts.reduce((a, p, i) => a + p.score * w[i], 0));
  const tips = parts.filter((p) => ['curricular', 'objetivo', 'brousseau', 'densidad', 'justificacion', 'coherencia'].includes(p.key)).sort((a, b) => a.score - b.score).filter((p) => p.score < 80).slice(0, 2);
  return { parts, imd, state: imd >= 85 ? 'Sobresaliente' : imd >= 60 ? 'Desarrollo Avanzado' : 'En Construcción', tips };
}
