# Plan de desarrollo — Book App (iOS)

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Lenguaje | Swift |
| UI | SwiftUI |
| Arquitectura | MVVM + repositorios |
| Persistencia local | SwiftData |
| Gestión de paquetes | Swift Package Manager (SPM) |
| ePub | EPUBKit (SPM) |
| Markdown | swift-markdown (Apple, SPM) |
| PDF | PDFKit (nativo iOS) |
| TTS | AVSpeechSynthesizer (nativo iOS) |
| Cloud | Google Drive API · Dropbox SDK · Microsoft Graph (OneDrive) · URLSession (WebDAV) |
| Calibre | OPDS protocol + Calibre Content Server REST API |
| Catálogos | Open Library API · Project Gutenberg API |
| Goodreads | OAuth 2 + Goodreads API |

---

## Fases de desarrollo

---

### Fase 0 — Fundación del proyecto

Objetivo: proyecto compilable, arquitectura definida, sin funcionalidad de usuario aún.

- [ ] Setup del proyecto Xcode (SwiftUI, iOS 17+, targets, schemes Debug/Release)
- [ ] Definición de arquitectura: MVVM + capa de repositorios + capa de servicios
- [ ] Estructura de carpetas (`Features/`, `Domain/`, `Data/`, `Core/`)
- [ ] Schema inicial de SwiftData: `Book`, `Collection`, `Annotation`, `Bookmark`
- [ ] Integración de dependencias via SPM: EPUBKit, swift-markdown

---

### Fase 1 — Biblioteca local

Objetivo: el usuario puede importar y organizar su biblioteca de libros en el dispositivo.

- [ ] Importación de archivos ePub, PDF y `.md` desde Files / iCloud Drive
- [ ] Extracción de metadata desde ePub (título, autor, portada)
- [ ] Vista de biblioteca: grid y lista, ordenamiento por título / autor / fecha
- [ ] Colecciones manuales: crear, renombrar, eliminar, asignar libros
- [ ] Vistas "Leyendo ahora", "Por leer", "Terminados"
- [ ] Eliminación de libros de la biblioteca

---

### Fase 2 — Lectores

Objetivo: experiencia de lectura completa para los tres formatos soportados.

#### ePub
- [ ] Renderizado de capítulos con WKWebView gestionado por SwiftUI
- [ ] Paginado horizontal y modo scroll vertical (switcheable)
- [ ] Persistencia de posición de lectura (CFI)

#### PDF
- [ ] Renderizado con PDFKit
- [ ] Navegación por página y modo continuo

#### Markdown
- [ ] Renderizado nativo con swift-markdown
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
- [ ] Integración de AVSpeechSynthesizer con segmentación por oración
- [ ] Highlight sincronizado sobre el texto mientras se escucha (modo "karaoke")
- [ ] Controles de reproducción: play/pause, velocidad (0.5x–2x), anterior/siguiente capítulo
- [ ] Selección de voz (voces disponibles en el dispositivo)
- [ ] Persistencia de posición de audio entre sesiones
- [ ] Integración con Control Center y pantalla bloqueada (MPNowPlayingInfoCenter)

---

### Fase 5 — Sincronización cloud

Objetivo: el usuario puede importar y mantener su biblioteca sincronizada desde servicios de almacenamiento externos.

- [ ] Abstracción común: protocolo `CloudProvider` (listar, descargar, observar cambios)
- [ ] **Google Drive** — Google Drive API v3 + OAuth 2
- [ ] **Dropbox** — Dropbox SDK for Swift
- [ ] **OneDrive** — Microsoft Graph API + MSAL (Microsoft Authentication Library)
- [ ] **WebDAV** — URLSession + digest/basic auth (compatible con Nextcloud, ownCloud, servidores propios)
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
- **Anotaciones:** almacenadas en SwiftData, asociadas al libro por ID + posición CFI. Independientes del archivo fuente para sobrevivir reimportaciones.
- **TTS sobre ePub:** el texto se extrae capítulo por capítulo en tiempo real; no se genera ningún archivo de audio persistente.
- **Providers cloud:** el protocolo `CloudProvider` permite agregar nuevos proveedores sin tocar la lógica de la biblioteca.
- **Goodreads API:** la API oficial está deprecada desde 2020. La integración deberá evaluarse via scraping autorizado, exportación CSV manual o servicios alternativos (OpenLibrary shelves).
