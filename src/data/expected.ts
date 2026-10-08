/**
 * RÚBRICAS DE IM10 (corrección de la formulación escrita), igual que en Laboratorio TSD.
 *
 * Cada rutina de cuidado tiene CUATRO grupos de términos equivalentes. Tocar un grupo es contener
 * cualquiera de sus términos. La justificación escrita es correcta si toca AL MENOS `minimoGrupos`
 * grupos distintos (3 de 4, igual que en Laboratorio). Un mismo fragmento del texto no puede
 * acreditar dos grupos.
 *
 * Esta rúbrica NO bloquea ni condiciona la decisión de Paso 2 (elegir la situación matemática):
 * la justificación escrita es opcional y, si se omite, el acto de formulación se registra igual
 * por acción (modo 'accion', ver toImmzEvents en lib/metrics.ts) con la coherencia real de la
 * decisión. La rúbrica solo entra en juego cuando la estudiante SÍ escribe una justificación.
 *
 * Se editan SOLO aquí (datos); el motor de comparación está más abajo y no depende de ninguna
 * rúbrica concreta (motor portado tal cual desde Laboratorio TSD, ver tokenizar/tokenCoincide).
 *
 * Cómo se compara (ver `evaluateAnswer`):
 *  · Texto y términos se normalizan igual: minúsculas, sin tildes (la «ñ» queda «n»), solo letras y cifras.
 *    Escribe los términos sin tildes ni «ñ».
 *  · Numerales ≡ palabras: «1» = «uno» = «una» (y 2…12 con sus palabras). En un término, «un» acepta «un» o «1».
 *  · Coincidencia por raíz: «clasificar» acepta «clasifico», «clasificación», «clasifican»… (ver `tokenCoincide`).
 *    Los términos de varias palabras exigen las palabras consecutivas. Los verbos irregulares no
 *    comparten raíz: si hace falta, agrégalos como término.
 *  · Un término no puede acreditar dos grupos: cada grupo debe apoyarse en palabras distintas del texto.
 */
export interface GrupoTerminos { id: string; nombre: string; terminos: string[] }
export interface RubricaRutina { routineId: string; grupos: GrupoTerminos[]; minimoGrupos: number }

/**
 * Una rúbrica por rutina (7), construida sobre el vocabulario de SUS situaciones matemáticas
 * coherentes declaradas en data/didactics.ts (COHERENCE_PAIRS) — para que una buena justificación
 * toque ≥3 grupos sin importar cuál de las situaciones válidas haya elegido la estudiante.
 */
/**
 * Ninguno de los términos de abajo aparece en el texto de devolución didáctica de su propia
 * rutina (verificado con scripts/check-devoluciones.ts) — si la devolución regalara el
 * vocabulario de la rúbrica, escribir una justificación "correcta" sería copiar y pegar.
 */
