import { useState } from 'react';
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { ArrowDownToLine, BookOpen, BrainCircuit, Check, FileText, GripVertical, HelpCircle, LayoutDashboard, Lightbulb, ListChecks, MessageSquareQuote, SearchX, Sparkles } from 'lucide-react';
import { AMBITOS_BCEP, MATH_SITUATIONS, NIVELES_BCEP, NUCLEOS_BCEP, NUCLEOS_POR_AMBITO, OAS_BCEP_COMPLETO } from '../data/rutinas';
import { PHASES, PHASE_GUIDANCE, PHASE_LETTER, PHASE_TITLE, getDevolucionText, type Phase } from '../data/didactics';
import { slotPhase } from '../lib/metrics';
import { RoutineIcon } from '../components/Icons';
import type { PlannerData, TimelineSlot } from '../types';

interface Props {
  slots: TimelineSlot[]; plan: PlannerData; setPlan: (f: (p: PlannerData) => PlannerData) => void;
  onMovePhase: (slotId: number, phase: Phase) => void; onAnalysis: (phase: Phase) => void; onGoAnalysis: () => void;
}
const AMBITO_TONE: Record<string, string> = { 'Desarrollo Personal y Social': 'bg-rose-500 border-rose-500', 'Comunicación Integral': 'bg-accent border-accent', 'Interacción y Comprensión del Entorno': 'bg-emerald-500 border-emerald-500' };
const Box = ({ on, tone = 'bg-brand-500 border-brand-500', size = 5 }: { on: boolean; tone?: string; size?: number }) => <span className={`flex ${size === 5 ? 'h-5 w-5' : 'h-4 w-4'} shrink-0 items-center justify-center rounded border transition ${on ? `${tone} text-white` : 'border-slate-300 bg-white'}`}>{on && <Check size={size * 3} />}</span>;
const toggle = (xs: string[], x: string) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);

function SlotCard({ slot, phase, plan, setPlan, onOpenDev, devOpen }: { slot: TimelineSlot; phase: Phase; plan: PlannerData; setPlan: Props['setPlan']; onOpenDev: () => void; devOpen: boolean }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({ id: `card:${slot.id}` });
  const sit = MATH_SITUATIONS.find((m) => m.id === slot.mathSituationId);
  return (
    <div ref={setNodeRef} data-slot-card={slot.id} style={{ opacity: isDragging ? 0.4 : 1 }} className="card space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3"><div className={`rounded-xl border p-2 ${slot.routine!.color}`}><RoutineIcon name={slot.routine!.iconName} /></div><div><h5 className="text-sm leading-tight text-slate-900">{slot.routine!.label}</h5><p className="micro !text-[10px]">{slot.timeLabel}</p></div></div>
        <button ref={setActivatorNodeRef} {...attributes} {...listeners} style={{ touchAction: 'none' }} data-drag-handle={slot.id} className="cursor-grab rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 active:cursor-grabbing" title="Arrastra a otra fase" aria-label="Arrastrar a otra fase"><GripVertical size={18} /></button>
      </div>
      {sit && <div className="flex items-center gap-1.5 rounded-lg border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs text-brand-500"><BrainCircuit size={14} className="shrink-0" /><span className="truncate">{sit.label}</span></div>}
      {!devOpen ? <button onClick={onOpenDev} data-testid={`btn-dev-fase-${slot.id}`} className="btn-ghost w-full justify-center !normal-case !tracking-normal"><BookOpen size={14} className="text-brand-500" />Devolución Didáctica de Fase</button>
        : <div className="space-y-1.5 rounded-xl border border-brand-100 bg-brand-50 p-3 text-[11px] leading-relaxed text-slate-800"><span className="micro flex items-center gap-1 !text-brand-500"><Sparkles size={12} />Devolución de la rutina en {PHASE_TITLE[phase]}</span><p>{getDevolucionText(slot.routine!.id, slot.mathSituationId)}</p></div>}
      <div className="relative"><MessageSquareQuote size={16} className="pointer-events-none absolute left-3 top-3.5 text-slate-300" />
        <textarea value={plan.justifications[slot.id] || ''} onChange={(e) => setPlan((p) => ({ ...p, justifications: { ...p.justifications, [slot.id]: e.target.value } }))} className="input min-h-[90px] resize-y pl-9 !text-xs" placeholder="Justifica teóricamente esta rutina..." data-testid={`just-${slot.id}`} /></div>
    </div>
  );
}
function PhaseColumn({ phase, children, count }: { phase: Phase; children: React.ReactNode; count: number }) {
  const { setNodeRef, isOver } = useDroppable({ id: `phase:${phase}` });
  return <div ref={setNodeRef} data-zone={`phase-${phase}`} className={`flex min-h-[200px] flex-col gap-4 rounded-xl border p-5 transition ${isOver ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-slate-50'}`}>{children}<span className="hidden">{count}</span></div>;
}

