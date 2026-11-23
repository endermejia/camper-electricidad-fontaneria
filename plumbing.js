/**
 * Esquema Hidráulico Camper — Mercedes-Benz Sprinter L2H2
 * Agua limpia, presión + expansión, ACS (Boiler Carbest 10L + Nordkapp Air) y aguas grises 40L.
 */

const PLUMBING_SUMMARY_DATA = [
  {
    group: '1. Agua Limpia y Captación (Depósito Varile)',
    rows: [
      { tramo: '1. Bocana exterior (entrada) → Pasamuros codo Varile', gauge: 'Ø 40 mm espiral', prot: '2× Abr. Inox 40–60 mm · Polímero MS en chapa', target: 'p-fill' },
      { tramo: '2. Pasamuros sup. Varile → Aireador integrado bocana', gauge: 'Ø 10 mm flexible', prot: 'Respiradero en la misma bocana · Subida sin bolsas ("U") · Abr. W4', target: 'p-vent' },
      { tramo: '3. Salida inferior 3/4"M → Llave de bola → Prefiltro', gauge: 'Ø 10 mm azul', prot: 'Adaptador 3/4"M-10mm + Teflón + Abr. W4 10–16 mm', target: 'p-suction' },
    ],
  },
  {
    group: '2. Presión, Regulación y Entorno Técnico',
    rows: [
      { tramo: '4. Bomba a presión VEVOR (60 PSI / ~4 bar)', gauge: 'Ø 10 mm azul', prot: 'Silentblocks goma · Presostato · Vía 5 (15A + Int. 3P LED)', target: 'p-pump' },
      { tramo: '5. Salida bomba → Vaso de expansión Fiamma A20', gauge: 'Ø 10 mm azul', prot: 'Lado alta (antes reductor) · Precarga ~1,5 bar · Sin ariete', target: 'p-a20' },
      { tramo: '6. Vaso A20 → Reductor 1/2" c/ manómetro y filtro', gauge: 'Ø 10 mm azul', prot: '2× Latón 1/2"-10mm + Teflón · Calibrado 1,5–2,0 bar', target: 'p-reducer' },
      { tramo: '7. Entorno técnico Nordkapp Air 2kW', gauge: 'Arcón técnico', prot: 'Calor anti-heladas · Margen > 5–10 cm de PE/tubos', target: 'p-heater' },
    ],
  },
  {
    group: '3. Boiler Carbest 10L y Distribución Consumos',
    rows: [
      { tramo: '8. Te 10 mm → Purga/Alivio → Boiler Carbest 10L IN', gauge: 'Ø 10 mm azul', prot: 'Latón 1/2"H-10mm (abajo) + Válvula alivio/purga 2,5–3 bar', target: 'p-boiler' },
      { tramo: '9. Boiler Carbest 10L OUT (sup.) → Te 10 mm caliente', gauge: 'Ø 10 mm roja', prot: 'Latón 1/2"H-10mm (arriba) · Manguera ACS · Jadeshay 25A', target: 'p-boiler' },
      { tramo: '10. Tes 10 mm → Fregadero y Ducha (gatillo + monomando)', gauge: 'Ø 10 mm azul/roja', prot: 'Abr. W4 10–16 mm · Microinterruptor grifo SIN conectar', target: 'p-taps' },
    ],
  },
  {
    group: '4. Circuito de Aguas Grises (Ø 25 mm → 40 L)',
    rows: [
      { tramo: '11. Fregadero + Ducha (codo escalonado) + Sifones', gauge: 'Ø 25 mm interior liso', prot: 'Sifón membrana seca / compacto + pendiente continua ≥ 2%', target: 'p-grey' },
      { tramo: '12. Colector "Y" (o "T") Ø 25 mm → Bajada sellada MS', gauge: 'Ø 25 mm interior liso', prot: 'Unión "Y" 45° recomendada + pasamuros 25 mm', target: 'p-grey' },
      { tramo: '13. Depósito extraplano 40L (99×40×10 cm) + Vaciado', gauge: 'Bajos Sprinter', prot: 'Pletinas acero M8 a travesaños + venteo sup. + llave bola', target: 'p-grey-tank' },
    ],
  },
];

