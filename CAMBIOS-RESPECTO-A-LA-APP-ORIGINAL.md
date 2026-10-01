# Qué se conservó y qué se corrigió respecto de Rutinas Matematizadas (original)

## Se conserva idéntico (funcionamiento e intención pedagógica)
7 rutinas · 6 situaciones matemáticas · matriz de coherencia (COHERENCE_PAIRS) · textos de devolución didáctica · tips de orientación · línea de tiempo de 5 momentos · Paso 3 completo (niveles/ámbitos/núcleos/OAs BCEP, objetivo específico, situación problemática, fases inicio/desarrollo/cierre con justificaciones y orientación de fase) · guía y fundamentos · Índice de Madurez del Diseño (9 criterios, mismos pesos) · autodiagnóstico Zimmerman (3 sliders + reflexión escrita) · bitácora · planificación descargable · textos de diagnóstico cualitativo por indicador (mismos umbrales) · pesos de apropiación 50/30/20.

## Se corrige para que el reporte calce con el Diario (estándar de las 5 apps)
| Tema | Original | Ahora |
|---|---|---|
| Sin evidencia | IM1, IM2, IM5, IM7, IM8, IM9, IM10, IM6 devolvían **100** | `null` (el Diario no lo cuenta como 0; ya no infla el IMMZ) |
| Niveles | 3 (Maduro / En desarrollo / Inicial, cortes 50/80) | 4 del Diario: <40 Inicial · <60 En Desarrollo · <80 Competente · ≥80 Avanzado |
| Índices | redondeo entero y IMMG = media de IMMZ e ICMR | media simple de indicadores con evidencia, 1 decimal (scoring del Diario); ICMR viaja como `idcd` |
| Payload | `indices` anidado, sin `class_number`, `participant`, `apropiacion`, `aciertos/errores/reflexiones`; Tailwind por CDN | claves en la raíz que lee el parser + segundo bloque con trazas crudas; HTML autocontenido |
| Nombre de archivo | `Reporte_Rutinas_Nombre_AM-…` | `Reporte_Rutinas_<Nombre>_<ID>.html` (prefijo del Diario) |
| Clase | no declarada | declarada (2 por defecto, configurable) |
| Colocar una rutina en la línea de tiempo | se registraba como movimiento **erróneo** (isCorrect=false) y hundía IM8/IM9/IM5 | se registra como `place` en la traza pero **no se evalúa** (aún no hay situación matemática) |
| Quitar rutina/situación | movimiento erróneo | `remove`, registrado y no evaluado |
| Exactitud de apropiación | rutinas coherentes ÷ 7 (con 5 momentos el máximo era 71 %) | momentos coherentes ÷ 5 momentos |
| IM6 Secuencia | penalizaba todo movimiento al cierre con < 6 tarjetas previas (siempre) | −25 por cada decisión sobre el cierre tomada antes de haber decidido algo en Inicio **y** en Desarrollo |
| IM10 Formulación | movimientos hacia «desarrollo» | decisiones cuya fase es Desarrollo (mismo espíritu, sin mezclar textos de fase con ids de situación) |
| IM4 Retroalimentación | las devoluciones de fase solo contaban como «disponibles» después de abrir la primera | siempre se cuentan las de las fases que tienen rutinas |
| IM3 | 50/50 lectura + corrección | igual (la corrección debe ser posterior al primer error) |
Fórmulas de IM1, IM2, IM5, IM7 (−15), IM8, IM9: sin cambios.

## Ajustes posteriores (piloto)
- **Ningún indicador queda «sin evidencia» en una jornada trabajada** (solo una sesión totalmente vacía los deja en `null`).
  - IM1: intervalos entre TODAS las acciones (ubicar, decidir, quitar, consultar devolución), no solo entre decisiones.
  - IM3: si no hubo errores, mide la verificación proactiva (situaciones contrastadas con su devolución ÷ situaciones asignadas).
  - IM5: por error 100 si el siguiente movimiento acierta o la misma rutina se corrige después; 50 si lee la devolución sin corregir aún; 0 si no reacciona. Sin errores = 100.
  - IM10: si no hay decisiones en Desarrollo, se evalúa el estado final de esa fase; fase vacía = 0.
- Pasos 1 y 2: rutinas únicas (el mazo deja un hueco punteado), se sacan arrastrando al mazo, lupa en lugar de la X con modal de devolución como en el Simulador TSD, tres cajas alineadas, sin botón «Continuar al Paso 3».
- Se elimina la descarga de planificación (evita subir el archivo equivocado al Diario).