export const RUBRICAS: RubricaRutina[] = [
  { routineId: 'llegada', minimoGrupos: 3, grupos: [ // secuencia (Tiempo)
    { id: 'G1', nombre: 'Secuencia', terminos: ['antes', 'luego', 'orden', 'secuencia', 'sucesion'] },
    { id: 'G2', nombre: 'Transición del día', terminos: ['entrada', 'ingreso', 'recibir', 'puerta', 'sala'] },
    { id: 'G3', nombre: 'Comparación temporal', terminos: ['lo que viene', 'lo anterior', 'lo siguiente'] },
    { id: 'G4', nombre: 'Compañía', terminos: ['companeros', 'grupo', 'juntos', 'cada uno llega'] },
  ] },
  { routineId: 'higiene', minimoGrupos: 3, grupos: [ // secuencia (Tiempo) o espacio (Espacio)
    { id: 'G1', nombre: 'Secuencia', terminos: ['primero', 'luego', 'secuencia', 'sucesion'] },
    { id: 'G2', nombre: 'Nociones espaciales', terminos: ['dentro', 'fuera', 'encima', 'debajo', 'ubicacion'] },
    { id: 'G3', nombre: 'Acción higiénica', terminos: ['lavado', 'enjabonar', 'tallar', 'secado'] },
    { id: 'G4', nombre: 'Ubicación de objetos', terminos: ['cada cosa en su sitio', 'donde corresponde'] },
  ] },
  { routineId: 'colacion', minimoGrupos: 3, grupos: [ // correspondencia (Número/Conteo) o cuantificadores (Número)
    { id: 'G1', nombre: 'Correspondencia', terminos: ['uno', 'una', '1', 'reparto', 'repartir', 'por persona'] },
    { id: 'G2', nombre: 'Cuantificadores', terminos: ['mucho', 'poco', 'todos', 'ninguno'] },
    { id: 'G3', nombre: 'Contexto alimentario', terminos: ['bandeja', 'porciones iguales'] },
    { id: 'G4', nombre: 'Comparación de cantidad', terminos: ['equivale', 'falta', 'sobra', 'alcanza'] },
  ] },
  { routineId: 'patio', minimoGrupos: 3, grupos: [ // espacio (Espacio) o seriacion (Lógica)
    { id: 'G1', nombre: 'Nociones espaciales', terminos: ['dentro', 'fuera', 'encima', 'debajo', 'recorrido', 'camino'] },
    { id: 'G2', nombre: 'Seriación', terminos: ['serie', 'tamano', 'distancia larga', 'distancia corta', 'comparar longitud'] },
    { id: 'G3', nombre: 'Juego libre', terminos: ['arenero', 'columpio', 'juguetes del patio'] },
    { id: 'G4', nombre: 'Organización', terminos: ['agrupar', 'clasificar', 'criterio'] },
  ] },
  { routineId: 'orden', minimoGrupos: 3, grupos: [ // clasificacion (Lógica) o seriacion (Lógica)
    { id: 'G1', nombre: 'Clasificación', terminos: ['agrupar', 'clasificar', 'tipo', 'color', 'forma', 'criterio comun'] },
    { id: 'G2', nombre: 'Seriación', terminos: ['serie', 'tamano', 'de menor a mayor', 'de mayor a menor'] },
    { id: 'G3', nombre: 'Contexto de materiales', terminos: ['estantes', 'cajas', 'rincon de construccion'] },
    { id: 'G4', nombre: 'Criterio compartido', terminos: ['parecido', 'se repite', 'comparten'] },
  ] },
  { routineId: 'siesta', minimoGrupos: 3, grupos: [ // secuencia (Tiempo)
    { id: 'G1', nombre: 'Secuencia', terminos: ['antes', 'luego', 'orden', 'secuencia'] },
    { id: 'G2', nombre: 'Contexto del descanso', terminos: ['quietud', 'dormir', 'acostarse'] },
    { id: 'G3', nombre: 'Correspondencia de objetos', terminos: ['manta', 'cada nino', 'cada nina'] },
    { id: 'G4', nombre: 'Regularidad', terminos: ['siempre igual', 'mismo lugar', 'todos los dias'] },
  ] },
  { routineId: 'despedida', minimoGrupos: 3, grupos: [ // secuencia (Tiempo)
    { id: 'G1', nombre: 'Secuencia', terminos: ['antes', 'luego', 'ultimo', 'termina'] },
    { id: 'G2', nombre: 'Cierre de la jornada', terminos: ['adios', 'hasta pronto', 'vuelta a casa'] },
    { id: 'G3', nombre: 'Retrospección', terminos: ['recordar lo que paso', 'hicimos hoy'] },
    { id: 'G4', nombre: 'Proyección', terminos: ['proximo encuentro', 'mañana sera otro dia'] },
  ] },
  // ───────── Forma B — Sala Cuna (1er Tramo) ─────────
  { routineId: 'bienvenida_b', minimoGrupos: 3, grupos: [ // secuencia (Tiempo)
    { id: 'G1', nombre: 'Secuencia', terminos: ['primero', 'despues', 'orden', 'secuencia'] },
    { id: 'G2', nombre: 'Transición del hogar', terminos: ['ingreso', 'recibir', 'acogida', 'bienvenida'] },
    { id: 'G3', nombre: 'Vínculo afectivo', terminos: ['seguridad', 'calidez', 'seguro'] },
    { id: 'G4', nombre: 'Anticipación', terminos: ['anticipar', 'avisar', 'preparar'] },
  ] },
  { routineId: 'muda_b', minimoGrupos: 3, grupos: [ // secuencia (Tiempo) o espacio (Espacio)
    { id: 'G1', nombre: 'Secuencia', terminos: ['primero', 'despues', 'luego', 'pasos'] },
    { id: 'G2', nombre: 'Nociones espaciales', terminos: ['dentro', 'fuera', 'mudador', 'estante'] },
    { id: 'G3', nombre: 'Acción corporal', terminos: ['piel', 'aseo', 'toalla'] },
    { id: 'G4', nombre: 'Ubicación de implementos', terminos: ['cada cosa en su lugar', 'donde va'] },
  ] },
  { routineId: 'alimentacion_b', minimoGrupos: 3, grupos: [ // correspondencia (Número/Conteo) o cuantificadores (Número)
    { id: 'G1', nombre: 'Correspondencia', terminos: ['uno', 'una', '1', 'cada guagua', 'por bebe'] },
    { id: 'G2', nombre: 'Cuantificadores', terminos: ['mucho', 'poco', 'todos', 'ninguno'] },
    { id: 'G3', nombre: 'Objeto de alimentación', terminos: ['mamadera', 'biberon', 'tetero'] },
    { id: 'G4', nombre: 'Comparación de cantidad', terminos: ['falta', 'sobra', 'alcanza'] },
  ] },
  { routineId: 'exploracion_b', minimoGrupos: 3, grupos: [ // espacio (Espacio) o seriacion (Lógica)
    { id: 'G1', nombre: 'Nociones espaciales', terminos: ['dentro', 'fuera', 'encima', 'debajo'] },
    { id: 'G2', nombre: 'Seriación', terminos: ['serie', 'tamano', 'mas grande', 'mas chico'] },
    { id: 'G3', nombre: 'Materiales de juego', terminos: ['mantita', 'pelota', 'sonajero'] },
    { id: 'G4', nombre: 'Exploración libre', terminos: ['curiosear', 'probar', 'tocar'] },
  ] },
  { routineId: 'guardado_b', minimoGrupos: 3, grupos: [ // clasificacion (Lógica) o seriacion (Lógica)
    { id: 'G1', nombre: 'Clasificación', terminos: ['agrupar', 'clasificar', 'tipo', 'categoria'] },
    { id: 'G2', nombre: 'Seriación', terminos: ['serie', 'tamano', 'de menor a mayor'] },
    { id: 'G3', nombre: 'Objetos personales', terminos: ['mantas', 'chupetes', 'canasto'] },
    { id: 'G4', nombre: 'Hábito de orden', terminos: ['guardar', 'lugar fijo', 'rutina'] },
  ] },
  { routineId: 'descanso_b', minimoGrupos: 3, grupos: [ // secuencia (Tiempo)
    { id: 'G1', nombre: 'Secuencia', terminos: ['ahora', 'despues', 'antes', 'orden'] },
    { id: 'G2', nombre: 'Sueño', terminos: ['dormir', 'descansar', 'cuna'] },
    { id: 'G3', nombre: 'Calma', terminos: ['calma', 'quietud', 'tranquilo'] },
    { id: 'G4', nombre: 'Regularidad', terminos: ['siempre', 'cada dia', 'mismo momento'] },
  ] },
  { routineId: 'entrega_b', minimoGrupos: 3, grupos: [ // secuencia (Tiempo)
    { id: 'G1', nombre: 'Secuencia', terminos: ['al inicio', 'al final', 'orden', 'paso'] },
    { id: 'G2', nombre: 'Vínculo con la familia', terminos: ['papa', 'mama', 'apoderado'] },
    { id: 'G3', nombre: 'Afecto', terminos: ['abrazo', 'carino', 'alegria'] },
    { id: 'G4', nombre: 'Cierre de la jornada', terminos: ['ultima actividad', 'se acaba', 'hora de irse'] },
  ] },
  // ───────── Forma C — Transición (3er Tramo) ─────────
  { routineId: 'registro_c', minimoGrupos: 3, grupos: [ // secuencia (Tiempo)
    { id: 'G1', nombre: 'Secuencia', terminos: ['primero', 'despues', 'antes', 'consecutivo'] },
    { id: 'G2', nombre: 'Conteo del curso', terminos: ['presentes', 'ausentes', 'cuantos vinieron'] },
    { id: 'G3', nombre: 'Inicio del día', terminos: ['entrar a la sala', 'grupo reunido', 'empezar la jornada'] },
    { id: 'G4', nombre: 'Rutina diaria', terminos: ['todos los dias', 'cada mañana', 'horario'] },
  ] },
  { routineId: 'autocuidado_c', minimoGrupos: 3, grupos: [ // secuencia (Tiempo) o espacio (Espacio)
    { id: 'G1', nombre: 'Secuencia', terminos: ['primero', 'luego', 'orden', 'pasos'] },
    { id: 'G2', nombre: 'Nociones espaciales', terminos: ['dentro', 'fuera', 'estante', 'lugar'] },
    { id: 'G3', nombre: 'Independencia', terminos: ['sin ayuda', 'el mismo nino', 'sin apoyo'] },
    { id: 'G4', nombre: 'Higiene personal', terminos: ['lavado', 'cepillado', 'aseo'] },
  ] },
  { routineId: 'economia_c', minimoGrupos: 3, grupos: [ // correspondencia (Número/Conteo) o cuantificadores (Número)
    { id: 'G1', nombre: 'Correspondencia', terminos: ['por persona', 'cada cual', 'reparto equitativo'] },
    { id: 'G2', nombre: 'Cuantificadores', terminos: ['mucho', 'poco', 'ninguno'] },
    { id: 'G3', nombre: 'Convivencia', terminos: ['compartir', 'companeros', 'mesa'] },
    { id: 'G4', nombre: 'Comparación de cantidad', terminos: ['falta', 'sobra', 'alcanza', 'suficiente'] },
  ] },
  { routineId: 'juegos_c', minimoGrupos: 3, grupos: [ // espacio (Espacio) o seriacion (Lógica)
    { id: 'G1', nombre: 'Nociones espaciales', terminos: ['dentro', 'fuera', 'lejos', 'cerca'] },
    { id: 'G2', nombre: 'Seriación', terminos: ['serie', 'orden', 'de mayor a menor'] },
    { id: 'G3', nombre: 'Juego reglado', terminos: ['cancha', 'equipo', 'arbitro'] },
    { id: 'G4', nombre: 'Patio', terminos: ['recreo', 'aire libre', 'deporte'] },
  ] },
  { routineId: 'biblioteca_c', minimoGrupos: 3, grupos: [ // clasificacion (Lógica) o seriacion (Lógica)
    { id: 'G1', nombre: 'Clasificación', terminos: ['agrupar', 'clasificar', 'categoria'] },
    { id: 'G2', nombre: 'Seriación', terminos: ['tamano', 'mas grande', 'mas chico', 'serie'] },
    { id: 'G3', nombre: 'Materiales de biblioteca', terminos: ['libros', 'cuentos', 'estante'] },
    { id: 'G4', nombre: 'Cuidado colaborativo', terminos: ['cuidar', 'compartido', 'entre todos'] },
  ] },
  { routineId: 'lectura_c', minimoGrupos: 3, grupos: [ // secuencia (Tiempo)
    { id: 'G1', nombre: 'Secuencia', terminos: ['antes', 'despues', 'orden', 'historia'] },
    { id: 'G2', nombre: 'Calma', terminos: ['quietud', 'pausado', 'sosegado'] },
    { id: 'G3', nombre: 'Lectura', terminos: ['paginas', 'ilustraciones', 'personajes'] },
    { id: 'G4', nombre: 'Concentración', terminos: ['atencion', 'enfocarse', 'escuchar'] },
  ] },
  { routineId: 'sintesis_c', minimoGrupos: 3, grupos: [ // secuencia (Tiempo)
    { id: 'G1', nombre: 'Secuencia', terminos: ['inicio', 'medio', 'final', 'orden'] },
    { id: 'G2', nombre: 'Recapitulación', terminos: ['repasar', 'reconstruir', 'relato completo'] },
    { id: 'G3', nombre: 'Cierre afectivo', terminos: ['hasta mañana', 'nos vemos', 'chao'] },
    { id: 'G4', nombre: 'Consolidación', terminos: ['lo que vivimos', 'lo que descubrimos', 'quedo claro'] },
  ] },
];