const PLUMBING_BOM_DATA = [
  {
    group: '1. Equipos Principales del Sistema Hidráulico',
    rows: [
      { item: 'Depósito Agua Limpia Varile (polietileno, con pasamuros 40 mm y 10 mm)', qty: '1 ud', cost: 'Proyecto base', owned: true },
      { item: 'Bomba a presión VEVOR 12V (60 PSI / ~4 bar · 96W presostato automático)', qty: '1 ud', cost: '43,90 € ref.', owned: true },
      { item: 'Vaso de expansión Fiamma A20 (amortiguación a salida de bomba)', qty: '1 ud', cost: 'Proyecto base', owned: true },
      { item: 'Reductor de presión 1/2" con manómetro integrado y filtro de malla (1,5–2 bar)', qty: '1 ud', cost: 'Proyecto base', owned: true },
      { item: 'Boiler Carbest CozyWater 10L (12V / 200W · tomas 1/2")', qty: '1 ud', cost: 'Proyecto base', owned: true },
      { item: 'Calefacción estacionaria Nordkapp Air 2kW (en entorno técnico)', qty: '1 ud', cost: 'Proyecto base', owned: true },
      { item: 'Depósito extraplano aguas grises 40L (99×40×10 cm) + llave vaciado bola', qty: '1 ud', cost: 'Proyecto base', owned: true },
      { item: 'Grifería monomando fregadero + ducha con microinterruptor y alcachofa gatillo', qty: '1 kit', cost: 'Proyecto base', owned: true },
    ],
  },
  {
    group: '2. Mangueras y Tubería por Diámetros',
    rows: [
      { item: 'Manguera espiral alimentaria Ø 40 mm (bocana exterior → codo depósito Varile)', qty: '~1–1,5 m', cost: 'Ø 40 mm' },
      { item: 'Manguera flexible alimentaria AZUL Ø 10 mm (respiradero a bocana, aspiración, presión y fría)', qty: '~10–15 m', cost: 'Ø 10 mm' },
      { item: 'Manguera flexible alimentaria ROJA Ø 10 mm alta temp. (salida Boiler → grifos)', qty: '~6–10 m', cost: 'Ø 10 mm ACS' },
      { item: 'Manguera corrugada flexible Ø 25 mm interior liso (ducha/fregadero → grises 40L)', qty: '~4–6 m', cost: 'Ø 25 mm' },
    ],
  },
  {
    group: '3. Racores, Válvulas, Pasamuros y Tes',
    rows: [
      { item: 'Pasamuros codo 40 mm (llenado) + pasamuros sup. 10 mm (respiradero Varile → bocana)', qty: '2 uds', cost: '40 / 10 mm' },
      { item: 'Adaptador rosca macho 3/4" → espiga 10 mm + llave paso bola doble espiga 10 mm', qty: '1 + 1 ud', cost: 'Aspiración' },
      { item: 'Prefiltro transparente de malla 10 mm (entrada bomba) + válvula alivio/purga boiler', qty: '1 + 1 ud', cost: 'Protección' },
      { item: 'Racores latón rosca hembra 1/2" a espiga 10 mm (Boiler ×2 + Reductor ×2)', qty: '4 uds', cost: 'Latón 1/2"→10' },
      { item: 'Tes distribución Ø 10 mm (1 fría boiler + 1 fría grifos + 1 caliente grifos)', qty: '3 uds', cost: 'Ø 10 mm' },
      { item: 'Desagüe codo escalonado ducha + 2× sifones secos/compactos + pieza "Y" (o "T") Ø 25 mm + pasamuros 25 mm', qty: '1 kit', cost: 'Ø 25 mm' },
    ],
  },
  {
    group: '4. Abrazaderas, Fijación y Selladores',
    rows: [
      { item: 'Abrazaderas acero inoxidable 40–60 mm (manguera espiral Ø 40 mm)', qty: '2–4 uds', cost: 'Inox 40–60' },
      { item: 'Abrazaderas acero inoxidable W4 (rango 10–16 mm, todas las uniones de 10 mm)', qty: '20–25 uds', cost: 'Inox W4 10–16' },
      { item: 'Abrazaderas acero inoxidable 20–32 mm (desagües Ø 25 mm y pasamuros grises)', qty: '6–8 uds', cost: 'Inox 20–32' },
      { item: 'Cinta teflón PTFE / Loctite 55 (roscas 3/4" y 1/2") + Polímero MS (bocana y pasos suelo)', qty: '1 lote', cost: 'Sellado' },
      { item: 'Pletinas/cinchas acero galvanizado o inox + tornillería M8 (soporte bajos depósito 40L)', qty: '2–3 uds', cost: 'Chasis bajos' },
    ],
  },
];

function drawTeeJoint(parent, x, y, color, label) {
  const g = el('g', {}, parent);
  el('circle', { cx: x, cy: y, r: 8.5, fill: '#ffffff', stroke: color, 'stroke-width': 2.4 }, g);
  el('text', {
    x, y: y + 3.5, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 900, fill: color,
  }, g).textContent = 'T';
  if (label) {
    textEl(label, { x: x + 12, y: y - 10, 'font-size': 9.2, 'font-weight': 800, fill: color }, g);
  }
}

