/**
 * Esquema Eléctrico Camper 12V — Generador SVG Interactivo y Coordinador de Vistas
 * Renderiza el diagrama eléctrico por zonas y gestiona cambio de esquema (Eléctrico 12V / Fontanería), pan, zoom y exportación.
 */

// Definición de los 6 circuitos de la caja de fusibles ATC/ATO
const FUSEBOX_CIRCUITS = [
  {
    id: 'via-1',
    via: 'Vía 1',
    fuse: '10A',
    gauge: '2,5 mm²',
    isSplit: true,
    branches: [
      { title: 'Claraboya OstarkDom 12V', subtitle: 'Ventilador techo', gauge: '2,5 mm²', fuseNote: '5A · 2,5 mm²', hasSwitch: false },
      {
        title: 'Iluminación LED (4 zonas)',
        zones: [
          { name: 'LED Salón', sub: 'Tira 12V · Int. 20A 3P LED' },
          { name: 'LED Cocina', sub: 'Tira 12V · Int. 20A 3P LED' },
          { name: 'LED Cama', sub: 'Tira 12V · Int. 20A 3P LED' },
          { name: 'LED Maletero', sub: 'Tira 12V · Int. 20A 3P LED' },
        ],
        gauge: '1,5 mm²',
      },
    ],
  },
  {
    id: 'via-2',
    via: 'Vía 2',
    fuse: '20A',
    gauge: '4 mm²',
    title: 'Calefacción estacionaria',
    subtitle: 'Nordkapp Air 2kW',
    hasSwitch: false,
  },
  {
    id: 'via-3',
    via: 'Vía 3',
    fuse: '15A',
    gauge: '2,5 mm² (4 mm² >3m)',
    shortGauge: '2,5 / 4 mm²',
    title: 'Puerto USB-C #1',
    subtitle: 'Carga rápida 100W',
    hasSwitch: false,
  },
  {
    id: 'via-4',
    via: 'Vía 4',
    fuse: '15A',
    gauge: '2,5 mm² (4 mm² >3m)',
    shortGauge: '2,5 / 4 mm²',
    title: 'Puerto USB-C #2',
    subtitle: 'Carga rápida 100W',
    hasSwitch: false,
  },
  {
    id: 'via-5',
    via: 'Vía 5',
    fuse: '15A',
    gauge: '2,5 mm²',
    title: 'Bomba VEVOR 12V (96W)',
    subtitle: '11,3 L/min · Presostato + Int. Pared',
    hasSwitch: true,
  },
  {
    id: 'via-6',
    via: 'Vía 6',
    fuse: '15A',
    gauge: '4 mm²',
    title: 'Nevera compresor 12V / Reserva',
    subtitle: 'Alimentación frigorífico 12V',
    hasSwitch: false,
  },
];

// Tabla de protecciones y secciones para el panel resumen
const SUMMARY_DATA = [
  {
    group: 'Generación y Almacenamiento',
    rows: [
      { tramo: 'Batería Arranque → Booster DC-DC (+)', gauge: '16 mm²', prot: 'Fusible MIDI 60A (<20 cm)', target: 'starter-booster' },
      { tramo: 'Placa Solar 450W → Magnetotérmico → MPPT (+ / -)', gauge: '6 mm²', prot: 'MC4 + Magnetotérmico DC 2P 25A', target: 'solar-mppt' },
      { tramo: 'Booster DC-DC → Busbar Positivo (+)', gauge: '16 mm²', prot: 'Fusible MIDI 40A', target: 'booster-busbar' },
      { tramo: 'Regulador MPPT → Busbar Positivo (+)', gauge: '10 mm²', prot: 'Fusible MIDI 40A', target: 'mppt-busbar' },
      { tramo: 'Masas Booster (16) y MPPT (10) → Busbar Negativo (-)', gauge: '16 / 10 mm²', prot: 'Retorno directo', target: 'mppt-busbar' },
      { tramo: 'Batería LiFePO4 300Ah (+) → Busbar Positivo (+)', gauge: '50 mm²', prot: 'Fusible Terminal MRBF 300A (directo M8) + Cortacorrientes 300A', target: 'aux-battery' },
      { tramo: 'Batería LiFePO4 300Ah (-) → Busbar Negativo (-)', gauge: '50 mm²', prot: 'Retorno directo', target: 'aux-battery' },
      { tramo: 'Busbar Negativo (-) → Masa Chasis Vehículo', gauge: '16 mm²', prot: 'Puesta a masa chasis', target: 'chassis-ground' },
    ],
  },
  {
    group: 'Distribución y Consumos 12V',
    rows: [
      { tramo: 'Busbar (+) → Boiler Carbest CozyWater 10L (200W)', gauge: '6 mm²', prot: 'Magnetotérmico DC 25A (1P fijo)', target: 'boiler' },
      { tramo: 'Busbar (+) → Panel USB PD/QC3.0 + Mechero 150W + Voltímetro', gauge: '2,5 mm² (4 mm² >3m)', prot: 'Portafusibles aéreo propio (15A)', target: 'usb-panel' },
      { tramo: 'Busbar (+) → Caja de Fusibles 6 Vías (+)', gauge: '10 mm²', prot: 'Fusible MIDI 60A', target: 'fusebox-feed' },
      { tramo: 'Caja de Fusibles 6 Vías (-) → Busbar Negativo (-)', gauge: '10 mm²', prot: 'Retorno común 6 vías', target: 'fusebox-feed' },
      ...FUSEBOX_CIRCUITS.flatMap((c) => {
        if (c.isSplit) {
          return [
            { tramo: `${c.via} (Troncal → Par #1 Wago 221-413)`, gauge: c.gauge, prot: `Fusible ${c.fuse} común`, target: c.id },
            { tramo: `${c.via}A: ${c.branches[0].title}`, gauge: c.branches[0].gauge, prot: 'Salida Par #1 (Wago 221-413)', target: c.id },
            { tramo: `${c.via}B: Cascada LED (Pares #2–#4 Wago 221-413)`, gauge: '2,5 mm²', prot: 'Puentes 2,5 mm² (8/10 uds)', target: c.id },
            ...c.branches[1].zones.map((z, zi) => ({
              tramo: `${c.via}B.${zi + 1}: ${z.name}`,
              gauge: '1,5 mm²',
              prot: `Wago 221-413 (#${zi < 2 ? zi + 2 : 4}) + Int. 20A 3P LED`,
              target: c.id,
            })),
          ];
        }
        return [{
          tramo: `${c.via}: ${c.title}`,
          gauge: c.gauge,
          prot: `Fusible ${c.fuse}${c.hasSwitch ? ' + Int. pared 20A' : ''}`,
          target: c.id,
        }];
      }),
    ],
  },
];

// Lista completa de materiales requeridos, terminales de anilla y coste aproximado (España)
const BOM_DATA = [
  {
    group: '1. Equipos y material ya comprado',
    rows: [
      { item: 'Caja Fusibles Fentar 6 Vías ATC/ATO (100A máx, M5/M4 + fusibles)', qty: '1 ud', spec: 'Comprado', cost: '14,99 €', owned: true },
      { item: 'Panel USB PD 20W + QC3.0 + Mechero 150W + Voltímetro (portafusibles incl.)', qty: '1 ud', spec: 'Comprado', cost: '22,99 €', owned: true },
      { item: 'Pareja Busbars Simangy M8 300A (Rojo + Negro, 6× pernos M8, con tapa)', qty: '1 par', spec: 'Comprado', cost: '41,72 €', owned: true },
      { item: 'Cortacorrientes Pindex 300A (12–48V, incl. 4 anillas cobre + termorretráctil)', qty: '1 ud', spec: 'Comprado', cost: '18,99 €', owned: true },
      { item: 'Fusible Terminal Batería QUARKZMAN MRBF 300A (58V DC, directo en borne M8)', qty: '1 kit', spec: 'Comprado', cost: '18,49 €', owned: true },
      { item: 'Pack 4 Portafusibles MIDI + 10 fusibles FengYunDe (usa 2×40A + 2×60A)', qty: '1 pack', spec: 'Comprado', cost: '11,99 €', owned: true },
      { item: 'Caja Estanca DIN 3 Módulos IP65 QINGLEE-EU (Wengart 2P + Jadeshay 1P)', qty: '1 ud', spec: 'Comprado', cost: '9,99 €', owned: true },
      { item: 'Magnetotérmico DC 2P 25A Wengart 500V DC (Placa Solar, Mód. 1–2)', qty: '1 ud', spec: 'Comprado', cost: '13,59 €', owned: true },
      { item: 'Magnetotérmico DC 1P 25A Jadeshay DZ47s-63Z-1P (Boiler 6 mm², Mód. 3)', qty: '1 ud', spec: 'Comprado', cost: '9,09 €', owned: true },
      { item: 'Pack 10 × Clemas Wago 221-413 GELiTec (usa 8 en cascada Vía 1 + 2 rep.)', qty: '10 uds', spec: 'Comprado', cost: '9,48 €', owned: true },
      { item: 'Pack 5 × Interruptores Rocker 20A LED Azul RUNCCI-YUN (3P pre-cableado: 1 Bomba + 4 LED)', qty: '5 uds', spec: 'Comprado', cost: '9,49 €', owned: true },
      { item: 'ISOLATECH Tubo corrugado sin ranura DI Ø16mm / DE Ø20mm (UL94V0, líneas 2,5–10 mm²)', qty: '25 m', spec: 'Comprado', cost: '30,99 €', owned: true },
      { item: 'ISOLATECH Tubo corrugado sin ranura DI Ø20mm / DE Ø25mm (UL94V0, mazos 16–50 mm²)', qty: '10 m', spec: 'Comprado', cost: '22,99 €', owned: true },
      { item: 'Romon 400 Piezas Termorretráctil 3:1 con Adhesivo (Rojo/Negro, 3,2 a 25,4 mm)', qty: '400 uds', spec: 'Comprado', cost: '13,24 €', owned: true },
      { item: 'Batería Auxiliar LiFePO4 12V 300Ah Eco-Worthy (Bornes M8)', qty: '1 ud', spec: 'Equipo', cost: 'Ya disponible', owned: true },
      { item: 'Conjunto Eco-Worthy Booster DC-DC + Regulador MPPT', qty: '1 ud', spec: 'Equipo', cost: 'Ya disponible', owned: true },
      { item: 'Placa Solar 450W + Conectores MC4', qty: '1 kit', spec: 'Equipo', cost: 'Ya disponible', owned: true },
      { item: 'Boiler Carbest CozyWater 10L (12V / 200W)', qty: '1 ud', spec: 'Equipo', cost: 'Ya disponible', owned: true },
      { item: 'Consumos (Claraboya, Nordkapp 2kW, Nevera, Bomba VEVOR 96W, 2× USB-C 100W, LEDs)', qty: '1 lote', spec: 'Equipos', cost: 'Ya disponible', owned: true },
    ],
  },
  {
    group: '2. Cableado de Cobre Flexible a comprar (Rojo + / Negro -)',
    rows: [
      { item: 'Cable 50 mm² (MRBF → Cortacorrientes → Busbar + y Bat - → Busbar -)', qty: '~1,5 m', spec: '50 mm²', cost: '22 – 32 €' },
      { item: 'Cable 16 mm² (Motor → Booster, Booster (-) y Masa Chasis)', qty: '~8–10 m', spec: '16 mm²', cost: '35 – 50 €' },
      { item: 'Cable 10 mm² (MPPT → Busbars y Busbars → Caja Fentar 6 vías)', qty: '~6–8 m', spec: '10 mm²', cost: '20 – 30 €' },
      { item: 'Cable 6 mm² (Placa Solar → Magnetotérmico → MPPT y Boiler)', qty: '~12–16 m', spec: '6 mm²', cost: '24 – 36 €' },
      { item: 'Cable 4 mm² (Calefacción 2kW, Nevera 12V y USB-C >3m)', qty: '~12–15 m', spec: '4 mm²', cost: '18 – 25 €' },
      { item: 'Cable 2,5 mm² y 1,5 mm² (Claraboya, Bomba, USB-C <3m, 4 zonas LED)', qty: '~30–40 m', spec: '2,5 / 1,5 mm²', cost: '25 – 38 €' },
    ],
  },
  {
    group: '3. Terminales de Anilla a comprar (Todas las conexiones)',
    rows: [
      { item: 'Anillas cobre estañado 50 mm² Ø M8 (MRBF, Cortac., Busbars, Bat -)', qty: '6 uds', spec: '50 mm² · M8', cost: '9 – 14 €' },
      { item: 'Anillas cobre estañado 16 mm² Ø M8 (4) + Ø M5 (4 MIDI)', qty: '8 uds', spec: '16 mm² · M8/M5', cost: '8 – 14 €' },
      { item: 'Anillas cobre estañado 10 mm² Ø M8 (4) + Ø M5 (6 MIDI + Fentar)', qty: '10 uds', spec: '10 mm² · M8/M5', cost: '8 – 14 €' },
      { item: 'Anillas 6 mm² Ø M8 (2 Boiler Busbar) + Ø M4 Amarillas 4–6 mm² (10)', qty: '12 uds', spec: '6/4 mm² · M8/M4', cost: '6 – 10 €' },
      { item: 'Anillas aisladas Azules 1,5–2,5 mm² Ø M4 (12 Fentar) + Ø M8 (2 Panel USB)', qty: '16 uds', spec: '2,5 mm² · M4/M8', cost: '8 – 12 €' },
    ],
  },
  {
    group: '4. Fijación y Bridas a comprar',
    rows: [
      { item: 'Bridas de nylon negras para sujetar tubo corrugado (corrugado + termorretráctil ya comprados)', qty: '1 lote', spec: 'Acabado', cost: '3 – 5 €' },
    ],
  },
];