export const rubricaDe = (routineId: string): RubricaRutina => {
  const r = RUBRICAS.find((x) => x.routineId === routineId);
  if (!r) throw new Error(`Sin rúbrica para la rutina ${routineId}`);
  return r;
};

/* ───────────── Motor de comparación (portado tal cual desde Laboratorio TSD; no editar para ajustar términos) ───────────── */

const NUMERALES: Record<string, string> = { uno: '1', una: '1', dos: '2', tres: '3', cuatro: '4', cinco: '5', seis: '6', siete: '7', ocho: '8', nueve: '9', diez: '10', once: '11', doce: '12' };
/** Minúsculas, sin tildes, solo letras y cifras; numerales en palabras → cifras. */
export const tokenizar = (texto: string): string[] =>
  texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean).map((t) => NUMERALES[t] ?? t);

const SUF_CORTOS = ['', 's', 'es', 'n', 'r', 'nes'];
const TERMINACIONES_VERBO = ['', 'a', 'as', 'an', 'o', 'amos', 'ar', 'ando', 'ado', 'ada', 'e', 'es', 'en', 'er', 'emos', 'iendo', 'ido', 'ir', 'imos'];

/** ¿El token del texto corresponde a la palabra del término? (coincidencia por raíz) */
export function tokenCoincide(termino: string, token: string): boolean {
  if (/^\d+$/.test(termino)) return token === termino;
  if (termino === 'un') return token === 'un' || token === '1';
  if (token === termino) return true;
  const L = termino.length;
  if (L <= 3) return false;
  const esInfinitivo = L >= 5 && /(ar|er|ir)$/.test(termino);
  if (esInfinitivo) { const raiz = termino.slice(0, -2); if (TERMINACIONES_VERBO.some((s) => token === raiz + s)) return true; }
  if (L <= 5) return SUF_CORTOS.some((s) => token === termino + s);
  const raiz = L >= 8 ? termino.slice(0, -3) : termino.slice(0, -1);
  return token.startsWith(raiz);
}

