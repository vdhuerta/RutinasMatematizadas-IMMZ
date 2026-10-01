// Coherencia rutina ↔ situación matemática y textos de devolución didáctica (copiados sin cambios de Rutinas Matematizadas).
export const COHERENCE_PAIRS: Record<string, string[]> = {
  llegada: ['secuencia'],
  higiene: ['secuencia', 'espacio'],
  colacion: ['correspondencia', 'cuantificadores'],
  patio: ['espacio', 'seriacion'],
  orden: ['clasificacion', 'seriacion'],
  siesta: ['secuencia'],
  despedida: ['secuencia']
};

export const DEVOLUCION_TEXTS: Record<string, Record<string, string>> = {
  llegada: {
    default: "Durante el saludo y la llegada, los párvulos experimentan la transición del hogar al aula. Plantear preguntas orientadoras como '¿qué haremos primero, qué haremos después?' ayuda a que estructuren mentalmente la jornada escolar y reduce la ansiedad de separación. En cambio, demandar conteos rigurosos o clasificaciones complejas en este momento de bienvenida resulta emocionalmente forzado e interfiere con la acogida afectiva inicial."
  },
  higiene: {
    default: "Lavarse las manos u organizar las pertenencias es una acción física e higiénica que exige una coordinación y un orden de pasos prácticos inmediatos. Dialogar con los niños sobre dónde ubicar los implementos (por ejemplo, 'guarda el jabón en su lugar' o 'lávate antes de secarte') resulta sumamente intuitivo y oportuno para su pensamiento cotidiano. Exigirles resolver problemas aritméticos abstractos o agrupar materiales por atributos lógicos entorpece la fluidez de un hábito higiénico que debe ser ágil y seguro."
  },
  colacion: {
    default: "La hora de la colación es un espacio de alimentación y convivencia social regulada. Invitar a los niños a reflexionar si cada compañero tiene su vaso y plato en la mesa, o a observar comparativamente sus porciones con preguntas como '¿quién tiene más o quién tiene menos fruta?', surge de forma orgánica. Introducir ejercicios de cuerpos geométricos o patrones de orden abstracto en la mesa satura al párvulo de exigencias académicas e interfiere con un momento destinado al disfrute alimentario y la socialización."
  },
  patio: {
    default: "El juego libre en el patio es un momento de exploración corporal activa y de contacto directo con la naturaleza. Es ideal para que los niños experimenten distancias, alturas, trayectorias y ordenen de menor a mayor los elementos naturales que recolectan (como hojitas o piedras). Forzar dinámicas de emparejamiento estricto o conteos formales obligatorios en el patio limita la autonomía motriz y la libre indagación del entorno que fundamentan este momento recreativo."
  },
  orden: {
    default: "El ordenamiento de la sala de clases es un hábito formativo y colaborativo. Organizar la ludoteca o los rincones de juego según la tipología de los materiales (por ejemplo, guardar los bloques en un cajón y los lápices en otro) facilita la estructuración lógica del espacio y la autonomía del párvulo. Intentar forzar análisis de intervalos de tiempo o demandar cuantificaciones exactas durante la recogida desvía el foco de atención, volviendo ineficiente y tedioso el hábito del orden."
  },
  siesta: {
    default: "La siesta es una transición de reposo y autorregulación fisiológica que exige disminuir la estimulación sensorial. Conversar calmadamente sobre el transcurrir del día (como 'al despertar vendrán a buscarnos para ir a casa') proporciona seguridad emocional y relaja el sistema nervioso. Implementar dinámicas interactivas de medición, conteo activo o juegos de orientación espacial sobreestimula cognitivamente a los párvulos en un momento diseñado para el descanso y la calma."
  },
  despedida: {
    default: "La despedida marca el cierre del día escolar y la reunión con las familias. Motivar a los párvulos a evocar y reconstruir el orden de las experiencias vividas (por ejemplo, '¿qué hicimos al inicio del día y qué hicimos al final?') consolida su memoria y autoconciencia de lo aprendido. Proponer análisis de agrupaciones geométricas complejas o tareas abstractas de conteo choca con el carácter afectivo de este hito de entrega y reencuentro familiar."
  }
};

export function getDevolucionText(routineId: string, situationId: string | null): string {
  const routineDev = DEVOLUCION_TEXTS[routineId];
  if (!routineDev) return "Esta combinación de rutina y situación matemática puede no estar didácticamente alineada. Te sugerimos revisar las orientaciones de andamiaje.";
  return routineDev[situationId || ''] || routineDev.default;
}

export type Phase = 'inicio' | 'desarrollo' | 'cierre';
export const PHASES: Phase[] = ['inicio', 'desarrollo', 'cierre'];
export const PHASE_TITLE: Record<Phase, string> = { inicio: 'Inicio', desarrollo: 'Desarrollo', cierre: 'Cierre' };
export const PHASE_LETTER: Record<Phase, string> = { inicio: 'A', desarrollo: 'B', cierre: 'C' };
export const PHASE_GUIDANCE: Record<Phase, string> = {
  inicio: 'En la fase de Inicio se privilegia la acogida, la anticipación de la estructura de la jornada y la activación de saberes previos. Es el momento propicio para plantear preguntas orientadoras que otorgan sentido didáctico a la rutina antes de la acción.',
  desarrollo: 'En la fase de Desarrollo se promueve la exploración activa, la formulación de hipótesis y el andamiaje docente. Los párvulos interactúan directamente con los materiales y las situaciones problemáticas en las rutinas cotidianas.',
  cierre: 'En la fase de Cierre se lleva a cabo la institucionalización y consolidación del aprendizaje, invitando a los párvulos a evocar, sintetizar y tomar conciencia de las relaciones matemáticas descubiertas durante el día.',
};

export const isCoherent = (routineId: string, situationId: string | null | undefined) => !!situationId && !!COHERENCE_PAIRS[routineId]?.includes(situationId);
