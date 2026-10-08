import { ArrowLeft } from 'lucide-react';
import { FORMAS, MATH_SITUATIONS } from '../data/rutinas';
import { COHERENCE_PAIRS } from '../data/didactics';
import { RoutineIcon } from '../components/Icons';

/** Matriz maestra de coherencia rutina ↔ situación (solo modo educador) — las 3 Formas, una tabla cada una. */
export default function SolutionView({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 lg:p-6">
      <button className="btn-ghost mb-1" onClick={onBack}><ArrowLeft size={14} />Volver</button>
      {FORMAS.map((forma) => (
        <div className="card p-6" key={forma.id}><span className="micro !text-brand-500">Modo educador</span><h2 className="mb-1 mt-1 text-xl text-slate-900">Matriz de coherencia didáctica — Forma {forma.id} ({forma.nivelBcep})</h2><p className="mb-4 text-sm text-slate-500">Combinaciones que la app considera óptimas (COHERENCE_PAIRS). Todo lo demás se registra como «conflicto didáctico».</p>
          <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[640px] border-collapse text-left"><thead><tr className="border-b border-slate-200 bg-slate-50 uppercase tracking-wider text-slate-500"><th className="p-3">Rutina</th>{MATH_SITUATIONS.map((s) => <th key={s.id} className="p-3 text-center">{s.label}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{forma.routines.map((r) => <tr key={r.id}><td className="p-3"><span className="flex items-center gap-2 text-slate-900"><RoutineIcon name={r.iconName} size={14} />{r.label}</span></td>{MATH_SITUATIONS.map((s) => <td key={s.id} className="p-3 text-center">{COHERENCE_PAIRS[r.id]?.includes(s.id) ? <span className="pill border-emerald-200 bg-emerald-50 text-emerald-700">Óptima</span> : <span className="text-slate-300">—</span>}</td>)}</tr>)}</tbody></table></div></div>
      ))}
    </div>
  );
}
