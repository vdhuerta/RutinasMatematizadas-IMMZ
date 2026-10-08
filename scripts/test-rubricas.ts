/* Pruebas de las rúbricas de IM10 (src/data/expected.ts), igual que en Laboratorio TSD: criterio
 * «al menos 3 de 4 grupos», normalización, raíz, numerales; y tres respuestas de prueba por rutina
 * (buena, parcial, vacía). Uso: npx tsx scripts/test-rubricas.ts */
import { RUBRICAS, evaluateAnswer, tokenizar } from '../src/data/expected';

let fails = 0;
const chk = (n: string, got: unknown, want: unknown) => { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) fails++; console.log(`${ok ? '  ok ' : 'FALLA'} ${n}${ok ? '' : `  → ${JSON.stringify(got)} ≠ ${JSON.stringify(want)}`}`); };

/* 1 · Estructura */
chk('veintiuna rúbricas (7 por forma × 3 formas)', RUBRICAS.length, 21);
chk('todas con 4 grupos y minimoGrupos 3', RUBRICAS.every((r) => r.grupos.length === 4 && r.minimoGrupos === 3), true);

/* 2 · Tres respuestas por rutina: buena (4 grupos, correcta) / parcial (2 grupos, incorrecta) / vacía */
const CASOS: { routine: string; buena: string; parcial: string }[] = [
  { routine: 'llegada', buena: 'Antes de entrar por la puerta recordamos lo que viene, y recibimos a los compañeros juntos.', parcial: 'Antes llegan los compañeros.' },
  { routine: 'higiene', buena: 'Primero hacemos el lavado y enjabonar las manos, luego guardamos cada cosa en su sitio dentro del estante.', parcial: 'Primero nos lavamos las manos, y dentro del baño hay jabón.' },
  { routine: 'colacion', buena: 'Reparto una fruta por persona, verificando si alcanza para todos y si las porciones iguales caben en la bandeja.', parcial: 'Reparto una fruta para todos.' },
  { routine: 'patio', buena: 'Dentro del arenero comparamos el tamaño de las piedras y las agrupamos por su criterio, siguiendo el camino.', parcial: 'Dentro del arenero jugamos.' },
  { routine: 'orden', buena: 'Agrupamos los bloques por tipo y tamaño, ordenándolos de menor a mayor en las cajas del rincón de construcción porque comparten la misma forma.', parcial: 'Agrupamos los bloques por color y los guardamos en las cajas.' },
  { routine: 'siesta', buena: 'Antes de dormir cada niño busca su manta y queda siempre igual en el mismo lugar.', parcial: 'Antes buscamos la manta.' },
  { routine: 'despedida', buena: 'Antes de decir adiós recordamos lo que hicimos hoy y pensamos en el próximo encuentro de mañana.', parcial: 'Antes de decir adiós nos vamos.' },
  // ───────── Forma B — Sala Cuna (1er Tramo) ─────────
  { routine: 'bienvenida_b', buena: 'Primero hay que preparar la bienvenida con calidez, generando seguridad y acogida en el ingreso.', parcial: 'Primero llega con la bienvenida.' },
  { routine: 'muda_b', buena: 'Primero el aseo de la piel con la toalla, después cada cosa en su lugar dentro del mudador.', parcial: 'Primero el aseo de la piel.' },
  { routine: 'alimentacion_b', buena: 'Una mamadera por bebe, revisando si falta, sobra o alcanza para todos.', parcial: 'Una mamadera por bebe.' },
  { routine: 'exploracion_b', buena: 'Dentro de la mantita hay una pelota mas grande y un sonajero mas chico para tocar y probar.', parcial: 'Dentro de la mantita hay una pelota.' },
  { routine: 'guardado_b', buena: 'Agrupar las mantas y chupetes en el canasto por tamaño, de menor a mayor, para guardar cada uno en su lugar fijo.', parcial: 'Agrupar las mantas en el canasto.' },
  { routine: 'descanso_b', buena: 'Ahora toca dormir en la cuna con calma y tranquilo, siempre en el mismo momento del día.', parcial: 'Ahora toca dormir en la cuna.' },
  { routine: 'entrega_b', buena: 'Al final llega la mama o el papa con un abrazo y cariño, porque ya es hora de irse.', parcial: 'Al final llega la mama.' },
  // ───────── Forma C — Transición (3er Tramo) ─────────
  { routine: 'registro_c', buena: 'Primero contamos cuántos vinieron, revisando presentes y ausentes, antes de entrar a la sala cada mañana.', parcial: 'Primero contamos cuántos vinieron.' },
  { routine: 'autocuidado_c', buena: 'Primero el lavado y cepillado sin ayuda, luego cada cosa dentro del estante en su lugar.', parcial: 'Primero el lavado.' },
  { routine: 'economia_c', buena: 'Una porción por persona en la mesa, para compartir con los compañeros, revisando si falta, sobra o alcanza, sin que quede ninguno de más.', parcial: 'Una porción por persona en la mesa.' },
  { routine: 'juegos_c', buena: 'En la cancha con nuestro equipo durante el recreo al aire libre, vemos quién queda cerca o lejos, de mayor a menor.', parcial: 'En la cancha con nuestro equipo durante el recreo.' },
  { routine: 'biblioteca_c', buena: 'Clasificar los libros y cuentos por categoría y tamaño, dejándolos en el estante para cuidar el material compartido entre todos.', parcial: 'Clasificar los libros por categoría.' },
  { routine: 'lectura_c', buena: 'Antes de dormir, la historia con quietud y voz pausada, mirando las ilustraciones y personajes, con atención para escuchar.', parcial: 'Antes la historia con quietud.' },
  { routine: 'sintesis_c', buena: 'Desde el inicio hasta el final, para repasar lo que vivimos armamos un relato completo, y decimos hasta mañana.', parcial: 'Al final decimos chao.' },
];
const filas: string[] = [];
for (const c of CASOS) {
  const b = evaluateAnswer(c.routine, c.buena), p = evaluateAnswer(c.routine, c.parcial), v = evaluateAnswer(c.routine, '');
  chk(`${c.routine} buena → correcta (4 grupos)`, [b.correcta, b.tocados.length], [true, 4]);
  chk(`${c.routine} parcial → incorrecta (2 grupos)`, [p.correcta, p.tocados.length], [false, 2]);
  chk(`${c.routine} vacía → incorrecta y sin grupos`, [v.correcta, v.tocados], [false, []]);
  filas.push(`${c.routine.padEnd(11)} buena   ${b.correcta ? 'CORRECTA  ' : 'incorrecta'} [${b.tocados.join(',')}]  ${JSON.stringify(b.terminos)}`, `${''.padEnd(11)} parcial ${p.correcta ? 'CORRECTA  ' : 'incorrecta'} [${p.tocados.join(',')}]  ${JSON.stringify(p.terminos)}`, `${''.padEnd(11)} vacía   ${v.correcta ? 'CORRECTA  ' : 'incorrecta'} [${v.tocados.join(',')}]`);
}