interface Acierto { grupo: string; termino: string; desde: number; hasta: number }
/** Todas las apariciones de términos de la rúbrica en el texto (sin la regla de exclusividad). */
function aciertos(r: RubricaRutina, tokens: string[]): Acierto[] {
  const out: Acierto[] = [];
  for (const g of r.grupos) for (const termino of g.terminos) {
    const partes = tokenizar(termino);
    for (let i = 0; i + partes.length <= tokens.length; i++) {
      if (partes.every((p, k) => tokenCoincide(p, tokens[i + k]))) out.push({ grupo: g.id, termino, desde: i, hasta: i + partes.length - 1 });
    }
  }
  return out;
}

/** Términos de la rúbrica que aparecen en un texto (cualquier grupo). Sirve para auditar las devoluciones. */
export function terminosEncontrados(routineId: string, texto: string): { grupo: string; termino: string }[] {
  const vistos = new Set<string>(); const out: { grupo: string; termino: string }[] = [];
  for (const a of aciertos(rubricaDe(routineId), tokenizar(texto))) { const k = `${a.grupo}|${a.termino}`; if (!vistos.has(k)) { vistos.add(k); out.push({ grupo: a.grupo, termino: a.termino }); } }
  return out;
}

export interface Evaluation {
  correcta: boolean;
  /** Ids de los grupos tocados (con apoyo en palabras distintas del texto). */
  tocados: string[];
  /** Ids de los grupos no tocados. */
  noTocados: string[];
  /** Por cada grupo tocado, el término que lo acreditó. Dato descriptivo para revisar la exigencia de la rúbrica. */
  terminos: Record<string, string>;
  minimo: number;
  caracteres: number;
  palabras: number;
}

