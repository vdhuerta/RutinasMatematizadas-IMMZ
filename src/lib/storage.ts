import type { HistoryEvent } from './metrics';
import type { PlannerData, SelfReflection, TimelineSlot } from '../types';

const K = { slots: 'rm_slots', plan: 'rm_plan', history: 'rm_history', name: 'rm_participant_name', cls: 'rm_class_number', refl: 'rm_self_reflection' };
const read = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };

export const INITIAL_SLOTS: TimelineSlot[] = [
  { id: 1, timeLabel: '08:30 - Inicio', routine: null, mathSituationId: null },
  { id: 2, timeLabel: '10:00 - Transición 1', routine: null, mathSituationId: null },
  { id: 3, timeLabel: '11:30 - Desarrollo', routine: null, mathSituationId: null },
  { id: 4, timeLabel: '13:00 - Transición 2', routine: null, mathSituationId: null },
  { id: 5, timeLabel: '14:30 - Cierre', routine: null, mathSituationId: null },
];
export const INITIAL_PLAN: PlannerData = {
  niveles: ['2do Tramo: Niveles Medios'], ambitos: ['Interacción y Comprensión del Entorno'], nucleos: ['Pensamiento Matemático'], objetivosBCEP: [],
  objetivoEspecifico: '', competencia: '', justifications: {}, phaseJustifications: { inicio: '', desarrollo: '', cierre: '' }, slotPhases: {},
};
export const INITIAL_REFLECTION: SelfReflection = { oportunidad: 3, especificidad: 3, mejora: 3, reflexionEscrita: '' };

export const storage = {
  slots: (): TimelineSlot[] => read(K.slots, INITIAL_SLOTS), saveSlots: (v: TimelineSlot[]) => write(K.slots, v),
  plan: (): PlannerData => ({ ...INITIAL_PLAN, ...read<Partial<PlannerData>>(K.plan, {}) }), savePlan: (v: PlannerData) => write(K.plan, v),
  history: (): HistoryEvent[] => read<HistoryEvent[]>(K.history, []), saveHistory: (v: HistoryEvent[]) => write(K.history, v),
  reflection: (): SelfReflection => ({ ...INITIAL_REFLECTION, ...read<Partial<SelfReflection>>(K.refl, {}) }), saveReflection: (v: SelfReflection) => write(K.refl, v),
  name: (): string => { try { return localStorage.getItem(K.name) ?? ''; } catch { return ''; } },
  saveName: (n: string) => { try { localStorage.setItem(K.name, n); } catch { /* */ } },
  /** Clase que declara el informe: número 1–12, o null = no declarar. */
  classNumber: (def: number): number | null => { try { const v = localStorage.getItem(K.cls); if (v === null) return def; return v === 'none' ? null : Number(v); } catch { return def; } },
  saveClassNumber: (c: number | null) => { try { localStorage.setItem(K.cls, c === null ? 'none' : String(c)); } catch { /* */ } },
  clearSession: () => { try { [K.slots, K.plan, K.history, K.refl].forEach((k) => localStorage.removeItem(k)); } catch { /* */ } },
};
