# Funcionalidades descartadas

Estas funcionalidades fueron evaluadas durante la fase de planificación y descartadas del alcance inicial de la app. Se documentan aquí para referencia futura.

---

## Pendientes de redefinicion

Las siguientes funcionalidades no se adoptan tal como existen en Apple Books, pero tampoco se descartan: se rediseñarán bajo un enfoque propio.

### 🔴 Prioritarios — Experiencia de lectura avanzada

#### Auto-scroll con control de velocidad
- Avance automático del texto a velocidad regulable por el usuario (píxeles/segundo o palabras/minuto)
- Control deslizante para ajustar velocidad en tiempo real durante la lectura
- Pausa automática al tocar la pantalla o al detectar inactividad visual
- Aplica a: epub (modo scroll) y markdown. PDF requiere evaluación aparte.
- **Estado:** Pendiente de implementación. Técnicamente directo sobre ScrollView.

#### Detección de atención con cámara (ARKit Eye Tracking)
- Usar `ARFaceTrackingConfiguration` de ARKit con la cámara TrueDepth (Face ID) para detectar si el usuario está mirando la pantalla
- Integración con auto-scroll: pausar automáticamente cuando el usuario aparta la vista
- Requiere permiso de cámara frontal y dispositivo con Face ID (iPhone X en adelante)
- Requiere módulo nativo (Swift/Objective-C) o paquete React Native con binding a ARKit
- **Estado:** Pendiente de exploración técnica. Alta complejidad nativa, alto valor diferencial.

#### Bionic Reading y RSVP
- **Bionic Reading:** pone en negrita los primeros caracteres de cada palabra para que el cerebro complete el resto, acelerando la velocidad de lectura. Se puede implementar procesando el texto HTML del epub antes de renderizarlo.
- **RSVP (Rapid Serial Visual Presentation):** muestra palabras una a una a alta velocidad en el centro de la pantalla (estilo Spritz). Alternativa al auto-scroll para lectores veloces.
- Ambas técnicas son complementarias; podrían ofrecerse como modos de lectura alternativos.
- **Estado:** Pendiente de implementación. Bionic Reading sobre epub: procesamiento HTML en WebView. RSVP: extractor de texto existente (EpubTextExtractor) + overlay de palabra actual.

---

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
