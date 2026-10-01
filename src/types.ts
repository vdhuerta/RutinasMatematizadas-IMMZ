// Tipos idénticos a los del Diario de Campo (src/types.ts): el reporte se lee con ellos.
export type ImmzCategory = 'Inicial' | 'En Desarrollo' | 'Competente' | 'Avanzado';
export interface CanonicalIndicatorDef {
  id: string; dimension: 'A' | 'B'; sub: 'AO' | 'AC' | 'IDCD'; label: string; description: string; weight: number; aliases: string[];
}
export interface AppReportIndicator { id: string; value: number | null; level: ImmzCategory | null; diagnosis: string }
export interface AppReportParsed {
  sourceVersion: string; version: 'V4'; simulator: string; scenarioName?: string | null; classNumber: number | null; studentName: string; generatedAt: string;
  indicators: AppReportIndicator[]; immzAO: number | null; immzAC: number | null; immz: number | null; idcd: number | null; immg: number | null;
  category: ImmzCategory | null; warnings: string[]; fileName?: string;
  apropiacion?: number | null; aciertos?: number; errores?: number; reflexiones?: number; parsingMode?: 'contract' | 'legacy'; qualitativeSummary?: string;
  resolutionSource?: string; confidence?: string; appNameFromContent?: string; appNameFromFilename?: string; indicesRecalculated?: boolean;
}

// ── Dominio de Rutinas Matematizadas ──
export interface Routine { id: string; label: string; iconName: string; color: string }
export interface MathSituation { id: string; label: string; concept: string; description: string }
export interface TimelineSlot { id: number; timeLabel: string; routine: Routine | null; mathSituationId: string | null }
export type PhaseKey = 'inicio' | 'desarrollo' | 'cierre';
export interface SelfReflection { oportunidad: number; especificidad: number; mejora: number; reflexionEscrita: string; savedAt?: string }
export interface PlannerData {
  niveles: string[]; ambitos: string[]; nucleos: string[]; objetivosBCEP: string[];
  objetivoEspecifico: string; competencia: string;
  justifications: Record<number, string>;
  phaseJustifications: Record<PhaseKey, string>;
  slotPhases: Record<number, PhaseKey>;
}