function buildPlumbingDiagram() {
  const { hdr, zonesLayer, wiresLayer, compsLayer } = initSvgCanvas(
    'ESQUEMA HIDRÁULICO SPRINTER L2H2 — AGUA LIMPIA, PRESIÓN (1,5–2 BAR), ACS BOILER 10L Y AGUAS GRISES 40L'
  );

  // Leyenda superior derecha
  const legendItems = [
    { label: 'Limpia / Fría (10 / 40 mm)', color: '#0284c7', kind: 'line' },
    { label: 'Caliente ACS (Roja 10 mm)', color: '#dc2626', kind: 'line' },
    { label: 'Grises Ø25 / Venteo', color: '#475569', kind: 'line' },
    { label: 'Ø Diámetro', kind: '#ffffff', kind: 'pill' },
    { label: 'Racor / Llave', color: '#0891b2', kind: 'ring' },
  ];
  let lx = 1235;
  legendItems.forEach((item) => {
    if (item.kind === 'line') {
      el('line', { x1: lx, y1: 41, x2: lx + 24, y2: 41, stroke: item.color, 'stroke-width': 4, 'stroke-linecap': 'round' }, hdr);
    } else if (item.kind === 'pill') {
      el('rect', { x: lx, y: 31, width: 24, height: 18, rx: 4, fill: '#f8fafc', stroke: '#94a3b8' }, hdr);
      textEl('Ø', { x: lx + 12, y: 44, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#0f172a' }, hdr);
    } else {
      el('circle', { cx: lx + 12, cy: 41, r: 6.5, fill: '#e2e8f0', stroke: '#0891b2', 'stroke-width': 2.2 }, hdr);
    }
    textEl(item.label, { x: lx + 30, y: 45, 'font-size': 11, 'font-weight': 600, fill: '#e2e8f0' }, hdr);
    lx += item.label.length * 6.3 + 52;
  });

  // =========================================================================
  // CONTENEDORES DE LAS 4 ZONAS HIDRÁULICAS
  // =========================================================================
  drawZone(zonesLayer, {
    x: 24, y: 78, w: 540, h: 1268,
    title: '1. AGUA LIMPIA, LLENADO Y RESPIRADERO',
    color: '#0369a1',
    fill: 'rgba(224, 242, 254, 0.35)',
    border: '#38bdf8',
  });
  drawZone(zonesLayer, {
    x: 584, y: 78, w: 560, h: 1268,
    title: '2. PRESIÓN, FIAMMA A20 Y NORDKAPP',
    color: '#d97706',
    fill: 'rgba(254, 249, 195, 0.35)',
    border: '#fbbf24',
  });
  drawZone(zonesLayer, {
    x: 1164, y: 78, w: 616, h: 1268,
    title: '3. BOILER CARBEST 10L Y REPARTO 10 MM',
    color: '#059669',
    fill: 'rgba(236, 253, 245, 0.38)',
    border: '#34d399',
  });
  drawZone(zonesLayer, {
    x: 1800, y: 78, w: 536, h: 1268,
    title: '4. CONSUMOS Y AGUAS GRISES (Ø 25 MM)',
    color: '#334155',
    fill: 'rgba(241, 245, 249, 0.55)',
    border: '#94a3b8',
  });

  // =========================================================================
  // ZONA 1: BOCANA DOBLE (ENTRADA + AIREADOR), DEPÓSITO VARILE Y ASPIRACIÓN
  // =========================================================================
  const bocanaCard = drawComponentCard(compsLayer, {
    x: 74, y: 118, w: 440, h: 146,
    title: 'Bocana Exterior (Llenado + Aireador)',
    subtitle: 'Tapón con llave · Entrada agua + respiradero integrados',
    subtitleY: 174,
    accent: '#0369a1',
    badges: ['Entrada Ø 40 mm', 'Aireador Ø 10 mm', 'Sellado MS'],
    circuit: 'p-fill p-vent',
  });
  textEl('↓ Toma llenado Ø 40 mm', { x: 172, y: 212, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#0369a1' }, bocanaCard);
  textEl('↑ Aireador integrado Ø 10 mm', { x: 416, y: 212, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#0f766e' }, bocanaCard);

  // Tubería Ø 40 mm espiral: Bocana (entrada) -> Depósito Varile
  drawWire(wiresLayer, [[172, 264], [172, 384]], {
    polarity: 'clean',
    gauge: 'Ø 40 mm espiral',
    labelPos: [172, 324],
    circuit: 'p-fill',
  });
  textEl('↓ Gravedad · Sin bolsa', { x: 186, y: 292, 'text-anchor': 'start', 'font-size': 9.4, 'font-weight': 700, fill: '#0369a1' }, wiresLayer);
  textEl('2× Abr. Inox 40–60 mm', { x: 186, y: 360, 'text-anchor': 'start', 'font-size': 9.4, 'font-weight': 700, fill: '#0369a1' }, wiresLayer);

  // Respiradero Ø 10 mm: Pasamuros superior Varile -> Aireador integrado en la misma bocana
  drawWire(wiresLayer, [[416, 384], [416, 264]], {
    polarity: 'vent',
    gauge: 'Ø 10 mm',
    labelPos: [416, 324],
    circuit: 'p-vent',
  });
  textEl('↑ Retorno aire', { x: 402, y: 292, 'text-anchor': 'end', 'font-size': 9.4, 'font-weight': 700, fill: '#0f766e' }, wiresLayer);
  textEl('Abr. W4 · Sin "U"', { x: 402, y: 360, 'text-anchor': 'end', 'font-size': 9.4, 'font-weight': 700, fill: '#0f766e' }, wiresLayer);

  // Depósito Varile de polietileno
  const varileCard = drawComponentCard(compsLayer, {
    x: 74, y: 384, w: 440, h: 266,
    title: 'Depósito Agua Limpia Varile',
    subtitle: 'Polietileno alimentario · Sujeción firme chasis',
    subtitleY: 434,
    accent: '#0284c7',
    badges: ['Codo 40 mm', 'Respiradero 10 mm', 'Toma 3/4"M'],
    circuit: 'p-fill p-vent p-suction',
  });
  // Gráfico agua interior Varile
  el('rect', { x: 98, y: 450, width: 392, height: 150, rx: 10, fill: '#e0f2fe', stroke: '#38bdf8', 'stroke-width': 1.5 }, varileCard);
  el('path', {
    d: 'M 98 506 Q 163 492 228 506 T 359 506 T 490 506 L 490 600 L 98 600 Z',
    fill: 'rgba(2, 132, 199, 0.25)',
  }, varileCard);
  textEl('Pasamuros codo 40 mm ↑', { x: 172, y: 472, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#0369a1' }, varileCard);
  textEl('Pasamuros sup. 10 mm ↑', { x: 416, y: 472, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#0f766e' }, varileCard);
  textEl('Salida inf. 3/4"M → espiga 10 mm (Teflón) ↓', { x: 294, y: 586, 'text-anchor': 'middle', 'font-size': 10.2, 'font-weight': 800, fill: '#075985' }, varileCard);

  // Aspiración: Salida Varile -> Llave de bola 10 mm -> Prefiltro -> Bomba
  drawWire(wiresLayer, [[294, 650], [294, 908], [626, 908]], {
    polarity: 'clean',
    gauge: 'Ø 10 mm',
    labelPos: [458, 908],
    circuit: 'p-suction',
  });
  drawProtectionBox(compsLayer, {
    x: 199, y: 686, w: 190, h: 66,
    title: 'Llave Bola 10 mm',
    amp: 'Aislamiento depósito',
    kind: 'valve',
    circuit: 'p-suction',
  });
  drawProtectionBox(compsLayer, {
    x: 199, y: 788, w: 190, h: 66,
    title: 'Prefiltro Malla 10 mm',
    amp: 'Protege diafragma',
    sub: 'Abr. W4 (10–16 mm)',
    kind: 'filter',
    circuit: 'p-suction',
  });

  // Cuadro Notas Llenado, Aireador Integrado y Aspiración (abajo Zona 1)
  const fillNotesG = el('g', { class: 'comp-item', 'data-circuit': 'p-fill p-vent p-suction' }, compsLayer);
  el('rect', { x: 56, y: 1030, width: 476, height: 274, rx: 12, fill: '#ffffff', stroke: '#0284c7', 'stroke-width': 2 }, fillNotesG);
  el('rect', { x: 56, y: 1030, width: 476, height: 32, rx: 10, fill: '#0369a1' }, fillNotesG);
  textEl('BOCANA DOBLE (LLENADO + AIREADOR) Y ASPIRACIÓN', {
    x: 294, y: 1051, 'text-anchor': 'middle', 'font-size': 10.8, 'font-weight': 800, fill: '#ffffff',
  }, fillNotesG);
  [
    '1. Respiradero integrado en la misma bocana:',
    '   El tubo Ø 10 mm sube del pasamuros superior del Varile directo',
    '   al aireador de la bocana (no requiere taladrar el suelo).',
    '2. Trazado continuo sin bolsas ("U") ni contrapendientes:',
    '   Caída continua en Ø 40 mm y subida continua en Ø 10 mm para',
    '   que el aire salga libremente al repostar sin escupir agua.',
    '3. Sellado y fijación mecánica:',
    '   Bocana sellada a chapa con polímero MS · Abr. Inox 40–60 y W4.',
    '   Salida inferior 3/4"M con Teflón/Loctite 55 sin forzar el PE.',
  ].forEach((txt, idx) => {
    const isHdr = txt.startsWith('1.') || txt.startsWith('2.') || txt.startsWith('3.');
    textEl(txt, {
      x: 74,
      y: 1084 + idx * 24,
      'font-size': isHdr ? 10.4 : 9.8,
      'font-weight': isHdr ? 800 : 600,
      fill: isHdr ? '#075985' : '#334155',
    }, fillNotesG);
  });

  // =========================================================================
  // ZONA 2: PRESIÓN (VEVOR -> FIAMMA A20 -> REDUCTOR 1/2") + NORDKAPP
  // =========================================================================
  const pumpCard = drawComponentCard(compsLayer, {
    x: 626, y: 805, w: 280, h: 155,
    title: 'Bomba Presión VEVOR 12V',
    subtitle: '60 PSI (~4 bar) · 96W (Vía 5)',
    subtitleY: 880,
    accent: '#0284c7',
    badges: ['Presostato auto', 'Silentblocks goma'],
    circuit: 'p-pump',
  });
  textEl('← IN 10 mm', { x: 638, y: 912, 'font-size': 10, 'font-weight': 800, fill: '#0369a1' }, pumpCard);
  textEl('OUT ↑', { x: 766, y: 856, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#0369a1' }, pumpCard);

  // Bomba OUT -> Fiamma A20
  drawWire(wiresLayer, [[766, 805], [766, 660]], {
    polarity: 'clean',
    gauge: 'Ø 10 mm',
    labelPos: [766, 734],
    circuit: 'p-pump p-a20',
  });

  const a20Card = drawComponentCard(compsLayer, {
    x: 626, y: 485, w: 280, h: 175,
    title: 'Vaso Expansión Fiamma A20',
    subtitle: 'A salida de bomba (lado alta 4 bar)',
    subtitleY: 540,
    accent: '#d97706',
    badges: ['Sin golpe ariete', 'Precarga ~1,5 bar'],
    circuit: 'p-a20',
  });
  textEl('Suaviza caudal y evita ciclados', { x: 766, y: 566, 'text-anchor': 'middle', 'font-size': 10.2, 'font-weight': 600, fill: '#92400e' }, a20Card);
  textEl('Válvula aire sup. · Abr. W4 10–16', { x: 766, y: 590, 'text-anchor': 'middle', 'font-size': 9.6, 'font-weight': 700, fill: '#475569' }, a20Card);

  // Fiamma A20 -> Reductor de presión 1/2"
  drawWire(wiresLayer, [[766, 485], [766, 345]], {
    polarity: 'clean',
    gauge: 'Ø 10 mm',
    labelPos: [766, 415],
    circuit: 'p-a20 p-reducer',
  });

  const reducerCard = drawComponentCard(compsLayer, {
    x: 626, y: 145, w: 280, h: 200,
    title: 'Reductor Presión 1/2"',
    subtitle: 'Manómetro + Filtro de malla',
    subtitleY: 202,
    accent: '#059669',
    badges: ['Calibrado 1,5–2 bar', 'Latón 1/2"→10 mm'],
    circuit: 'p-reducer',
  });
  textEl('2× Racores latón + Teflón', { x: 766, y: 230, 'text-anchor': 'middle', 'font-size': 10.2, 'font-weight': 700, fill: '#065f46' }, reducerCard);
  textEl('Protege Boiler 10L y grifería', { x: 766, y: 254, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 600, fill: '#334155' }, reducerCard);
  textEl('OUT Regulada (1,5–2 bar) →', { x: 894, y: 286, 'text-anchor': 'end', 'font-size': 9.8, 'font-weight': 800, fill: '#0284c7' }, reducerCard);

  // Tarjeta lateral orden hidráulico en Zona 2
  const orderG = el('g', { class: 'comp-item', 'data-circuit': 'p-pump p-a20 p-reducer' }, compsLayer);
  el('rect', { x: 928, y: 400, width: 194, height: 220, rx: 10, fill: '#ffffff', stroke: '#f59e0b', 'stroke-width': 1.8 }, orderG);
  el('rect', { x: 928, y: 400, width: 194, height: 30, rx: 8, fill: '#d97706' }, orderG);
  textEl('ORDEN OBLIGATORIO', { x: 1025, y: 420, 'text-anchor': 'middle', 'font-size': 10.8, 'font-weight': 800, fill: '#ffffff' }, orderG);
  [
    '1º Bomba VEVOR (~4 bar)',
    '2º Vaso Fiamma A20',
    '   (absorbe pulsos bomba)',
    '3º Reductor 1/2" c/ filtro',
    '   (baja a 1,5–2,0 bar)',
    '4º Boiler + Consumos',
    '• Manguera curva ~25 cm',
    '  en entrada/salida bomba',
  ].forEach((line, li) => {
    textEl(line, { x: 940, y: 452 + li * 20, 'font-size': 9.6, 'font-weight': li % 2 === 0 ? 700 : 600, fill: '#334155' }, orderG);
  });

  // Entorno Técnico: Calefacción Estacionaria Nordkapp Air 2kW (abajo Zona 2)
  const heaterG = el('g', { class: 'comp-item', 'data-circuit': 'p-heater' }, compsLayer);
  el('rect', {
    x: 616, y: 1030, width: 496, height: 274, rx: 14,
    fill: '#fff7ed', stroke: '#ea580c', 'stroke-width': 2.2, 'stroke-dasharray': '7,4',
  }, heaterG);
  el('rect', { x: 644, y: 1016, width: 440, height: 26, rx: 8, fill: '#ea580c' }, heaterG);
  textEl('ENTORNO TÉCNICO · CALEFACCIÓN NORDKAPP AIR 2KW', {
    x: 864, y: 1033, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: '#ffffff',
  }, heaterG);
  [
    '• Ubicada en el mismo arcón técnico para evitar heladas en depósito, A20 y mangueras 10 mm.',
    '• Mantener margen térmico > 5–10 cm entre tobera aire caliente y polietileno/tubos.',
    '• Chapa base sellada al suelo: escape, admisión y línea gasoil 100% hacia bajos Sprinter.',
    '• Alimentación eléctrica 12V desde Caja Fentar Vía 2 (Fusible 20A · Cable 4 mm²).',
  ].forEach((t, ti) => {
    textEl(t, { x: 634, y: 1080 + ti * 28, 'font-size': 10.6, 'font-weight': 600, fill: '#7c2d12' }, heaterG);
  });
  el('rect', { x: 634, y: 1212, width: 460, height: 68, rx: 8, fill: '#ffffff', stroke: '#fdba74', 'stroke-width': 1.4 }, heaterG);
  textEl('Consejo de distribución física en Sprinter L2H2:', { x: 648, y: 1234, 'font-size': 10.5, 'font-weight': 800, fill: '#9a3412' }, heaterG);
  textEl('Mantén la electrónica (MPPT/Booster/Fentar) en plano superior o separado del circuito de agua.', { x: 648, y: 1256, 'font-size': 9.8, 'font-weight': 600, fill: '#475569' }, heaterG);

  // =========================================================================
  // ZONA 3: BOILER CARBEST COZYWATER 10L Y REPARTO (AZUL FRÍA / ROJA CALIENTE)
  // =========================================================================
  // Salida Reductor -> Te #1 Fría (1246, 210) -> Te #2 Fría (1570, 210)
  drawWire(wiresLayer, [[906, 210], [1570, 210]], {
    polarity: 'clean',
    gauge: 'Ø 10 mm Azul',
    labelPos: [1042, 210],
    circuit: 'p-reducer p-boiler p-taps',
  });
  textEl('1,5 – 2,0 bar regulados', { x: 1042, y: 234, 'text-anchor': 'middle', 'font-size': 9.6, 'font-weight': 800, fill: '#059669' }, wiresLayer);

  // Rama Fría Te #2 -> Fregadero (arriba) y Ducha (abajo)
  drawWire(wiresLayer, [[1570, 210], [1850, 210]], {
    polarity: 'clean',
    gauge: 'Ø 10 mm Azul',
    labelPos: [1710, 192],
    circuit: 'p-taps',
  });
  drawWire(wiresLayer, [[1570, 210], [1570, 515], [1850, 515]], {
    polarity: 'clean',
    gauge: 'Ø 10 mm Azul',
    labelPos: [1710, 495],
    circuit: 'p-taps',
  });

  // Bajada Te #1 Fría -> Purga/Alivio -> Boiler IN (inferior)
  drawWire(wiresLayer, [[1246, 210], [1246, 650], [1300, 650]], {
    polarity: 'clean',
    gauge: 'Ø 10 mm Azul',
    labelPos: [1246, 310],
    circuit: 'p-boiler',
  });
  drawProtectionBox(compsLayer, {
    x: 1180, y: 392, w: 132, h: 64,
    title: 'Purga / Alivio',
    amp: '2,5–3 bar + Vac.',
    kind: 'valve',
    circuit: 'p-boiler',
  });
  drawWire(wiresLayer, [[1246, 456], [1202, 456], [1202, 855]], {
    polarity: 'vent',
    gauge: 'Ø 10 mm',
    labelPos: [1202, 745],
    circuit: 'p-boiler',
  });
  textEl('Alivio dilatación / vaciado → Bajos', { x: 1260, y: 882, 'text-anchor': 'middle', 'font-size': 9.4, 'font-weight': 700, fill: '#0f766e' }, wiresLayer);

  // Boiler Carbest CozyWater 10L (12V / 200W)
  const boilerCard = drawComponentCard(compsLayer, {
    x: 1300, y: 490, w: 250, h: 225,
    title: 'Boiler Carbest CozyWater 10L',
    subtitle: '12V / 200W · Jadeshay 25A',
    subtitleY: 544,
    accent: '#0284c7',
    badges: ['Nunca encender en seco', 'Sellar 2× 1/2"H'],
    circuit: 'p-boiler',
  });
  textEl('OUT Caliente (Sup.) ↑', { x: 1425, y: 568, 'text-anchor': 'middle', 'font-size': 10.2, 'font-weight': 800, fill: '#dc2626' }, boilerCard);
  textEl('Racor latón 1/2"H → 10 mm (Teflón)', { x: 1425, y: 590, 'text-anchor': 'middle', 'font-size': 9.4, 'font-weight': 700, fill: '#334155' }, boilerCard);
  textEl('← IN Fría (Inf.) · 1/2"H → 10 mm', { x: 1312, y: 654, 'font-size': 9.8, 'font-weight': 800, fill: '#0284c7' }, boilerCard);

  // Salida Caliente Boiler (ROJA 10 mm) -> hop sobre Fría vertical (1570) -> Te #3 (1625, 355)
  drawWire(wiresLayer, [[1425, 490], [1425, 355], [1625, 355]], {
    polarity: 'hot',
    gauge: 'Ø 10 mm Roja',
    labelPos: [1488, 355],
    circuit: 'p-boiler p-taps',
    hop: { segmentIndex: 2, dir: 'horizontal', x: 1570 },
  });

  // Rama Caliente Te #3 -> Fregadero (250) y Ducha (555)
  drawWire(wiresLayer, [[1625, 355], [1625, 250], [1850, 250]], {
    polarity: 'hot',
    gauge: 'Ø 10 mm Roja',
    labelPos: [1710, 268],
    circuit: 'p-taps',
  });
  drawWire(wiresLayer, [[1625, 355], [1625, 555], [1850, 555]], {
    polarity: 'hot',
    gauge: 'Ø 10 mm Roja',
    labelPos: [1710, 574],
    circuit: 'p-taps',
    hop: { segmentIndex: 1, dir: 'vertical', y: 515 },
  });

  drawTeeJoint(compsLayer, 1246, 210, '#0284c7', 'Te 10 mm');
  drawTeeJoint(compsLayer, 1570, 210, '#0284c7', 'Te 10 mm');
  drawTeeJoint(compsLayer, 1625, 355, '#dc2626', 'Te 10 mm');

  // Cuadro Notas Grifos / Microinterruptor / Abrazaderas (abajo Zona 3)
  const tapNotesG = el('g', { class: 'comp-item', 'data-circuit': 'p-taps p-pump' }, compsLayer);
  el('rect', { x: 1196, y: 970, width: 552, height: 320, rx: 12, fill: '#ffffff', stroke: '#059669', 'stroke-width': 2 }, tapNotesG);
  el('rect', { x: 1196, y: 970, width: 552, height: 32, rx: 10, fill: '#059669' }, tapNotesG);
  textEl('CONTROL DE GRIFERÍA, MICROINTERRUPTOR Y ESTANQUEIDAD', {
    x: 1472, y: 991, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: '#ffffff',
  }, tapNotesG);
  [
    '1. Grifo con microinterruptor + Bomba VEVOR presostato:',
    '   NO conectar el microinterruptor a la bomba (96W / 8A lo quemaría).',
    '   Deja sus 2 cables aislados sin uso; manda el presostato + Int. Vía 5.',
    '2. Alcachofa de ducha con gatillo:',
    '   Al cerrar solo el gatillo la manguera queda a 1,5–2 bar. Cierra siempre',
    '   el monomando (y/o apaga el Int. Vía 5) al terminar de ducharte.',
    '3. Abrazaderas y sellado ACS:',
    '   Todas las espigas de 10 mm llevan abrazaderas Inox W4 (10–16 mm).',
    '   En Boiler y Reductor: racores latón 1/2"H-10 mm con Teflón/Loctite 55.',
  ].forEach((txt, idx) => {
    const isHdr = txt.startsWith('1.') || txt.startsWith('2.') || txt.startsWith('3.');
    textEl(txt, {
      x: 1216,
      y: 1028 + idx * 27,
      'font-size': isHdr ? 10.6 : 10,
      'font-weight': isHdr ? 800 : 600,
      fill: isHdr ? '#065f46' : '#334155',
    }, tapNotesG);
  });

  // =========================================================================
  // ZONA 4: FREGADERO, DUCHA Y AGUAS GRISES (Ø 25 MM -> DEPÓSITO 40 L)
  // =========================================================================
  const sinkCard = drawComponentCard(compsLayer, {
    x: 1850, y: 155, w: 320, h: 135,
    title: 'Fregadero (Grifo Monomando)',
    subtitle: 'Fría Azul + Caliente Roja (10 mm)',
    subtitleY: 208,
    accent: '#0369a1',
    badges: ['Abr. W4 10–16', 'Desagüe Ø 25 mm'],
    circuit: 'p-taps p-grey',
  });
  textEl('← Fría', { x: 1862, y: 214, 'font-size': 9.8, 'font-weight': 800, fill: '#0284c7' }, sinkCard);
  textEl('← Caliente', { x: 1862, y: 254, 'font-size': 9.8, 'font-weight': 800, fill: '#dc2626' }, sinkCard);

  const showerCard = drawComponentCard(compsLayer, {
    x: 1850, y: 465, w: 320, h: 140,
    title: 'Ducha (Monomando + Gatillo)',
    subtitle: 'Plato de ducha · Desagüe codo escalonado',
    subtitleY: 518,
    accent: '#0284c7',
    badges: ['Microint. libre', 'Codo Ø 25 mm'],
    circuit: 'p-taps p-grey',
  });
  textEl('← Fría', { x: 1862, y: 519, 'font-size': 9.8, 'font-weight': 800, fill: '#0284c7' }, showerCard);
  textEl('← Caliente', { x: 1862, y: 559, 'font-size': 9.8, 'font-weight': 800, fill: '#dc2626' }, showerCard);

  // Desagüe Fregadero -> Sifón -> Colector Ø 25 mm -> Unión Y (2125, 755)
  drawWire(wiresLayer, [[2010, 290], [2010, 405], [2235, 405], [2235, 755], [2125, 755]], {
    polarity: 'grey',
    gauge: 'Ø 25 mm Liso',
    labelPos: [2235, 580],
    circuit: 'p-grey',
  });
  drawProtectionBox(compsLayer, {
    x: 1930, y: 318, w: 160, h: 52,
    title: 'Sifón Fregadero',
    amp: 'Membrana seca',
    kind: 'trap',
    circuit: 'p-grey',
  });

  // Desagüe Ducha (codo escalonado) -> Sifón -> Unión Y (2125, 766)
  drawWire(wiresLayer, [[2010, 605], [2010, 766], [2125, 766]], {
    polarity: 'grey',
    gauge: 'Ø 25 mm',
    labelPos: [2010, 722],
    circuit: 'p-grey',
  });
  drawProtectionBox(compsLayer, {
    x: 1900, y: 636, w: 220, h: 56,
    title: 'Codo Escalonado + Sifón',
    amp: 'Corte a Ø 25 mm',
    kind: 'trap',
    circuit: 'p-grey',
  });

  // Bajada Unión "Y" / "T" Ø 25 mm -> Pasamuros 25 mm -> Depósito Grises 40L
  drawWire(wiresLayer, [[2125, 766], [2125, 905]], {
    polarity: 'grey',
    gauge: 'Ø 25 mm Liso',
    labelPos: [2125, 838],
    circuit: 'p-grey p-grey-tank',
  });
  drawProtectionBox(compsLayer, {
    x: 2050, y: 738, w: 150, h: 56,
    title: 'Unión "Y" / "T"',
    amp: 'Ø 25 mm (45° rec.)',
    kind: 'valve',
    circuit: 'p-grey',
  });
  textEl('Pendiente ≥ 2% · Sin panzas', {
    x: 2108, y: 873, 'text-anchor': 'end', 'font-size': 9.2, 'font-weight': 700, fill: '#475569',
  }, wiresLayer);
  textEl('Pasachapas sellado MS', {
    x: 2108, y: 887, 'text-anchor': 'end', 'font-size': 9.2, 'font-weight': 700, fill: '#475569',
  }, wiresLayer);

  // Depósito Extraplano Aguas Grises 40 L (99 x 40 x 10 cm) en bajos
  const greyTank = drawComponentCard(compsLayer, {
    x: 1840, y: 905, w: 460, h: 185,
    title: 'Depósito Extraplano Aguas Grises 40L',
    subtitle: '99 × 40 × 10 cm · Instalado en bajos Sprinter L2H2',
    subtitleY: 960,
    accent: '#334155',
    badges: ['Pasamuros 25 mm', 'Pletinas acero M8', '40 kg dinámicos'],
    circuit: 'p-grey-tank',
  });
  el('rect', { x: 1868, y: 976, width: 404, height: 64, rx: 8, fill: '#e2e8f0', stroke: '#64748b', 'stroke-width': 1.4 }, greyTank);
  textEl('Entrada Ø 25 mm (Pasamuros + Abr. 20–32) ↑', { x: 2070, y: 998, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#1e293b' }, greyTank);
  textEl('Sujeto a travesaños estructurales (no a chapa fina) · Alejado del escape', { x: 2070, y: 1022, 'text-anchor': 'middle', 'font-size': 9.4, 'font-weight': 600, fill: '#475569' }, greyTank);

  // Venteo/Rebosadero superior depósito 40L (crucial en 10 cm alto)
  drawWire(wiresLayer, [[2264, 905], [2264, 872], [2308, 872], [2308, 1135], [2248, 1135]], {
    polarity: 'vent',
    gauge: 'Ø 10–12 mm',
    labelPos: [2248, 1135],
    circuit: 'p-grey-tank',
  });
  textEl('Venteo / Rebosadero', { x: 2248, y: 1160, 'text-anchor': 'middle', 'font-size': 9.2, 'font-weight': 700, fill: '#0f766e' }, wiresLayer);

  // Válvula vaciado inferior llave de bola
  drawWire(wiresLayer, [[2040, 1090], [2040, 1185]], {
    polarity: 'grey',
    gauge: 'Ø 25 mm',
    circuit: 'p-grey-tank',
  });
  drawProtectionBox(compsLayer, {
    x: 1924, y: 1185, w: 232, h: 64,
    title: 'Válvula Bola Vaciado',
    amp: 'Acceso lateral bajos',
    sub: 'Protegida sobre línea mínima chasis',
    kind: 'valve',
    circuit: 'p-grey-tank',
  });

  // Puntos de conexión clave (racores / uniones)
  [
    [172, 264, 'clean'], [416, 264, 'vent'], [172, 384, 'clean'], [416, 384, 'vent'], [294, 650, 'clean'],
    [626, 908, 'clean'], [766, 805, 'clean'], [766, 660, 'clean'], [766, 485, 'clean'], [766, 345, 'clean'], [906, 210, 'clean'],
    [1300, 650, 'clean'], [1425, 490, 'hot'],
    [1850, 210, 'clean'], [1850, 250, 'hot'], [1850, 515, 'clean'], [1850, 555, 'hot'],
    [2010, 290, 'grey'], [2010, 605, 'grey'], [2125, 905, 'grey'], [2040, 1090, 'grey'],
  ].forEach(([tx, ty, pol]) => drawTerminal(compsLayer, tx, ty, pol));
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.doc === 'plumbing') {
    buildPlumbingDiagram();
  }
});
