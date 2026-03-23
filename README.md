# Standup AI

Una aplicación web impulsada por Inteligencia Artificial que lee tu actividad en GitHub (commits, Pull Requests, Issues) y genera automáticamente un reporte de "Daily Standup" listo para copiar y pegar en Slack o Teams.

Usa **Groq** para una generación ultrarrápida (usando `llama-3.3-70b-versatile`) con **OpenRouter** como opción de respaldo.

## Características

- 🔐 Autenticación segura vía GitHub OAuth
- 📊 Integración nativa con GitHub API para traer tu trabajo al instante
- 🤖 Generación asistida por IA usando Llama 3 (Groq + OpenRouter)
- 🎭 Selector de tonos: Formal, Casual, o Con Humor
- 💿 Guarda todos tus reportes anteriores en el historial de forma segura localmente
- 🎨 UI Premium con Dark Mode, Glassmorphism, y animaciones limpias
- 🐳 Optimización para despliegue usando Docker

## Prerrequisitos (API Keys)

Para correr este proyecto vas a necesitar obtener algunas llaves gratuitas:

1. **GitHub OAuth App**: Ve a [Developer Settings](https://github.com/settings/developers), crea una OAuth App y obtén el **Client ID** y **Client Secret**. Añade `http://localhost:3000/api/auth/callback/github` como Callback URL.
2. **Groq API Key**: Ve a [Groq Console](https://console.groq.com/) y obtén tu apikey gratuita.
3. **OpenRouter API Key**: Ve a [OpenRouter](https://openrouter.ai/) y obtén tu apikey gratuita.
4. (Opcional) Crea un código seguro [NextAuth Secret] con `npx auth secret`.

## Cómo correrlo localmente

1. Clona el proyecto y entra a su carpeta:
```bash
git clone ...
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
