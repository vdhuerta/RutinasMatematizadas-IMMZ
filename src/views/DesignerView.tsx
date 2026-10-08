import { useState, type ReactNode } from 'react';
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { AlertCircle, BrainCircuit, Check, CheckCircle2, GripVertical, Lightbulb, MousePointer2, PenLine, Plus, Quote, Search, Undo2, X } from 'lucide-react';
import { MATH_SITUATIONS } from '../data/rutinas';
import { isCoherent } from '../data/didactics';
import { RoutineIcon } from '../components/Icons';
import { RoutineAnalysisModal } from '../components/Modals';
import type { Routine, TimelineSlot } from '../types';

interface Props {
  /** Las 7 rutinas de la Forma activa (A/B/C) — ver getForma(formaId) en data/rutinas.ts. */
  routines: Routine[];
  slots: TimelineSlot[];
  onPlace: (slotId: number, r: Routine) => void;
  onMoveCard: (fromId: number, toId: number) => void;
  onRemoveRoutine: (slotId: number) => void;
  onSetSituation: (slotId: number, situationId: string | null, justification?: string) => void;
  onAnalysis: (kind: 'rutina' | 'situacion', routineId: string) => void;
  /** El OJO (ahora global, en la barra superior entre Análisis y Ayuda): revela qué oculta cada
   *  decisión, tanto en la línea de tiempo (Paso 1) como en las situaciones no elegidas de Paso 2. */
  revealAnswers: boolean;
}

/** Cabecera común de las tres cajas: etiqueta, título y resumen, con altura fija para que queden alineadas. */
function ColHeader({ kicker, title, summary, right }: { kicker: string; title: string; summary: string; right?: ReactNode }) {
  return (
    <header className="mb-4 min-h-[104px] border-b border-slate-100 pb-3">
      <div className="flex items-start justify-between gap-2"><span className="pill border-brand-100 bg-brand-50 text-[10px] uppercase tracking-widest text-brand-500">{kicker}</span>{right}</div>
      <h2 className="mt-2 text-lg text-slate-900">{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{summary}</p>
    </header>
  );
}

function PaletteItem({ r, overlay = false }: { r: Routine; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `pal:${r.id}` });
  return (
    <div ref={overlay ? undefined : setNodeRef} data-routine-id={r.id} {...(overlay ? {} : attributes)} {...(overlay ? {} : listeners)} style={{ touchAction: 'none', opacity: isDragging && !overlay ? 0.4 : 1 }}
      className={`flex h-[50px] cursor-grab select-none items-center gap-3 rounded-xl border border-dashed px-3 transition hover:border-solid active:cursor-grabbing ${r.color} ${overlay ? 'rotate-1 scale-105 shadow-lg' : 'hover:-translate-y-0.5'}`}>
      <RoutineIcon name={r.iconName} className="shrink-0" /><span className="text-sm leading-tight">{r.label}</span><GripVertical size={16} className="ml-auto shrink-0 opacity-40" />
    </div>
  );
}

function RoutineCard({ slot, overlay = false, onLupa, onClearSituation, correctness = null }: { slot: TimelineSlot; overlay?: boolean; onLupa?: () => void; onClearSituation?: () => void; correctness?: boolean | null }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `card:${slot.id}` });
  const r = slot.routine!; const sit = MATH_SITUATIONS.find((m) => m.id === slot.mathSituationId);
  const revealBorder = correctness === true ? '!border-emerald-500' : correctness === false ? '!border-rose-400' : '';
  return (
    <div ref={overlay ? undefined : setNodeRef} data-card-slot={slot.id} {...(overlay ? {} : attributes)} {...(overlay ? {} : listeners)} style={{ touchAction: 'none', opacity: isDragging && !overlay ? 0.4 : 1 }}
      className={`relative flex h-full min-h-[88px] w-full cursor-grab select-none items-start gap-4 rounded-xl border p-4 active:cursor-grabbing ${r.color} ${overlay ? 'rotate-1 scale-105 shadow-lg' : ''} ${revealBorder}`}>
      <div className="rounded-xl bg-white/60 p-2.5"><RoutineIcon name={r.iconName} size={20} /></div>
      <div className="min-w-0 flex-1 pt-0.5 pr-8">
        <h3 className="text-sm">{r.label}</h3>
        {sit ? (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/70 bg-white/80 py-1 pl-2.5 pr-1 text-[11px] text-slate-800"><BrainCircuit size={14} className="shrink-0 text-brand-500" /><span>{sit.label}</span>
            {onClearSituation && <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onClearSituation(); }} className="ml-0.5 shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-200/80 hover:text-rose-600" title="Sacar situación matemática" aria-label="Sacar situación matemática"><X size={12} /></button>}</div>
        ) : <p className="micro mt-2 flex items-center gap-1.5 !text-slate-600"><AlertCircle size={14} />Falta matematizar</p>}
      </div>
      {correctness !== null && (
        <span className="absolute right-3 top-3" title={correctness ? 'Combinación coherente' : 'Combinación poco coherente'} data-testid="reveal-badge">
          {correctness ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-rose-500" />}
        </span>
      )}
      {onLupa && (
        <span className="group/tip absolute right-3 top-3" style={correctness !== null ? { right: '2.1rem' } : undefined}>
          <button type="button" data-analysis-btn onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onLupa(); }} className="rounded-lg bg-white/60 p-1.5 text-slate-500 shadow-xs transition hover:bg-white hover:text-brand-500 focus-visible:bg-white focus-visible:text-brand-500" aria-label="Ver la Devolución Didáctica de esta rutina"><Search size={15} /></button>
          <span role="tooltip" className="pointer-events-none absolute bottom-full right-0 z-30 mb-1.5 w-max max-w-[210px] rounded-lg bg-brand-500 px-2.5 py-1.5 text-left text-[11px] leading-snug text-white opacity-0 shadow-lg transition group-hover/tip:opacity-100 group-focus-within/tip:opacity-100">
            Usa la lupa para mirar la Devolución Didáctica de esta rutina<i className="absolute right-3 top-full h-0 w-0 border-x-[5px] border-t-[5px] border-x-transparent border-t-brand-500" />
          </span>
        </span>)}
    </div>
  );
}

