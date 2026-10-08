import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardList, Eye, Gauge, GraduationCap, HelpCircle, Info, Layers, Layout, LayoutTemplate, Lock, PenTool, Scale, Users, XCircle } from 'lucide-react';
import { FORMAS, MATH_SITUATIONS, type Forma } from '../data/rutinas';
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
      <div className="mb-4 flex gap-3 text-sm text-slate-600"><AlertTriangle className="shrink-0 text-rose-500" />Esta acción limpia la línea de tiempo, la planificación, tu autodiagnóstico y el historial de decisiones, y también olvida el NRC y la Forma: la app volverá a pedir la identificación completa, como al primer inicio. No se puede deshacer. Si aún no descargas tu reporte, hazlo antes.</div>
      <div className="flex justify-end gap-2"><button className="btn-ghost" onClick={onClose}>Cancelar</button><button className="btn-danger" onClick={() => { onConfirm(); onClose(); }}>Reiniciar todo</button></div>
    </Modal>
  );
}

export function ConfigModal({ open, onClose, onShowSolution, classNumber, onClass, judgmentEnabled, onJudgmentEnabled, nrc, onNrc, formaId, onForma }: { open: boolean; onClose: () => void; onShowSolution: () => void; classNumber: number | null; onClass: (c: number | null) => void; judgmentEnabled: boolean; onJudgmentEnabled: (v: boolean) => void; nrc: string | null; onNrc: (v: string) => void; formaId: Forma['id']; onForma: (id: Forma['id']) => void }) {
  const [pin, setPin] = useState(''); const [ok, setOk] = useState(false); const [err, setErr] = useState(false);
  const [nrcDraft, setNrcDraft] = useState(nrc ?? '');
  const unlock = () => { if (pin === ADMIN_DEFAULT_PIN) { setOk(true); setErr(false); setNrcDraft(nrc ?? ''); } else { setErr(true); setTimeout(() => setErr(false), 1800); } };
  const close = () => { setOk(false); setPin(''); onClose(); };
  const nrcValid = /^\d{3,6}$/.test(nrcDraft.trim());
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
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3"><label className="label" htmlFor="nrc">NRC del curso</label>
            <div className="flex gap-2"><input id="nrc" data-testid="nrc-config" inputMode="numeric" className="input text-center tracking-widest" value={nrcDraft} onChange={(e) => setNrcDraft(e.target.value.replace(/[^\d]/g, '').slice(0, 6))} placeholder="NRC" /><button className="btn-primary shrink-0" disabled={!nrcValid} onClick={() => onNrc(nrcDraft.trim())}>Guardar</button></div>
            <p className="mt-1 text-[11px] text-slate-500">Numérico, de 3 a 6 dígitos. Solo se cambia aquí, detrás del PIN.</p></div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3"><label className="label" htmlFor="forma-config">Forma de la sesión (A/B/C)</label>
            <select id="forma-config" data-testid="forma-config" className="input" value={formaId} onChange={(e) => onForma(e.target.value as Forma['id'])}>
              {FORMAS.map((f) => <option key={f.id} value={f.id}>Forma {f.id} — {f.nombre} ({f.nivelBcep})</option>)}</select>
            <p className="mt-1 text-[11px] text-slate-500">Misma arquitectura (7 rutinas, 6 situaciones, 11 pares de coherencia) con un tramo BCEP distinto en cada forma. El reporte queda marcado con <span className="font-mono">form_id</span> y <span className="font-mono">content_id</span>.</p>
            <p className="mt-2 text-[11px] text-amber-700">Cambiar de forma reinicia la línea de tiempo, la planificación y el historial de esta sesión (igual que «Reiniciar»), porque cada Forma tiene su propio conjunto de rutinas. Elígela antes de que la estudiante empiece a trabajar.</p></div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3"><label className="label" htmlFor="cls">Clase que declara el reporte (Plan Orientador)</label>
            <select id="cls" data-testid="cls" className="input" value={classNumber ?? ''} onChange={(e) => onClass(e.target.value ? Number(e.target.value) : null)}>
              <option value="">No declarar clase (el Diario usará la de la entrada)</option>
              {PLAN_CLASSES.map((c) => <option key={c.number} value={c.number}>{c.title}</option>)}</select>
            <p className="mt-1 text-[11px] text-slate-500">Debe coincidir con la clase configurada para «{APP_META.name}» en el Diario de Campo (por defecto, Clase {APP_META.defaultClassNumber}). Si difiere, el auditor del Diario marcará la discrepancia R11.</p></div>
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-3"><Gauge size={18} className="text-brand-500" /><div><p className="text-sm text-slate-900">Modal de calibración del juicio (IM11)</p><p className="text-xs text-slate-500">Antes de confirmar cada rutina, preguntar «¿Crees que esta secuencia es coherente?».</p></div></div>
            <button role="switch" aria-checked={judgmentEnabled} onClick={() => onJudgmentEnabled(!judgmentEnabled)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${judgmentEnabled ? 'bg-brand-500' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${judgmentEnabled ? 'left-5' : 'left-0.5'}`} /></button>
          </div>
          {!judgmentEnabled && <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-700">Con el modal apagado no se registran juicios: el indicador IM11 (Calibración del juicio metacognitivo) quedará sin evidencia en el reporte.</p>}
          <button className="w-full py-2 text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600" onClick={close}>Cerrar sesión admin</button>
        </div>)}
    </Modal>
  );
}

/**
 * Identificación al primer inicio (TAREA 4 + MISMO formato, layout y lógica de ingreso del
 * Simulador TSD-IMMZ: ver su IdentificationModal en src/components/Modals.tsx): bloqueante — sin
 * botón de cerrar, sin tecla Escape y sin clic en el fondo, no hay onClose. Pide NRC del curso y
 * la Forma (A/B/C) de la sesión; ambos se guardan juntos y no se vuelven a pedir en este
 * dispositivo (solo son editables después desde Configuración, detrás del PIN).
 */
export function IdentificationModal({ open, error, onComplete }: { open: boolean; error?: string | null; onComplete: (nrc: string, formaId: Forma['id']) => void }) {
  const [nrc, setNrc] = useState('');
  const [formaId, setFormaId] = useState<Forma['id'] | ''>('');
  const nrcTouched = nrc.length > 0;
  const nrcValid = /^\d{3,6}$/.test(nrc);
  const canSubmit = nrcValid && formaId !== '';
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      <div role="dialog" aria-modal="true" className="card relative max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-6">
        <div className="mb-4 flex items-center gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-500"><ClipboardList size={22} /></span><div><h3 className="text-lg text-slate-900">Identificación del curso</h3><p className="text-xs text-slate-500">Antes de comenzar</p></div></div>
        <p className="mb-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Estos datos los configura la docente al inicio de la clase y no se vuelven a pedir en este dispositivo.</p>
        {error && <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"><AlertTriangle size={14} className="mt-0.5 shrink-0" />{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="nrc-input">NRC del curso *</label>
            <input id="nrc-input" autoFocus data-testid="nrc-input" type="text" inputMode="numeric" value={nrc} onChange={(e) => setNrc(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Ej. 12345" className={`input ${nrcTouched && !nrcValid ? '!border-rose-300' : ''}`} />
            {nrcTouched && !nrcValid && <p className="mt-1 text-[11px] text-rose-500">Debe tener entre 3 y 6 dígitos.</p>}
          </div>
          <div>
            <label className="label" htmlFor="forma-input">Forma de la sesión *</label>
            <select id="forma-input" data-testid="forma-input" className="input" value={formaId} onChange={(e) => setFormaId(e.target.value as Forma['id'])}>
              <option value="" disabled>Selecciona una forma…</option>
              {FORMAS.map((f) => <option key={f.id} value={f.id}>Forma {f.id} — {f.nombre} ({f.nivelBcep})</option>)}
            </select>
          </div>
        </div>
        <button disabled={!canSubmit} data-testid="identification-submit" onClick={() => onComplete(nrc, formaId as Forma['id'])} className="btn-primary mt-6 w-full justify-center">Comenzar</button>
      </div>
    </div>
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

/**
 * Calibración del juicio metacognitivo (IM11, motor 4.1) — MISMO formato, colores e iconos que
 * ConjectureModal del Simulador TSD-IMMZ: se dispara justo después de que la decisión queda
 * registrada en la traza (la coherencia real ya está calculada), pero antes de que la estudiante
 * siga trabajando — por eso la pregunta se formula en términos de «antes de confirmar»: lo que se
 * pide es declarar la confianza en la combinación antes de pasar a la siguiente, no reabrir la
 * decisión. Cerrar el modal sin responder no emite el evento 'judgment'.
 */
export function JudgmentModal({ open, routineLabel, situationLabel, onAnswer, onClose }: { open: boolean; routineLabel: string; situationLabel: string; onAnswer: (declared: boolean) => void; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Antes de confirmar…">
      <div className="mb-4 flex items-center gap-3"><span className="rounded-xl bg-brand-50 p-2 text-brand-500"><Scale size={20} /></span><p className="text-sm text-slate-600">Calibración del juicio metacognitivo (IM11)</p></div>
      <p className="mb-5 rounded-xl bg-slate-50 p-4 text-base leading-snug text-slate-900">«{routineLabel} · {situationLabel}»</p>
      <p className="mb-5 text-sm text-slate-700">¿Crees que esta secuencia es coherente?</p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onAnswer(true)} data-testid="judgment-yes" className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm text-emerald-700 transition hover:bg-emerald-100"><CheckCircle2 size={16} />Sí</button>
        <button onClick={() => onAnswer(false)} data-testid="judgment-no" className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-3 text-sm text-rose-700 transition hover:bg-rose-100"><XCircle size={16} />No</button>
      </div>
      <p className="mt-4 text-center text-[11px] text-slate-400">Tu decisión ya quedó registrada: responder es opcional, pero solo cuenta para IM11 si respondes.</p>
    </Modal>
  );
}
