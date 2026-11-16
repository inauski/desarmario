# Armario: app para desmontar y volver a montar

App en español, para móvil, sin cuentas. Todo se guarda en el propio teléfono y funciona sin conexión (una vez publicada). Botones grandes, uso con una mano, cámara siempre a un toque.

## Fase 1 (esta entrega): piezas, bolsas, cajas y alta rápida
- **Inicio**: nombre del proyecto, barra de progreso (piezas desmontadas / total), accesos grandes a Piezas, Cajas y bolsas, Alta rápida, y (deshabilitados "próximamente") Desmontaje, Montaje, Etiquetas, Herramientas.
- **Piezas**: lista con buscador por código o nombre, filtros por estado (montada / desmontada / guardada) y por caja. Ficha con fotos, medidas, orientación, notas, estado y caja donde está.
- **Alta rápida** (botón flotante de cámara en todas las pantallas): foto → código automático (P-01, B-01, C-1) → nombre → Guardar. Pestañas Pieza / Bolsa / Caja en el mismo flujo.
- **Cajas y bolsas**: listado con buscador, contenido de cada caja, y en cada pieza/bolsa se ve en qué caja está.
- **Proyecto**: nombre, descripción y fotos del armario montado.
- **Copia de seguridad**: exportar e importar un archivo con todo (fotos incluidas).
- Fotos comprimidas automáticamente al guardarlas.

## Fases siguientes
2. Uniones (piezas que une, tipo de fijación, cantidad, foto, bolsa) y herramientas con checklist.
3. Pasos: modo desmontaje con botón "Hecho" creando piezas/bolsas desde el paso; modo montaje en orden inverso con "Montado", mostrando qué piezas y bolsas necesitas y en qué caja están.
4. Etiquetas con QR imprimibles en PDF, escáner QR que abre la ficha, y exportación del proyecto completo a PDF.

## Estilo
Limpio y práctico tipo "taller": fondo claro cálido, tipografía robusta legible, acento color madera/naranja, códigos en tipografía monoespaciada grande como las pegatinas.

## Detalles técnicos
- Dexie (IndexedDB) con tablas: project, pieces, bags, boxes, joints, steps, tools; fotos como Blob en tabla photos. Acceso solo en cliente (useLiveQuery, rutas con componentes cliente).
- Códigos autogenerados por contador por tipo (P-NN, B-NN, C-N).
- Compresión con canvas (máx ~1600px, JPEG 0.7). Input `capture="environment"`.
- Rutas: /, /piezas, /piezas/$id, /bolsas/$id, /cajas, /cajas/$id, /alta, /proyecto, /ajustes (copia).
- Backup JSON con fotos en base64.
- Offline: vite-plugin-pwa (generateSW) con registro protegido que no se activa en la vista previa; manifiesto e iconos para instalar.
