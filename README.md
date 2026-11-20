# Esquemas Camper Mercedes-Benz Sprinter L2H2 — Electricidad 12V y Fontanería

Aplicación web interactiva (`HTML` + `SVG`) y dossiers imprimibles en PDF para el montaje eléctrico e hidráulico de una camper gran volumen (**Mercedes-Benz Sprinter L2H2**).

## Contenido incluido

- **⚡ Esquema Eléctrico 12V DC** ([index.html](index.html#electrico) · [dossier-impresion.html](dossier-impresion.html) · [esquema-electrico-camper-12v.pdf](esquema-electrico-camper-12v.pdf))
  - Batería auxiliar **LiFePO4 300Ah Eco-Worthy (M8)** con **MRBF 300A QUARKZMAN**, cortacorrientes **Pindex 300A** y busbars **Simangy 300A (6×M8)**.
  - Placa solar **450W** con magnetotérmico **Wengart DC 2P 25A**, combo **Eco-Worthy DC-DC + MPPT** y magnetotérmico **Jadeshay DC 1P 25A** (Boiler) en caja **QINGLEE DIN 3 módulos**.
  - **Caja Fentar 6 vías** (`Vía 1`: Claraboya + 4 zonas LED en cascada `Wago 221-413` con interruptores `RUNCCI-YUN 20A 3P LED`; `Vía 2`: Nordkapp 2kW; `Vías 3–4`: USB-C 100W; `Vía 5`: Bomba VEVOR 96W; `Vía 6`: Nevera / Reserva).
  - Tablas de taller (cables rojos/negros, anillas M8/M5/M4 y despiece de material).

- **💧 Esquema de Fontanería** ([index.html](index.html#fontaneria) · [dossier-fontaneria.html](dossier-fontaneria.html) · [esquema-fontaneria-camper.pdf](esquema-fontaneria-camper.pdf))
  - Agua limpia por gravedad (**Ø 40 mm** espiral), venteo en cuello alto (**Ø 10 mm**) y aspiración (**3/4" → 10 mm**) con llave de bola y prefiltro al depósito **Varile**.
  - Sistema de presión y regulación: **Bomba VEVOR (60 PSI / ~4 bar)** → **Vaso de expansión Fiamma A20** → **Reductor 1/2" con manómetro (1,5–2,0 bar)**.
  - ACS **Boiler Carbest CozyWater 10L (12V / 200W)** con racores `1/2"H → 10 mm` y válvula de purga/alivio, entorno térmico **Nordkapp Air 2kW** y reparto frío/caliente (**Ø 10 mm** azul/roja, abrazaderas `W4 10–16 mm`).
  - Aguas grises (**Ø 25 mm** interior liso + sifones + unión `"Y"/"T"`) hacia depósito extraplano **40 L (`99×40×10 cm`)** en bajos con venteo y llave de bola.

## Uso local

```bash
python -m http.server 8123 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:8123/` en el navegador para alternar entre **⚡ Eléctrico 12V** y **💧 Fontanería**, filtrar circuitos, consultar las tablas interactivas y exportar en `SVG`, `PNG HD` o `PDF`.
