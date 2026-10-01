# Rutinas Matematizadas · versión IMMZ 4.0

Réplica funcional de la app «Rutinas Matematizadas» (Pasos 1-2 diseñador, Paso 3 planificador BCEP, devoluciones didácticas, IMD y autodiagnóstico Zimmerman) construida sobre el mismo sistema visual y el mismo contrato de reporte del **Simulador TSD** (verde pizarra + ámbar, Inter, solo títulos en negrita, tarjetas de borde fino, componente «Análisis del participante» idéntico).

    npm install
    npm run dev             # desarrollo
    npm run build           # dist/ (Netlify: publish = dist)
    npm run build:single    # dist-single/index.html (un solo archivo)
    npm run verify:calc     # fórmulas IM1–IM10 + reporte → parser del Diario (sin navegador)
    npm run preview & node scripts/e2e.mjs /tmp/e2e     # juega la app en un navegador y descarga el reporte
    DIARIO_SRC=…/diario-campo/src npm run verify -- Reporte_Rutinas_*.html   # parser/auditor/narrador ORIGINALES del Diario

Identidad ante el Diario: APP «Rutinas Matematizadas», id `rutinas_matematizadas`, prefijo `Reporte_Rutinas_`, clase por defecto **6** (Config → PIN 4132 para cambiarla o «no declarar»).
Ver `CONTRATO-IMMZ.md`, `ESTANDAR-ANALISIS.md` y `CAMBIOS-RESPECTO-A-LA-APP-ORIGINAL.md`.

Estructura: `src/lib/metrics.ts` (trazas + IM1–IM10), `src/lib/design.ts` (IMD), `src/lib/immzReport.ts` (reporte + contrato + autovalidación), `src/lib/immz/{parser,scoring}.ts` (copias exactas del Diario), `src/analysis/*` (estándar de análisis), `src/views/*` (pantallas), `src/data/*` (rutinas, situaciones, BCEP, devoluciones).
