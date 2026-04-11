# Funcionalidades descartadas

Estas funcionalidades fueron evaluadas durante la fase de planificación y descartadas del alcance inicial de la app. Se documentan aquí para referencia futura.

---

## Pendientes de redefinicion

Las siguientes funcionalidades no se adoptan tal como existen en Apple Books, pero tampoco se descartan: se rediseñarán bajo un enfoque propio.

### Diccionario y referencia
- Definición de palabras (diccionario nativo)
- Traducción de palabras o frases seleccionadas
- Búsqueda de texto en Wikipedia y web
- **Estado:** Por definir — se evaluará una alternativa diferente al diccionario clásico.

### Progreso y metas
- Seguimiento de progreso por libro (porcentaje / páginas)
- Metas diarias de lectura (minutos por día)
- Streaks de lectura (racha diaria)
- Meta anual de libros
- Notificaciones y recordatorios de lectura
- Year in Review
- **Estado:** Por definir — se diseñará un sistema de métricas propio para el perfil del usuario recurrente.

---

## Tienda integrada
- Book Store para comprar libros y audiolibros
- Historial de compras y descargas
- **Motivo:** La app es open source. La gestión de contenido es responsabilidad del usuario.

---

## Sincronización y multiplataforma
- Sincronización de posición de lectura entre iPhone, iPad y Mac
- Handoff entre dispositivos
- **Motivo:** Fuera de alcance por el momento. Posible incorporación en versiones futuras.

### Proveedores cloud pendientes de evaluación (Fase 5b)
- **WebDAV** — protocolo genérico compatible con Nextcloud, ownCloud y servidores propios. Sin OAuth, solo URL + credenciales. Prioridad: usuarios power-user / privacidad.
- **Dropbox / OneDrive** — OAuth2, SDKs de terceros. Menor prioridad dado que Google Drive ya cubre el segmento de cloud comercial.
- **Estado:** Descartados del alcance actual. Evaluar según demanda tras lanzar Fase 5 (iCloud + Google Drive).

### Configuración pendiente: EXPO_PUBLIC_GOOGLE_CLIENT_ID
- Requiere crear un proyecto en Google Cloud Console con OAuth 2.0 client ID para iOS.
- El bundle ID del proyecto debe coincidir con el del client ID.
- La variable `EXPO_PUBLIC_GOOGLE_CLIENT_ID` debe definirse en el entorno de build (`.env.local` o CI secrets) antes de compilar.
- **Estado:** Pendiente de revisión y configuración antes del primer build de producción.

### Integraciones externas pendientes (Fase 6b)
- **Open Library (Internet Archive)** — API pública para metadata y descarga de libros de dominio público.
- **Project Gutenberg** — más de 70.000 libros libres de derechos, API de búsqueda y descarga directa.
- **Goodreads** — sincronización de lista de lectura y ratings (requiere evaluación de la API actual tras los cambios de 2020).
- **Estado:** Descartados del alcance actual. Evaluar en Fase 6b tras estabilizar integración con Calibre.

---

## Accesibilidad
- VoiceOver
- Speak Screen
- Fuentes grandes y ajuste de espaciado
- Compatibilidad con DAISY
- **Motivo:** Fuera de alcance por el momento. Posible incorporación en versiones futuras.

---

## Social / Compartir
- Compartir citas o pasajes
- Family Sharing
- **Motivo:** Fuera de alcance por el momento. Posible incorporación en versiones futuras.
