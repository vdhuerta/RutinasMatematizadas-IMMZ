import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Eye, GraduationCap, HelpCircle, Info, Layers, Layout, LayoutTemplate, Lock, PenTool, Users } from 'lucide-react';
import { MATH_SITUATIONS } from '../data/rutinas';
import { getDevolucionText, isCoherent } from '../data/didactics';
import type { TimelineSlot } from '../types';
import { ADMIN_DEFAULT_PIN, APP_META } from '../config';
import { PLAN_CLASSES } from '../data/plan';
import { Modal } from './ui';

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const step = (n: string, t: string, d: string) => <div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500 font-title">{n}</span><div><p className="text-sm text-slate-900 font-title">{t}</p><p className="text-sm text-slate-500">{d}</p></div></div>;
  const con = (t: string, d: React.ReactNode) => <div className="rounded-xl border border-slate-100 bg-white p-4"><h5 className="text-xs uppercase tracking-widest text-brand-500">{t}</h5><p className="mt-1 text-sm leading-relaxed text-slate-600">{d}</p></div>;
  return (
    <Modal open={open} onClose={onClose} size="5xl" title="Guía Práctica y Fundamentos">
      <div className="space-y-6 text-sm text-slate-600">
        <section><h4 className="mb-2 flex items-center gap-2 text-slate-900"><Info size={16} className="text-accent" />¿Qué es Rutinas Matematizadas?</h4>
          <div className="rounded-xl bg-slate-50 p-4"><p>Es una herramienta de diseño didáctico para la Educación Parvularia que permite visibilizar e integrar el aprendizaje matemático durante los momentos cotidianos o de cuidado (rutinas), transformándolos en oportunidades educativas ricas y alineadas con las Bases Curriculares.</p></div></section>
        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-xl border border-slate-100 bg-slate-50 p-5"><h4 className="mb-4 flex items-center gap-2 text-slate-900"><LayoutTemplate size={16} className="text-brand-500" />El viaje del usuario (paso a paso)</h4><div className="space-y-4">
            {step('1', 'Paso 1: Selector de rutina', 'Arrastra las tarjetas de rutinas (Saludo, Higiene, Colación, etc.) a tu línea de tiempo. Cada rutina se usa una sola vez: para sacarla, arrástrala de vuelta al mazo. Usa la lupa para recibir su Devolución Didáctica.')}
            {step('2', 'Paso 2: Integración matemática', 'Transforma la rutina aplicando una de las «Situaciones Matemáticas». Convierte el conteo de asistencia o repartir material en un desafío explícito.')}
            {step('3', 'Paso 3: Planificación BCEP', 'Cruza tu diseño con las Bases Curriculares (Nivel, Ámbito, Núcleo, OA), define los objetivos y distribuye las rutinas en las fases de Inicio, Desarrollo y Cierre.')}
            {step('4', 'Análisis y reporte', 'En «Análisis del participante» ves tus 10 indicadores (IMMZ e ICMR), registras tu autodiagnóstico y descargas el «Análisis IMMZ (HTML)» para tu Diario de Campo.')}</div></section>
          <section className="rounded-xl border border-brand-100 bg-brand-50 p-5"><h4 className="mb-3 flex items-center gap-2 text-brand-500"><PenTool size={16} />Redacción de objetivos</h4>
            <p>Un <b>Objetivo Específico</b> eficaz sigue esta fórmula:</p><p className="my-3 rounded-xl border border-brand-100 bg-white p-4 text-center font-mono text-sm"><span className="text-emerald-600">Verbo</span> + <span className="text-sky-600">Variable</span> + <span className="text-indigo-600">Unidad de análisis</span> + <span className="text-amber-700">Contexto</span></p>
            <p className="rounded-lg border border-slate-100 bg-white p-3 italic">«Distinguir (verbo) emociones básicas (variable) en los niños y niñas (unidad) durante el juego de roles (contexto).»</p></section>
        </div>
        <section><h4 className="mb-3 flex items-center gap-2 text-slate-900"><Layers size={16} className="text-brand-500" />Sustento teórico y conceptos clave</h4>
          <div className="mb-4 rounded-xl border border-brand-100 bg-brand-50 p-5"><h5 className="mb-1 text-brand-500 font-title">¿Qué es matematizar las rutinas?</h5><p className="italic">«No se trata de enseñar matemáticas durante la comida, sino de descubrir la estructura matemática que ya existe en el acto de comer (repartir, cuantificar, secuenciar).»</p><p className="mt-2">Matematizar es usar herramientas del pensamiento lógico para organizar, describir y resolver situaciones del mundo real: transformar un momento cotidiano en una <b>situación didáctica</b> con intención pedagógica.</p></div>
          <div className="grid gap-3 md:grid-cols-2">
            {con('Matematización (Freudenthal)', 'La matemática es una actividad humana consistente en organizar la realidad. La matematización horizontal ocurre cuando el niño o niña organiza sus rutinas con nociones de tiempo, cantidad y espacio.')}
            {con('Didáctica de la matemática (González y Weinstein)', 'Enfoque centrado en que el niño dé sentido a lo aprendido, aprovechando la funcionalidad de la matemática en su entorno.')}
            {con('Teoría de Situaciones Didácticas (Brousseau)', 'Sustenta el Paso 2: el aprendizaje se logra enfrentando al niño a situaciones que lo retan, en cuatro fases: acción, formulación, validación e institucionalización.')}
            {con('El currículum en acción (Gonzalez-Mena)', 'Los momentos de cuidado (alimentación, muda, sueño) no son pausas del aprendizaje, sino currículum temprano indispensable.')}
            <div className="md:col-span-2">{con('Bases Curriculares de Educación Parvularia (BCEP)', 'La app cruza Niveles, Ámbitos y Núcleos para sugerir los Objetivos de Aprendizaje precisos, evitando la desalineación entre la actividad y el currículum.')}</div></div></section>
        <section className="rounded-xl border border-brand-100 bg-brand-50 p-4"><h4 className="mb-1 text-brand-500">Conexión con el Diario de Campo</h4><p>Al terminar, descarga el reporte <span className="font-mono text-xs">{APP_META.filenamePrefix}Nombre_ID.html</span> y adjúntalo <u>sin modificarlo</u> en tu entrada del Diario (APP «{APP_META.name}»). Ahí escribirás tu reflexión metacognitiva sobre estas mismas trazas.</p></section>
      </div>
      <div className="mt-5 text-center"><button className="btn-primary" onClick={onClose}>Comenzar a planificar</button></div>
    </Modal>
  );
}

