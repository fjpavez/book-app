# Plan de desarrollo — Book App (iOS / multiplataforma)

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Lenguaje | TypeScript |
| UI | React Native (Expo) |
| Arquitectura | MVVM + repositorios + servicios |
| Estado global | Zustand |
| Datos remotos | TanStack Query (React Query) |
| Persistencia local | SQLite via `expo-sqlite` |
| Gestión de paquetes | npm / Expo SDK |
| ePub | `react-native-epub-view` (WebView) |
| Markdown | `react-native-markdown-display` |
| PDF | `react-native-pdf` |
| TTS | `react-native-tts` (AVSpeechSynthesizer en iOS, TTS en Android) |
| Cloud | Google Drive API · Dropbox API · Microsoft Graph (OneDrive) · fetch (WebDAV) |
| Calibre | OPDS protocol + Calibre Content Server REST API |
| Catálogos | Open Library API · Project Gutenberg API |
| Goodreads | OAuth 2 + Goodreads API (ver nota) |

---

## Arquitectura: MVVM + repositorios + servicios

```
View (componente React Native)
 └── ViewModel (hook personalizado: useLibrary, useReader, etc.)
      └── Repository (libraryRepository, annotationRepository...)
           └── Service (EpubParserService, TTSService, GoogleDriveService...)
```

- **View:** componentes React Native. Solo renderizan, no tienen lógica de negocio.
- **ViewModel:** hooks (`useLibraryViewModel`, `useReaderViewModel`) que exponen estado y acciones a la View.
- **Repository:** acceso a datos. El ViewModel no sabe si los datos vienen de SQLite, red o cache.
- **Service:** lógica técnica especializada (parsear ePub, hablar con una API, gestionar TTS).
- **Zustand:** store global para estado compartido entre pantallas (libro activo, preferencias, sesión cloud).
- **TanStack Query:** manejo de datos remotos (catálogos, cloud providers) con cache y estados de carga automáticos.

---

## Fases de desarrollo

---

### Fase 0 — Fundación del proyecto

Objetivo: proyecto compilable, arquitectura definida, sin funcionalidad de usuario aún.

- [ ] Setup del proyecto con Expo (TypeScript, bare workflow para acceso a módulos nativos)
- [ ] Configuración de ESLint, Prettier, y path aliases (`@features/`, `@domain/`, `@data/`, `@core/`)
- [ ] Estructura de carpetas:
  ```
  src/
    features/      # pantallas y ViewModels por feature
    domain/        # modelos (Book, Collection, Annotation, Bookmark)
    data/          # repositorios y servicios
    core/          # store Zustand, cliente HTTP, helpers
  ```
- [ ] Schema inicial de SQLite: tablas `books`, `collections`, `annotations`, `bookmarks`
- [ ] Store Zustand base: slices de `library`, `reader`, `settings`
- [ ] Navegación base con React Navigation (stack + bottom tabs)
- [ ] Instalación de dependencias principales: `react-native-epub-view`, `react-native-pdf`, `react-native-markdown-display`, `react-native-tts`, `expo-sqlite`, `@tanstack/react-query`, `zustand`

---

### Fase 1 — Biblioteca local

Objetivo: el usuario puede importar y organizar su biblioteca de libros en el dispositivo.

- [ ] Importación de archivos ePub, PDF y `.md` desde Files / iCloud Drive (`expo-document-picker`)
- [ ] Extracción de metadata desde ePub (título, autor, portada)
- [ ] Vista de biblioteca: grid y lista, ordenamiento por título / autor / fecha
- [ ] Colecciones manuales: crear, renombrar, eliminar, asignar libros
- [ ] Vistas "Leyendo ahora", "Por leer", "Terminados"
- [ ] Eliminación de libros de la biblioteca

---

### Fase 2 — Lectores

Objetivo: experiencia de lectura completa para los tres formatos soportados.

#### ePub
- [ ] Renderizado de capítulos via `react-native-epub-view` (WebView)
- [ ] Paginado horizontal y modo scroll vertical (switcheable)
- [ ] Persistencia de posición de lectura (CFI)

#### PDF
- [ ] Renderizado con `react-native-pdf`
- [ ] Navegación por página y modo continuo

#### Markdown
- [ ] Renderizado con `react-native-markdown-display`
- [ ] Soporte de encabezados, listas, código, tablas, énfasis, links

