import type { Routine, MathSituation } from '../types';

/** Forma A (2do Tramo: Niveles Medios) — contenido original de la app. */
const FORMA_A_ROUTINES: Routine[] = [
  { id: 'llegada', label: 'Llegada y Saludo', iconName: 'Sun', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { id: 'higiene', label: 'Higiene y Baño', iconName: 'Droplets', color: 'bg-sky-100 text-sky-700 border-sky-300' },
  { id: 'colacion', label: 'Colación / Comida', iconName: 'Apple', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { id: 'patio', label: 'Patio y Juego Libre', iconName: 'Trees', color: 'bg-lime-100 text-lime-700 border-lime-300' },
  { id: 'orden', label: 'Orden y Limpieza', iconName: 'Box', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { id: 'siesta', label: 'Descanso / Siesta', iconName: 'Moon', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  { id: 'despedida', label: 'Despedida', iconName: 'Hand', color: 'bg-purple-100 text-purple-700 border-purple-300' }
];

/** Forma B (1er Tramo: Sala Cuna) — mismas 7 funciones didácticas de la jornada, adaptadas a lactantes. */
const FORMA_B_ROUTINES: Routine[] = [
  { id: 'bienvenida_b', label: 'Llegada y Acogida', iconName: 'Sunrise', color: 'bg-rose-100 text-rose-700 border-rose-300' },
  { id: 'muda_b', label: 'Muda y Cuidado Corporal', iconName: 'Shirt', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  { id: 'alimentacion_b', label: 'Alimentación y Mamadera', iconName: 'Milk', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { id: 'exploracion_b', label: 'Exploración Sensorial', iconName: 'Sparkles', color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300' },
  { id: 'guardado_b', label: 'Guardado de Mantas y Objetos', iconName: 'Box', color: 'bg-teal-100 text-teal-700 border-teal-300' },
  { id: 'descanso_b', label: 'Sueño y Descanso', iconName: 'Moon', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { id: 'entrega_b', label: 'Entrega a la Familia', iconName: 'Users', color: 'bg-violet-100 text-violet-700 border-violet-300' }
];

/** Forma C (3er Tramo: Niveles de Transición) — mismas 7 funciones, para preescolares mayores. */
const FORMA_C_ROUTINES: Routine[] = [
  { id: 'registro_c', label: 'Llegada y Registro de Asistencia', iconName: 'ListChecks', color: 'bg-red-100 text-red-700 border-red-300' },
  { id: 'autocuidado_c', label: 'Higiene y Autocuidado', iconName: 'Droplets', color: 'bg-teal-100 text-teal-700 border-teal-300' },
  { id: 'economia_c', label: 'Colación y Reparto de Materiales', iconName: 'Package', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { id: 'juegos_c', label: 'Patio y Juegos Reglados', iconName: 'Dices', color: 'bg-green-100 text-green-700 border-green-300' },
  { id: 'biblioteca_c', label: 'Orden de la Biblioteca de Aula', iconName: 'BookOpen', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { id: 'lectura_c', label: 'Tiempo de Relajación y Lectura', iconName: 'Moon', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { id: 'sintesis_c', label: 'Despedida y Síntesis del Día', iconName: 'LogOut', color: 'bg-pink-100 text-pink-700 border-pink-300' }
];

/** Compat: Forma A, para código que aún no distingue formas. Preferir getForma(formaId).routines. */
export const ROUTINES: Routine[] = FORMA_A_ROUTINES;

export const MATH_SITUATIONS: MathSituation[] = [
  { 
    id: 'secuencia', 
    label: 'Secuencias Temporales', 
    concept: 'Tiempo',
    description: 'Preguntar "¿Qué pasó primero?" o armar tarjetas visuales de "antes y después". Ideal para rutinas de llegada o higiene.' 
  },
  { 
    id: 'correspondencia', 
    label: 'Correspondencia uno a uno', 
    concept: 'Número / Conteo',
    description: 'Repartir un elemento a cada niño (ej. platos en colación, mantitas en siesta). Ayuda a establecer relaciones entre conjuntos.' 
  },
  { 
    id: 'cuantificadores', 
    label: 'Cuantificadores', 
    concept: 'Número',
    description: 'Usar conceptos como "más/menos", "muchos/pocos", "todos/ninguno". (Ej. "¿Alcanzan los materiales para todos?").' 
  },
  { 
    id: 'espacio', 
    label: 'Nociones Topológicas', 
    concept: 'Espacio',
    description: 'Lenguaje espacial: "dentro/fuera", "encima/debajo". Esconder objetos o describir recorridos (ej. trayecto al patio).' 
  },
  { 
    id: 'clasificacion', 
    label: 'Clasificación', 
    concept: 'Lógica',
    description: 'Agrupar objetos por características comunes (color, forma, uso). Excelente para el momento de ordenar materiales.' 
  },
  { 
    id: 'seriacion', 
    label: 'Seriación', 
    concept: 'Lógica',
    description: 'Organizar secuencias según una propiedad (ej. de más corto a más largo, o por pesos en el cesto del tesoro).' 
  }
];

/** Una Forma de contenido paralelo (A/B/C), igual en estructura al Simulador TSD: mismas 7
 *  rutinas-función, mismas 6 situaciones matemáticas (genéricas BCEP, no cambian entre formas) y
 *  los mismos 11 pares de coherencia con idéntica distribución por rutina (1-2-2-2-2-1-1) — así
 *  las tres formas son estadísticamente equivalentes y solo cambia el contexto cotidiano. */
export interface Forma { id: 'A' | 'B' | 'C'; nombre: string; nivelBcep: string; contentLevel: number; contentId: string; routines: Routine[] }
export const FORMAS: Forma[] = [
  { id: 'A', nombre: 'Jornada de Rutinas de Cuidado', nivelBcep: '2do Tramo: Niveles Medios', contentLevel: 1, contentId: 'rutinas_cuidado_completo_7x6', routines: FORMA_A_ROUTINES },
  { id: 'B', nombre: 'Jornada de Sala Cuna', nivelBcep: '1er Tramo: Sala Cuna', contentLevel: 2, contentId: 'rutinas_sala_cuna_7x6', routines: FORMA_B_ROUTINES },
  { id: 'C', nombre: 'Jornada de Transición', nivelBcep: '3er Tramo: Niveles de Transición', contentLevel: 3, contentId: 'rutinas_transicion_7x6', routines: FORMA_C_ROUTINES },
];
export const DEFAULT_FORMA_ID: Forma['id'] = 'A';
/** Devuelve la Forma por id; si no se reconoce (o la guardada ya no existe), usa la Forma A. */
export const getForma = (id: string | null | undefined): Forma => FORMAS.find((f) => f.id === id) ?? FORMAS[0];

export const NUCLEOS_BCEP = [
  'Pensamiento Matemático',
  'Identidad y Autonomía',
  'Convivencia y Ciudadanía',
  'Corporalidad y Movimiento',
  'Lenguaje Verbal',
  'Lenguajes Artísticos',
  'Exploración del Entorno Natural',
  'Comprensión del Entorno Sociocultural'
];

export const AMBITOS_BCEP = [
  'Desarrollo Personal y Social',
  'Comunicación Integral',
  'Interacción y Comprensión del Entorno'
];

export const NUCLEOS_POR_AMBITO: Record<string, string[]> = {
  'Desarrollo Personal y Social': [
    'Identidad y Autonomía',
    'Convivencia y Ciudadanía',
    'Corporalidad y Movimiento'
  ],
  'Comunicación Integral': [
    'Lenguaje Verbal',
    'Lenguajes Artísticos'
  ],
  'Interacción y Comprensión del Entorno': [
    'Exploración del Entorno Natural',
    'Comprensión del Entorno Sociocultural',
    'Pensamiento Matemático'
  ]
};

export const NIVELES_BCEP = [
  '1er Tramo: Sala Cuna',
  '2do Tramo: Niveles Medios',
  '3er Tramo: Niveles de Transición'
];

export const OAS_BCEP_COMPLETO: Record<string, Record<string, string[]>> = {
  '1er Tramo: Sala Cuna': {
    'Pensamiento Matemático': [
      'Adquirir la noción de permanencia de objetos y de personas significativas.',
      'Explorar a través de sus experiencias sensoriales y motrices, atributos de los objetos como tamaño, textura y dureza.'
    ],
    'Identidad y Autonomía': [
      'Expresar vocal, gestual o corporalmente distintas emociones o necesidades.',
      'Reconocer su imagen en el espejo explorando sus características corporales.'
    ],
    'Convivencia y Ciudadanía': [
      'Interactuar con pares y adultos significativos, a través de gestos y vocalizaciones.',
      'Compartir objetos o juguetes en situaciones de juego con sus pares.'
    ],
    'Corporalidad y Movimiento': [
      'Descubrir partes de su cuerpo y algunas de sus características físicas.',
      'Adquirir desplazamiento gradual a través del gateo o marcha independiente.'
    ],
    'Lenguaje Verbal': [
      'Comprender mensajes simples asociados a acciones u objetos de uso cotidiano.',
      'Expresar sus necesidades e intereses mediante balbuceos, palabras aisladas o gestos.'
    ],
    'Lenguajes Artísticos': [
      'Manifestar interés por sonidos, texturas, colores y luminosidad de su entorno.',
      'Producir sonidos con objetos o instrumentos musicales en situaciones de juego.'
    ],
    'Exploración del Entorno Natural': [
      'Explorar su entorno, observando, manipulando y experimentando con diversos materiales.',
      'Descubrir características concretas de seres vivos y fenómenos naturales.'
    ],
    'Comprensión del Entorno Sociocultural': [
      'Reconocer a personas significativas de su familia y comunidad.',
      'Explorar utensilios cotidianos descubriendo algunos de sus usos.'
    ]
  },
  '2do Tramo: Niveles Medios': {
    'Pensamiento Matemático': [
      'Explorar y describir posiciones y desplazamientos en el espacio (dentro/fuera, encima/debajo, cerca/lejos).',
      'Organizar hechos cotidianos en secuencias temporales simples (antes/después, mañana/ayer, principio/fin).',
      'Utilizar cuantificadores para comparar colecciones (más/menos, muchos/pocos, todos/ninguno).'
    ],
    'Identidad y Autonomía': [
      'Representar verbal y corporalmente diferentes emociones y sentimientos en sus juegos.',
      'Manifestar disposición y confianza para relacionarse con algunos adultos y pares.'
    ],
    'Convivencia y Ciudadanía': [
      'Participar en actividades y juegos grupales con sus pares, conversando, intercambiando pertenencias, cooperando.',
      'Reconocer y aplicar normas de convivencia básica (escuchar, respetar turnos, compartir).'
    ],
    'Corporalidad y Movimiento': [
      'Reconocer las principales partes y características físicas de su cuerpo y sus funciones.',
      'Adquirir control y equilibrio en movimientos, posturas y desplazamientos.'
    ],
    'Lenguaje Verbal': [
      'Comprender mensajes orales simples en distintas situaciones, que involucran diversas informaciones.',
      'Expresarse oralmente, empleando estructuras oracionales simples y respetando patrones gramaticales.'
    ],
    'Lenguajes Artísticos': [
      'Expresar corporalmente sensaciones y emociones al escuchar distintas obras musicales.',
      'Experimentar sus posibilidades de expresión plástica a través de diversos recursos.'
    ],
    'Exploración del Entorno Natural': [
      'Describir características de las necesidades de plantas y animales de su entorno.',
      'Experimentar con diversos objetos, explorando sus propiedades.'
    ],
    'Comprensión del Entorno Sociocultural': [
      'Identificar instituciones significativas de su entorno.',
      'Reconocer actividades y roles que desarrollan personas de su familia y entorno.'
    ]
  },
  '3er Tramo: Niveles de Transición': {
    'Pensamiento Matemático': [
      'Crear patrones sonoros, visuales, gestuales, corporales u otros, de dos o tres elementos.',
      'Emplear los números, para contar, identificar, cuantificar y comparar cantidades hasta el 20 e indicar orden o posición de algunos elementos.'
    ],
    'Identidad y Autonomía': [
      'Comunicar a los demás, emociones y sentimientos tales como: amor, miedo, alegría, ira, que le provocan diversas narraciones o situaciones.',
      'Tomar decisiones por sí mismo, respecto de sus intereses, juegos y relaciones.'
    ],
    'Convivencia y Ciudadanía': [
      'Participar solidariamente en actividades y juegos, proponiendo ideas y estrategias de cooperación.',
      'Apreciar la diversidad de las personas y sus formas de vida.'
    ],
    'Corporalidad y Movimiento': [
      'Coordinar con precisión y eficiencia sus habilidades psicomotrices finas en función de sus intereses de exploración y juego.',
      'Resolver desafíos prácticos manteniendo control, equilibrio y coordinación postural.'
    ],
    'Lenguaje Verbal': [
      'Expresarse oralmente en forma clara y comprensible, empleando estructuras oracionales completas.',
      'Comprender textos orales como preguntas, explicaciones, relatos, instrucciones y algunos conceptos verbales.'
    ],
    'Lenguajes Artísticos': [
      'Apreciar producciones artísticas de diversos contextos (en forma directa o virtual).',
      'Expresar corporalmente sensaciones, emociones e ideas al escuchar música de diversos géneros y procedencias.'
    ],
    'Exploración del Entorno Natural': [
      'Manifestar interés y asombro al ampliar información sobre el entorno, a través de la formulación de preguntas.',
      'Formular conjeturas y predicciones acerca de las causas o consecuencias de fenómenos naturales y observación de cambios.'
    ],
    'Comprensión del Entorno Sociocultural': [
      'Comprender roles que desarrollan miembros de su familia y comunidad, y su aporte para el bienestar común.',
      'Reconocer la importancia del servicio que prestan instituciones, lugares e hitos representativos de su comunidad.'
    ]
  }
};
