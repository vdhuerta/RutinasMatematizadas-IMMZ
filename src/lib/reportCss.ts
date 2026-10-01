// CSS del reporte IMMZ: idéntico al del Simulador TSD (mismas cajas, colores y fuentes) más bloques propios de Rutinas.
export const REPORT_CSS = `
:root{--bg:#F2F1EC;--line:#E4E2D8;--ink:#23271F;--mut:#6E6F66;--brand:#24473A;--brand50:#EEF4F1;--brand100:#DCE8E2;--accent:#C98F2D;--accentsoft:#F6ECD6;--white:#fff}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;font-weight:400;-webkit-font-smoothing:antialiased;line-height:1.45}
h1,h2,h3,h4,h5{font-weight:700;margin:0}
.wrap{max-width:900px;margin:0 auto;padding:24px 16px 40px}
.sheet{background:var(--white);border:1px solid var(--line);border-radius:12px;box-shadow:0 1px 2px rgba(35,39,31,.06);padding:28px;position:relative;overflow:hidden}
.sheet:before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;background:var(--brand)}
.micro{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--mut)}
.head{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:flex-start;border-bottom:1px solid var(--line);padding-bottom:16px;margin-bottom:20px}
.head h1{font-size:24px;margin-top:4px}.head p{margin:2px 0 0;color:var(--mut);font-size:13px}
.logo{display:inline-flex;align-items:center;gap:8px}.logo i{position:relative;display:inline-block;width:28px;height:28px;border-radius:8px;background:var(--brand)}
.logo i:after{content:"";position:absolute;right:0;top:0;width:9px;height:9px;border-bottom-left-radius:6px;background:var(--accent)}
.pill{display:inline-flex;align-items:center;border:1px solid var(--line);border-radius:999px;padding:2px 10px;font-size:11px;background:#fff;color:var(--ink)}
.cid{font-family:ui-monospace,Menlo,monospace;background:var(--brand50);border-color:var(--brand100);color:var(--brand)}
.c-ini{background:#fff1f2;color:#be123c;border-color:#fecdd3}.c-dev{background:#fffbeb;color:#b45309;border-color:#fde68a}.c-com{background:#f0f9ff;color:#0369a1;border-color:#bae6fd}.c-adv{background:#ecfdf5;color:#047857;border-color:#a7f3d0}.c-none{background:#f7f6f1;color:var(--mut)}
.tiles{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:22px}
.tile{border:1px solid var(--line);border-radius:12px;padding:12px;background:#F7F6F1;min-width:0}
.tile .v{font-size:24px;font-weight:700;margin-top:4px}
.tile .s{font-size:10px;color:var(--mut);margin-top:2px}
.tile.a{background:#eef2ff;border-color:#e0e7ff}.tile.a .v{color:#312e81}.tile.b{background:#f0f9ff;border-color:#e0f2fe}.tile.b .v{color:#0c4a6e}.tile.g{background:var(--brand50);border-color:var(--brand100)}.tile.g .v{color:var(--brand)}
.contract{border:1px dashed var(--accent);background:var(--accentsoft);border-radius:12px;padding:12px 14px;font-size:12px;margin-bottom:22px}
.contract b{font-weight:400;color:var(--ink);font-family:ui-monospace,Menlo,monospace;font-size:11px}
.sec{margin-bottom:26px}
.sec>h2{font-size:15px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--line);padding-bottom:8px;margin-bottom:12px}
.sec>h2 i{display:inline-block;width:6px;height:18px;border-radius:3px}
.sub{border-left:4px solid #a5b4fc;padding-left:12px;margin-bottom:16px}
.subhead{display:flex;justify-content:space-between;align-items:center;gap:10px;background:#eef2ff;border:1px solid #e0e7ff;border-radius:10px;padding:10px 12px;margin-bottom:10px}
.subhead h3{font-size:12px;text-transform:uppercase;letter-spacing:.04em}.subhead p{margin:2px 0 0;font-size:11px;color:#4338ca}
.verdict{border-radius:10px;padding:12px;font-size:12px;margin-bottom:12px;border:1px solid var(--line);background:#F7F6F1}
.verdict .t{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);display:block;margin-bottom:2px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.card{border:1px solid var(--line);border-radius:16px;padding:18px;background:#fff;break-inside:avoid}
.card .top{display:flex;justify-content:space-between;gap:10px}
.card h4{font-size:13px;line-height:1.3}.card .basis{font-size:10px;color:var(--mut);margin-top:2px;display:block}
.card .val{font-size:18px;font-weight:700;text-align:right}
.bar{height:6px;border-radius:999px;background:#EBEAE2;overflow:hidden;margin:10px 0}.bar i{display:block;height:100%;border-radius:999px}
.card p{font-size:12px;color:var(--mut);margin:6px 0 0}
.diag{margin-top:10px;padding:8px 10px;border-radius:8px;background:#F7F6F1;font-size:12px}
.diag .micro{display:block;margin-bottom:2px}
.ev{font-size:10px;color:var(--mut);margin-top:6px;font-family:ui-monospace,Menlo,monospace}
.phases{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.phase{border:1px solid var(--line);border-radius:10px;padding:10px;background:#F7F6F1}
.phase h3{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--brand);border-bottom:1px solid var(--line);padding-bottom:6px;margin-bottom:8px}
.pc{border:1px solid;border-radius:8px;padding:8px;margin-bottom:6px;font-size:11px;break-inside:avoid}
.pc.ok{background:#ecfdf5cc;border-color:#a7f3d0}.pc.no{background:#fff1f2cc;border-color:#fecdd3}
.pc .k{font-size:8px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut)}
.pc .j{margin-top:4px;padding-top:4px;border-top:1px solid rgba(35,39,31,.08);font-size:9px;color:var(--mut);font-style:italic}
table{width:100%;border-collapse:collapse;font-size:11px}th{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--mut);text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);font-weight:400}td{padding:8px;border-bottom:1px solid #EBEAE2;vertical-align:top}
.note{background:#F7F6F1;border:1px solid var(--line);border-radius:12px;padding:14px;font-size:11px;color:var(--mut)}
.note h3{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--brand);margin-bottom:6px}
.log{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid #EBEAE2;padding:7px 0;font-size:11px}
.log .r{text-align:right;white-space:nowrap}.ok-t{color:#047857}.no-t{color:#be123c}.rf-t{color:#4338ca}
.foot{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;border-top:1px solid var(--line);margin-top:24px;padding-top:12px;font-size:10px;color:var(--mut);text-transform:uppercase;letter-spacing:.06em}
.tile.plain{background:#F7F6F1}.tile.w{background:#fff;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;border-color:var(--brand100)}.tile.w.e{border-color:#e0f2fe}.tile.w .v{font-size:22px}
.mini{display:grid;grid-template-columns:1fr 1fr;gap:4px;width:100%;margin-top:6px}.m1{background:#eef2ffcc;border:1px solid #e0e7ff;border-radius:6px;padding:3px}.m1 i{display:block;font-style:normal;font-size:7px;text-transform:uppercase;color:#4f46e5}.m1 b{font-size:12px;font-weight:700;color:#312e81}.m1.g{background:#F7F6F1;border-color:var(--line)}.m1.e{background:#f0f9ffcc;border-color:#e0f2fe}.m1.e i{color:#0284c7}.m1.e b{color:#075985}
.verdict.a{background:#eef2ff66;border-color:#e0e7ff}.verdict.b{background:#f0f9ff99;border-color:#e0f2fe}.verdict em{display:block}
.subval{white-space:nowrap;flex-shrink:0;background:#fff;border:1px solid #c7d2fe;border-radius:8px;padding:4px 10px;text-align:right}.subval b{display:block;font-size:11px;font-weight:700;color:#3730a3}
.chip{display:inline-block;margin-top:8px;background:var(--brand50);border:1px solid var(--brand100);border-radius:999px;padding:3px 10px;font-size:11px;color:var(--brand)}
.bt{font-weight:700}.mono{white-space:nowrap;font-family:ui-monospace,Menlo,monospace;color:var(--brand)}
.ttl{display:flex;align-items:center;gap:14px}.ico{position:relative;display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:12px;background:var(--brand);color:#fff;flex-shrink:0}.ico:after{content:"";position:absolute;right:0;top:0;width:11px;height:11px;border-bottom-left-radius:7px;background:var(--accent)}
.kpis3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px}.kpi3{border:1px solid #e0e7ff;background:#eef2ff;border-radius:12px;padding:8px 10px;text-align:center}.kpi3 i{display:block;font-style:normal;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#4f46e5}.kpi3 b{font-size:20px;font-weight:700;color:#3730a3}.kpi3.g{background:#e0e7ff;border-color:#c7d2fe}.kpi3.g b{color:#1e1b4b}.kpi3.e{background:#f0f9ff;border-color:#e0f2fe}.kpi3.e i{color:#0284c7}.kpi3.e b{color:#075985}
.kpis5{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:14px}.kpi5{display:flex;align-items:center;justify-content:space-between;gap:6px;border:1px solid var(--line);border-radius:12px;padding:10px;background:#fff;break-inside:avoid}.kpi5 .kv{font-size:20px;font-weight:700;margin-top:3px}.kpi5 .kh{font-size:10px;color:var(--mut);line-height:1.3;margin-top:2px}.kic{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;flex-shrink:0}
.k-brand .kv{color:var(--brand)}.k-brand .kic{background:var(--brand50);color:var(--brand)}.k-ok .kv{color:#059669}.k-ok .kic{background:#ecfdf5;color:#059669}.k-no .kv{color:#e11d48}.k-no .kic{background:#fff1f2;color:#e11d48}.k-sky .kv{color:#0284c7}.k-sky .kic{background:#f0f9ff;color:#0284c7}.k-amber .kv{color:#b45309}.k-amber .kic{background:var(--accentsoft);color:#b45309}
@media(max-width:720px){.kpis5{grid-template-columns:1fr 1fr}.kpis3{grid-template-columns:1fr}.kpi3.e{max-width:none}.tiles{grid-template-columns:1fr 1fr}.grid2{grid-template-columns:1fr}.phases{grid-template-columns:1fr 1fr}}
@media print{body{background:#fff}.wrap{padding:0}.sheet{border:none;box-shadow:none}}
.tl{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px}.tls{border:1px solid var(--line);border-radius:10px;padding:8px;background:#F7F6F1;font-size:11px;break-inside:avoid}.tls .h{font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut)}.tls.ok{background:#ecfdf5cc;border-color:#a7f3d0}.tls.no{background:#fff1f2cc;border-color:#fecdd3}.tls .r{font-size:12px;font-weight:700;margin-top:3px}
.imd{display:grid;grid-template-columns:1fr 1fr;gap:8px}.imdc{border:1px solid var(--line);border-radius:10px;padding:10px;background:#F7F6F1;break-inside:avoid}.imdc .t{display:flex;justify-content:space-between;font-size:11px}.imdc p{font-size:10px;color:var(--mut);margin:4px 0 0}
.plan{border:1px solid var(--line);border-radius:10px;padding:12px;background:#fff;margin-bottom:10px;font-size:12px}.plan h4{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--brand);margin-bottom:4px}.plan ul{margin:0;padding-left:16px}.plan .txt{white-space:pre-wrap;background:#F7F6F1;border-radius:8px;padding:8px}
@media(max-width:720px){.tl{grid-template-columns:1fr 1fr}.imd{grid-template-columns:1fr}}
`;
