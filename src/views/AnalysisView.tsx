import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, BookMarked, CheckCircle2, Download, FileText, GraduationCap, History, Layers, Layout, MousePointerClick, Save, Search, ShieldCheck, Target, Brain, Trophy, XCircle, type LucideIcon } from 'lucide-react';
import { MATH_SITUATIONS } from '../data/rutinas';
import { PHASE_TITLE, isCoherent } from '../data/didactics';
import { computeStats, slotPhase, type HistoryEvent, type Session } from '../lib/metrics';
import { buildReport, describeEvent, selfCheck } from '../lib/immzReport';
import { computeDesign } from '../lib/design';
import { downloadHtml, downloadPdf } from '../lib/download';
import { buildAnalysisModel } from '../analysis/model';
import { DimASection, DimBSection, FrameworkSection, SummarySection } from '../analysis/AnalysisParticipant';
import { fmtPct } from '../components/ui';
import type { SelfReflection } from '../types';

type Tab = 'RESUMEN' | 'DIM1' | 'DIM2' | 'MARCO' | 'TRABAJO';
const TABS: { key: Tab; label: string; icon: LucideIcon }[] = [
  { key: 'RESUMEN', label: 'Resumen', icon: GraduationCap },
  { key: 'DIM1', label: 'Dimensión 1 · IMMZ', icon: Brain },
  { key: 'DIM2', label: 'Dimensión 2 · ICMR', icon: Layers },
  { key: 'MARCO', label: 'DigCompEdu y Fundamento', icon: BookMarked },
  { key: 'TRABAJO', label: 'Hoja de Trabajo', icon: Layout },
];
interface Props { history: HistoryEvent[]; session: Session; classNumber: number | null; name: string; onName: (n: string) => void; onClear: () => void; reflection: SelfReflection; onReflection: (r: SelfReflection) => void }