/**
 * Marca una justificación como correcta si toca ≥ `minimoGrupos` grupos distintos. Un mismo
 * fragmento del texto no acredita dos grupos: se busca la asignación (grupo → aparición) con
 * apariciones disjuntas que maximiza los grupos tocados. Texto vacío = incorrecta.
 */
export function evaluateAnswer(routineId: string, text: string): Evaluation {
  const r = rubricaDe(routineId); const t = text.trim();
  const tokens = tokenizar(t);
  const todos = aciertos(r, tokens);
  const porGrupo = r.grupos.map((g) => todos.filter((a) => a.grupo === g.id));
  let mejor: (Acierto | null)[] = r.grupos.map(() => null); let mejorN = 0;
  const elegidos: (Acierto | null)[] = [];
  const choca = (a: Acierto) => elegidos.some((o) => o && !(a.hasta < o.desde || a.desde > o.hasta));
  const dfs = (i: number, n: number) => {
    if (i === r.grupos.length) { if (n > mejorN) { mejorN = n; mejor = [...elegidos]; } return; }
    for (const a of porGrupo[i]) { elegidos.length = i; if (choca(a)) continue; elegidos[i] = a; dfs(i + 1, n + 1); }
    elegidos.length = i; elegidos[i] = null; dfs(i + 1, n);
  };
  dfs(0, 0);
  const tocados = r.grupos.filter((_, i) => mejor[i]).map((g) => g.id);
  const terminos: Record<string, string> = {}; r.grupos.forEach((g, i) => { const a = mejor[i]; if (a) terminos[g.id] = a.termino; });
  return { correcta: t.length > 0 && tocados.length >= r.minimoGrupos, tocados, noTocados: r.grupos.filter((g) => !tocados.includes(g.id)).map((g) => g.id), terminos, minimo: r.minimoGrupos, caracteres: t.length, palabras: t.split(/\s+/).filter(Boolean).length };
}
