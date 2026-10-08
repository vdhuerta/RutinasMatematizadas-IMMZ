# Rutinas Matematizadas · motor IMMZ 4.1 (payload 4.0-compatible)

Réplica funcional de la app «Rutinas Matematizadas» (Pasos 1-2 diseñador, Paso 3 planificador BCEP, devoluciones didácticas, IMD y autodiagnóstico Zimmerman) construida sobre el mismo sistema visual y el mismo contrato de reporte del **Simulador TSD** (verde pizarra + ámbar, Inter, solo títulos en negrita, tarjetas de borde fino, componente «Análisis del participante» idéntico).

Esta app adoptó `src/immz-core/` (motor IMMZ 4.1, 11 indicadores) **tal cual** desde Simulador-TSD-IMMZ: `src/lib/metrics.ts` es solo el traductor de esta app (rutina→unidad, decisión→intento, devolución→devolucion, juicio→juicio) hacia ese vocabulario; no contiene fórmulas propias. `npm run verify:immz-core` confirma que los 4 archivos siguen siendo idénticos byte a byte al original (si Simulador TSD cambia sus fórmulas, se vuelve a copiar íntegro y se actualizan los hashes ahí — nunca se parchea `immz-core` directamente). El Diario de Campo hoy solo conoce el esquema 4.0 (IM1–IM10): el payload raíz es 100% compatible con eso (`indicators`/`immz`/`immz_ao`/`immz_ac`/`idcd`/`immg`, calculados igualmente con immz-core); IM11 (Calibración del juicio metacognitivo, Nelson y Narens 1990 / Lee y Bosch 2025) y los índices completos viajan aparte en un bloque `immz41` que el Diario ignora hasta que lo adopte.

La raíz del payload declara `schema_version`/`schemaVersion: '4.1'` y, aparte, `compat_schema: '4.0'`: el parser del Diario detecta la *generación* del esquema por el entero mayor (`>=4` → `4.0`, sin re-mapeo de códigos — ver `detectSchema()` en su parser), así que un `4.1` en la raíz se comporta exactamente igual que un `4.0` ante el Diario de hoy (verificado en `scripts/verify-calc.ts [9]` y contra el parser real en `scripts/verify-immz.ts`); `compat_schema` declara, aparte, que el bloque de compatibilidad conserva la forma EXACTA 4.0.

**Identificación (NRC + Forma)**: al abrir la app por primera vez (sin identificación guardada en este dispositivo), un modal bloqueante pide el NRC del curso (numérico, 3 a 6 dígitos) y la Forma de la sesión (A/B/C) antes de cualquier interacción — mismo formato de ingreso que el Simulador TSD-IMMZ. Ambos se guardan juntos en `localStorage` (`rut_nrc`, `rut_nrc_set`, `rut_forma_id`) y no se vuelven a pedir; solo son editables después desde Configuración, detrás del PIN (cambiar la Forma ahí reinicia la sesión, porque cada Forma tiene su propio conjunto de 7 rutinas). Se muestran discretos y permanentes como «NRC nnn · Forma X» en la barra superior, y viajan en la raíz del payload (`nrc`, `form_id`).

    npm install
    npm run dev                 # desarrollo
    npm run build                # dist/ (Netlify: publish = dist)
    npm run build:single         # dist-single/index.html (un solo archivo)
    npm run verify:calc          # fórmulas IM1–IM11 + reporte → parser del Diario (sin navegador)
    npm run verify:immz-core     # src/immz-core/ sigue siendo idéntico al Simulador TSD-IMMZ
    npm run test:rubricas        # rúbrica de IM10 (grupos de términos, igual que en Laboratorio TSD)
    npm run check:devoluciones   # ninguna devolución didáctica regala términos de su propia rúbrica
    npm run preview & node scripts/e2e.mjs /tmp/e2e     # juega la app en un navegador y descarga el reporte
    DIARIO_SRC=…/diario-campo/src npm run verify -- Reporte_Rutinas_*.html   # parser/auditor/narrador ORIGINALES del Diario

