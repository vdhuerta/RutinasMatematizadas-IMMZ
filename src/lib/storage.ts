import type { HistoryEvent } from './metrics';
import type { PlannerData, SelfReflection, TimelineSlot } from '../types';
import { DEFAULT_FORMA_ID, getForma } from '../data/rutinas';

const K = { slots: 'rm_slots', plan: 'rm_plan', history: 'rm_history', name: 'rm_participant_name', cls: 'rm_class_number', refl: 'rm_self_reflection', judgment: 'rm_judgment_enabled', nrc: 'rut_nrc', nrcSet: 'rut_nrc_set', forma: 'rut_forma_id' };
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
  /** Modal de calibración del juicio (IM11, motor 4.1): activo por defecto. */
  judgmentEnabled: (): boolean => { try { const v = localStorage.getItem(K.judgment); return v === null ? true : v === '1'; } catch { return true; } },
  saveJudgmentEnabled: (v: boolean) => { try { localStorage.setItem(K.judgment, v ? '1' : '0'); } catch { /* */ } },
  /**
   * NRC del curso (TAREA 4): lo declara la docente una sola vez al inicio de la clase. No hay
   * valor por defecto — su ausencia es justamente lo que dispara el modal bloqueante al abrir la
   * app. Modificable después solo desde Configuración, detrás del PIN.
   */
  nrc: (): string | null => { try { return localStorage.getItem(K.nrcSet) === '1' ? localStorage.getItem(K.nrc) : null; } catch { return null; } },
  saveNrc: (v: string) => { try { localStorage.setItem(K.nrc, v); localStorage.setItem(K.nrcSet, '1'); } catch { /* */ } },
  /**
   * Forma paralela (A/B/C, TAREA — formato de ingreso del Simulador): igual que el NRC, la
   * docente la declara una sola vez al identificarse. `rawFormaId` devuelve el valor crudo
   * (o null si nunca se declaró) para que isIdentified() pueda distinguir "no identificada
   * todavía" de "identificada con Forma A"; `formaId` nunca devuelve null (cae a la forma por
   * defecto) para el resto de la app, que siempre necesita una forma válida con la que operar.
   */
  rawFormaId: (): string | null => { try { return localStorage.getItem(K.forma); } catch { return null; } },
  formaId: (): string => { try { return localStorage.getItem(K.forma) ?? DEFAULT_FORMA_ID; } catch { return DEFAULT_FORMA_ID; } },
  saveFormaId: (v: string) => { try { localStorage.setItem(K.forma, v); } catch { /* */ } },
  /**
   * Borra NRC y Forma declarados (botón «Reiniciar»): el reinicio total vuelve a pedir la
   * identificación desde cero, igual que en el primer inicio — no solo la línea de tiempo.
   */
  clearIdentification: () => { try { [K.nrc, K.nrcSet, K.forma].forEach((k) => localStorage.removeItem(k)); } catch { /* */ } },
};

/** true si ya se declaró NRC y una Forma válida (A/B/C) — igual criterio que el Simulador. */
export const isIdentified = (): boolean => storage.nrc() !== null && !!storage.rawFormaId() && getForma(storage.rawFormaId()).id === storage.rawFormaId();