function buildDiagram() {
  const svg = document.getElementById('diagram-svg');
  svg.innerHTML = '';

  // Fondo blanco limpio para exportación SVG/PNG
  el('rect', { x: 0, y: 0, width: 2360, height: 1380, fill: '#f8fafc' }, svg);

  // Patrón sutil de rejilla técnica dentro del SVG
  const defs = el('defs', {}, svg);
  const pat = el('pattern', { id: 'tech-grid', width: 28, height: 28, patternUnits: 'userSpaceOnUse' }, defs);
  el('path', { d: 'M 28 0 L 0 0 0 28', fill: 'none', stroke: '#e2e8f0', 'stroke-width': 0.8 }, pat);
  el('rect', { x: 0, y: 0, width: 2360, height: 1380, fill: 'url(#tech-grid)' }, svg);

  // Contenedor raíz transformable para Pan & Zoom
  const root = el('g', { id: 'viewport-root' }, svg);

  // Cabecera dentro del esquema
  const headerG = el('g', {}, root);
  el('rect', { x: 24, y: 12, width: 2312, height: 52, rx: 12, fill: '#0f172a' }, headerG);
  textEl('ESQUEMA ELÉCTRICO CAMPER 12V DC — GENERACIÓN, BUSBARS 300A Y DISTRIBUCIÓN', {
    x: 44,
    y: 44,
    'font-size': 17,
    'font-weight': 800,
    'letter-spacing': '0.03em',
    fill: '#f8fafc',
  }, headerG);

  // Leyenda rápida en cabecera
  const legX = 1265;
  el('line', { x1: legX, y1: 38, x2: legX + 32, y2: 38, stroke: '#ef4444', 'stroke-width': 5, 'stroke-linecap': 'round' }, headerG);
  textEl('Positivo (+)', { x: legX + 42, y: 43, 'font-size': 12.5, 'font-weight': 700, fill: '#fca5a5' }, headerG);

  el('line', { x1: legX + 145, y1: 38, x2: legX + 177, y2: 38, stroke: '#94a3b8', 'stroke-width': 5, 'stroke-linecap': 'round' }, headerG);
  textEl('Negativo (-) / Masa', { x: legX + 187, y: 43, 'font-size': 12.5, 'font-weight': 700, fill: '#e2e8f0' }, headerG);

  el('rect', { x: legX + 345, y: 27, width: 24, height: 22, rx: 5, fill: '#d97706' }, headerG);
  textEl('⚡', { x: legX + 357, y: 42, 'text-anchor': 'middle', 'font-size': 12, fill: '#fff' }, headerG);
  textEl('Fusible / Protección', { x: legX + 378, y: 43, 'font-size': 12.5, 'font-weight': 700, fill: '#fde68a' }, headerG);

  el('rect', { x: legX + 535, y: 27, width: 54, height: 22, rx: 6, fill: '#f8fafc' }, headerG);
  textEl('mm²', { x: legX + 562, y: 42, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 800, 'font-family': 'Consolas, monospace', fill: '#0f172a' }, headerG);
  textEl('Sección cable', { x: legX + 598, y: 43, 'font-size': 12.5, 'font-weight': 700, fill: '#cbd5e1' }, headerG);

  el('circle', { cx: legX + 732, cy: 38, r: 7, fill: '#e2e8f0', stroke: '#38bdf8', 'stroke-width': 2.2 }, headerG);
  el('circle', { cx: legX + 732, cy: 38, r: 3, fill: '#0f172a' }, headerG);
  textEl('Terminal Anilla (M8/M5/M4)', { x: legX + 748, y: 43, 'font-size': 12.5, 'font-weight': 700, fill: '#7dd3fc' }, headerG);

  // =========================================================================
  // 3 ZONAS PRINCIPALES
  // =========================================================================
  const zonesLayer = el('g', { id: 'zones-layer' }, root);
  drawZone(zonesLayer, {
    x: 24, y: 92, w: 716, h: 1264,
    title: 'ZONA MOTOR Y SOLAR',
    color: '#b45309',
    fill: 'rgba(255, 251, 235, 0.72)',
    border: '#fbbf24',
  });
  drawZone(zonesLayer, {
    x: 762, y: 92, w: 560, h: 1264,
    title: 'ZONA BATERÍA Y BUSBARS (300A)',
    color: '#047857',
    fill: 'rgba(236, 253, 245, 0.72)',
    border: '#34d399',
  });
  drawZone(zonesLayer, {
    x: 1344, y: 92, w: 992, h: 1264,
    title: 'ZONA VIVIENDA / CONSUMOS (12V)',
    color: '#1d4ed8',
    fill: 'rgba(239, 246, 255, 0.72)',
    border: '#60a5fa',
  });

  const wiresLayer = el('g', { id: 'wires-layer' }, root);
  const compsLayer = el('g', { id: 'components-layer' }, root);

  // =========================================================================
  // ZONA 1: MOTOR Y SOLAR
  // =========================================================================

  // 1.1 Batería de arranque (Motor 12V)
  const starterCard = drawComponentCard(compsLayer, {
    x: 52, y: 152, w: 230, h: 180,
    title: 'Batería de Arranque',
    subtitle: 'Motor 12V (Vehículo)',
    subtitleY: 248,
    accent: '#b45309',
    badges: ['Alternador / Motor', '12V DC'],
    circuit: 'starter-booster',
  });
  // Gráfico simple de bornes en batería arranque
  textEl('Borne (+) →', { x: 268, y: 216, 'text-anchor': 'end', 'font-size': 11, 'font-weight': 700, fill: '#b91c1c' }, starterCard);
  textEl('Masa (-) ↓', { x: 167, y: 282, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#1e293b' }, starterCard);

  // Cable masa batería arranque a chasis OEM
  drawWire(wiresLayer, [[167, 332], [167, 405]], { polarity: 'neg', gauge: '6 mm²', circuit: 'starter-booster' });
  drawGroundSymbol(compsLayer, 167, 405, 'Masa Chasis (Motor)', 'Referencia común vehículo', 'starter-booster');

  // Cable positivo Batería Arranque -> Fusible MIDI 60A (<20cm) -> Booster DC-DC
  drawWire(wiresLayer, [[282, 212], [504, 212]], {
    polarity: 'pos',
    gauge: '16 mm²',
    labelPos: [314, 186],
    circuit: 'starter-booster',
  });
  drawProtectionBox(compsLayer, {
    x: 348, y: 178, w: 112, h: 66,
    title: 'Fusible MIDI (M5)',
    amp: '60A',
    sub: '< 20 cm de batería',
    kind: 'fuse',
    circuit: 'starter-booster',
  });

  // 1.1b Detalle físico: Caja DIN de 3 Módulos (Solar 2P + Boiler 1P)
  const dinBox = el('g', { class: 'comp-item', 'data-circuit': 'solar-mppt boiler' }, compsLayer);
  el('rect', { x: 55, y: 541, width: 396, height: 274, rx: 12, fill: 'rgba(15, 23, 42, 0.07)' }, dinBox);
  el('rect', { x: 52, y: 538, width: 396, height: 274, rx: 12, fill: '#f8fafc', stroke: '#475569', 'stroke-width': 2.2 }, dinBox);
  el('path', { d: 'M 52 550 Q 52 538 64 538 L 436 538 Q 448 538 448 550 L 448 572 L 52 572 Z', fill: '#334155' }, dinBox);
  textEl('CAJA DIN 3 MÓDULOS · QINGLEE IP65 (2P + 1P)', {
    x: 250, y: 560, 'text-anchor': 'middle', 'font-size': 11.2, 'font-weight': 800, fill: '#ffffff',
  }, dinBox);

  // Carril DIN 35 mm de fondo
  el('rect', { x: 66, y: 666, width: 368, height: 22, rx: 3, fill: '#cbd5e1', stroke: '#94a3b8', 'stroke-width': 1.2 }, dinBox);
  el('line', { x1: 66, y1: 677, x2: 434, y2: 677, stroke: '#64748b', 'stroke-width': 1, 'stroke-dasharray': '6,4' }, dinBox);

  // Módulos 1 y 2: Magnetotérmico Solar DC 2P 25A
  el('rect', { x: 76, y: 592, width: 204, height: 172, rx: 8, fill: '#fff7ed', stroke: '#ea580c', 'stroke-width': 2 }, dinBox);
  el('line', { x1: 178, y1: 592, x2: 178, y2: 764, stroke: '#fed7aa', 'stroke-width': 1.5, 'stroke-dasharray': '4,3' }, dinBox);
  textEl('MÓD. 1–2 · WENGART 2P', { x: 178, y: 610, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#9a3412' }, dinBox);
  textEl('IN (+)', { x: 127, y: 626, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 800, fill: '#dc2626' }, dinBox);
  textEl('IN (-)', { x: 229, y: 626, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 800, fill: '#0f172a' }, dinBox);
  // Palanca unificada 2P
  el('rect', { x: 102, y: 662, width: 152, height: 26, rx: 5, fill: '#ea580c' }, dinBox);
  textEl('25A DC · 2P', { x: 178, y: 679, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, 'font-family': 'Consolas, monospace', fill: '#ffffff' }, dinBox);
  textEl('OUT → MPPT (+ / -)', { x: 178, y: 740, 'text-anchor': 'middle', 'font-size': 9.8, 'font-weight': 700, fill: '#334155' }, dinBox);
  textEl('Cable 6 mm²', { x: 178, y: 754, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 700, fill: '#b45309' }, dinBox);

  // Módulo 3: Magnetotérmico Boiler DC 1P 25A (Jadeshay DZ47s-63Z-1P)
  el('rect', { x: 294, y: 592, width: 130, height: 172, rx: 8, fill: '#fff7ed', stroke: '#ea580c', 'stroke-width': 2 }, dinBox);
  textEl('MÓD. 3 · JADESHAY 1P', { x: 359, y: 610, 'text-anchor': 'middle', 'font-size': 9.6, 'font-weight': 800, fill: '#9a3412' }, dinBox);
  textEl('IN Busbar (+)', { x: 359, y: 626, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 800, fill: '#dc2626' }, dinBox);
  // Palanca 1P
  el('rect', { x: 318, y: 662, width: 82, height: 26, rx: 5, fill: '#ea580c' }, dinBox);
  textEl('25A DC', { x: 359, y: 679, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, 'font-family': 'Consolas, monospace', fill: '#ffffff' }, dinBox);
  textEl('OUT → Boiler (+)', { x: 359, y: 740, 'text-anchor': 'middle', 'font-size': 9.8, 'font-weight': 700, fill: '#334155' }, dinBox);
  textEl('Cable 6 mm²', { x: 359, y: 754, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 700, fill: '#b45309' }, dinBox);

  // Bornes prensa-cable arriba/abajo visuales
  [[127, 634, '#dc2626'], [229, 634, '#111827'], [127, 720, '#dc2626'], [229, 720, '#111827'], [359, 634, '#dc2626'], [359, 720, '#dc2626']].forEach(([bx, by, col]) => {
    el('circle', { cx: bx, cy: by, r: 5, fill: col, stroke: '#ffffff', 'stroke-width': 1.5 }, dinBox);
  });

  textEl('2 + 1 = 3 módulos exactos · Prensa-cable 6 mm² (respetar + / -)', {
    x: 250, y: 794, 'text-anchor': 'middle', 'font-size': 10.2, 'font-weight': 700, fill: '#0f172a',
  }, dinBox);

  // 1.2 Placa Solar 450W
  const solarCard = drawComponentCard(compsLayer, {
    x: 52, y: 950, w: 230, h: 225,
    title: 'Placa Solar 450W',
    subtitle: 'Panel Fotovoltaico Monocristalino',
    accent: '#0369a1',
    badges: ['450W Pico', 'Conectores MC4'],
    circuit: 'solar-mppt',
  });
  // Rejilla decorativa panel solar
  const sg = el('g', {}, solarCard);
  el('rect', { x: 82, y: 1020, width: 140, height: 78, rx: 5, fill: '#0c4a6e', stroke: '#38bdf8', 'stroke-width': 1.5 }, sg);
  for (let gx = 110; gx < 220; gx += 28) {
    el('line', { x1: gx, y1: 1020, x2: gx, y2: 1098, stroke: '#38bdf8', 'stroke-width': 0.9, opacity: 0.7 }, sg);
  }
  for (let gy = 1046; gy < 1098; gy += 26) {
    el('line', { x1: 82, y1: gy, x2: 222, y2: gy, stroke: '#38bdf8', 'stroke-width': 0.9, opacity: 0.7 }, sg);
  }
  textEl('(+)', { x: 266, y: 1018, 'text-anchor': 'end', 'font-size': 11, 'font-weight': 800, fill: '#dc2626' }, solarCard);
  textEl('(-)', { x: 266, y: 1108, 'text-anchor': 'end', 'font-size': 11, 'font-weight': 800, fill: '#0f172a' }, solarCard);

  // Cables Solares + MC4 -> Magnetotérmico DC 2P 25A -> MPPT
  drawWire(wiresLayer, [[282, 1014], [412, 1014]], {
    polarity: 'pos',
    gauge: '6 mm²',
    labelPos: [376, 990],
    circuit: 'solar-mppt',
  });
  drawWire(wiresLayer, [[282, 1104], [412, 1104]], {
    polarity: 'neg',
    gauge: '6 mm²',
    labelPos: [376, 1128],
    circuit: 'solar-mppt',
  });

  // Conectores MC4
  const mc4G = el('g', { class: 'comp-item', 'data-circuit': 'solar-mppt' }, compsLayer);
  el('rect', { x: 306, y: 1002, width: 34, height: 24, rx: 5, fill: '#fee2e2', stroke: '#dc2626', 'stroke-width': 1.8 }, mc4G);
  textEl('MC4', { x: 323, y: 1018, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 800, fill: '#991b1b' }, mc4G);
  el('rect', { x: 306, y: 1092, width: 34, height: 24, rx: 5, fill: '#e2e8f0', stroke: '#0f172a', 'stroke-width': 1.8 }, mc4G);
  textEl('MC4', { x: 323, y: 1108, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 800, fill: '#0f172a' }, mc4G);

  // Magnetotérmico DC Bipolar 25A (Wengart 2P)
  const mcbG = el('g', { class: 'comp-item', 'data-circuit': 'solar-mppt' }, compsLayer);
  el('rect', { x: 412, y: 944, width: 112, height: 202, rx: 10, fill: '#fff7ed', stroke: '#ea580c', 'stroke-width': 2.2 }, mcbG);
  textEl('Wengart DC 2P', { x: 468, y: 966, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: '#0f172a' }, mcbG);
  textEl('Magnetotérmico Solar', { x: 468, y: 981, 'text-anchor': 'middle', 'font-size': 9.4, 'font-weight': 600, fill: '#9a3412' }, mcbG);
  // Interruptores internos 2P
  el('line', { x1: 422, y1: 1014, x2: 446, y2: 1014, stroke: '#dc2626', 'stroke-width': 3 }, mcbG);
  el('line', { x1: 446, y1: 1014, x2: 486, y2: 1003, stroke: '#dc2626', 'stroke-width': 3, 'stroke-linecap': 'round' }, mcbG);
  el('line', { x1: 490, y1: 1014, x2: 514, y2: 1014, stroke: '#dc2626', 'stroke-width': 3 }, mcbG);
  el('line', { x1: 422, y1: 1104, x2: 446, y2: 1104, stroke: '#0f172a', 'stroke-width': 3 }, mcbG);
  el('line', { x1: 446, y1: 1104, x2: 486, y2: 1093, stroke: '#0f172a', 'stroke-width': 3, 'stroke-linecap': 'round' }, mcbG);
  el('line', { x1: 490, y1: 1104, x2: 514, y2: 1104, stroke: '#0f172a', 'stroke-width': 3 }, mcbG);
  el('line', { x1: 466, y1: 1010, x2: 466, y2: 1098, stroke: '#ea580c', 'stroke-width': 1.8, 'stroke-dasharray': '4,3' }, mcbG);
  el('rect', { x: 442, y: 1044, width: 52, height: 22, rx: 6, fill: '#ea580c' }, mcbG);
  textEl('25A DC', { x: 468, y: 1059, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, 'font-family': 'Consolas, monospace', fill: '#fff' }, mcbG);
  textEl('Caja DIN 3 Mód. (1-2)', { x: 468, y: 1134, 'text-anchor': 'middle', 'font-size': 9.2, 'font-weight': 700, fill: '#9a3412' }, mcbG);

  // Salida Magnetotérmico -> Entradas PV MPPT
  drawWire(wiresLayer, [[524, 1014], [558, 1014], [558, 840]], {
    polarity: 'pos',
    gauge: '6 mm²',
    labelPos: [558, 916],
    circuit: 'solar-mppt',
  });
  drawWire(wiresLayer, [[524, 1104], [652, 1104], [652, 840]], {
    polarity: 'neg',
    gauge: '6 mm²',
    labelPos: [652, 916],
    circuit: 'solar-mppt',
  });

  // 1.3 Conjunto Eco-Worthy (Booster DC-DC + Regulador MPPT)
  const ecoFrame = el('g', { class: 'comp-item', 'data-circuit': 'booster-busbar mppt-busbar' }, compsLayer);
  el('rect', {
    x: 490, y: 132, width: 228, height: 744, rx: 14,
    fill: 'rgba(255, 255, 255, 0.85)',
    stroke: '#0284c7',
    'stroke-width': 2.2,
    'stroke-dasharray': '7,4',
  }, ecoFrame);
  el('rect', { x: 514, y: 120, width: 180, height: 24, rx: 7, fill: '#0284c7' }, ecoFrame);
  textEl('CONJUNTO ECO-WORTHY', { x: 604, y: 136, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: '#ffffff' }, ecoFrame);

  // Booster DC-DC
  const boosterCard = drawComponentCard(compsLayer, {
    x: 504, y: 162, w: 200, h: 266,
    title: 'Booster DC-DC',
    subtitle: 'Cargador Alternador 12V',
    subtitleY: 294,
    accent: '#0369a1',
    badges: ['Aislamiento', 'Carga DC-DC'],
    circuit: 'starter-booster booster-busbar',
  });
  textEl('IN Motor (+)', { x: 514, y: 216, 'font-size': 10.5, 'font-weight': 700, fill: '#b91c1c' }, boosterCard);
  textEl('OUT (+)', { x: 692, y: 216, 'text-anchor': 'end', 'font-size': 10.5, 'font-weight': 700, fill: '#b91c1c' }, boosterCard);
  textEl('Masa (-)', { x: 692, y: 374, 'text-anchor': 'end', 'font-size': 10.5, 'font-weight': 700, fill: '#1e293b' }, boosterCard);

  // Regulador MPPT
  const mpptCard = drawComponentCard(compsLayer, {
    x: 504, y: 550, w: 200, h: 290,
    title: 'Regulador MPPT',
    subtitle: 'Controlador Solar 450W',
    subtitleY: 688,
    accent: '#0284c7',
    badges: [],
    circuit: 'solar-mppt mppt-busbar',
  });
  textEl('Seguimiento MPPT', { x: 604, y: 716, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 600, fill: '#0369a1' }, mpptCard);
  textEl('PV (+)', { x: 558, y: 824, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: '#b91c1c' }, mpptCard);
  textEl('PV (-)', { x: 652, y: 824, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: '#1e293b' }, mpptCard);
  textEl('BAT (+)', { x: 688, y: 614, 'text-anchor': 'end', 'font-size': 10.5, 'font-weight': 700, fill: '#b91c1c' }, mpptCard);
  textEl('Masa (-)', { x: 688, y: 769, 'text-anchor': 'end', 'font-size': 10.5, 'font-weight': 700, fill: '#1e293b' }, mpptCard);

  // =========================================================================
  // CONEXIONES ZONA 1 -> ZONA 2 (BUSBARS)
  // =========================================================================

  // Booster (+) -> Fusible MIDI 40A -> Busbar (+)
  drawWire(wiresLayer, [[704, 212], [990, 212]], {
    polarity: 'pos',
    gauge: '16 mm²',
    labelPos: [782, 188],
    circuit: 'booster-busbar',
  });
  drawProtectionBox(compsLayer, {
    x: 850, y: 178, w: 112, h: 62,
    title: 'Fusible MIDI (M5)',
    amp: '40A',
    kind: 'fuse',
    circuit: 'booster-busbar',
  });

  // Booster (-) -> Busbar (-)
  drawWire(wiresLayer, [[704, 370], [782, 370], [782, 945], [990, 945]], {
    polarity: 'neg',
    gauge: '16 mm²',
    labelPos: [782, 435],
    circuit: 'booster-busbar',
  });

  // MPPT (+) -> salto sobre Booster (-) en x=782 -> sube a y=282 -> Fusible MIDI 40A -> Busbar (+)
  drawWire(wiresLayer, [[704, 610], [824, 610], [824, 282], [990, 282]], {
    polarity: 'pos',
    gauge: '10 mm²',
    labelPos: [824, 515],
    circuit: 'mppt-busbar',
    hop: { segmentIndex: 1, dir: 'horizontal', x: 782 },
  });
  drawProtectionBox(compsLayer, {
    x: 850, y: 250, w: 112, h: 62,
    title: 'Fusible MIDI (M5)',
    amp: '40A',
    kind: 'fuse',
    circuit: 'mppt-busbar',
  });

  // MPPT (-) -> Busbar (-)
  drawWire(wiresLayer, [[704, 765], [744, 765], [744, 1015], [990, 1015]], {
    polarity: 'neg',
    gauge: '10 mm²',
    labelPos: [744, 895],
    circuit: 'mppt-busbar',
  });

  // =========================================================================
  // ZONA 2: BATERÍA AUXILIAR Y BUSBARS 300A
  // =========================================================================

  // 2.1 Busbar Positivo (+) 300A
  const busPosG = el('g', { class: 'comp-item', 'data-circuit': 'booster-busbar mppt-busbar aux-battery boiler usb-panel fusebox-feed' }, compsLayer);
  el('rect', { x: 990, y: 150, width: 280, height: 196, rx: 12, fill: '#fff1f2', stroke: '#dc2626', 'stroke-width': 2.6 }, busPosG);
  el('rect', { x: 990, y: 150, width: 280, height: 34, rx: 10, fill: '#dc2626' }, busPosG);
  textEl('BUSBAR POSITIVO (+) 300A', { x: 1130, y: 172, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#ffffff' }, busPosG);
  // Barra de cobre interna
  el('rect', { x: 1020, y: 205, width: 220, height: 112, rx: 8, fill: '#fee2e2', stroke: '#ef4444', 'stroke-width': 1.8 }, busPosG);
  el('rect', { x: 1040, y: 254, width: 180, height: 14, rx: 4, fill: '#b91c1c' }, busPosG);
  textEl('SIMANGY 300A · 6× PERNOS M8', { x: 1130, y: 234, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#991b1b' }, busPosG);
  textEl('Todas las conexiones con Anilla M8', { x: 1130, y: 294, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 600, fill: '#7f1d1d' }, busPosG);

  // 2.2 Cadena Batería Auxiliar (+) -> Fusible Terminal MRBF 300A (directo M8) -> Cortacorrientes 300A -> Busbar (+)
  // Cable 50 mm² desde salida M8 del MRBF hacia Cortacorrientes y Busbar (+)
  drawWire(wiresLayer, [[1130, 569], [1130, 346]], {
    polarity: 'pos',
    gauge: '50 mm²',
    labelPos: [1130, 376],
    circuit: 'aux-battery',
  });
  drawGaugePill(wiresLayer, 1130, 521, '50 mm²', 'pos');

  drawProtectionBox(compsLayer, {
    x: 1030, y: 406, w: 200, h: 68,
    title: 'Cortacorrientes Pindex 300A',
    amp: '300A ON/OFF',
    kind: 'switch',
    circuit: 'aux-battery',
  });

  // Fusible MRBF atornillado directamente al borne (+) M8 de la batería
  drawProtectionBox(compsLayer, {
    x: 1018, y: 569, w: 224, h: 66,
    title: 'Fusible Terminal MRBF (M8)',
    amp: '300A · Directo en borne',
    kind: 'fuse',
    circuit: 'aux-battery',
  });

  // 2.3 Batería Auxiliar LiFePO4 12V 300Ah (Eco-Worthy)
  const auxBat = drawComponentCard(compsLayer, {
    x: 970, y: 635, w: 320, h: 192,
    title: 'Batería Auxiliar LiFePO4 300Ah',
    subtitle: '12V · Eco-Worthy (3.840 Wh)',
    subtitleY: 718,
    accent: '#059669',
    badges: ['Bornes M8', 'Botón ON/OFF', 'BT / WiFi'],
    circuit: 'aux-battery',
  });
  textEl('Borne (+) M8 · MRBF directo ↑', { x: 1130, y: 690, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: '#dc2626' }, auxBat);
  textEl('BMS Integrado 12V 300Ah', { x: 1130, y: 744, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 600, fill: '#065f46' }, auxBat);
  textEl('Borne (-) M8 · Anilla 50 mm² ↓', { x: 1130, y: 772, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: '#0f172a' }, auxBat);

  // Cable Negativo Batería 50 mm² -> Busbar Negativo (-)
  drawWire(wiresLayer, [[1130, 827], [1130, 900]], {
    polarity: 'neg',
    gauge: '50 mm²',
    labelPos: [1130, 864],
    circuit: 'aux-battery',
  });

  // 2.4 Busbar Negativo (-) 300A
  const busNegG = el('g', { class: 'comp-item', 'data-circuit': 'booster-busbar mppt-busbar aux-battery chassis-ground boiler usb-panel fusebox-feed' }, compsLayer);
  el('rect', { x: 990, y: 900, width: 280, height: 176, rx: 12, fill: '#f1f5f9', stroke: '#0f172a', 'stroke-width': 2.6 }, busNegG);
  el('rect', { x: 990, y: 900, width: 280, height: 34, rx: 10, fill: '#0f172a' }, busNegG);
  textEl('BUSBAR NEGATIVO (-) 300A', { x: 1130, y: 922, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#ffffff' }, busNegG);
  el('rect', { x: 1020, y: 954, width: 220, height: 92, rx: 8, fill: '#e2e8f0', stroke: '#334155', 'stroke-width': 1.8 }, busNegG);
  el('rect', { x: 1040, y: 992, width: 180, height: 14, rx: 4, fill: '#1e293b' }, busNegG);
  textEl('SIMANGY MASAS 300A · 6× PERNOS M8', { x: 1130, y: 974, 'text-anchor': 'middle', 'font-size': 9.8, 'font-weight': 800, fill: '#0f172a' }, busNegG);
  textEl('Todas las conexiones con Anilla M8', { x: 1130, y: 1030, 'text-anchor': 'middle', 'font-size': 9.8, 'font-weight': 600, fill: '#334155' }, busNegG);

  // Masa Chasis del vehículo 16 mm²
  drawWire(wiresLayer, [[1130, 1076], [1130, 1185]], {
    polarity: 'neg',
    gauge: '16 mm²',
    labelPos: [1130, 1130],
    circuit: 'chassis-ground',
  });
  drawGroundSymbol(compsLayer, 1130, 1185, 'Masa Chasis Vehículo', 'Conexión directa carrocería (16 mm²)', 'chassis-ground');

  // =========================================================================
  // ZONA 3: VIVIENDA / CONSUMOS (12V)
  // =========================================================================

  // 3.1 Línea Dedicada Boiler Carbest CozyWater 10L (12V / 200W)
  drawWire(wiresLayer, [[1270, 188], [1855, 188]], {
    polarity: 'pos',
    gauge: '6 mm²',
    labelPos: [1345, 164],
    circuit: 'boiler',
  });
  drawProtectionBox(compsLayer, {
    x: 1445, y: 156, w: 158, h: 62,
    title: 'Jadeshay DC 1P (Boiler)',
    amp: '25A · Mód. 3 DIN',
    kind: 'breaker',
    circuit: 'boiler',
  });
  drawGaugePill(wiresLayer, 1720, 164, '6 mm²', 'pos');

  // Retorno negativo Boiler -> Busbar (-)
  drawWire(wiresLayer, [[1855, 222], [1372, 222], [1372, 945], [1270, 945]], {
    polarity: 'neg',
    gauge: '6 mm²',
    labelPos: [1720, 244],
    circuit: 'boiler',
    hops: [
      { segmentIndex: 2, dir: 'vertical', y: 266 },
      { segmentIndex: 2, dir: 'vertical', y: 456 },
    ],
  });

  const boilerCard = drawComponentCard(compsLayer, {
    x: 1855, y: 120, w: 452, h: 148,
    title: 'Boiler Carbest CozyWater 10L',
    subtitle: '12V / 200W · Línea dedicada de alta potencia',
    subtitleY: 168,
    accent: '#0284c7',
    badges: ['10 Litros · 200W', 'Línea directa desde Busbar'],
    circuit: 'boiler',
  });
  textEl('(+) 25A', { x: 1868, y: 192, 'font-size': 11, 'font-weight': 800, fill: '#dc2626' }, boilerCard);
  textEl('(-) Retorno', { x: 1868, y: 226, 'font-size': 11, 'font-weight': 800, fill: '#0f172a' }, boilerCard);

  // 3.2 Línea Dedicada Panel USB + Mechero 150W + Voltímetro (con portafusibles propio)
  drawWire(wiresLayer, [[1270, 266], [1424, 266], [1424, 346], [1855, 346]], {
    polarity: 'pos',
    gauge: '2,5 / 4 mm²',
    labelPos: [1320, 244],
    circuit: 'usb-panel',
  });
  drawProtectionBox(compsLayer, {
    x: 1445, y: 314, w: 180, h: 64,
    title: 'Portafusibles aéreo propio',
    amp: '15A (kit incluido)',
    kind: 'fuse',
    circuit: 'usb-panel',
  });
  drawGaugePill(wiresLayer, 1720, 324, '2,5 / 4 mm²', 'pos');

  // Retorno negativo Panel USB + Mechero -> Busbar (-)
  drawWire(wiresLayer, [[1855, 378], [1396, 378], [1396, 995], [1270, 995]], {
    polarity: 'neg',
    gauge: '2,5 / 4 mm²',
    labelPos: [1720, 400],
    circuit: 'usb-panel',
    hop: { segmentIndex: 2, dir: 'vertical', y: 456 },
  });

  const panelUsbCard = drawComponentCard(compsLayer, {
    x: 1855, y: 280, w: 452, h: 144,
    title: 'Panel USB + Mechero 150W + Voltímetro',
    subtitle: 'USB PD 20W + QC3.0 + Toma 12V + Interruptor',
    subtitleY: 326,
    accent: '#0369a1',
    badges: ['Portafusibles aéreo propio', 'Directo desde Busbar'],
    circuit: 'usb-panel',
  });
  textEl('(+) 15A', { x: 1868, y: 350, 'font-size': 11, 'font-weight': 800, fill: '#dc2626' }, panelUsbCard);
  textEl('(-) Retorno', { x: 1868, y: 382, 'font-size': 11, 'font-weight': 800, fill: '#0f172a' }, panelUsbCard);

  // 3.3 Alimentación Caja de Fusibles 6 Vías (Busbar + -> MIDI 50A -> Caja)
  drawWire(wiresLayer, [[1270, 326], [1314, 326], [1314, 456], [1590, 456], [1590, 514]], {
    polarity: 'pos',
    gauge: '10 mm²',
    labelPos: [1314, 392],
    circuit: 'fusebox-feed',
  });
  drawProtectionBox(compsLayer, {
    x: 1445, y: 424, w: 120, h: 62,
    title: 'Fusible MIDI (M5)',
    amp: '60A',
    kind: 'fuse',
    circuit: 'fusebox-feed',
  });

  // Retorno negativo común Caja de Fusibles -> Busbar (-)
  drawWire(wiresLayer, [[1440, 1248], [1420, 1248], [1420, 1045], [1270, 1045]], {
    polarity: 'neg',
    gauge: '10 mm²',
    labelPos: [1335, 1068],
    circuit: 'fusebox-feed',
  });

  // 3.4 Caja de Fusibles Fentar 6 Vías (ATC/ATO · Máx 100A)
  const fbG = el('g', { class: 'comp-item', 'data-circuit': 'fusebox-feed' }, compsLayer);
  el('rect', { x: 1440, y: 514, width: 300, height: 774, rx: 14, fill: '#ffffff', stroke: '#1d4ed8', 'stroke-width': 2.5 }, fbG);
  el('rect', { x: 1440, y: 514, width: 300, height: 42, rx: 12, fill: '#1d4ed8' }, fbG);
  textEl('CAJA FENTAR 6 VÍAS (100A MÁX)', {
    x: 1590, y: 540,
    'text-anchor': 'middle',
    'font-size': 12.5,
    'font-weight': 800,
    fill: '#ffffff',
  }, fbG);

  // Barra interna Positiva (+) dentro de Caja de Fusibles
  el('rect', { x: 1458, y: 568, width: 14, height: 656, rx: 4, fill: '#dc2626' }, fbG);
  textEl('IN (+) Anilla M5', { x: 1602, y: 570, 'text-anchor': 'start', 'font-size': 10, 'font-weight': 800, fill: '#dc2626' }, fbG);
  el('line', { x1: 1590, y1: 556, x2: 1590, y2: 574, stroke: '#dc2626', 'stroke-width': 4 }, fbG);
  el('line', { x1: 1465, y1: 574, x2: 1590, y2: 574, stroke: '#dc2626', 'stroke-width': 4 }, fbG);

  // Barra interna Negativa (-) colectora dentro de Caja de Fusibles
  el('rect', { x: 1702, y: 582, width: 14, height: 672, rx: 4, fill: '#111827' }, fbG);
  el('line', { x1: 1440, y1: 1248, x2: 1709, y2: 1248, stroke: '#111827', 'stroke-width': 4.5 }, fbG);
  textEl('Borne (-) Anilla M5 → 10 mm² Busbar (-)', {
    x: 1575, y: 1272,
    'text-anchor': 'middle',
    'font-size': 10.5,
    'font-weight': 700,
    fill: '#0f172a',
  }, fbG);

  // 3.5 Los 6 Circuitos individuales + Consumos
  FUSEBOX_CIRCUITS.forEach((c, idx) => {
    const cy = idx === 0 ? 602 : 815 + (idx - 1) * 94;
    const yPos = cy - 16;
    const yNeg = cy + 16;

    // Fila interna en Caja de Fusibles
    const rowG = el('g', { class: 'comp-item', 'data-circuit': c.id }, compsLayer);
    el('rect', { x: 1480, y: cy - 30, width: 212, height: 56, rx: 8, fill: '#f8fafc', stroke: '#cbd5e1', 'stroke-width': 1.2 }, rowG);
    el('line', { x1: 1472, y1: yPos, x2: 1550, y2: yPos, stroke: '#dc2626', 'stroke-width': 2.5 }, rowG);
    el('line', { x1: 1622, y1: yPos, x2: 1740, y2: yPos, stroke: '#dc2626', 'stroke-width': 2.5 }, rowG);

    // Badge Vía
    el('rect', { x: 1488, y: cy - 22, width: 52, height: 20, rx: 5, fill: '#1e293b' }, rowG);
    textEl(c.via, { x: 1514, y: cy - 8, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 800, fill: '#ffffff' }, rowG);

    // Fusible ATC/ATO dentro de la caja
    el('rect', { x: 1550, y: yPos - 11, width: 74, height: 22, rx: 5, fill: '#fef3c7', stroke: '#d97706', 'stroke-width': 1.6 }, rowG);
    textEl(`Fus. ${c.fuse}`, {
      x: 1587, y: yPos + 4,
      'text-anchor': 'middle',
      'font-size': 10.5,
      'font-weight': 800,
      'font-family': 'Consolas, monospace',
      fill: '#92400e',
    }, rowG);

    // Sub-nota de terminales anilla M4 dentro de la fila
    textEl('Salidas Anilla M4 (+ / -)', { x: 1688, y: yNeg + 4, 'text-anchor': 'end', 'font-size': 9.2, 'font-weight': 700, fill: '#334155' }, rowG);

    // Cables + y - hacia el consumo (o derivación Vía 1 -> Claraboya + 4 zonas LED)
    if (c.isSplit) {
      const clemaX = 1800;
      const clemaW = 46;
      const posX = 1814;
      const negX = 1832;

      // Troncal 2,5 mm² desde Caja de Fusibles hasta Wago 3 vías
      drawWire(wiresLayer, [[1740, yPos], [posX, yPos]], {
        polarity: 'pos',
        gauge: c.gauge,
        labelPos: [1772, yPos],
        circuit: c.id,
      });
      drawWire(wiresLayer, [[negX, yNeg], [1716, yNeg]], {
        polarity: 'neg',
        gauge: c.gauge,
        labelPos: [1772, yNeg],
        circuit: c.id,
      });

      // Rama 1A: Claraboya OstarkDom 12V (arriba)
      const cyA = 492;
      const yPosA = cyA - 16;
      const yNegA = cyA + 16;
      const cardAX = 2038;
      const cardAW = 269;
      drawWire(wiresLayer, [[posX, yPos], [posX, yPosA], [cardAX, yPosA]], {
        polarity: 'pos',
        gauge: c.branches[0].gauge,
        labelPos: [1948, yPosA],
        circuit: c.id,
      });
      drawWire(wiresLayer, [[cardAX, yNegA], [negX, yNegA], [negX, yNeg]], {
        polarity: 'neg',
        gauge: c.branches[0].gauge,
        labelPos: [1948, yNegA],
        circuit: c.id,
      });

      const clCard = el('g', { class: 'comp-item', 'data-circuit': c.id }, compsLayer);
      el('rect', { x: cardAX, y: cyA - 34, width: cardAW, height: 68, rx: 10, fill: '#ffffff', stroke: '#2563eb', 'stroke-width': 2 }, clCard);
      el('rect', { x: cardAX, y: cyA - 34, width: 10, height: 68, rx: 4, fill: '#2563eb' }, clCard);
      textEl(c.branches[0].title, { x: cardAX + 20, y: cyA - 8, 'font-size': 12.5, 'font-weight': 800, fill: '#0f172a' }, clCard);
      textEl(c.branches[0].subtitle, { x: cardAX + 20, y: cyA + 11, 'font-size': 10.5, 'font-weight': 600, fill: '#475569' }, clCard);
      el('rect', { x: cardAX + cardAW - 94, y: cyA + 6, width: 84, height: 20, rx: 5, fill: '#f1f5f9', stroke: '#cbd5e1', 'stroke-width': 1 }, clCard);
      textEl(c.branches[0].fuseNote, {
        x: cardAX + cardAW - 52, y: cyA + 20, 'text-anchor': 'middle', 'font-size': 9.8, 'font-weight': 700, 'font-family': 'Consolas, monospace', fill: '#1e293b',
      }, clCard);
      drawTerminal(compsLayer, cardAX, yPosA, 'pos');
      drawTerminal(compsLayer, cardAX, yNegA, 'neg');

      // Par #1 Wago 221-413 (Vía 1: Claraboya + Troncal cascada LED)
      const clemaG = el('g', { class: 'comp-item', 'data-circuit': c.id }, compsLayer);
      el('rect', { x: clemaX, y: 556, width: clemaW, height: 84, rx: 8, fill: 'rgba(255, 251, 235, 0.50)', stroke: '#d97706', 'stroke-width': 1.8 }, clemaG);
      textEl('221-413', { x: clemaX + clemaW / 2, y: 653, 'text-anchor': 'middle', 'font-size': 9.4, 'font-weight': 800, fill: '#b45309' }, clemaG);
      textEl('Par #1 (3v)', { x: clemaX + clemaW / 2, y: 664, 'text-anchor': 'middle', 'font-size': 8.8, 'font-weight': 700, fill: '#92400e' }, clemaG);
      drawTerminal(clemaG, posX, yPos, 'pos');
      drawTerminal(clemaG, negX, yNeg, 'neg');

      // Rama 1B: Cascada de 3 pares Wago 221-413 (#2, #3, #4) -> 4 zonas LED
      const wX = 1924;
      const wW = 50;
      const wPosX = 1938;
      const wNegX = 1960;
      const ledCardX = 2132;
      const ledCardW = 175;
      const zoneY = [572, 624, 676, 728];

      // Troncal puente 2,5 mm² desde Par #1 hasta Par #2 (Salón)
      drawWire(wiresLayer, [[posX, yPos], [1908, yPos], [1908, zoneY[0] - 10], [wPosX, zoneY[0] - 10]], {
        polarity: 'pos',
        gauge: '2,5 mm²',
        labelPos: [1870, yPos],
        circuit: c.id,
        hop: { segmentIndex: 1, dir: 'horizontal', x: negX },
      });
      drawWire(wiresLayer, [[wNegX, zoneY[0] + 10], [1916, zoneY[0] + 10], [1916, yNeg], [negX, yNeg]], {
        polarity: 'neg',
        gauge: '2,5 mm²',
        labelPos: [1870, yNeg],
        circuit: c.id,
        hop: { segmentIndex: 1, dir: 'horizontal', x: wPosX },
      });

      // Puentes verticales de 2,5 mm² entre Pares #2 -> #3 -> #4
      drawWire(wiresLayer, [[wPosX, zoneY[0] - 10], [wPosX, zoneY[3] - 10]], {
        polarity: 'pos',
        gauge: '2,5 mm²',
        circuit: c.id,
      });
      drawWire(wiresLayer, [[wNegX, zoneY[3] + 10], [wNegX, zoneY[0] + 10]], {
        polarity: 'neg',
        gauge: '2,5 mm²',
        circuit: c.id,
      });

      // 3 bloques Wago 221-413 en cascada (Par #2 Salón, Par #3 Cocina, Par #4 Cama+Maletero)
      const cascadeBoxes = [
        { y: 550, h: 42, tag: '#2' },
        { y: 604, h: 40, tag: '#3' },
        { y: 656, h: 92, tag: '#4' },
      ];
      cascadeBoxes.forEach((bx) => {
        const bg = el('g', { class: 'comp-item', 'data-circuit': c.id }, compsLayer);
        el('rect', { x: wX, y: bx.y, width: wW, height: bx.h, rx: 7, fill: 'rgba(255, 251, 235, 0.50)', stroke: '#d97706', 'stroke-width': 1.8 }, bg);
        textEl(bx.tag, { x: wX - 4, y: bx.y + bx.h / 2 + 3, 'text-anchor': 'end', 'font-size': 8.8, 'font-weight': 800, fill: '#b45309' }, bg);
      });

      const wLabelG = el('g', { class: 'comp-item', 'data-circuit': c.id }, compsLayer);
      textEl('Cascada 221-413', { x: wX + wW / 2, y: 762, 'text-anchor': 'middle', 'font-size': 9.4, 'font-weight': 800, fill: '#b45309' }, wLabelG);
      textEl('(8/10 uds · 2 rep.)', { x: wX + wW / 2, y: 773, 'text-anchor': 'middle', 'font-size': 8.6, 'font-weight': 700, fill: '#92400e' }, wLabelG);
      textEl('Puentes 2,5 mm²', { x: 1862, y: 724, 'text-anchor': 'middle', 'font-size': 8.8, 'font-weight': 700, fill: '#64748b' }, wLabelG);

      // 4 Zonas LED independientes: Salón, Cocina, Cama, Maletero
      const drawMiniPill = (x, y, label, pol) => {
        const pg = el('g', { class: 'gauge-pill' }, wiresLayer);
        const pw = 48;
        const ph = 15;
        const isP = pol === 'pos';
        el('rect', {
          x: x - pw / 2, y: y - ph / 2, width: pw, height: ph, rx: 5,
          fill: isP ? '#fef2f2' : '#f1f5f9', stroke: isP ? '#dc2626' : '#334155', 'stroke-width': 1.1,
        }, pg);
        textEl(label, {
          x, y: y + 3.3, 'text-anchor': 'middle', 'font-size': 9.2, 'font-weight': 700,
          'font-family': 'Consolas, ui-monospace, monospace', fill: isP ? '#991b1b' : '#0f172a',
        }, pg);
      };

      c.branches[1].zones.forEach((z, zi) => {
        const cyL = zoneY[zi];
        const yp = cyL - 10;
        const yn = cyL + 10;

        drawWire(wiresLayer, [[wPosX, yp], [ledCardX, yp]], {
          polarity: 'pos',
          gauge: '1,5 mm²',
          circuit: c.id,
          hop: zi > 0 ? { segmentIndex: 1, dir: 'horizontal', x: wNegX } : null,
        });
        drawWire(wiresLayer, [[ledCardX, yn], [wNegX, yn]], {
          polarity: 'neg',
          gauge: '1,5 mm²',
          circuit: c.id,
        });

        drawMiniPill(2006, yp, '1,5 mm²', 'pos');
        drawMiniPill(2081, yn, '1,5 mm²', 'neg');

        // Interruptor independiente RUNCCI-YUN 20A (3P LED azul)
        const swZ = el('g', { class: 'comp-item', 'data-circuit': c.id }, compsLayer);
        el('rect', { x: 2044, y: yp - 9, width: 74, height: 18, rx: 5, fill: '#eff6ff', stroke: '#2563eb', 'stroke-width': 1.5 }, swZ);
        textEl('Int. 20A LED', { x: 2081, y: yp + 3.2, 'text-anchor': 'middle', 'font-size': 8.9, 'font-weight': 800, fill: '#1d4ed8' }, swZ);

        // Tarjeta compacta de zona LED
        const zCard = el('g', { class: 'comp-item', 'data-circuit': c.id }, compsLayer);
        el('rect', { x: ledCardX, y: cyL - 19, width: ledCardW, height: 38, rx: 8, fill: '#ffffff', stroke: '#2563eb', 'stroke-width': 1.8 }, zCard);
        el('rect', { x: ledCardX, y: cyL - 19, width: 8, height: 38, rx: 3, fill: '#2563eb' }, zCard);
        textEl(z.name, { x: ledCardX + 16, y: cyL - 3, 'font-size': 11.5, 'font-weight': 800, fill: '#0f172a' }, zCard);
        textEl(z.sub, { x: ledCardX + 16, y: cyL + 11, 'font-size': 9.4, 'font-weight': 600, fill: '#475569' }, zCard);

        drawTerminal(compsLayer, wPosX, yp, 'pos');
        drawTerminal(compsLayer, wNegX, yn, 'neg');
        drawTerminal(compsLayer, ledCardX, yp, 'pos');
        drawTerminal(compsLayer, ledCardX, yn, 'neg');
      });
      return;
    }

    const pillGauge = c.shortGauge || c.gauge;
    drawWire(wiresLayer, [[1740, yPos], [1945, yPos]], {
      polarity: 'pos',
      gauge: pillGauge,
      labelPos: c.hasSwitch ? [1794, yPos] : [1842, yPos],
      circuit: c.id,
    });
    drawWire(wiresLayer, [[1945, yNeg], [1716, yNeg]], {
      polarity: 'neg',
      gauge: pillGauge,
      labelPos: [1842, yNeg],
      circuit: c.id,
    });

    // Interruptor de corte en pared RUNCCI-YUN para Bomba VEVOR (Vía 5)
    if (c.hasSwitch) {
      const swG = el('g', { class: 'comp-item', 'data-circuit': c.id }, compsLayer);
      el('rect', { x: 1842, y: yPos - 15, width: 92, height: 28, rx: 6, fill: '#eff6ff', stroke: '#2563eb', 'stroke-width': 1.6 }, swG);
      textEl('Int. 20A (3P LED)', { x: 1888, y: yPos + 3, 'text-anchor': 'middle', 'font-size': 9.1, 'font-weight': 800, fill: '#1d4ed8' }, swG);
    }

    // Tarjeta de Consumo (Derecha)
    const consG = el('g', { class: 'comp-item', 'data-circuit': c.id }, compsLayer);
    el('rect', { x: 1945, y: cy - 35, width: 362, height: 70, rx: 10, fill: '#ffffff', stroke: '#2563eb', 'stroke-width': 2 }, consG);
    el('rect', { x: 1945, y: cy - 35, width: 10, height: 70, rx: 4, fill: '#2563eb' }, consG);

    textEl(c.title, { x: 1968, y: cy - 9, 'font-size': 13, 'font-weight': 800, fill: '#0f172a' }, consG);
    textEl(c.subtitle, { x: 1968, y: cy + 10, 'font-size': 11, 'font-weight': 600, fill: '#475569' }, consG);

    // Chip de fusible + sección a la derecha de la tarjeta
    const chipText = `${c.fuse} · ${c.gauge}`;
    const chipW = Math.max(92, chipText.length * 6.2 + 12);
    el('rect', { x: 2296 - chipW, y: cy + 6, width: chipW, height: 20, rx: 5, fill: '#f1f5f9', stroke: '#cbd5e1', 'stroke-width': 1 }, consG);
    textEl(chipText, {
      x: 2296 - chipW / 2,
      y: cy + 20,
      'text-anchor': 'middle',
      'font-size': 10,
      'font-weight': 700,
      'font-family': 'Consolas, monospace',
      fill: '#1e293b',
    }, consG);

    drawTerminal(compsLayer, 1945, yPos, 'pos');
    drawTerminal(compsLayer, 1945, yNeg, 'neg');
  });

  // Puntos de conexión clave (bornes principales)
  drawTerminal(compsLayer, 282, 212, 'pos');
  drawTerminal(compsLayer, 504, 212, 'pos');
  drawTerminal(compsLayer, 704, 212, 'pos');
  drawTerminal(compsLayer, 704, 370, 'neg');
  drawTerminal(compsLayer, 704, 610, 'pos');
  drawTerminal(compsLayer, 704, 765, 'neg');
  drawTerminal(compsLayer, 558, 840, 'pos');
  drawTerminal(compsLayer, 652, 840, 'neg');
  drawTerminal(compsLayer, 282, 1014, 'pos');
  drawTerminal(compsLayer, 282, 1104, 'neg');

  // Bornes Busbars
  drawTerminal(compsLayer, 990, 212, 'pos');
  drawTerminal(compsLayer, 990, 282, 'pos');
  drawTerminal(compsLayer, 1130, 346, 'pos');
  drawTerminal(compsLayer, 1270, 188, 'pos');
  drawTerminal(compsLayer, 1270, 266, 'pos');
  drawTerminal(compsLayer, 1270, 326, 'pos');

  drawTerminal(compsLayer, 1130, 569, 'pos');
  drawTerminal(compsLayer, 1130, 635, 'pos');
  drawTerminal(compsLayer, 1130, 827, 'neg');

  drawTerminal(compsLayer, 990, 945, 'neg');
  drawTerminal(compsLayer, 990, 1015, 'neg');
  drawTerminal(compsLayer, 1130, 900, 'neg');
  drawTerminal(compsLayer, 1130, 1076, 'neg');
  drawTerminal(compsLayer, 1270, 945, 'neg');
  drawTerminal(compsLayer, 1270, 995, 'neg');
  drawTerminal(compsLayer, 1270, 1045, 'neg');

  drawTerminal(compsLayer, 1855, 188, 'pos');
  drawTerminal(compsLayer, 1855, 222, 'neg');
  drawTerminal(compsLayer, 1855, 346, 'pos');
  drawTerminal(compsLayer, 1855, 378, 'neg');
  drawTerminal(compsLayer, 1590, 514, 'pos');
  drawTerminal(compsLayer, 1440, 1248, 'neg');
}

// ===========================================================================
// INTERACTIVIDAD: PAN, ZOOM, SELECCIÓN, RESUMEN Y EXPORTACIÓN
// ===========================================================================
function initInteractions(initialScheme = 'electric') {
  const viewport = document.getElementById('viewport');
  const svg = document.getElementById('diagram-svg');
  const zoomReadout = document.getElementById('zoom-readout');
  const clearBtn = document.getElementById('clear-selection');
  const selectionInfo = document.getElementById('selection-info');
  const filterGroup = document.getElementById('filter-group');
  const brandBadge = document.getElementById('brand-badge');
  const brandTitle = document.getElementById('brand-title');
  const brandSub = document.getElementById('brand-sub');
  const exportPdf = document.getElementById('export-pdf');
  const chip1 = document.getElementById('legend-chip-1');
  const chip2 = document.getElementById('legend-chip-2');
  const chip3 = document.getElementById('legend-chip-3');

  const SCHEME_CONFIG = {
    electric: {
      badge: '12V DC',
      title: 'Esquema Eléctrico Camper 12V',
      sub: 'LiFePO4 300Ah (M8) · Fentar 6 Vías (M5/M4) · Terminales de Anilla · Solar 450W',
      docTitle: 'Esquema Eléctrico Camper 12V — LiFePO4 300Ah + Solar 450W',
      filters: [
        { filter: 'all', label: 'Todo', title: 'Mostrar todos los cables', cls: '' },
        { filter: 'pos', label: 'Solo (+) Rojo', title: 'Resaltar cables positivos (+)', cls: 'filter-pos' },
        { filter: 'neg', label: 'Solo (-) Negro', title: 'Resaltar cables negativos (-)', cls: 'filter-neg' },
      ],
      chips: [
        '<span class="swatch pos"></span> Positivo (+)',
        '<span class="swatch neg"></span> Negativo (-) / Masa',
        '<span class="ring-swatch"></span> Terminal de Anilla',
      ],
      summaryTitle: 'Resumen de Protecciones y Secciones',
      summaryTabLabel: 'Tramos y Fusibles',
      summaryCols: ['Tramo / Circuito', 'Sección', 'Protección'],
      bomTitle: 'Lista de Materiales, Anillas y Coste',
      bomTabLabel: 'Materiales, Anillas y Coste',
      bomCols: ['Elemento / Especificación', 'Cant.', 'Coste aprox.'],
      summaryData: SUMMARY_DATA,
      bomData: BOM_DATA,
      totalCardHtml: `
        <div>Solo falta comprar cableado flexible, terminales de anilla y bridas (protecciones, corrugado y termorretráctil 3:1 ya comprados):</div>
        <strong>Total pendiente aproximado: ~185 – 280 €</strong>
        <div style="font-size: 11px; color: #a7f3d0;">* Ya descontados 248,03 € en material comprado (Fentar, USB, Simangy, Pindex, MRBF QUARKZMAN, MIDI, QINGLEE, Wengart 2P, Jadeshay 1P, Wagos, RUNCCI-YUN, ISOLATECH y Romon 400uds).</div>
      `,
      svgName: 'esquema-electrico-camper-12v.svg',
      pngName: 'esquema-electrico-camper-12v-HD.png',
      pdfHref: 'esquema-electrico-camper-12v.pdf',
      buildFn: buildDiagram,
    },
    plumbing: {
      badge: 'AGUA / ACS',
      title: 'Esquema Fontanería Sprinter L2H2',
      sub: 'Varile 40/10 mm · Bomba VEVOR + Fiamma A20 + Reductor 1,5–2 bar · Boiler Carbest 10L · Grises 40L (Ø25 mm)',
      docTitle: 'Esquema Fontanería Sprinter L2H2 — Agua Limpia, ACS 10L y Grises 40L',
      filters: [
        { filter: 'all', label: 'Todo', title: 'Mostrar todos los conductos', cls: '' },
        { filter: 'clean', label: 'Limpia / Fría', title: 'Resaltar agua limpia y fría (azul)', cls: 'filter-clean' },
        { filter: 'hot', label: 'Caliente ACS', title: 'Resaltar agua caliente (roja)', cls: 'filter-hot' },
        { filter: 'grey', label: 'Grises Ø25', title: 'Resaltar circuito de aguas grises', cls: 'filter-grey' },
      ],
      chips: [
        '<span class="swatch" style="background:#0284c7;"></span> Limpia / Fría (10 / 40 mm)',
        '<span class="swatch pos"></span> Caliente ACS (10 mm)',
        '<span class="swatch" style="background:#475569;"></span> Grises (Ø25 mm)',
      ],
      summaryTitle: 'Orden de Montaje, Diámetros y Racores',
      summaryTabLabel: 'Tramos y Pasos',
      summaryCols: ['Paso / Tramo', 'Diámetro', 'Racores y Estanqueidad'],
      bomTitle: 'Mangueras, Racores y Abrazaderas',
      bomTabLabel: 'Mangueras y Racores',
      bomCols: ['Componente / Especificación', 'Cant.', 'Medida / Ref.'],
      summaryData: typeof PLUMBING_SUMMARY_DATA !== 'undefined' ? PLUMBING_SUMMARY_DATA : [],
      bomData: typeof PLUMBING_BOM_DATA !== 'undefined' ? PLUMBING_BOM_DATA : [],
      totalCardHtml: `
        <div>Sistema hidráulico estructurado para <strong>Mercedes-Benz Sprinter L2H2</strong> (agua limpia, presión regulada 1,5–2 bar, ACS 10L + Nordkapp Air y grises 40L).</div>
        <strong>Puntos críticos: Fiamma A20 antes del reductor · Microint. grifo libre · Sifones y venteo en grises 40L</strong>
      `,
      svgName: 'esquema-fontaneria-sprinter-l2h2.svg',
      pngName: 'esquema-fontaneria-sprinter-l2h2-HD.png',
      pdfHref: 'esquema-fontaneria-camper.pdf',
      buildFn: typeof buildPlumbingDiagram === 'function' ? buildPlumbingDiagram : buildDiagram,
    },
  };

  let activeScheme = SCHEME_CONFIG[initialScheme] ? initialScheme : 'electric';
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let activeCircuit = null;

  function applyTransform() {
    const root = document.getElementById('viewport-root');
    if (root) {
      root.setAttribute('transform', `translate(${tx}, ${ty}) scale(${scale})`);
    }
    zoomReadout.textContent = `${Math.round(scale * 100)}%`;
  }

  function fitToScreen() {
    scale = 1;
    tx = 0;
    ty = 0;
    applyTransform();
  }

  // Zoom con rueda del ratón centrado en el puntero
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = svg.getBoundingClientRect();
    const viewBoxW = 2360;
    const viewBoxH = 1380;
    const scaleFit = Math.min(rect.width / viewBoxW, rect.height / viewBoxH);
    const offsetX = (rect.width - viewBoxW * scaleFit) / 2;
    const offsetY = (rect.height - viewBoxH * scaleFit) / 2;

    const svgX = (e.clientX - rect.left - offsetX) / scaleFit;
    const svgY = (e.clientY - rect.top - offsetY) / scaleFit;

    const factor = e.deltaY < 0 ? 1.14 : 0.88;
    const nextScale = Math.min(5, Math.max(0.45, scale * factor));
    const ratio = nextScale / scale;

    tx = svgX - (svgX - tx) * ratio;
    ty = svgY - (svgY - ty) * ratio;
    scale = nextScale;
    applyTransform();
  }, { passive: false });

  // Arrastre (Pan)
  viewport.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isPanning = true;
    startX = e.clientX;
    startY = e.clientY;
    viewport.classList.add('panning');
  });

  window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    const rect = svg.getBoundingClientRect();
    const scaleFit = Math.min(rect.width / 2360, rect.height / 1380);
    const dx = (e.clientX - startX) / scaleFit;
    const dy = (e.clientY - startY) / scaleFit;
    startX = e.clientX;
    startY = e.clientY;
    tx += dx;
    ty += dy;
    applyTransform();
  });

  window.addEventListener('mouseup', () => {
    isPanning = false;
    viewport.classList.remove('panning');
  });

  document.getElementById('zoom-in').addEventListener('click', () => {
    const cx = 1180;
    const cy = 690;
    const nextScale = Math.min(5, scale * 1.25);
    const ratio = nextScale / scale;
    tx = cx - (cx - tx) * ratio;
    ty = cy - (cy - ty) * ratio;
    scale = nextScale;
    applyTransform();
  });

  document.getElementById('zoom-out').addEventListener('click', () => {
    const cx = 1180;
    const cy = 690;
    const nextScale = Math.max(0.45, scale * 0.8);
    const ratio = nextScale / scale;
    tx = cx - (cx - tx) * ratio;
    ty = cy - (cy - ty) * ratio;
    scale = nextScale;
    applyTransform();
  });

  document.getElementById('zoom-fit').addEventListener('click', fitToScreen);

  // Selección de circuito
  function selectCircuit(circuitId, labelText = '') {
    if (!circuitId || activeCircuit === circuitId) {
      activeCircuit = null;
      svg.classList.remove('has-selection');
      svg.querySelectorAll('.highlighted').forEach((n) => n.classList.remove('highlighted'));
      clearBtn.style.display = 'none';
      selectionInfo.textContent = 'Rueda del ratón: Zoom · Arrastrar: Mover · Clic en componente/cable: Resaltar tramo';
      return;
    }

    activeCircuit = circuitId;
    svg.classList.add('has-selection');
    svg.querySelectorAll('.highlighted').forEach((n) => n.classList.remove('highlighted'));

    svg.querySelectorAll('[data-circuit]').forEach((node) => {
      const list = node.getAttribute('data-circuit').split(' ');
      if (list.includes(circuitId)) {
        node.classList.add('highlighted');
      }
    });

    clearBtn.style.display = 'inline-flex';
    selectionInfo.innerHTML = `Tramo resaltado: <strong>${labelText || circuitId}</strong> (clic de nuevo para restaurar)`;
  }

  svg.addEventListener('click', (e) => {
    const target = e.target.closest('[data-circuit]');
    if (!target) {
      if (activeCircuit) selectCircuit(null);
      return;
    }
    const primary = target.getAttribute('data-circuit').split(' ')[0];
    selectCircuit(primary);
  });

  clearBtn.addEventListener('click', () => selectCircuit(null));

  // Panel lateral con pestañas dinámicas según el esquema activo
  const drawer = document.getElementById('summary-drawer');
  const drawerBody = document.getElementById('drawer-body');
  const drawerTitle = document.getElementById('drawer-title');
  const tabCircuitsBtn = document.getElementById('tab-circuits');
  const tabBomBtn = document.getElementById('tab-bom');
  let activeTab = 'circuits';

  function renderFilterButtons(cfg) {
    filterGroup.innerHTML = '';
    svg.classList.remove('filter-pos', 'filter-neg', 'filter-clean', 'filter-hot', 'filter-grey');
    cfg.filters.forEach((f, idx) => {
      const btn = document.createElement('button');
      btn.className = `btn${idx === 0 ? ' active' : ''}`;
      btn.setAttribute('data-filter', f.filter);
      btn.title = f.title;
      btn.textContent = f.label;
      btn.addEventListener('click', () => {
        filterGroup.querySelectorAll('[data-filter]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        svg.classList.remove('filter-pos', 'filter-neg', 'filter-clean', 'filter-hot', 'filter-grey');
        if (f.cls) svg.classList.add(f.cls);
      });
      filterGroup.appendChild(btn);
    });
  }

  function renderDrawerTab(tab) {
    const cfg = SCHEME_CONFIG[activeScheme];
    activeTab = tab;
    drawerBody.innerHTML = '';
    tabCircuitsBtn.textContent = cfg.summaryTabLabel;
    tabBomBtn.textContent = cfg.bomTabLabel;
    document.querySelectorAll('.tab-btn').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tab);
    });

    if (tab === 'circuits') {
      drawerTitle.textContent = cfg.summaryTitle;
      cfg.summaryData.forEach((sec) => {
        const block = document.createElement('div');
        block.className = 'summary-section';
        const h3 = document.createElement('h3');
        h3.textContent = sec.group;
        block.appendChild(h3);

        const table = document.createElement('table');
        table.className = 'summary-table';
        table.innerHTML = `<thead><tr><th>${cfg.summaryCols[0]}</th><th>${cfg.summaryCols[1]}</th><th>${cfg.summaryCols[2]}</th></tr></thead>`;
        const tbody = document.createElement('tbody');

        sec.rows.forEach((r) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${r.tramo}</td><td><span class="badge-gauge">${r.gauge}</span></td><td><span class="badge-fuse">${r.prot}</span></td>`;
          tr.addEventListener('click', () => selectCircuit(r.target, r.tramo));
          tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        block.appendChild(table);
        drawerBody.appendChild(block);
      });
      return;
    }

    drawerTitle.textContent = cfg.bomTitle;
    const totalCard = document.createElement('div');
    totalCard.className = 'cost-total-card';
    totalCard.innerHTML = cfg.totalCardHtml;
    drawerBody.appendChild(totalCard);

    cfg.bomData.forEach((sec) => {
      const block = document.createElement('div');
      block.className = 'summary-section';
      const h3 = document.createElement('h3');
      h3.textContent = sec.group;
      block.appendChild(h3);

      const table = document.createElement('table');
      table.className = 'summary-table';
      table.innerHTML = `<thead><tr><th>${cfg.bomCols[0]}</th><th>${cfg.bomCols[1]}</th><th>${cfg.bomCols[2]}</th></tr></thead>`;
      const tbody = document.createElement('tbody');

      sec.rows.forEach((r) => {
        const tr = document.createElement('tr');
        const costHtml = r.owned
          ? `<span class="badge-owned">${r.cost}</span>`
          : `<span class="badge-cost">${r.cost}</span>`;
        tr.innerHTML = `<td>${r.item}</td><td><span class="badge-gauge">${r.qty}</span></td><td>${costHtml}</td>`;
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      block.appendChild(table);
      drawerBody.appendChild(block);
    });
  }

  function switchScheme(scheme) {
    if (!SCHEME_CONFIG[scheme]) return;
    activeScheme = scheme;
    const cfg = SCHEME_CONFIG[scheme];

    document.querySelectorAll('[data-scheme]').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-scheme') === scheme);
    });
    brandBadge.textContent = cfg.badge;
    brandTitle.textContent = cfg.title;
    brandSub.textContent = cfg.sub;
    document.title = cfg.docTitle;
    exportPdf.setAttribute('href', cfg.pdfHref);

    chip1.innerHTML = cfg.chips[0];
    chip2.innerHTML = cfg.chips[1];
    chip3.innerHTML = cfg.chips[2];

    selectCircuit(null);
    cfg.buildFn();
    renderFilterButtons(cfg);
    renderDrawerTab(activeTab);
    fitToScreen();
    window.location.hash = scheme === 'plumbing' ? '#fontaneria' : '#electrico';
  }

  document.querySelectorAll('[data-scheme]').forEach((btn) => {
    btn.addEventListener('click', () => switchScheme(btn.getAttribute('data-scheme')));
  });

  switchScheme(activeScheme);

  const drawerParam = new URLSearchParams(window.location.search).get('drawer');
  if (drawerParam === 'bom' || drawerParam === 'circuits') {
    renderDrawerTab(drawerParam);
    drawer.classList.remove('collapsed');
  }

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => renderDrawerTab(btn.getAttribute('data-tab')));
  });

  document.getElementById('toggle-drawer').addEventListener('click', () => {
    if (drawer.classList.contains('collapsed') || activeTab !== 'circuits') {
      renderDrawerTab('circuits');
      drawer.classList.remove('collapsed');
    } else {
      drawer.classList.add('collapsed');
    }
  });

  document.getElementById('toggle-bom').addEventListener('click', () => {
    if (drawer.classList.contains('collapsed') || activeTab !== 'bom') {
      renderDrawerTab('bom');
      drawer.classList.remove('collapsed');
    } else {
      drawer.classList.add('collapsed');
    }
  });

  document.getElementById('close-drawer').addEventListener('click', () => {
    drawer.classList.add('collapsed');
  });

  // Exportar SVG limpio (sin zoom/pan temporal)
  function getCleanSvgMarkup() {
    const clone = svg.cloneNode(true);
    clone.classList.remove('has-selection', 'filter-pos', 'filter-neg', 'filter-clean', 'filter-hot', 'filter-grey');
    clone.querySelectorAll('.highlighted').forEach((n) => n.classList.remove('highlighted'));
    const cloneRoot = clone.getElementById('viewport-root');
    if (cloneRoot) cloneRoot.removeAttribute('transform');
    clone.setAttribute('width', '2360');
    clone.setAttribute('height', '1380');
    return new XMLSerializer().serializeToString(clone);
  }

  document.getElementById('export-svg').addEventListener('click', () => {
    const markup = getCleanSvgMarkup();
    const blob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = SCHEME_CONFIG[activeScheme].svgName;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('export-png').addEventListener('click', () => {
    const markup = getCleanSvgMarkup();
    const svgBlob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const scaleExport = 2; // 4720 x 2760 px HD
      const canvas = document.createElement('canvas');
      canvas.width = 2360 * scaleExport;
      canvas.height = 1380 * scaleExport;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      canvas.toBlob((pngBlob) => {
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = SCHEME_CONFIG[activeScheme].pngName;
        a.click();
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');
    };
    img.src = url;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('viewport')) {
    const startPlumbing = window.location.hash === '#fontaneria';
    initInteractions(startPlumbing ? 'plumbing' : 'electric');
  } else if (document.body.dataset.doc !== 'plumbing') {
    buildDiagram();
  }
});