export default function AnalysisView({ history, session, classNumber, name, onName, onClear, reflection, onReflection }: Props) {
  const [tab, setTab] = useState<Tab>('RESUMEN');
  const [askName, setAskName] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [last, setLast] = useState<{ file: string; ok: boolean; issues: string[] } | null>(null);
  const model = useMemo(() => buildAnalysisModel(history, session), [history, session]);
  const stats = useMemo(() => computeStats(history, session), [history, session]);
  const design = useMemo(() => computeDesign(session.slots, session.plan, reflection), [session, reflection]);
  const check = useMemo(() => { const r = buildReport({ participantName: name || 'Participante', classNumber, session, history, reflection }); return selfCheck(r, classNumber, name || 'Participante'); }, [history, session, classNumber, name, reflection]);
  const parsed = check.parsed;

  const generate = async (kind: 'html' | 'pdf') => {
    if (!name.trim()) { setAskName(true); return; }
    setBusy(true);
    try {
      const r = buildReport({ participantName: name, classNumber, session, history, reflection });
      const c = selfCheck(r, classNumber, name);
      setLast({ file: r.fileName, ok: c.ok, issues: c.issues });
      if (kind === 'html') downloadHtml(r.html, r.fileName); else await downloadPdf(r);
    } finally { setBusy(false); }
  };
  const setR = (k: 'oportunidad' | 'especificidad' | 'mejora', v: number) => { onReflection({ ...reflection, [k]: v }); setSaved(false); };

  return (
    <div className="mx-auto max-w-6xl p-4 lg:p-6">
      <header className="card relative mb-5 p-5 pl-7" data-testid="analysis-header">
        <div className="absolute inset-y-0 left-0 w-1.5 rounded-l-xl bg-brand-500" />
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white"><Activity size={22} /><span className="absolute right-0 top-0 h-3 w-3 rounded-bl-md bg-accent" /></div>
            <div className="min-w-0"><p className="micro">{model.cfg.moduleLabel}</p><h2 className="mt-0.5 text-2xl text-slate-900">Análisis del Participante</h2><p className="mt-0.5 text-sm text-slate-500">{model.cfg.title} · {model.cfg.subtitle}</p></div>
          </div>
          <div className="relative flex w-full shrink-0 flex-col items-stretch gap-2 md:w-auto md:items-end">
            <div className="flex gap-2">
              <button onClick={() => setAskName((p) => !p)} disabled={busy} data-testid="btn-html" className="btn-primary"><Download size={14} />Descargar Análisis IMMZ (HTML)</button>
              <button onClick={() => generate('pdf')} disabled={busy} className="btn-ghost"><FileText size={14} />PDF</button>
            </div>
            {askName && (
              <div className="card z-30 flex w-full flex-col gap-2 p-4 shadow-lg md:absolute md:right-0 md:top-full md:mt-2 md:w-96">
                <div className="flex items-center justify-between"><label htmlFor="pname" className="label !mb-0">Nombre del participante *</label>{!name.trim() && <span className="micro !text-rose-500">Requerido</span>}</div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input id="pname" autoFocus type="text" value={name} onChange={(e) => onName(e.target.value)} placeholder="Ej. María González" className={`input ${!name.trim() ? '!border-rose-300' : ''}`} />
                  <button onClick={() => { setAskName(false); generate('html'); }} disabled={!name.trim() || busy} className="btn-primary shrink-0 justify-center whitespace-nowrap">Descarga ahora</button>
                </div>
                {!name.trim() && <p className="text-[11px] text-slate-500">Ingresa tu nombre para habilitar la descarga del análisis.</p>}
              </div>)}
          </div>
        </div>
        <p className={`mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs ${check.ok ? 'text-emerald-700' : 'text-amber-700'}`} data-testid="compat">{check.ok ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}{check.ok ? <>Compatible con el Diario de Campo · leerá IMMZ {fmtPct(parsed.immz)} · ICMR {fmtPct(parsed.idcd)} · IMMG {fmtPct(parsed.immg)}</> : <>Revisar compatibilidad: {check.issues.join(' · ')}</>}</p>
      </header>

      <div className="mb-5 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-xs" role="tablist">
        {TABS.map(({ key, label, icon: I }) => <button key={key} role="tab" aria-selected={tab === key} data-testid={`atab-${key}`} onClick={() => setTab(key)} className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] transition ${tab === key ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><I size={15} />{label}</button>)}
      </div>

      {tab === 'RESUMEN' && <SummarySection m={model} />}
      {tab === 'DIM1' && <DimASection m={model} />}
      {tab === 'DIM2' && <DimBSection m={model} />}
      {tab === 'MARCO' && <FrameworkSection m={model} />}
      {tab === 'TRABAJO' && (
        <div className="space-y-6" data-testid="trabajo-tab">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" data-testid="kpis-trabajo">
            {([
              ['Apropiación', stats.hasEvidence ? `${stats.appropriation}%` : 'Sin evidencia', `Exactitud ${stats.accuracy}% · Efic. ${stats.efficiency}%`, GraduationCap, 'text-brand-500', 'bg-brand-50'],
              ['Aciertos (hoy)', String(stats.currentHits), 'Rutinas con situación coherente', CheckCircle2, 'text-emerald-600', 'bg-emerald-50'],
              ['Errores (hoy)', String(stats.currentErrors), 'Combinaciones con desajuste', XCircle, 'text-rose-500', 'bg-rose-50'],
              ['Decisiones', String(stats.totalMoves), 'Situaciones y fases decididas', MousePointerClick, 'text-sky-600', 'bg-sky-50'],
              ['Devoluciones', String(stats.analyses), 'Consultas de devolución didáctica', Search, 'text-amber-700', 'bg-accent-soft'],
            ] as [string, string, string, LucideIcon, string, string][]).map(([label, value, hint, Icon, tone, bg]) => (
              <div key={label} className="card flex items-center justify-between gap-3 p-4" data-kpi={label}>
                <div className="min-w-0"><p className="micro">{label}</p><p className={`mt-1.5 text-2xl font-title ${tone}`}>{value}</p><p className="mt-1 text-[11px] leading-snug text-slate-500">{hint}</p></div>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg} ${tone}`}><Icon size={22} /></div>
              </div>))}
          </div>

          <section className="card p-6"><h3 className="mb-4 flex items-center gap-2 text-base text-slate-900"><Layout size={16} className="text-slate-400" />Hoja de trabajo y clasificación didáctica</h3>
            <div className="grid gap-3 md:grid-cols-3">{(['inicio', 'desarrollo', 'cierre'] as const).map((p) => { const ss = session.slots.filter((s) => s.routine && slotPhase(s, session.plan) === p); return (
              <div key={p} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="micro mb-2 !text-brand-500">{PHASE_TITLE[p]}</p>
                <div className="space-y-1.5">{ss.length === 0 ? <p className="micro py-2">Sin rutinas asignadas</p> : ss.map((s) => { const ok = s.mathSituationId ? isCoherent(s.routine!.id, s.mathSituationId) : null; return (
                  <div key={s.id} className={`flex items-center justify-between gap-2 rounded-lg border bg-white p-2 ${ok === false ? 'border-rose-200' : ok ? 'border-emerald-200' : 'border-slate-200'}`}><div className="min-w-0"><p className="micro !text-[9px]">{s.timeLabel}</p><p className="truncate text-xs text-slate-700">{s.routine!.label} · {MATH_SITUATIONS.find((m) => m.id === s.mathSituationId)?.label ?? 'falta matematizar'}</p></div>{ok === true ? <CheckCircle2 size={14} className="shrink-0 text-emerald-500" /> : ok === false ? <AlertTriangle size={14} className="shrink-0 text-rose-400" /> : null}</div>); })}</div></div>); })}</div></section>

          <section className="card p-6" data-testid="imd-section"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-base text-slate-900"><Trophy size={16} className="text-emerald-600" />Índice de Madurez del Diseño (IMD) · Desglose de Calidad Didáctica</h3><span className="pill border-emerald-200 bg-emerald-50 text-emerald-700" data-testid="imd-value">IMD {design.imd}% · {design.state}</span></div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{design.parts.map((p) => <div key={p.key} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5"><div className="flex items-center justify-between"><span className="text-xs text-slate-700">{p.label}</span><span className="pill border-slate-200 bg-white !py-0 text-xs text-slate-900 font-title">{p.score}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${p.score}%` }} /></div><p className="mt-2 text-[11px] leading-snug text-slate-500">{p.feedback ?? p.note}</p></div>)}</div></section>

          <div className="grid gap-6 lg:grid-cols-12">
            <section className="card space-y-5 p-6 lg:col-span-8" data-testid="autodiagnostico"><h3 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-base text-slate-900"><Target size={16} className="text-brand-500" />Autodiagnóstico de Calidad Didáctica (Zimmerman)</h3>
              {design.tips.length > 0 && <div className="rounded-xl border border-amber-200 bg-accent-soft p-4"><p className="micro mb-2 flex items-center gap-1.5 !text-amber-800"><AlertTriangle size={14} />Recomendaciones prioritarias</p><ul className="list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-amber-900">{design.tips.map((t) => <li key={t.key}><b>{t.label}:</b> {t.tip}</li>)}</ul></div>}
              {([['oportunidad', 'Oportunidad de Matematización', '¿Identificaste los momentos óptimos de cuidado cotidiano para matematizar?'], ['especificidad', 'Especificidad de la Propuesta', '¿La situación problémica desafía el pensamiento de manera concreta y medible?'], ['mejora', 'Potencial de Mejora Didáctica', '¿El andamiaje provisto permite al párvulo superar el obstáculo didáctico?']] as const).map(([k, l, h]) => (
                <div key={k}><div className="mb-1 flex justify-between text-xs text-slate-700"><span className="font-title">{l}</span><span>{reflection[k]} / 5</span></div><input type="range" min={1} max={5} data-testid={`rng-${k}`} value={reflection[k]} onChange={(e) => setR(k, Number(e.target.value))} className="h-1.5 w-full cursor-pointer accent-brand-500" /><p className="mt-1 text-[11px] text-slate-500">{h}</p></div>))}
              <div><label className="label" htmlFor="refl">Reflexión metacognitiva escrita</label><textarea id="refl" data-testid="reflexion" value={reflection.reflexionEscrita} onChange={(e) => { onReflection({ ...reflection, reflexionEscrita: e.target.value }); setSaved(false); }} className="input min-h-[100px] resize-y !text-xs" placeholder="Escribe un breve análisis sobre tu propio proceso de diseño de clase... ¿Qué aprendiste y qué debes ajustar en tu próxima intervención didáctica?" /></div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4"><p className="max-w-sm text-[11px] text-slate-500">El autodiagnóstico se incluye en el reporte y actualiza tu indicador de autorreflexión (IMD).</p><button className="btn-primary" data-testid="btn-save-refl" onClick={() => { onReflection({ ...reflection, savedAt: new Date().toISOString() }); setSaved(true); }}><Save size={14} />{saved ? 'Autodiagnóstico guardado' : 'Registrar autodiagnóstico'}</button></div></section>
            <section className="card p-6 lg:col-span-4"><h3 className="mb-1 flex items-center gap-2 text-base text-slate-900"><History size={16} className="text-slate-400" />Bitácora de Monitoreo Activo</h3><p className="mb-4 text-xs text-slate-500">Registros en tiempo real de tu interacción cognitiva con la planificación didáctica.</p>
              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1" data-testid="bitacora">{history.length === 0 ? <p className="py-8 text-center text-xs italic text-slate-400">No se han registrado interacciones aún.</p> : history.slice().reverse().map((e, i) => { const d = describeEvent(e, session); return <div key={i} className="relative border-l border-slate-200 pb-1 pl-4"><span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-white" /><p className="font-mono text-[10px] text-brand-500">{new Date(e.timestamp).toLocaleTimeString('es-CL')}</p><p className="text-xs text-slate-900">{d.action}</p><p className="text-[11px] leading-snug text-slate-500">{d.detail}</p></div>; })}</div></section>
          </div>

          <section className="card bg-slate-50 p-6"><h3 className="micro mb-3 flex items-center gap-2 !text-brand-500"><Target size={14} />Lo que verá el Diario de Campo</h3>
            <ul className="space-y-1 text-sm text-slate-600"><li><b>APP:</b> {parsed.simulator} · escenario «{parsed.scenarioName}»</li><li><b>Clase declarada:</b> {parsed.classNumber ?? '—'} · <b>Esquema:</b> {parsed.sourceVersion} → V4</li><li><b>Participante:</b> {name.trim() ? parsed.studentName : '— (se pedirá al descargar)'}</li><li><b>Apropiación:</b> {fmtPct(parsed.apropiacion ?? null)} · aciertos {parsed.aciertos} · errores {parsed.errores} · reflexiones {parsed.reflexiones}</li>{last && <li><b>Último archivo:</b> <span className="font-mono text-xs">{last.file}</span> {last.ok ? '✓ verificado' : '⚠ ' + last.issues.join(', ')}</li>}</ul>
            {parsed.warnings.length > 0 && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"><p className="mb-1 flex items-center gap-1.5 font-title"><AlertTriangle size={13} />Avisos de normalización (igual que en el Diario)</p><ul className="list-disc pl-5">{parsed.warnings.slice(0, 6).map((w, i) => <li key={i}>{w}</li>)}</ul></div>}</section>
        </div>)}
      <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4"><button className="micro !text-rose-500 hover:!text-rose-600" onClick={() => { if (confirm('¿Borrar todo el historial de decisiones? (la línea de tiempo y la planificación se conservan)')) onClear(); }}>Borrar historial</button><span className="micro">{history.length} eventos en la traza</span></div>
    </div>
  );
}
