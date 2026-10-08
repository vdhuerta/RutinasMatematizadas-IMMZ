// Coherencia rutina ↔ situación matemática y textos de devolución didáctica (copiados sin cambios de Rutinas Matematizadas).
// Forma A (2do Tramo). Formas B (Sala Cuna) y C (Transición) replican EXACTAMENTE la misma
// distribución de pares por posición (1-2-2-2-2-1-1 = 11) sobre sus propias rutinas — ver
// src/data/rutinas.ts (FORMAS) y README (Formas paralelas).
export const COHERENCE_PAIRS: Record<string, string[]> = {
  llegada: ['secuencia'],
  higiene: ['secuencia', 'espacio'],
  colacion: ['correspondencia', 'cuantificadores'],
  patio: ['espacio', 'seriacion'],
  orden: ['clasificacion', 'seriacion'],
  siesta: ['secuencia'],
  despedida: ['secuencia'],
  // Forma B — Sala Cuna
  bienvenida_b: ['secuencia'],
  muda_b: ['secuencia', 'espacio'],
  alimentacion_b: ['correspondencia', 'cuantificadores'],
  exploracion_b: ['espacio', 'seriacion'],
  guardado_b: ['clasificacion', 'seriacion'],
  descanso_b: ['secuencia'],
  entrega_b: ['secuencia'],
  // Forma C — Transición
  registro_c: ['secuencia'],
  autocuidado_c: ['secuencia', 'espacio'],
  economia_c: ['correspondencia', 'cuantificadores'],
  juegos_c: ['espacio', 'seriacion'],
  biblioteca_c: ['clasificacion', 'seriacion'],
  lectura_c: ['secuencia'],
  sintesis_c: ['secuencia'],
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
  },
  // Forma B — Sala Cuna (1er Tramo)
  bienvenida_b: {
    default: "En la llegada de sala cuna, el vínculo afectivo y la transición desde el hogar son prioritarios. Nombrar con calma lo que viene apenas se cruza la puerta ayuda a la guagua a anclar la separación y reduce su ansiedad. Exigir conteos o agrupaciones en este momento tan temprano del desarrollo resulta cognitivamente prematuro e interfiere con la contención afectiva inicial."
  },
  muda_b: {
    default: "El cambio de muda es un hábito corporal que exige un procedimiento práctico (retirar, limpiar, vestir) y un sitio fijo para cada implemento. Conversar con la guagua sobre ese procedimiento mientras ocurre acompaña su desarrollo sensoriomotor cotidiano. Plantear problemas aritméticos o seriaciones abstractas durante la muda entorpece un hábito higiénico que debe ser ágil, seguro y breve."
  },
  alimentacion_b: {
    default: "La alimentación en sala cuna satisface la necesidad fisiológica del lactante y sostiene un momento de cercanía con el adulto que lo alimenta. Observar si todas recibieron su turno, o comparar cuánta leche va quedando, surge naturalmente de servir y distribuir. Introducir figuras geométricas o seriaciones de tamaño en este momento satura de exigencia académica un acto que debe mantenerse íntimo y centrado en el cuidado."
  },
  exploracion_b: {
    default: "La actividad de los sentidos invita al lactante a experimentar superficies y recorridos con su cuerpo, sin una meta productiva. Es ideal para que distinga qué objeto queda escondido o cuál está más cerca sobre la manta de materiales. Imponer emparejamientos estrictos o cálculos formales en este momento limita la libertad motriz que fundamenta esta actividad."
  },
  guardado_b: {
    default: "Ordenar los objetos personales después de usarlos es un hábito formativo temprano. Reunirlos en conjuntos según su clase (las prendas de abrigo en una cesta, los juguetes de dentición en otra) facilita que el lactante reconozca conjuntos simples del entorno cotidiano. Demandar análisis de intervalos de tiempo o cálculos exactos en este momento desvía la atención de un hábito que debe mantenerse simple y repetible."
  },
  descanso_b: {
    default: "El sueño en la sala de lactantes exige disminuir al máximo la estimulación y sostener una rutina predecible. Nombrar con voz suave que llegó el momento de cerrar los ojos entrega seguridad fisiológica al bebé. Introducir dinámicas de medición, cálculo activo o preguntas de ubicación sobreestimula un momento diseñado exclusivamente para el reposo."
  },
  entrega_b: {
    default: "La entrega a los cuidadores concluye la jornada con un reencuentro afectivo del lactante con sus adultos significativos. Evocar brevemente, aunque sea con gestos, lo que se vivió durante el día acompaña su memoria incipiente. Proponer tareas de agrupación o cálculo complejo en este momento choca con el carácter afectivo de este cierre del día."
  },
  // Forma C — Transición (3er Tramo)
  registro_c: {
    default: "El repaso de quiénes se integran a la clase, en el nivel de transición, formaliza la llegada mediante un orden preciso al pasar lista. Conversar sobre ese procedimiento de la educadora ayuda a que los niños anticipen cómo comienza el día. Exigir en este momento agrupaciones complejas de materiales o cálculos de reparto resulta forzado para un acto centrado en recibir al curso."
  },
  autocuidado_c: {
    default: "En transición, el autocuidado (lavarse, peinarse, vestirse solo) se vuelve cada vez más autónomo, pero sigue exigiendo un procedimiento preciso y un sitio correcto para cada implemento personal. Conversar sobre ese procedimiento y esa ubicación acompaña la autonomía creciente del niño. Introducir ejercicios de cálculo abstracto o reparto de cantidades en este momento entorpece un hábito que debe mantenerse fluido."
  },
  economia_c: {
    default: "La colación en transición puede funcionar como una pequeña economía de aula, donde los niños distribuyen materiales o alimentos verificando que a todos les llegue su porción. Observar cuánto queda disponible surge con naturalidad de esa distribución cotidiana. Imponer figuras geométricas o seriaciones de tamaño en el comedor satura de exigencia académica un momento de convivencia."
  },
  juegos_c: {
    default: "Los juegos de mesa y patio en transición permiten que los niños comparen resultados numéricos mientras siguen pautas compartidas con sus pares. Preguntar quién avanzó más o quién quedó atrás en la competencia emerge del propio juego. Forzar emparejamientos estrictos o cálculos formales al margen de esta dinámica limita la autonomía motriz y social que fundamenta este momento."
  },
  biblioteca_c: {
    default: "Ordenar la biblioteca de aula invita a los niños de transición a reunir las publicaciones según su tipo y a acomodarlas en el mueble correspondiente. Esta organización surge naturalmente del hábito de mantener en buen estado los materiales de uso común. Demandar análisis de tiempo o cálculos exactos durante este ordenamiento desvía el foco de un hábito que debe ser lógico y colaborativo."
  },
  lectura_c: {
    default: "El tiempo de relajación y lectura en transición reemplaza la siesta por un momento de calma donde se repasa, con tranquilidad, el relato del cuento compartido. Esta narración sostiene la autorregulación sin necesidad de estimulación activa. Introducir dinámicas de cálculo o preguntas de ubicación en este momento sobreestimula un tiempo diseñado para la concentración."
  },
  sintesis_c: {
    default: "La despedida en transición invita a los niños a resumir oralmente, con sus propias palabras, la jornada completa que acaban de vivir. Esta síntesis consolida su memoria autobiográfica y autoconciencia del aprendizaje. Proponer análisis de agrupaciones complejas o tareas abstractas de cálculo en este cierre choca con el carácter reflexivo y afectivo de la despedida."
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