export function ConfirmModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="¿Reiniciar progreso?">
      <div className="mb-4 flex gap-3 text-sm text-slate-600"><AlertTriangle className="shrink-0 text-rose-500" />Esta acción limpia la línea de tiempo, la planificación, tu autodiagnóstico y el historial de decisiones. No se puede deshacer. Si aún no descargas tu reporte, hazlo antes.</div>
      <div className="flex justify-end gap-2"><button className="btn-ghost" onClick={onClose}>Cancelar</button><button className="btn-danger" onClick={() => { onConfirm(); onClose(); }}>Reiniciar todo</button></div>
    </Modal>
  );
}

export function ConfigModal({ open, onClose, onShowSolution, classNumber, onClass }: { open: boolean; onClose: () => void; onShowSolution: () => void; classNumber: number | null; onClass: (c: number | null) => void }) {
  const [pin, setPin] = useState(''); const [ok, setOk] = useState(false); const [err, setErr] = useState(false);
  const unlock = () => { if (pin === ADMIN_DEFAULT_PIN) { setOk(true); setErr(false); } else { setErr(true); setTimeout(() => setErr(false), 1800); } };
  const close = () => { setOk(false); setPin(''); onClose(); };
  return (
    <Modal open={open} onClose={close} title="Panel de configuración">
      {!ok ? (
        <div className="space-y-4 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500"><Lock /></div><p className="text-sm text-slate-500">Ingresa la clave de administrador para continuar</p>
          <input type="password" autoFocus data-testid="pin" className={`input text-center text-2xl tracking-[0.8em] ${err ? '!border-rose-300' : ''}`} value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && unlock()} placeholder="••••" />
          {err && <p className="text-xs text-rose-500">Clave incorrecta</p>}<button className="btn-primary w-full justify-center" onClick={unlock}>Verificar clave</button></div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3"><GraduationCap className="text-emerald-600" /><div><p className="text-sm text-emerald-800 font-title">Modo educador activo</p><p className="micro !text-emerald-600">Privilegios concedidos</p></div></div>
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex items-center gap-3"><Eye size={18} className="text-brand-500" /><div><p className="text-sm text-slate-900">Visualizar matriz de coherencia</p><p className="text-xs text-slate-500">Hoja de respuestas maestra rutina ↔ situación</p></div></div><button className="btn-primary" onClick={() => { onShowSolution(); close(); }}>Entrar</button></div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3"><label className="label" htmlFor="cls">Clase que declara el reporte (Plan Orientador)</label>
            <select id="cls" data-testid="cls" className="input" value={classNumber ?? ''} onChange={(e) => onClass(e.target.value ? Number(e.target.value) : null)}>
              <option value="">No declarar clase (el Diario usará la de la entrada)</option>
              {PLAN_CLASSES.map((c) => <option key={c.number} value={c.number}>{c.title}</option>)}</select>
            <p className="mt-1 text-[11px] text-slate-500">Debe coincidir con la clase configurada para «{APP_META.name}» en el Diario de Campo (por defecto, Clase {APP_META.defaultClassNumber}). Si difiere, el auditor del Diario marcará la discrepancia R11.</p></div>
          <button className="w-full py-2 text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600" onClick={close}>Cerrar sesión admin</button>
        </div>)}
    </Modal>
  );
}

