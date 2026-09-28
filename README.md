# 📚 DocuPortal — Plantilla Oficial de Documentación Técnica

**DocuPortal** es la plantilla base para desplegar portales de documentación técnica moderna, guías de usuario, release notes y blogs de producto, sincronizados en tiempo real con **Portal**.

Construido con **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Caral UI** e **IconCaral2**.

---

## ⚡ Guía de Inicio Rápido (Primeros Pasos)

Sigue estos sencillos pasos para configurar y sincronizar tu portal por primera vez:

### 1. Clonar e Instalar Dependencias

```bash
git clone <URL_DEL_REPOSITORIO>
cd docuportal
npm install
```

---

### 2. Configurar Variables de Entorno (`.env.local`)

Copia el archivo de plantilla `.env.example` o crea un archivo `.env.local` en la raíz del proyecto:

```env
# 1. Slug identificador de tu producto en Portal CMS (ej. 'crestone', 'doxa', 'daiana', 'feelings')
NEXT_PUBLIC_PRODUCT_SLUG=tu-producto

# 2. URL base de Portal CMS
NEXT_PUBLIC_PORTAL_URL=https://v2.portal.seidoranalytics.com

# 3. Token secreto para autenticación de Webhooks en tiempo real
PORTAL_WEBHOOK_SECRET=tu_clave_secreta_webhook

# 4. (Opcional) Authtoken de ngrok para recibir webhooks en local
NGROK_AUTHTOKEN=tu_ngrok_token
```

---

### 3. Sincronizar el Contenido por Primera Vez 🔄

Antes de levantar el servidor o compilar, ejecuta el script de sincronización inicial para descargar la documentación, artículos de blog y notas de versión directamente desde Portal CMS:

```bash
npm run sync
```

Este comando:
- Conecta con la API de Portal CMS usando tu `NEXT_PUBLIC_PRODUCT_SLUG`.
- Descarga todos los módulos, documentos técnicos, imágenes, blog posts y release notes.
- Guarda un snapshot local en `data/docs-cache.json` para garantizar funcionamiento rápido, compilación SSG/ISR y respaldo offline.

---

### 4. Iniciar en Modo Desarrollo 🚀

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el portal en funcionamiento.

---

## ⚡ Sincronización en Tiempo Real con Webhooks

DocuPortal cuenta con un endpoint `/api/webhook` que recibe notificaciones push desde Portal CMS cada vez que se crea, edita o publica contenido, actualizando la documentación al instante sin necesidad de polling ni tareas cron.

### Probar Webhooks en Local con ngrok 🚇

Para recibir webhooks mientras desarrollas en tu máquina local:

```bash
# Opción A: Iniciar túnel ngrok y servidor de desarrollo juntos
npm run dev:all

# Opción B: Iniciar túnel ngrok en una terminal separada
npm run tunnel
```

El script te mostrará una URL pública (ej: `https://xxxx.ngrok-free.app`). 
Configura dicha URL en Portal CMS con la ruta `/api/webhook`:
```
https://xxxx.ngrok-free.app/api/webhook
```

---

## 🧹 Gestión de Caché

Si deseas limpiar la compilación de Next.js y el snapshot local de datos para forzar una reconstrucción limpia desde cero:

```bash
# Limpiar caché de Next.js y snapshot local
npm run cache:clear
# o simplemente:
npm run clean

# Luego vuelve a sincronizar:
npm run sync
```

---

## 🎨 Personalización del Portal (`portal.config.ts`)

Toda la configuración del portal está centralizada en [`portal.config.ts`](./portal.config.ts) dividida en 3 bloques claros e intuitivos:

### 1. `defaultProductConfig` (Metadata y Secciones)
- Define el título, descripción, versión, autor y enlaces por defecto.
- Configura las secciones modulares de la página de inicio (`homeSections`): Hero, Descubrir funcionalidades, Preguntas Frecuentes (FAQ), etc.

### 2. `navbar` (Navegación Superior)
- **`logo`**: Activar/desactivar y definir ruta del logo.
- **`itemsLeft`**: Enlaces de navegación rápida (bilingües ES / EN).
- **`enableSearch`**: Habilitar el buscador global con atajo <kbd>⌘ K</kbd> o <kbd>Ctrl + K</kbd>.
- **`enableMultiLanguage`**: Habilitar el selector de idioma (Español / English).
- **`enableThemeSwitcher`**: Selector de modo Claro / Oscuro.
- **`enableCollapseSidebar`**: Botón para colapsar la barra lateral en la documentación.

### 3. `footer` (Pie de Página)
- Define el copyright, descripción de pie de página y enlaces a redes sociales (GitHub, LinkedIn, Twitter, etc.).

### 4. `branding.portal.ts` (Identidad Visual)
- En [`branding.portal.ts`](./branding.portal.ts) puedes personalizar colores de marca (primario, secundario, acento, fondo y texto), isologos y badges.

---

## 📋 Lista de Comandos Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local en `http://localhost:3000`. |
| `npm run sync` | Sincroniza y descarga todo el contenido desde Portal CMS a `data/docs-cache.json`. |
| `npm run cache:clear` | Elimina la caché de compilación (`.next`) y el snapshot local de datos. |
| `npm run tunnel` | Abre un túnel público seguro con ngrok apuntando al puerto 3000 para probar webhooks. |
| `npm run dev:all` | Inicia simultáneamente el servidor Next.js y el túnel ngrok. |
| `npm run build` | Compila la aplicación para producción con optimizaciones SSG e ISR. |
| `npm start` | Inicia el servidor de producción compilado. |
| `npm run lint` | Ejecuta el linter de código (ESLint). |

---

## 📁 Estructura del Proyecto

```text
├── app/                  # Rutas de Next.js App Router (docs, blog, releases, api/webhook)
├── components/           # Componentes UI (Header, Footer, Sidebar, MarkdownRenderer, etc.)
│   ├── footer.tsx        # Componente Footer estándar conectado a portal.config.ts
│   ├── header.tsx        # Encabezado responsive y buscador global
│   └── home-sections/    # Secciones modulares de la landing page
├── context/              # Proveedores de contexto (Idioma, Tema, Sidebar)
├── data/                 # Snapshot local de documentación (docs-cache.json)
├── lib/                  # Utilidades, cliente API de Portal CMS y sincronizador
├── scripts/              # Scripts de automatización (sync, clear-cache, tunnel, dev-tunnel)
├── branding.portal.ts    # Configuración de colores y tokens de marca
├── layout.types.ts       # Definiciones de tipos para el layout (Navbar, Footer, Home)
├── portal.config.ts      # Archivo central de configuración del portal
└── portal.types.ts       # Tipos TypeScript para productos y documentación de CMS
```

---

## 🚀 Despliegue en Producción

Al desplegar en **Vercel**, **Docker** o cualquier servidor Node.js:
1. Configura las variables de entorno en el panel de tu proveedor (`NEXT_PUBLIC_PRODUCT_SLUG`, `NEXT_PUBLIC_PORTAL_URL`, `PORTAL_WEBHOOK_SECRET`).
2. El comando de build ejecutará `next build`.
3. Registra la URL de producción `https://tu-dominio.com/api/webhook` en **Portal CMS** para habilitar la actualización automática e instantánea.
