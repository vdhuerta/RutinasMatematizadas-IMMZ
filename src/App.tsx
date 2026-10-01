import { useEffect, useState } from 'react';
import { Activity, ClipboardList, FileText, HelpCircle, LayoutDashboard, RotateCcw, Settings } from 'lucide-react';
import { APP_META, APP_VERSION, BUILD_DATE, INSTITUTION } from './config';
import { isCoherent } from './data/didactics';
import { slotPhase, type HistoryEvent } from './lib/metrics';
import { INITIAL_PLAN, INITIAL_REFLECTION, INITIAL_SLOTS, storage } from './lib/storage';
import type { PhaseKey, PlannerData, Routine, SelfReflection, TimelineSlot } from './types';
import AppHeader from './components/AppHeader';
import { ConfigModal, ConfirmModal, HelpModal } from './components/Modals';
import DesignerView from './views/DesignerView';
import PlannerView from './views/PlannerView';
import AnalysisView from './views/AnalysisView';
import SolutionView from './views/SolutionView';

type View = 'design' | 'plan' | 'analysis';

export default function App() {
  const [slots, setSlots] = useState<TimelineSlot[]>(() => storage.slots());
  const [plan, setPlanState] = useState<PlannerData>(() => storage.plan());
  const [history, setHistory] = useState<HistoryEvent[]>(() => storage.history());
  const [reflection, setReflection] = useState<SelfReflection>(() => storage.reflection());
  const [name, setName] = useState(() => storage.name());
  const [classNumber, setClassNumber] = useState<number | null>(() => storage.classNumber(APP_META.defaultClassNumber));
  const [view, setView] = useState<View>('design');
  const [showConfig, setShowConfig] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => storage.saveSlots(slots), [slots]);
  useEffect(() => storage.savePlan(plan), [plan]);
  useEffect(() => storage.saveHistory(history), [history]);
  useEffect(() => storage.saveReflection(reflection), [reflection]);
  useEffect(() => storage.saveName(name), [name]);
  useEffect(() => storage.saveClassNumber(classNumber), [classNumber]);

  const log = (e: HistoryEvent) => setHistory((h) => [...h, e]);
  const setPlan = (f: (p: PlannerData) => PlannerData) => setPlanState(f);
  const phaseOf = (slot: TimelineSlot) => slotPhase(slot, plan);

  // Paso 1: ubicar rutina (no se evalúa: aún no hay situación matemática). Cada rutina existe una sola vez: si el bloque está ocupado, la anterior vuelve al mazo.
  const onPlace = (slotId: number, r: Routine) => {
    const slot = slots.find((s) => s.id === slotId); if (!slot) return;
    if (slot.routine && slot.routine.id !== r.id) log({ type: 'remove', kind: 'routine', cardId: slot.routine.id, slotId, timestamp: Date.now() });
    setSlots((p) => p.map((s) => (s.id === slotId ? { ...s, routine: r, mathSituationId: null } : s.routine?.id === r.id ? { ...s, routine: null, mathSituationId: null } : s)));
    log({ type: 'place', cardId: r.id, slotId, phase: phaseOf(slot), timestamp: Date.now() });
  };
  // Arrastrar una rutina ya ubicada a otro bloque de la línea de tiempo (lleva su situación; si el destino está ocupado, se intercambian)
  const onMoveCard = (fromId: number, toId: number) => {
    const a = slots.find((s) => s.id === fromId); const b = slots.find((s) => s.id === toId); if (!a?.routine || !b || fromId === toId) return;
    setSlots((p) => p.map((s) => (s.id === toId ? { ...s, routine: a.routine, mathSituationId: a.mathSituationId } : s.id === fromId ? { ...s, routine: b.routine, mathSituationId: b.routine ? b.mathSituationId : null } : s)));
    log({ type: 'place', cardId: a.routine.id, slotId: toId, phase: phaseOf(b), timestamp: Date.now() });
    if (b.routine) log({ type: 'place', cardId: b.routine.id, slotId: fromId, phase: phaseOf(a), timestamp: Date.now() });
  };
  const onRemoveRoutine = (slotId: number) => {
    const slot = slots.find((s) => s.id === slotId); if (!slot?.routine) return;
    log({ type: 'remove', kind: 'routine', cardId: slot.routine.id, slotId, timestamp: Date.now() });
    setSlots((p) => p.map((s) => (s.id === slotId ? { ...s, routine: null, mathSituationId: null } : s)));
  };
  // Paso 2: decisión evaluable = asignar/cambiar la situación matemática
  const onSetSituation = (slotId: number, situationId: string | null) => {
    const slot = slots.find((s) => s.id === slotId); if (!slot?.routine) return;
    if (situationId === null) { if (slot.mathSituationId) log({ type: 'remove', kind: 'situation', cardId: slot.routine.id, slotId, timestamp: Date.now() }); }
    else log({ type: 'move', kind: 'situation', cardId: slot.routine.id, slotId, from: slot.mathSituationId, to: situationId, phase: phaseOf(slot), isCorrect: isCoherent(slot.routine.id, situationId), timestamp: Date.now() });
    setSlots((p) => p.map((s) => (s.id === slotId ? { ...s, mathSituationId: situationId } : s)));
  };
  // Paso 3: reubicar rutina en otra fase (evaluable solo si ya tiene situación)
  const onMovePhase = (slotId: number, phase: PhaseKey) => {
    const slot = slots.find((s) => s.id === slotId); if (!slot?.routine) return;
    const from = phaseOf(slot); if (from === phase) return;
    setPlanState((p) => ({ ...p, slotPhases: { ...p.slotPhases, [slotId]: phase } }));
    if (slot.mathSituationId) log({ type: 'move', kind: 'phase', cardId: slot.routine.id, slotId, from, to: phase, phase, isCorrect: isCoherent(slot.routine.id, slot.mathSituationId), timestamp: Date.now() });
    else log({ type: 'place', cardId: slot.routine.id, slotId, phase, timestamp: Date.now() });
  };
  // Devoluciones didácticas: una traza por clave (rutina · situación · fase), como en la app original
  const onAnalysisRoutine = (kind: 'rutina' | 'situacion', routineId: string) => {
    if (history.some((h) => h.type === 'analysis' && h.kind === kind && h.cardId === routineId)) return;
    log({ type: 'analysis', kind, cardId: routineId, phase: null, timestamp: Date.now() });
  };
  const onAnalysisPhase = (phase: PhaseKey) => {
    if (history.some((h) => h.type === 'analysis' && h.kind === 'fase' && h.phase === phase)) return;
    log({ type: 'analysis', kind: 'fase', cardId: phase, phase, timestamp: Date.now() });
  };
  const reset = () => { setSlots(INITIAL_SLOTS); setPlanState(INITIAL_PLAN); setHistory([]); setReflection(INITIAL_REFLECTION); storage.clearSession(); setView('design'); };

  if (showSolution) return <SolutionView onBack={() => setShowSolution(false)} />;
  const tabBtn = (k: View, label: string, icon: React.ReactNode) => (
    <button onClick={() => setView(k)} data-testid={`tab-${k}`} role="tab" aria-selected={view === k} className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] transition ${view === k ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{icon}{label}</button>);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-chrome-bg">
      <ConfigModal open={showConfig} onClose={() => setShowConfig(false)} onShowSolution={() => setShowSolution(true)} classNumber={classNumber} onClass={setClassNumber} />
      <ConfirmModal open={showReset} onClose={() => setShowReset(false)} onConfirm={reset} />
      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
      <AppHeader>
        <div className="hidden gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-xs md:flex" role="tablist">{tabBtn('design', 'Pasos 1 y 2', <LayoutDashboard size={13} />)}{tabBtn('plan', 'Paso 3', <ClipboardList size={13} />)}{tabBtn('analysis', 'Análisis del participante', <Activity size={13} />)}</div>
        <button onClick={() => setShowHelp(true)} className="btn-ghost !px-2.5" title="Guía y fundamentos" aria-label="Ayuda"><HelpCircle size={15} /></button>
        <button onClick={() => setShowConfig(true)} className="btn-ghost !px-2.5" title="Configuración" aria-label="Configuración"><Settings size={15} /></button>
        <button onClick={() => setShowReset(true)} className="btn-ghost !px-2.5 hover:!bg-rose-50 hover:!text-rose-600" title="Reiniciar" aria-label="Reiniciar"><RotateCcw size={15} /></button>
      </AppHeader>
      <div className="flex gap-1 border-b border-slate-200 bg-white p-2 md:hidden" role="tablist">{tabBtn('design', 'Pasos 1-2', <LayoutDashboard size={13} />)}{tabBtn('plan', 'Paso 3', <FileText size={13} />)}{tabBtn('analysis', 'Análisis', <Activity size={13} />)}</div>
      <div className="flex-1 overflow-y-auto">
        {view === 'design' && <DesignerView slots={slots} onPlace={onPlace} onMoveCard={onMoveCard} onRemoveRoutine={onRemoveRoutine} onSetSituation={onSetSituation} onAnalysis={onAnalysisRoutine} />}
        {view === 'plan' && <PlannerView slots={slots} plan={plan} setPlan={setPlan} onMovePhase={onMovePhase} onAnalysis={onAnalysisPhase} onGoAnalysis={() => setView('analysis')} />}
        {view === 'analysis' && <AnalysisView history={history} session={{ slots, plan }} classNumber={classNumber} name={name} onName={setName} onClear={() => setHistory([])} reflection={reflection} onReflection={setReflection} />}
      </div>
      <footer className="flex h-7 shrink-0 items-center justify-center border-t border-slate-200 bg-white px-4"><p className="text-[10px] uppercase tracking-widest text-slate-400">{APP_META.name} © 2026 · {INSTITUTION} · v{APP_VERSION} · {BUILD_DATE}</p></footer>
    </div>
  );
}