/** Devolución didáctica de una rutina ubicada (mismo formato y funcionamiento que el «Análisis didáctico» del Simulador TSD). */
export function RoutineAnalysisModal({ slot, open, onClose }: { slot: TimelineSlot | null; open: boolean; onClose: () => void }) {
  if (!slot?.routine) return null;
  const r = slot.routine; const sit = MATH_SITUATIONS.find((m) => m.id === slot.mathSituationId);
  const ok = sit ? isCoherent(r.id, sit.id) : null;
  const fb = sit
    ? ok ? { title: 'Retroalimentación de la alineación didáctica', text: `La combinación «${r.label} · ${sit.label}» ofrece un andamiaje excelente para el pensamiento lógico-matemático. ${getDevolucionText(r.id, sit.id)}` }
      : { title: 'Devolución didáctica (desajuste de coherencia)', text: `Esta combinación puede generar desajustes cognitivos o resultar forzada para el párvulo. ${getDevolucionText(r.id, sit.id)}` }
    : { title: 'Devolución didáctica de la rutina', text: `${getDevolucionText(r.id, null)} Aún falta matematizar esta rutina: elige una situación en el Paso 2.` };
  return (
    <Modal open={open} onClose={onClose} size="3xl" title="Análisis didáctico">
      <p className="micro mb-3">Devolución y reflexión didáctica · Rutina de cuidado · {slot.timeLabel}</p>
      <p className="mb-5 rounded-xl bg-slate-50 p-4 text-lg leading-snug text-slate-900">«{r.label}{sit ? ` · ${sit.label}` : ''}»</p>
      <div className="mb-3 flex items-center gap-3"><span className={`rounded-xl p-2 ${ok === false ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>{ok === false ? <HelpCircle size={20} /> : <CheckCircle2 size={20} />}</span><h4 className="text-sm uppercase tracking-widest text-slate-900">{fb.title}</h4></div>
      <p className="border-l-4 border-brand-200 pl-3 text-sm leading-relaxed text-slate-600" data-testid="analysis-text">{fb.text}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 text-[10px] uppercase tracking-widest text-slate-500"><div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3"><Users size={16} className="text-brand-400" />Contrato didáctico</div><div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3"><Layout size={16} className="text-brand-400" />Rutina de cuidado</div></div>
      <div className="mt-5 text-center"><button className="btn-primary" onClick={onClose}>Cerrar análisis</button></div>
    </Modal>
  );
}
