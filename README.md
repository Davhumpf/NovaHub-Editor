# Novahub Editor

Novahub Editor es un IDE web tipo VS Code: carga rápido, compila en entornos aislados y permite colaborar en vivo sin instalar nada.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4

## Lenguajes planteados para la v1
JavaScript/TypeScript, Python, C/C++, Go, Rust, PHP, Bash, Java, C#, Kotlin, Ruby (runtimes y toolchains integrables por worker/contenedor).

## Scripts
- `npm run dev` – entorno local de desarrollo
- `npm run build` – build de producción
- `npm start` – servidor de producción

## Roadmap corto
- Workspace web con UI similar a VS Code (explorador, tabs, terminal/console mock).
- Ejecutar código en workers/containers aislados con plantillas por lenguaje.
- Compartir sesiones y presencia en tiempo real.
- Pipelines declarativos: lint, test, build y preview desplegable.
