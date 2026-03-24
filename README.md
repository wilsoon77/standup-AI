# Standup AI

Una aplicación web impulsada por Inteligencia Artificial que lee tu actividad en GitHub (commits, Pull Requests, Issues) y genera automáticamente un reporte de "Daily Standup" listo para copiar y pegar en Slack o Teams.

Usa **Groq** para una generación ultrarrápida (usando `llama-3.3-70b-versatile`) con **OpenRouter** como opción de respaldo.

## Características

- 🔐 Autenticación segura vía GitHub OAuth para guardar historial
- 🧩 Versión de prueba para usuarios no logueados
- 🌐 Soporte para múltiples idiomas (Español e Inglés)
- 📊 Integración nativa con GitHub API para traer tu trabajo al instante
- 🤖 Generación asistida por IA usando Llama 3 (Groq + OpenRouter)
- 🎭 Selector de tonos: Formal, Casual, o Con Humor
- 💿 Guarda todos tus reportes anteriores en el historial de forma segura localmente (Solo para usuarios logueados)
- 🎨 UI con Dark Mode, Glassmorphism, animaciones interactivas
- 🔒 Seguridad Anti-Prompt-Injection al enviar bloqueos personalizados
- 🛡️ Rate Limiter de protección API (Máx. 5 reportes por invitado y 15 en cuentas premium)
- 🐳 Optimización para despliegue usando Docker

## 🛠️ Tecnologías Usadas

- **Frontend & Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Estilos & UI**: Tailwind CSS v4, Lucide Icons, Glassmorphism UI
- **IA & APIs**: Groq (Llama 3), OpenRouter (Fallback), Vercel AI SDK
- **Integraciones**: GitHub REST API, NextAuth (Auth.js)
- **Base de Datos**: Turso / SQLite (vía Drizzle ORM)
- **🚀 Infraestructura y Despliegue**: Esta aplicación ha sido diseñada y optimizada para ser alojada y ejecutada en **CubePath** como servidor principal para garantizar su estabilidad y rendimiento en producción.

## 🚀 Roadmap / Future Features Que se pueden agregar

- **Integraciones Adicionales (Jira/Linear)**: Soporte planeado para cruzar ramas y commits automáticamente con tickets de trabajo.
- **Exportación Nativas**: Botones para generar y exportar el reporte con formato nativo garantizado para Slack, Microsoft Teams y WhatsApp.
- **Plantillas Personalizables (Templates)**: Capacidad de guardar templates de standups según el formato único que necesite tu equipo (ej. "Ayer/Hoy/Dificultades" vs "Logros/Metas").

## 🧠 Mejorando el Formato de la IA (Escalabilidad de Prompts)

Toda la base de los reportes es controlable desde los Prompts de Sistema localizados en `lib/ai/index.ts`. Puedes escalar y mejorar el comportamiento del modelo modificando este archivo. Algunas opciones de escalabilidad futura incluirian:

1. **Formato Nativo para Slack**: Modificar el prompt para exigir que envuelva nombres de repositorios en \`backticks\` y usar viñetas precisas y emojis tácticos (`🚧`, `📈`).
2. **Formato Orientado a Tareas (Feature-Oriented)**: Forzar a la IA a agrupar los commits no por orden cronológico, sino agrupados bajo la "Feature" o componente que hayan modificado.
3. **Formateo JSON Estricto**: Hacer que responda con una estructura JSON en caso de querer alimentar otro sistema (como crear tickets automáticos en Jira a partir del standup).
4. **Resaltado Markdown**: Escalar la interfaz de la aplicación actual para soportar pestañas de "**Raw**" (Copiable) y "**Preview**" (Renderizado visual de todo el Markdown).

## Prerrequisitos (API Keys)

Para correr este proyecto vas a necesitar obtener algunas llaves gratuitas:

1. **GitHub OAuth App**: Ve a [Developer Settings](https://github.com/settings/developers), crea una OAuth App y obtén el **Client ID** y **Client Secret**. Añade `http://localhost:3000/api/auth/callback/github` como Callback URL.
2. **Groq API Key**: Ve a [Groq Console](https://console.groq.com/) y obtén tu apikey gratuita.
3. **OpenRouter API Key**: Ve a [OpenRouter](https://openrouter.ai/) y obtén tu apikey gratuita.

## Cómo correrlo localmente

1. Clona el proyecto y entra a su carpeta:
```bash
git clone https://github.com/wilson-dev-ops/standup-ai.git
cd standup-ai
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea y llena el archivo `.env.local`:
```bash
cp .env.example .env.local
```
Llénalo con las llaves que obtuviste en los requisitos.

4. Configura y migra la Base de Datos local:
```bash
npm run db:generate
npm run db:migrate
```

5. Inicializa el servidor local de desarrollo:
```bash
npm run dev
```

6. ¡Listo! Abre la app en `http://localhost:3000`.

## Scripts Útiles

- `npm run dev` - Arranca el Next.js local (desarrollo).
- `npm run build` - Construye una build óptima para producción.
- `npm run db:generate` - Genera una estructura de migración usando `drizzle-schema.ts`.
- `npm run db:migrate` - Aplica migraciones directamente a la base de SQLite local.
- `npm run db:studio` - Interfaz gráfica para revisar qué datos hay guardados en la base de datos.
