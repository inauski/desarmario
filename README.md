<div align="center">
  <img src="./public/icon-192.png" alt="Icono de Desarmario" width="112" height="112" />

  # Desarmario

  **Documenta el desmontaje de un mueble para volver a montarlo sin perder piezas, tornillos ni tiempo.**

  PWA móvil, en español, sin cuentas y con todos los datos guardados en el propio dispositivo.

  [Abrir la aplicación](https://desarmario.lovable.app) · [Funcionalidades](#funcionalidades) · [Instalación](#instalación-como-aplicación) · [Desarrollo](#desarrollo-local)
</div>

---

## ¿Qué es Desarmario?

Desarmario es una guía digital de taller para desmontar y volver a montar un armario u otro mueble. Permite fotografiar el estado original, catalogar piezas y herrajes, organizar bolsas y cajas, documentar las uniones y seguir los pasos de montaje en orden inverso.

Está pensada para utilizarse con una mano desde el móvil: acciones grandes, formularios breves, buen contraste y acceso rápido a la cámara.

## Funcionalidades

- **Proyecto del mueble:** nombre, descripción y fotografías del estado original.
- **Inventario completo:** piezas, bolsas de herrajes y cajas con códigos automáticos (`P-01`, `B-01`, `C-1`).
- **Alta rápida con cámara:** crea elementos sin formularios largos; las fotos se comprimen antes de guardarse.
- **Fichas detalladas:** fotos, medidas, orientación, notas, estado y ubicación de cada pieza.
- **Uniones (`U-01`, `U-02`…):** relaciona dos o más piezas, el tipo y cantidad de fijación, las fotos y la bolsa asociada.
- **Pasos ordenables:** título, descripción, fotos, herramientas, piezas afectadas y bolsas generadas; se reordenan arrastrando.
- **Modo desmontaje:** avanza paso a paso, marca lo completado y crea piezas o bolsas sin salir del flujo.
- **Modo montaje:** recorre los pasos en orden inverso e indica qué elementos necesitas y en qué caja están.
- **Herramientas:** checklist con nombre, tamaño y estado de preparación.
- **Etiquetas QR:** genera códigos para piezas, bolsas y cajas, escanea QR con la cámara e imprime hojas A4 de 21 pegatinas.
- **Documentación en PDF:** exporta un resumen del proyecto con piezas, uniones y pasos.
- **Copia de seguridad:** exporta e importa todo el proyecto en JSON, fotografías incluidas.
- **Aviso de copia:** recuerda hacer una copia cuando han pasado más de tres días desde la última.
- **Ayuda integrada:** explica el funcionamiento y enlaza con cada sección.
- **PWA instalable y offline:** puede abrirse desde la pantalla de inicio y funcionar sin conexión después de la primera carga de la versión publicada.

## Flujo de uso recomendado

1. Crea el proyecto y fotografía el mueble montado.
2. Prepara la checklist de herramientas.
3. Registra las piezas, uniones, bolsas y cajas durante el desmontaje.
4. Define y ordena los pasos mientras el proceso está fresco.
5. Imprime y pega las etiquetas QR en los elementos que necesites localizar.
6. Utiliza el modo desmontaje para seguir el trabajo y marcar cada paso como hecho.
7. Para volver a montar, abre el modo montaje y sigue los pasos en orden inverso.
8. Exporta una copia de seguridad al terminar cada sesión importante.

## Privacidad y almacenamiento

Desarmario **no utiliza cuentas, servidores de datos ni servicios de sincronización**. Toda la información se almacena localmente en el navegador mediante IndexedDB y Dexie:

- Los registros se guardan en la base de datos local del navegador.
- Las fotografías se almacenan como archivos binarios comprimidos, con un lado máximo de 1600 px y calidad JPEG de 0,7.
- No se necesitan claves de API, variables de entorno ni credenciales.
- Los datos no se envían a otros dispositivos ni se sincronizan entre navegadores.

> [!IMPORTANT]
> Borrar los datos del navegador, desinstalar la aplicación o cambiar de dispositivo puede eliminar o dejar inaccesible el proyecto. Exporta copias de seguridad periódicamente desde **Ajustes**.

### Copias de seguridad

La copia JSON contiene el proyecto, las piezas, bolsas, cajas, uniones, pasos, herramientas, contadores y fotografías.

- **Exportar:** abre **Ajustes** y descarga la copia. Guárdala en un lugar seguro y separado del teléfono.
- **Importar:** abre **Ajustes** y selecciona un archivo de copia válido.
- **Atención:** importar una copia sustituye los datos que haya actualmente en ese navegador.

Los códigos QR contienen únicamente un enlace a la ficha correspondiente, no los datos del elemento. Para abrirlos con la información disponible, utiliza el mismo navegador y dispositivo o importa antes la copia de seguridad.

## Instalación como aplicación

Abre [desarmario.lovable.app](https://desarmario.lovable.app) en un navegador compatible:

- **Android:** entra en la sección **Instalar en pantalla de inicio** y pulsa **Instalar en Android**. Si el navegador no muestra el aviso, utiliza **menú ⋮ → Instalar aplicación**.
- **iPhone o iPad:** en Safari, pulsa **Compartir → Añadir a pantalla de inicio**.
- **Ordenador:** en un navegador compatible, utiliza el icono de instalación de la barra de direcciones o la opción de instalación de Desarmario.

La instalación y el acceso a la cámara requieren una conexión segura HTTPS, excepto durante el desarrollo en `localhost`.

### Funcionamiento sin conexión

La primera visita debe realizarse con conexión para descargar la aplicación y sus recursos. Después, la versión publicada puede recargarse y utilizarse sin conexión. Los datos y las fotos ya guardados permanecen en el dispositivo.

El modo offline se activa únicamente en compilaciones de producción. No se registra en el servidor de desarrollo, dentro de marcos ni en las vistas previas de Lovable.

## Desarrollo local

### Requisitos

- [Node.js](https://nodejs.org/) 22 o superior.
- [Bun](https://bun.sh/) para instalar las dependencias y ejecutar los scripts.

### Puesta en marcha

Clona el repositorio sustituyendo la URL y el nombre por los de tu proyecto:

```bash
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
cd TU_REPOSITORIO
bun install
bun run dev
```

La terminal mostrará la dirección local para abrir la aplicación.

### Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `bun run dev` | Inicia el servidor de desarrollo. |
| `bun run build` | Genera la compilación de producción. |
| `bun run preview` | Sirve localmente la compilación de producción. |
| `bun test` | Ejecuta todas las pruebas una vez. |
| `bun run test:watch` | Ejecuta las pruebas en modo observación. |
| `bun run lint` | Revisa el código con ESLint. |
| `bun run format` | Da formato al proyecto con Prettier. |

Antes de enviar cambios:

```bash
bun test
bun run lint
bun run build
```

Para comprobar la instalación y el comportamiento offline en local, prueba la compilación de producción; el servidor de desarrollo no registra el service worker.

## Tecnologías

- [React 19](https://react.dev/) y [TypeScript](https://www.typescriptlang.org/).
- [TanStack Start](https://tanstack.com/start/latest) y TanStack Router.
- [Vite](https://vite.dev/).
- [Tailwind CSS 4](https://tailwindcss.com/).
- [Dexie](https://dexie.org/) sobre IndexedDB para la persistencia local.
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) y Workbox para instalación y uso offline.
- [dnd-kit](https://dndkit.com/) para reordenar pasos.
- [qrcode](https://github.com/soldair/node-qrcode) y [ZXing](https://github.com/zxing-js/library) para generar y leer códigos QR.
- [pdf-lib](https://pdf-lib.js.org/) para etiquetas y documentos PDF.
- [Vitest](https://vitest.dev/) y Testing Library para las pruebas.

## Estructura principal

```text
.
├── public/                     # Manifiesto, iconos y recursos públicos
├── src/
│   ├── components/             # Controles, cámara, ayuda, QR y pasos
│   ├── lib/
│   │   ├── db.ts               # Modelo local, fotos, códigos y copias
│   │   ├── pwa.ts              # Registro protegido del service worker
│   │   ├── labels-pdf.ts       # Hojas de etiquetas A4
│   │   └── project-pdf.ts      # Exportación del proyecto a PDF
│   ├── routes/                 # Pantallas de la aplicación
│   ├── styles.css              # Tokens visuales y estilos globales
│   └── test/                   # Configuración y pruebas de integración
├── vite.config.ts              # Configuración de Vite y PWA
└── vitest.config.ts            # Configuración de pruebas
```

La base de datos local contiene las colecciones `project`, `pieces`, `bags`, `boxes`, `joints`, `steps`, `tools`, `photos` y `counters`.

## Contribuir

1. Crea una rama a partir de la rama principal.
2. Haz cambios pequeños y mantiene la interfaz en español.
3. Conserva el almacenamiento local, el uso móvil con una mano y la compresión de fotografías.
4. Añade o actualiza pruebas cuando cambies una regla de funcionamiento.
5. Ejecuta las pruebas, el lint y la compilación antes de abrir una pull request.

No edites manualmente `src/routeTree.gen.ts`: TanStack Router lo genera automáticamente.

## Limitaciones conocidas

- No hay sincronización automática entre dispositivos.
- La disponibilidad del botón de instalación depende del navegador; siempre existe la opción manual del menú.
- El escáner QR necesita permiso de cámara y un navegador compatible.
- Las pegatinas impresas conservan el dominio con el que fueron generadas; si cambia la dirección publicada, conviene generarlas de nuevo.

## Licencia

Licencia pendiente de definir. Si quieres permitir el uso, la modificación o la distribución del código, añade un archivo `LICENSE` con la licencia elegida.

---

Creado con [Lovable](https://lovable.dev). La aplicación publicada está disponible en [desarmario.lovable.app](https://desarmario.lovable.app).