export default function PlannerView({ slots, plan, setPlan, onMovePhase, onAnalysis, onGoAnalysis }: Props) {
  const [openPhase, setOpenPhase] = useState<Record<string, boolean>>({});
  const [openSlot, setOpenSlot] = useState<Record<number, boolean>>({});
  const [dragId, setDragId] = useState<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));
  const active = slots.filter((s) => s.routine);
  const by = (p: Phase) => active.filter((s) => slotPhase(s, plan) === p);

  const availableOAs = plan.niveles.flatMap((nivel) => plan.nucleos.reduce<{ nivel: string; nucleo: string; oas: string[] }[]>((acc, nucleo) => {
    const parent = Object.entries(NUCLEOS_POR_AMBITO).find(([a, ns]) => ns.includes(nucleo) && plan.ambitos.includes(a));
    if (parent && OAS_BCEP_COMPLETO[nivel]?.[nucleo]) acc.push({ nivel, nucleo, oas: OAS_BCEP_COMPLETO[nivel][nucleo] });
    return acc;
  }, []));
  const setAmbito = (a: string) => setPlan((p) => { const sel = p.ambitos.includes(a); const ns = NUCLEOS_POR_AMBITO[a] || []; return { ...p, ambitos: toggle(p.ambitos, a), nucleos: sel ? p.nucleos.filter((n) => !ns.includes(n)) : Array.from(new Set([...p.nucleos, ...ns])) }; });
  const onDragEnd = (e: DragEndEvent) => { setDragId(null); const a = String(e.active.id); const o = e.over ? String(e.over.id) : ''; if (a.startsWith('card:') && o.startsWith('phase:')) onMovePhase(Number(a.slice(5)), o.slice(6) as Phase); };
  const dragSlot = dragId ? slots.find((s) => s.id === dragId) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 lg:p-6">
      <div><span className="micro !text-brand-500">Paso 3</span><h2 className="text-2xl text-slate-900">Planificación de Clase</h2><p className="mt-1 text-sm text-slate-500">Completa los datos de la planificación y justifica tus decisiones basadas en las Bases Curriculares.</p></div>

      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg text-slate-900"><BookOpen size={20} className="text-brand-500" />Componentes Curriculares</h3>
        <div className="card space-y-8 p-6">
          <div><label className="mb-3 block text-sm text-slate-700 font-title">Niveles Educativos (BCEP)</label>
            <div className="grid gap-3 sm:grid-cols-3">{NIVELES_BCEP.map((n) => <button key={n} type="button" data-testid={`nivel-${n[0]}`} onClick={() => setPlan((p) => ({ ...p, niveles: toggle(p.niveles, n) }))} className="flex items-center gap-3 rounded-xl border border-transparent bg-slate-50 p-3 text-left transition hover:border-brand-100 hover:bg-brand-50/60"><Box on={plan.niveles.includes(n)} /><span className="text-sm leading-tight text-slate-700">{n}</span></button>)}</div></div>
          <div className="grid gap-8 border-t border-slate-100 pt-6 md:grid-cols-2">
            <div><label className="mb-3 block text-sm text-slate-700 font-title">Ámbitos de Experiencias (BCEP)</label><div className="space-y-2">{AMBITOS_BCEP.map((a) => <button key={a} type="button" onClick={() => setAmbito(a)} className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-slate-50 p-3 text-left transition hover:border-slate-200"><Box on={plan.ambitos.includes(a)} tone={AMBITO_TONE[a]} /><span className="text-sm leading-snug text-slate-700">{a}</span></button>)}</div></div>
            <div><label className="mb-3 block text-sm text-slate-700 font-title">Núcleos de Aprendizaje (BCEP)</label><div className="max-h-60 space-y-2 overflow-y-auto pr-1">{NUCLEOS_BCEP.map((n) => { const parent = Object.keys(NUCLEOS_POR_AMBITO).find((a) => NUCLEOS_POR_AMBITO[a].includes(n)) || ''; return <button key={n} type="button" onClick={() => setPlan((p) => ({ ...p, nucleos: toggle(p.nucleos, n) }))} className={`flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition ${plan.nucleos.includes(n) ? 'border-transparent bg-slate-50' : 'border-slate-100 hover:bg-slate-50'}`}><Box on={plan.nucleos.includes(n)} tone={AMBITO_TONE[parent]} size={4} /><span className="text-sm text-slate-700">{n}</span></button>; })}</div></div>
          </div>
          <div className="border-t border-slate-100 pt-6"><label className="mb-4 flex items-center gap-2 text-base text-slate-900 font-title"><ListChecks size={18} className="text-brand-500" />Selección de Objetivos de Aprendizaje (OAs Oficiales)</label>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">{availableOAs.length === 0 ? <div className="py-6 text-center"><SearchX size={30} className="mx-auto mb-3 text-slate-300" /><p className="text-sm text-slate-500">Selecciona al menos un Nivel, Ámbito y su Núcleo correspondiente para cargar los objetivos...</p></div>
              : <div className="space-y-6">{availableOAs.map(({ nivel, nucleo, oas }) => <div key={nivel + nucleo}><h4 className="micro mb-3 ml-1"><span className="text-brand-400">[{nivel}]</span> — {nucleo}</h4><div className="space-y-2">{oas.map((oa, i) => { const on = plan.objetivosBCEP.includes(oa); return <button key={i} type="button" data-testid="oa" onClick={() => setPlan((p) => ({ ...p, objetivosBCEP: toggle(p.objetivosBCEP, oa) }))} className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition ${on ? 'border-brand-200 bg-brand-50' : 'border-slate-200 bg-white hover:border-brand-200'}`}><span className="mt-0.5"><Box on={on} /></span><span className={`text-sm leading-relaxed ${on ? 'text-brand-600' : 'text-slate-600'}`}>{oa}</span></button>; })}</div></div>)}</div>}</div></div>
          <div><div className="mb-2 flex items-center gap-2"><label className="block text-sm text-slate-700 font-title" htmlFor="obj">Objetivo de Aprendizaje Específico</label>
            <span className="group relative flex items-center"><HelpCircle size={16} className="cursor-help text-slate-400 hover:text-brand-500" /><span className="pointer-events-none invisible absolute bottom-[calc(100%+8px)] left-0 z-50 w-80 rounded-xl bg-brand-500 p-4 text-[13px] leading-relaxed text-white opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100"><b className="mb-1 block !text-brand-200 font-title">Objetivos de aprendizajes específicos:</b>La redacción debe ser más concreta que el OA y seguir esta directriz: <b className="!text-white font-title">VERBO + VARIABLE + UNIDAD DE ANÁLISIS + CONTEXTO</b> (verbo en infinitivo).<i className="mt-2 block border-t border-white/20 pt-2 text-brand-100">Ejemplo: Distinguir emociones básicas (alegría, enojo y tristeza) en situaciones lúdicas para su posterior representación.</i></span></span></div>
            <textarea id="obj" data-testid="objetivo" value={plan.objetivoEspecifico} onChange={(e) => setPlan((p) => ({ ...p, objetivoEspecifico: e.target.value }))} className="input min-h-[100px] resize-y" placeholder="Ej. Distinguir emociones básicas en situaciones lúdicas..." /></div>
          <div><label className="mb-2 block text-sm text-slate-700 font-title" htmlFor="comp">Competencias / Situaciones Problemáticas</label><textarea id="comp" data-testid="competencia" value={plan.competencia} onChange={(e) => setPlan((p) => ({ ...p, competencia: e.target.value }))} className="input min-h-[100px] resize-y" placeholder="Describe la situación problémica (Brousseau)..." /></div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-2 text-lg text-slate-900"><LayoutDashboard size={20} className="text-brand-500" />Componentes de la Clase (Fases y Rutinas)</h3>
        <p className="mb-5 text-xs text-slate-500">Arrastra cada rutina (asa <GripVertical size={12} className="inline" />) a la fase de la clase que le corresponde y justifícala.</p>
        <DndContext sensors={sensors} onDragStart={(e) => setDragId(Number(String(e.active.id).slice(5)))} onDragEnd={onDragEnd} onDragCancel={() => setDragId(null)}>
          <div className="flex flex-col gap-6">{PHASES.map((p) => (
            <PhaseColumn key={p} phase={p} count={by(p).length}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div><h4 className="text-[13px] uppercase tracking-wider text-slate-700"><span className="mr-2 text-brand-500">{PHASE_LETTER[p]}</span>{PHASE_TITLE[p]}</h4>{by(p).length === 0 && <p className="micro !normal-case !tracking-normal !text-[10px]">Justifica teóricamente este momento educativo</p>}</div>
                <div className="flex items-center gap-2"><button data-testid={`btn-fase-${p}`} onClick={() => { const o = !openPhase[p]; setOpenPhase((s) => ({ ...s, [p]: o })); if (o) onAnalysis(p); }} className="btn-ghost !px-3 !py-1 !normal-case !tracking-normal"><BookOpen size={14} className="text-brand-500" />{openPhase[p] ? 'Ocultar Orientación' : 'Orientación de Fase'}</button><span className="pill border-slate-200 bg-white text-[11px] text-slate-500">{by(p).length}</span></div></div>
              {openPhase[p] && <div className="rounded-xl border border-brand-100 bg-brand-50 p-3.5 text-xs leading-relaxed text-slate-800"><div className="micro mb-1 flex items-center gap-1.5 !text-brand-500"><Lightbulb size={14} className="text-accent" />Orientación Pedagógica — Momento de {PHASE_TITLE[p]}</div><p>{PHASE_GUIDANCE[p]}</p></div>}
              {by(p).length === 0 && <div className="relative"><FileText size={16} className="pointer-events-none absolute left-3 top-3.5 text-slate-300" /><textarea data-testid={`pj-${p}`} value={plan.phaseJustifications[p] || ''} onChange={(e) => setPlan((s) => ({ ...s, phaseJustifications: { ...s.phaseJustifications, [p]: e.target.value } }))} className="input min-h-[100px] resize-y pl-9 !text-xs" placeholder={`Justificación teórica para el momento de ${PHASE_TITLE[p].toLowerCase()}...`} /></div>}
              <div className="space-y-4">{by(p).map((s) => <SlotCard key={s.id} slot={s} phase={p} plan={plan} setPlan={setPlan} devOpen={!!openSlot[s.id]} onOpenDev={() => { setOpenSlot((o) => ({ ...o, [s.id]: true })); onAnalysis(p); }} />)}
                {by(p).length === 0 && <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-slate-300 bg-white/60 p-6 text-slate-400"><ArrowDownToLine size={22} className="mb-2 opacity-50" /><p className="text-xs">Arrastra rutinas aquí</p></div>}</div>
            </PhaseColumn>))}</div>
          <DragOverlay dropAnimation={null}>{dragSlot?.routine ? <div className="card flex items-center gap-3 rotate-1 p-3 shadow-lg"><div className={`rounded-xl border p-2 ${dragSlot.routine.color}`}><RoutineIcon name={dragSlot.routine.iconName} /></div><span className="text-sm">{dragSlot.routine.label}</span></div> : null}</DragOverlay>
        </DndContext>
      </div>
      <div className="card flex flex-col items-center border-dashed p-6 text-center"><h3 className="text-xs uppercase tracking-widest text-slate-900">Reflexión didáctica</h3><p className="micro mt-1 max-w-md">Cuando termines, ve a «Análisis del participante», registra tu autodiagnóstico y descarga tu reporte para adjuntarlo al Diario de Campo.</p><button className="btn-ghost mt-3" onClick={onGoAnalysis}>Ver mi análisis</button></div>
    </div>
  );
}