Identidad ante el Diario: APP «Rutinas Matematizadas», id `rutinas_matematizadas`, prefijo `Reporte_Rutinas_`, clase por defecto **6** (Config → PIN 4132 para cambiarla o «no declarar»). La misma pantalla tiene el interruptor del modal de calibración IM11 (activo por defecto; si se apaga, IM11 queda sin evidencia en el reporte) y el campo para corregir el NRC del curso.
Ver `CONTRATO-IMMZ.md`, `ESTANDAR-ANALISIS.md` y `CAMBIOS-RESPECTO-A-LA-APP-ORIGINAL.md`.

Estructura: `src/immz-core/{constants,events,compute,indices}.ts` (motor 4.1, copia exacta — no editar), `src/lib/metrics.ts` (traductor de esta app hacia ese vocabulario), `src/lib/design.ts` (IMD), `src/lib/immzReport.ts` (reporte + contrato 4.0/4.1 + autovalidación), `src/lib/immz/{parser,scoring}.ts` (copias exactas del Diario), `src/analysis/*` (estándar de análisis), `src/views/*` (pantallas), `src/data/*` (rutinas, situaciones, BCEP, devoluciones).

## IM10: justificación escrita y rúbrica de grupos de términos

En el Paso 2 (elegir la situación matemática), hay un campo opcional de justificación escrita («¿por qué esta situación es pertinente para esta rutina?»). Si la rutina cae en la fase de Desarrollo: con texto, el acto de formulación (IM10) se evalúa con `src/data/expected.ts` — una rúbrica de 4 grupos de términos por rutina (motor de comparación portado tal cual desde Laboratorio TSD: normalización sin tildes/ñ, numerales↔palabras, coincidencia por raíz, exclusividad de términos), correcta si toca ≥3 de los 4 grupos; sin texto, se registra igual por acción, con la coherencia real de la decisión (como antes de esta funcionalidad). La justificación nunca condiciona ni bloquea la decisión del Paso 2. Ningún texto de devolución didáctica regala los términos de la rúbrica de su propia rutina (`npm run check:devoluciones`).

## Formas paralelas (A/B/C)

La app tiene tres formas completas y estadísticamente equivalentes, cada una anclada a un tramo real de las BCEP (`NIVELES_BCEP`) y con su propio conjunto de 7 rutinas — nunca una partición del mismo contenido, sino tres conjuntos independientes sobre las mismas 6 Situaciones Matemáticas universales:

- **Forma A** — *Jornada de Rutinas de Cuidado* (2do Tramo: Niveles Medios). El contenido original de la app.
- **Forma B** — *Jornada de Sala Cuna* (1er Tramo: Sala Cuna). 7 rutinas propias del lactante (llegada y acogida, muda, alimentación, exploración sensorial, guardado de objetos, sueño y descanso, entrega a la familia).
- **Forma C** — *Jornada de Transición* (3er Tramo: Niveles de Transición). 7 rutinas propias de los niveles de transición (registro de asistencia, autocuidado, colación, patio y juegos reglados, orden de biblioteca, lectura y relajación, despedida y síntesis).

Las 3 formas son estadísticamente paralelas: 7 rutinas, 6 situaciones matemáticas, 11 pares de coherencia con la misma distribución por posición de rutina (1-2-2-2-2-1-1), y rúbricas de IM10 de 4 grupos de términos por rutina (igual criterio de corrección: ≥3 de 4 grupos). Ningún texto de devolución didáctica de las 21 rutinas (7×3 formas) regala los términos de la rúbrica de su propia rutina (`npm run check:devoluciones`, verificado sobre las 21).

La Forma se declara junto con el NRC en la identificación inicial (ver arriba) y viaja en el payload como `form_id`/`content_level`/`content_id` (`getForma(formId)` en `src/data/rutinas.ts`). `opportunity_target` declara la capacidad estructural de la **forma activa** (pares de coherencia, devoluciones y formulaciones disponibles como máximo, escalados a sus 7 rutinas); no es el desempeño de la sesión ni se usa como denominador de IM10 (IM10 sigue evaluándose contra lo que el estudiante formuló realmente). Cambiar de Forma desde Configuración (detrás del PIN) reinicia la sesión activa, porque cada Forma tiene su propio mazo de rutinas.