function SlotRow({ slot, active, onSelect, onLupa, onClearSituation, revealAnswers }: { slot: TimelineSlot; active: boolean; onSelect: () => void; onLupa: () => void; onClearSituation: () => void; revealAnswers: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot:${slot.id}` });
  const [t, label] = slot.timeLabel.split(' - ');
  const correctness = revealAnswers && slot.routine && slot.mathSituationId ? isCoherent(slot.routine.id, slot.mathSituationId) : null;
  return (
    <div className="flex min-h-[92px] items-stretch" data-slot-id={slot.id}>
      <div className="relative flex w-24 shrink-0 flex-col items-end py-3 pr-4">
        <span className="text-sm text-slate-500 font-title">{t}</span><span className="micro mt-1 !text-[9px]">{label}</span>
        <div className="absolute inset-y-0 right-0 w-px bg-slate-200" /><div className={`absolute -right-1.5 top-5 h-3 w-3 rounded-full border-2 border-white ${active ? 'bg-brand-500' : 'bg-slate-300'}`} />
      </div>
      <div ref={setNodeRef} data-zone={`slot-${slot.id}`} role="button" tabIndex={0} onClick={() => slot.routine && onSelect()} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && slot.routine && onSelect()}
        className={`ml-4 flex-1 rounded-xl transition ${active ? 'ring-2 ring-brand-500 ring-offset-2' : ''} ${slot.routine ? 'cursor-pointer' : `border-2 border-dashed ${isOver ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white'} flex items-center justify-center text-slate-400`} ${isOver && slot.routine ? 'ring-2 ring-brand-300' : ''}`}>
        {!slot.routine ? <div className="flex items-center gap-2 text-sm"><Plus size={18} className="text-slate-300" /><span className="select-none">Arrastra una rutina aquí</span></div> : <RoutineCard slot={slot} onLupa={onLupa} onClearSituation={onClearSituation} correctness={correctness} />}
      </div>
    </div>
  );
}

function Deck({ slots, children }: { slots: TimelineSlot[]; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'deck' });
  return <div ref={setNodeRef} data-zone="deck" data-placed={slots.filter((s) => s.routine).length} className={`flex flex-1 flex-col rounded-xl transition ${isOver ? 'bg-brand-50 ring-2 ring-brand-300' : ''}`}>{children}</div>;
}

export default function DesignerView({ routines, slots, onPlace, onMoveCard, onRemoveRoutine, onSetSituation, onAnalysis, revealAnswers }: Props) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [dragPal, setDragPal] = useState<Routine | null>(null);
  const [dragSlot, setDragSlot] = useState<TimelineSlot | null>(null);
  const [lupaId, setLupaId] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [tips, setTips] = useState<Record<string, boolean>>({});
  const [justDraft, setJustDraft] = useState<Record<number, string>>({});
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));
  const active = slots.find((s) => s.id === activeId);
  const placed = new Set(slots.filter((s) => s.routine).map((s) => s.routine!.id));
  const done = slots.filter((s) => s.routine && s.mathSituationId).length;
  const lupaSlot = slots.find((s) => s.id === lupaId) ?? null;

  const openLupa = (slot: TimelineSlot) => { if (!slot.routine) return; onAnalysis('rutina', slot.routine.id); if (slot.mathSituationId) onAnalysis('situacion', slot.routine.id); setLupaId(slot.id); };
  const onDragEnd = (e: DragEndEvent) => {
    setDragPal(null); setDragSlot(null);
    const from = String(e.active.id); const to = e.over ? String(e.over.id) : '';
    if (from.startsWith('pal:') && to.startsWith('slot:')) { const r = routines.find((x) => x.id === from.slice(4)); const sid = Number(to.slice(5)); if (r) { onPlace(sid, r); setActiveId(sid); } }
    else if (from.startsWith('card:')) {
      const fid = Number(from.slice(5));
      if (to === 'deck') { onRemoveRoutine(fid); if (activeId === fid) setActiveId(null); }
      else if (to.startsWith('slot:')) { const tid = Number(to.slice(5)); if (tid !== fid) { onMoveCard(fid, tid); if (activeId === fid) setActiveId(tid); } }
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={(e) => { const id = String(e.active.id); setDragPal(id.startsWith('pal:') ? routines.find((r) => `pal:${r.id}` === id) ?? null : null); setDragSlot(id.startsWith('card:') ? slots.find((s) => s.id === Number(id.slice(5))) ?? null : null); }} onDragEnd={onDragEnd} onDragCancel={() => { setDragPal(null); setDragSlot(null); }}>
      <RoutineAnalysisModal slot={lupaSlot} open={lupaId !== null} onClose={() => setLupaId(null)} />
      <div className="mx-auto grid max-w-7xl items-stretch gap-5 p-4 md:grid-cols-12 lg:p-6">
        {/* Columna 1 · Rutinas (mazo) */}
        <section className="card flex flex-col p-5 md:col-span-3" data-testid="col-rutinas">
          <ColHeader kicker="Mazo" title="Rutinas" summary="Las 7 rutinas de cuidado de la jornada. Arrástralas a la línea de tiempo; cada una se usa una sola vez." right={<span className="pill !py-0 border-rose-200 bg-rose-50 text-rose-600" data-testid="remaining">{routines.length - placed.size}</span>} />
          <Deck slots={slots}>
            <div className="grid gap-2.5" data-testid="palette">{routines.map((r) => placed.has(r.id) ? <div key={r.id} data-empty-slot={r.id} className="h-[50px] rounded-xl border-2 border-dashed border-slate-200" /> : <PaletteItem key={r.id} r={r} />)}</div>
            <p className="mt-3 flex items-start gap-1.5 text-[11px] italic text-slate-500"><Undo2 size={13} className="mt-0.5 shrink-0" />Para sacar una rutina de la línea de tiempo, arrástrala de vuelta aquí. En tablet, mantén presionada la tarjeta.</p>
            <div className="card relative mt-auto overflow-hidden bg-brand-50 p-4"><Quote size={52} className="absolute -right-3 -top-3 text-brand-100" /><p className="relative text-sm italic text-brand-600">«Las rutinas de cuidado no son tiempos vacíos, sino contextos fundamentales para el aprendizaje.»</p><span className="micro relative mt-2 block !text-brand-400">— Gonzalez-Mena &amp; Eyer</span></div>
          </Deck>
        </section>

        {/* Columna 2 · Paso 1 */}
        <section className="card flex flex-col p-5 md:col-span-5" data-testid="col-paso1">
          <ColHeader kicker="Paso 1" title="Línea de Tiempo" summary="Organiza tu jornada: ubica cada rutina en un momento del día. Toca una rutina para configurarla y usa la lupa para recibir su devolución." right={
            <span className="pill border-slate-200 text-[10px] text-slate-500" data-testid="progress">{done}/{slots.length} matematizadas</span>} />
          <div className="space-y-3">{slots.map((s) => <SlotRow key={s.id} slot={s} active={activeId === s.id} onSelect={() => setActiveId(s.id)} onLupa={() => openLupa(s)} onClearSituation={() => onSetSituation(s.id, null)} revealAnswers={revealAnswers} />)}</div>
          <div className="mt-auto space-y-3 border-t border-slate-100 pt-4">
            <button data-testid="btn-dev" onClick={() => setShowHint((v) => !v)} className="btn-primary w-full justify-center">Devolución Didáctica</button>
            {showHint && <p className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-100 bg-brand-50 p-3 text-center text-xs text-brand-600" data-testid="dev-hint">Presiona sobre la <Search size={14} className="shrink-0" /> para recibir la Devolución Didáctica</p>}
          </div>
        </section>

        {/* Columna 3 · Paso 2 */}
        <section className="card flex flex-col p-5 md:col-span-4" data-testid="col-paso2">
          <ColHeader kicker="Paso 2" title="Situación Matemática" summary="Elige la situación problémica matemática que integrarás en la rutina seleccionada. Los tips te orientan." />
          {active?.routine ? (
            <div className="flex flex-1 flex-col space-y-3" key={active.id}>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5"><div className={`rounded-xl border p-2 ${active.routine.color}`}><RoutineIcon name={active.routine.iconName} size={18} /></div><div><h3 className="text-sm text-slate-900">{active.routine.label}</h3><p className="micro mt-0.5">{active.timeLabel}</p></div></div>
              <h4 className="text-sm text-slate-900">¿Qué situación problémica matemática integrarás en esta rutina?</h4>
              <div className="space-y-1.5">
                {MATH_SITUATIONS.map((s) => { const sel = active.mathSituationId === s.id; const tip = !!tips[s.id]; const revealed = revealAnswers ? isCoherent(active.routine!.id, s.id) : null; return (
                  <div key={s.id} className={`rounded-xl border-2 p-2 transition ${sel ? 'border-brand-500 bg-brand-50' : 'border-slate-100 bg-white hover:border-brand-200'}`} data-situation-id={s.id}>
                    <div className="flex items-center justify-between gap-3">
                      <div role="button" data-testid={`sit-${s.id}`} onClick={() => onSetSituation(active.id, sel ? null : s.id, sel ? undefined : justDraft[active.id])} className="flex flex-1 cursor-pointer select-none items-center gap-3">
                        <span className={`rounded-full p-1 ${sel ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{sel ? <Check size={14} /> : <span className="block h-3.5 w-3.5" />}</span><span className="text-sm text-slate-900">{s.label}</span></div>
                      {revealed !== null && (
                        <span data-testid={`sit-reveal-${s.id}`} title={revealed ? 'Combinación coherente' : 'Combinación poco coherente'}>
                          {revealed ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-rose-500" />}
                        </span>)}
                      <button type="button" title={tip ? 'Ocultar Tip' : 'Mostrar Tip'} onClick={() => setTips((p) => ({ ...p, [s.id]: !p[s.id] }))} className={`rounded-lg border p-1.5 ${tip ? 'border-amber-300 bg-accent-soft' : 'border-slate-200 bg-slate-50 hover:bg-accent-soft'}`}><Lightbulb size={14} className="text-accent" /></button></div>
                    {tip && <div className="mt-1.5 rounded-xl border border-slate-200 bg-white p-2.5 text-xs leading-relaxed text-slate-700"><span className="micro mb-1 flex items-center gap-1 !text-brand-500"><Lightbulb size={12} className="text-accent" />Tip de orientación</span>{s.description}</div>}
                  </div>); })}
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <label htmlFor="just" className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-600"><PenLine size={14} className="text-brand-500" />Justificación escrita (opcional) — ¿por qué esta situación es pertinente para esta rutina?</label>
                <textarea id="just" data-testid="justification" rows={2} value={justDraft[active.id] ?? ''} onChange={(e) => setJustDraft((p) => ({ ...p, [active.id]: e.target.value }))}
                  placeholder="Escribe tu razón antes de elegir arriba: se registra junto con la decisión." className="input w-full resize-none text-sm" />
                <p className="mt-1 text-[10px] text-slate-400">Si la fase de esta rutina es Desarrollo, tu justificación se evalúa para IM10 (Apropiación de códigos de formulación). Si la dejas en blanco, el acto de formulación se registra igual por acción.</p>
              </div>
              <p className="mt-auto flex items-start gap-1.5 text-[11px] italic text-slate-500"><Search size={13} className="mt-0.5 shrink-0" />Después de elegir, presiona la lupa de la rutina para recibir la devolución de tu combinación.</p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center space-y-3 px-4 text-center"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-100"><MousePointer2 size={32} className="text-slate-300" /></div><h3 className="text-lg text-slate-700">Selecciona una rutina</h3><p className="mx-auto max-w-[250px] text-sm text-slate-500">Haz clic en cualquier rutina ya colocada en la línea de tiempo para configurarla y asignar un objetivo matemático.</p></div>)}
        </section>
      </div>
      <DragOverlay dropAnimation={null}>{dragPal ? <PaletteItem r={dragPal} overlay /> : dragSlot?.routine ? <div className="w-[320px]"><RoutineCard slot={dragSlot} overlay /></div> : null}</DragOverlay>
    </DndContext>
  );
}
