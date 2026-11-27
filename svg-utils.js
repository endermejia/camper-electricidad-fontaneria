/**
 * Utilidades SVG compartidas para los esquemas Eléctrico 12V y Fontanería Sprinter L2H2.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

const WIRE_STYLES = {
  pos:   { cls: 'wire-pos',   stroke: '#dc2626', pillBg: '#fef2f2', pillBorder: '#dc2626', pillText: '#991b1b' },
  neg:   { cls: 'wire-neg',   stroke: '#111827', pillBg: '#f1f5f9', pillBorder: '#334155', pillText: '#0f172a' },
  phase: { cls: 'wire-phase', stroke: '#92400e', pillBg: '#fef3c7', pillBorder: '#b45309', pillText: '#78350f' },
  neutral: { cls: 'wire-neutral', stroke: '#38bdf8', pillBg: '#e0f2fe', pillBorder: '#0284c7', pillText: '#075985' },
  earth: { cls: 'wire-earth', stroke: '#15803d', pillBg: '#dcfce7', pillBorder: '#16a34a', pillText: '#166534', dashed: '7,4' },
  clean: { cls: 'wire-clean', stroke: '#0284c7', pillBg: '#e0f2fe', pillBorder: '#0284c7', pillText: '#075985' },
  hot:   { cls: 'wire-hot',   stroke: '#dc2626', pillBg: '#fef2f2', pillBorder: '#dc2626', pillText: '#991b1b' },
  grey:  { cls: 'wire-grey',  stroke: '#475569', pillBg: '#f1f5f9', pillBorder: '#475569', pillText: '#1e293b' },
  vent:  { cls: 'wire-clean', stroke: '#0d9488', pillBg: '#ccfbf1', pillBorder: '#0d9488', pillText: '#115e59', dashed: '7,4' },
};

function el(tag, attrs = {}, parent = null) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    node.setAttribute(k, String(v));
  }
  if (parent) parent.appendChild(node);
  return node;
}

function textEl(text, attrs = {}, parent = null) {
  const node = el('text', attrs, parent);
  node.textContent = text;
  return node;
}

function wireStrokeWidth(gaugeText) {
  if (!gaugeText) return 2.5;
  // Diámetros hidráulicos (mm)
  if (gaugeText.includes('Ø')) {
    if (gaugeText.includes('40')) return 8.5;
    if (gaugeText.includes('25')) return 6.2;
    return 3.6;
  }
  // Secciones eléctricas (mm²)
  if (gaugeText.includes('50')) return 8.5;
  if (gaugeText.includes('16')) return 5.5;
  if (gaugeText.includes('10')) return 4.5;
  if (gaugeText.includes('6')) return 3.6;
  if (gaugeText.includes('4')) return 3.0;
  return 2.5;
}

function drawGaugePill(parent, x, y, label, polarity = 'pos') {
  const style = WIRE_STYLES[polarity] || WIRE_STYLES.pos;
  const g = el('g', { class: 'gauge-pill' }, parent);
  const w = Math.max(54, label.length * 6.8 + 14);
  const h = 20;
  el('rect', {
    x: x - w / 2,
    y: y - h / 2,
    width: w,
    height: h,
    rx: 6,
    fill: style.pillBg,
    stroke: style.pillBorder,
    'stroke-width': 1.3,
  }, g);
  textEl(label, {
    x,
    y: y + 4,
    'text-anchor': 'middle',
    'font-size': 11,
    'font-weight': 700,
    'font-family': 'Consolas, ui-monospace, monospace',
    fill: style.pillText,
  }, g);
}

function drawWire(parent, points, { polarity = 'pos', gauge = '', labelPos = null, circuit = '', hop = null, hops = null }) {
  const style = WIRE_STYLES[polarity] || WIRE_STYLES.pos;
  const sw = wireStrokeWidth(gauge);
  const hopList = hops || (hop ? [hop] : []);

  const g = el('g', {
    class: `wire-item ${style.cls}`,
    'data-circuit': circuit,
  }, parent);

  // Construye ruta con saltos semicirculares opcionales (bridge hops) en cruces
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i - 1];
    const [x2, y2] = points[i];
    const segHops = hopList.filter((h) => h.segmentIndex === i);
    if (segHops.length > 0) {
      if (segHops[0].dir === 'horizontal') {
        const sign = x2 > x1 ? 1 : -1;
        segHops.sort((a, b) => (a.x - b.x) * sign);
        segHops.forEach((h) => {
          d += ` L ${h.x - sign * 10} ${y1} A 10 10 0 0 ${sign > 0 ? 1 : 0} ${h.x + sign * 10} ${y1}`;
        });
      } else {
        const sign = y2 > y1 ? 1 : -1;
        segHops.sort((a, b) => (a.y - b.y) * sign);
        segHops.forEach((h) => {
          d += ` L ${x1} ${h.y - sign * 10} A 10 10 0 0 ${sign > 0 ? 1 : 0} ${x1} ${h.y + sign * 10}`;
        });
      }
      d += ` L ${x2} ${y2}`;
    } else {
      d += ` L ${x2} ${y2}`;
    }
  }

  // Halo blanco sutil para legibilidad sobre rejilla y fondos
  el('path', {
    d,
    fill: 'none',
    stroke: '#ffffff',
    'stroke-width': sw + 3,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    opacity: 0.75,
  }, g);

  const pathAttrs = {
    d,
    fill: 'none',
    stroke: style.stroke,
    'stroke-width': sw,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  };
  if (style.dashed) pathAttrs['stroke-dasharray'] = style.dashed;
  el('path', pathAttrs, g);

  if (gauge && labelPos) {
    drawGaugePill(g, labelPos[0], labelPos[1], gauge, polarity);
  }
  return g;
}

function drawTerminal(parent, x, y, polarity = 'pos', label = '') {
  const style = WIRE_STYLES[polarity] || WIRE_STYLES.pos;
  const g = el('g', {}, parent);
  el('circle', {
    cx: x,
    cy: y,
    r: 7.2,
    fill: '#e2e8f0',
    stroke: style.stroke,
    'stroke-width': 2.2,
  }, g);
  el('circle', {
    cx: x,
    cy: y,
    r: 3.1,
    fill: style.stroke,
  }, g);
  if (label) {
    textEl(label, {
      x: x + (label.startsWith('IN') || label.startsWith('PV') ? 11 : -11),
      y: y + 4,
      'text-anchor': label.startsWith('IN') || label.startsWith('PV') ? 'start' : 'end',
      'font-size': 10,
      'font-weight': 700,
      fill: style.pillText,
    }, g);
  }
}

function drawProtectionBox(parent, { x, y, w, h, title, amp, sub = '', kind = 'fuse', circuit = '' }) {
  const g = el('g', { class: 'comp-item', 'data-circuit': circuit }, parent);

  el('rect', {
    x: x + 2,
    y: y + 3,
    width: w,
    height: h,
    rx: 9,
    fill: 'rgba(15, 23, 42, 0.10)',
  }, g);

  const kindStyles = {
    switch:  { bg: '#eff6ff', stroke: '#2563eb' },
    breaker: { bg: '#fff7ed', stroke: '#ea580c' },
    valve:   { bg: '#ecfeff', stroke: '#0891b2' },
    filter:  { bg: '#f0fdf4', stroke: '#16a34a' },
    trap:    { bg: '#f8fafc', stroke: '#475569' },
    fuse:    { bg: '#fefce8', stroke: '#d97706' },
  };
  const { bg, stroke } = kindStyles[kind] || kindStyles.fuse;

  el('rect', {
    x,
    y,
    width: w,
    height: h,
    rx: 9,
    fill: bg,
    stroke,
    'stroke-width': 2,
  }, g);

  const cx = x + w / 2;
  if (kind === 'fuse') {
    el('line', { x1: x + 12, y1: y + 17, x2: x + w - 12, y2: y + 17, stroke: '#b45309', 'stroke-width': 2 }, g);
    el('rect', { x: cx - 16, y: y + 11, width: 32, height: 12, rx: 3, fill: '#fde68a', stroke: '#b45309', 'stroke-width': 1.6 }, g);
  } else if (kind === 'switch') {
    el('circle', { cx: cx - 14, cy: y + 17, r: 3.5, fill: '#1d4ed8' }, g);
    el('circle', { cx: cx + 14, cy: y + 17, r: 3.5, fill: '#1d4ed8' }, g);
    el('line', { x1: cx - 14, y1: y + 17, x2: cx + 10, y2: y + 8, stroke: '#1d4ed8', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g);
  } else if (kind === 'breaker') {
    el('circle', { cx: cx - 15, cy: y + 17, r: 3.2, fill: '#c2410c' }, g);
    el('circle', { cx: cx + 15, cy: y + 17, r: 3.2, fill: '#c2410c' }, g);
    el('line', { x1: cx - 15, y1: y + 17, x2: cx + 10, y2: y + 9, stroke: '#ea580c', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g);
  } else if (kind === 'valve') {
    // Símbolo de llave de paso / válvula (doble triángulo enfrentado)
    el('polygon', { points: `${cx - 14},${y + 11} ${cx - 14},${y + 23} ${cx},${y + 17}`, fill: '#0891b2' }, g);
    el('polygon', { points: `${cx + 14},${y + 11} ${cx + 14},${y + 23} ${cx},${y + 17}`, fill: '#0891b2' }, g);
    el('line', { x1: cx, y1: y + 8, x2: cx, y2: y + 17, stroke: '#0e7490', 'stroke-width': 2 }, g);
    el('line', { x1: cx - 7, y1: y + 8, x2: cx + 7, y2: y + 8, stroke: '#0e7490', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, g);
  } else if (kind === 'filter') {
    el('rect', { x: cx - 14, y: y + 11, width: 28, height: 12, rx: 3, fill: '#dcfce7', stroke: '#15803d', 'stroke-width': 1.5 }, g);
    el('line', { x1: cx - 6, y1: y + 11, x2: cx + 6, y2: y + 23, stroke: '#15803d', 'stroke-width': 1.4, 'stroke-dasharray': '2,2' }, g);
    el('line', { x1: cx + 6, y1: y + 11, x2: cx - 6, y2: y + 23, stroke: '#15803d', 'stroke-width': 1.4, 'stroke-dasharray': '2,2' }, g);
  } else if (kind === 'trap') {
    el('path', { d: `M ${cx - 14} ${y + 12} L ${cx - 6} ${y + 12} L ${cx - 6} ${y + 21} Q ${cx} ${y + 26} ${cx + 6} ${y + 21} L ${cx + 6} ${y + 14} L ${cx + 14} ${y + 14}`, fill: 'none', stroke: '#334155', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, g);
  }

  textEl(title, {
    x: cx,
    y: y + 36,
    'text-anchor': 'middle',
    'font-size': 11,
    'font-weight': 700,
    fill: '#0f172a',
  }, g);

  const badgeW = Math.max(48, amp.length * 6.8 + 14);
  el('rect', {
    x: cx - badgeW / 2,
    y: y + 41,
    width: badgeW,
    height: 17,
    rx: 5,
    fill: stroke,
  }, g);
  textEl(amp, {
    x: cx,
    y: y + 53,
    'text-anchor': 'middle',
    'font-size': 10.2,
    'font-weight': 800,
    'font-family': 'Consolas, ui-monospace, monospace',
    fill: '#ffffff',
  }, g);

  if (sub) {
    textEl(sub, {
      x: cx,
      y: y + h + 14,
      'text-anchor': 'middle',
      'font-size': 10.2,
      'font-weight': 700,
      fill: '#b45309',
    }, g);
  }
  return g;
}

function drawGroundSymbol(parent, x, y, label, sub = '', circuit = '') {
  const g = el('g', { class: 'comp-item', 'data-circuit': circuit }, parent);
  el('line', { x1: x, y1: y, x2: x, y2: y + 14, stroke: '#0f172a', 'stroke-width': 3 }, g);
  el('line', { x1: x - 22, y1: y + 14, x2: x + 22, y2: y + 14, stroke: '#0f172a', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g);
  el('line', { x1: x - 14, y1: y + 22, x2: x + 14, y2: y + 22, stroke: '#0f172a', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
  el('line', { x1: x - 6, y1: y + 30, x2: x + 6, y2: y + 30, stroke: '#0f172a', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g);

  textEl(label, {
    x,
    y: y + 48,
    'text-anchor': 'middle',
    'font-size': 12,
    'font-weight': 800,
    fill: '#0f172a',
  }, g);

  if (sub) {
    textEl(sub, {
      x,
      y: y + 63,
      'text-anchor': 'middle',
      'font-size': 10.5,
      fill: '#475569',
    }, g);
  }
  return g;
}

function drawComponentCard(parent, { x, y, w, h, title, subtitle = '', subtitleY = null, accent = '#0284c7', fill = '#ffffff', badges = [], circuit = '' }) {
  const g = el('g', { class: 'comp-item', 'data-circuit': circuit }, parent);
  el('rect', {
    x: x + 3,
    y: y + 4,
    width: w,
    height: h,
    rx: 12,
    fill: 'rgba(15, 23, 42, 0.08)',
  }, g);
  el('rect', {
    x,
    y,
    width: w,
    height: h,
    rx: 12,
    fill,
    stroke: accent,
    'stroke-width': 2.2,
  }, g);
  el('path', {
    d: `M ${x} ${y + 12} Q ${x} ${y} ${x + 12} ${y} L ${x + w - 12} ${y} Q ${x + w} ${y} ${x + w} ${y + 12} L ${x + w} ${y + 34} L ${x} ${y + 34} Z`,
    fill: accent,
  }, g);

  textEl(title, {
    x: x + w / 2,
    y: y + 22,
    'text-anchor': 'middle',
    'font-size': 13,
    'font-weight': 700,
    fill: '#ffffff',
  }, g);

  if (subtitle) {
    textEl(subtitle, {
      x: x + w / 2,
      y: subtitleY ?? (y + 54),
      'text-anchor': 'middle',
      'font-size': 11.5,
      'font-weight': 600,
      fill: '#334155',
    }, g);
  }

  if (badges.length > 0) {
    const gap = 8;
    const widths = badges.map((b) => Math.min(w - 24, b.length * 6.0 + 14));
    const totalW = widths.reduce((a, b) => a + b, 0) + gap * (badges.length - 1);
    let bx = x + (w - totalW) / 2;
    const by = y + h - 32;
    badges.forEach((b, idx) => {
      const bw = widths[idx];
      el('rect', {
        x: bx,
        y: by,
        width: bw,
        height: 21,
        rx: 6,
        fill: '#f1f5f9',
        stroke: '#cbd5e1',
        'stroke-width': 1,
      }, g);
      textEl(b, {
        x: bx + bw / 2,
        y: by + 14,
        'text-anchor': 'middle',
        'font-size': 10,
        'font-weight': 600,
        fill: '#0f172a',
      }, g);
      bx += bw + gap;
    });
  }
  return g;
}

function drawZone(parent, { x, y, w, h, title, color, fill, border }) {
  const g = el('g', { class: 'zone-box' }, parent);
  el('rect', {
    x,
    y,
    width: w,
    height: h,
    rx: 18,
    fill,
    stroke: border,
    'stroke-width': 2.4,
  }, g);

  const pillW = title.length * 8.4 + 34;
  el('rect', {
    x: x + 20,
    y: y - 16,
    width: pillW,
    height: 32,
    rx: 10,
    fill: color,
  }, g);
  textEl(title, {
    x: x + 20 + pillW / 2,
    y: y + 5,
    'text-anchor': 'middle',
    'font-size': 12.6,
    'font-weight': 800,
    'letter-spacing': '0.04em',
    fill: '#ffffff',
  }, g);
  return g;
}

function initSvgCanvas(headerTitle) {
  const svg = document.getElementById('diagram-svg');
  svg.innerHTML = '';

  el('rect', { x: 0, y: 0, width: 2360, height: 1380, fill: '#f8fafc' }, svg);

  const defs = el('defs', {}, svg);
  const pat = el('pattern', { id: 'tech-grid', width: 28, height: 28, patternUnits: 'userSpaceOnUse' }, defs);
  el('path', { d: 'M 28 0 L 0 0 0 28', fill: 'none', stroke: '#cbd5e1', 'stroke-width': 0.6, opacity: 0.45 }, pat);
  el('rect', { x: 0, y: 0, width: 2360, height: 1380, fill: 'url(#tech-grid)' }, svg);

  const root = el('g', { id: 'viewport-root' }, svg);
  const zonesLayer = el('g', { id: 'zones-layer' }, root);
  const wiresLayer = el('g', { id: 'wires-layer' }, root);
  const compsLayer = el('g', { id: 'comps-layer' }, root);

  const hdr = el('g', {}, zonesLayer);
  el('rect', { x: 24, y: 18, width: 2312, height: 46, rx: 10, fill: '#0f172a' }, hdr);
  textEl(headerTitle, {
    x: 44, y: 46, 'font-size': 15.5, 'font-weight': 800, fill: '#f8fafc', 'letter-spacing': '0.04em',
  }, hdr);

  return { svg, hdr, zonesLayer, wiresLayer, compsLayer };
}