#### Experiencia común
- [ ] Selección de fuente (tipo y tamaño)
- [ ] Temas de color: blanco, sepia, gris oscuro, negro
- [ ] Modo nocturno automático (por horario del sistema / sensor)
- [ ] Ajuste de márgenes, interlineado y ancho de columna
- [ ] Modo focus (oculta chrome de la app)
- [ ] Tabla de contenidos navegable
- [ ] Búsqueda dentro del libro

---

### Fase 3 — Anotaciones

Objetivo: el usuario puede subrayar, comentar y gestionar sus notas dentro de cualquier libro.

- [ ] Subrayados con selección de color (5 colores)
- [ ] Notas sobre selecciones de texto
- [ ] Marcadores de página
- [ ] Panel de anotaciones agrupado por capítulo
- [ ] Búsqueda global de anotaciones en toda la biblioteca
- [ ] Exportar anotaciones de un libro a `.md` y texto plano

---

### Fase 4 — Audio (TTS)

Objetivo: cualquier libro puede escucharse usando la voz del dispositivo, con el texto resaltado en sincronía.

- [ ] Extracción de texto plano desde ePub (capítulo a capítulo)
- [ ] Extracción de texto plano desde `.md`
- [ ] Integración de `react-native-tts` con segmentación por oración
- [ ] Highlight sincronizado sobre el texto mientras se escucha (modo "karaoke")
- [ ] Controles de reproducción: play/pause, velocidad (0.5x–2x), anterior/siguiente capítulo
- [ ] Selección de voz (voces disponibles en el dispositivo)
- [ ] Persistencia de posición de audio entre sesiones
- [ ] Integración con Control Center y pantalla bloqueada (via `react-native-track-player`)

---

### Fase 5 — Sincronización cloud

Objetivo: el usuario puede importar y mantener su biblioteca sincronizada desde servicios de almacenamiento externos.

- [ ] Abstracción común: interfaz `CloudProvider` (listar, descargar, observar cambios)
- [ ] **Google Drive** — Google Drive API v3 + OAuth 2
- [ ] **Dropbox** — Dropbox API v2
- [ ] **OneDrive** — Microsoft Graph API + MSAL
- [ ] **WebDAV** — fetch + digest/basic auth (compatible con Nextcloud, ownCloud, servidores propios)
- [ ] UI de gestión de cuentas conectadas
- [ ] Descarga bajo demanda vs sincronización completa (ajustable por proveedor)

---

### Fase 6 — Integraciones externas

Objetivo: el usuario puede acceder a catálogos externos y conectar su gestor de libros.

- [ ] **Calibre Content Server** — navegación OPDS + descarga directa de libros
- [ ] **Open Library** — búsqueda por título/autor, descarga de ePub/PDF gratuitos
- [ ] **Project Gutenberg** — catálogo integrado, búsqueda y descarga
- [ ] **Goodreads** — OAuth, importar estanterías (Want to Read, Read, Currently Reading), sincronizar estado

---

### Fase 7 — Funcionalidades por definir

Estas funcionalidades se incluirán una vez que se cierre su diseño conceptual.

- [ ] **Alternativa al diccionario** — reemplazar el diccionario clásico por un enfoque propio (pendiente de definición)
- [ ] **Sistema de progreso y métricas** — diseño de un sistema de seguimiento adaptado al usuario recurrente (pendiente de definición)

---

## Secuencia recomendada

```
Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6 → Fase 7
```

Las fases 5 y 6 son independientes entre sí y pueden desarrollarse en paralelo tras completar la Fase 2.

---

## Notas de arquitectura

- **Formato de posición de lectura:** CFI (Canonical Fragment Identifier) para ePub; número de línea para `.md` y PDF.
- **Anotaciones:** almacenadas en SQLite, asociadas al libro por ID + posición CFI. Independientes del archivo fuente para sobrevivir reimportaciones.
- **TTS sobre ePub:** el texto se extrae capítulo a capítulo en tiempo real; no se genera ningún archivo de audio persistente.
- **CloudProvider:** la interfaz común permite agregar nuevos proveedores sin tocar ViewModels ni Views.
- **Goodreads API:** la API oficial está deprecada desde 2020. La integración deberá evaluarse via scraping autorizado, exportación CSV manual o servicios alternativos (OpenLibrary shelves).
- **Expo bare workflow:** necesario para módulos con código nativo (`react-native-tts`, `react-native-pdf`). Permite acceso completo a iOS y Android sin sacrificar el ecosistema Expo.