/* 3 · Normalización, raíz y numerales */
chk('«1» = «uno» = «una»', [tokenizar('1'), tokenizar('Uno'), tokenizar('UNA')], [['1'], ['1'], ['1']]);
chk('tildes y ñ', tokenizar('Pequeña, NIÑO'), ['pequena', 'nino']);
for (const w of ['agrupar', 'agrupa', 'agrupación', 'Agrupan']) chk(`raíz: «${w}» acredita G1 de orden (clasificación)`, evaluateAnswer('orden', w).tocados, ['G1']);
chk('«1 fruta por persona» acredita G1 de colación (correspondencia)', evaluateAnswer('colacion', 'reparto 1 fruta por persona').tocados.includes('G1'), true);

/* 4 · Umbral: 2 grupos → incorrecta; 3 → correcta */
chk('colación: 2 grupos incorrecta, 3 correcta', [evaluateAnswer('colacion', 'reparto una fruta para todos').correcta, evaluateAnswer('colacion', 'reparto una fruta para todos y alcanza').correcta], [false, true]);
chk('texto sin términos pero largo → incorrecta', evaluateAnswer('higiene', 'x '.repeat(80)).correcta, false);

console.log('\n── Detalle de las respuestas de prueba ──\n' + filas.join('\n'));
console.log(fails ? `\n${fails} FALLAS` : '\nTodo OK');
process.exit(fails ? 1 : 0);
