const featureList = [
  {
    title: "Editor tipo VS Code",
    desc: "Tema oscuro, minimapa, comandos rápidos y paleta de acciones.",
  },
  {
    title: "Compilación aislada",
    desc: "Workers/containers efímeros para ejecutar código sin exponer tu host.",
  },
  {
    title: "Colaboración en vivo",
    desc: "Sesiones multiusuario, presencia y comentarios en línea.",
  },
  {
    title: "DevOps integrado",
    desc: "Pipelines rápidos: lint, test, build y preview en un clic.",
  },
];

const languages = [
  "JavaScript",
  "TypeScript",
  "Python",
  "C/C++",
  "Go",
  "Rust",
  "PHP",
  "Bash",
  "Java",
  "C#",
  "Kotlin",
  "Ruby",
];

const sampleCode = [
  { line: 1, text: "// novahub build: node18" },
  { line: 2, text: "import { runTask } from \"@novahub/runtime\";" },
  { line: 3, text: "" },
  { line: 4, text: "export async function handler(input) {" },
  { line: 5, text: "  const result = await runTask(\"tests\", {" },
  { line: 6, text: "    command: \"npm test\", timeout: 120000," },
  { line: 7, text: "  });" },
  { line: 8, text: "  return { status: result.success ? 200 : 500, result };" },
  { line: 9, text: "}" },
];

function EditorPreview() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 text-xs/5 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="ml-3 rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            workspace/main
          </span>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-500">
          running
        </span>
      </div>
      <div className="grid gap-0 border-b border-zinc-200 dark:border-zinc-800 sm:grid-cols-[240px,1fr]">
        <aside className="hidden border-r border-zinc-200 px-3 py-4 text-sm font-medium text-zinc-600 dark:border-zinc-800 dark:text-zinc-300 sm:block">
          <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            proyectos
          </p>
          <ul className="space-y-1">
            <li className="rounded-lg bg-white px-3 py-2 text-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-800">
              novahub-editor
            </li>
            <li className="rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              api-gateway
            </li>
            <li className="rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              jobs-runner
            </li>
          </ul>
        </aside>
        <div className="overflow-hidden rounded-2xl p-4">
          <div className="flex w-full items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-600 shadow-inner dark:bg-zinc-800 dark:text-zinc-300">
            <span className="rounded bg-zinc-200 px-2 py-0.5 text-[11px] font-semibold text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100">
              app/api/runtime.ts
            </span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              TSX | Node 18
            </span>
          </div>
          <div className="mt-4 rounded-xl bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.25),transparent_35%)] px-2 py-3 text-sm font-mono text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.18),transparent_35%)]">
            <div className="rounded-xl border border-zinc-800/80 bg-[#0f1115] px-4 py-3 shadow-inner">
              <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                <span>novahub-runtime</span>
                <span className="rounded bg-zinc-800 px-2 py-0.5 font-medium text-amber-400">
                  saved
                </span>
              </div>
              <div className="space-y-1">
                {sampleCode.map((line) => (
                  <div
                    key={line.line}
                    className="flex gap-4 whitespace-pre text-[13px]"
                  >
                    <span className="w-8 select-none text-right text-zinc-500">
                      {line.line}
                    </span>
                    <code
                      className={`flex-1 ${
                        line.text.includes("runTask")
                          ? "text-emerald-200"
                          : line.text.startsWith("//")
                            ? "text-zinc-400"
                            : "text-sky-100"
                      }`}
                    >
                      {line.text}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 px-4 py-3 text-xs text-zinc-500 sm:grid-cols-3 dark:text-zinc-400">
        <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-[11px] uppercase tracking-wide text-zinc-400">
            lint/test
          </p>
          <p className="font-semibold text-emerald-500">green</p>
          <p>21 scenarios</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-[11px] uppercase tracking-wide text-zinc-400">
            preview
          </p>
          <p className="font-semibold text-sky-500">ready</p>
          <p>open in cloud sandbox</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-[11px] uppercase tracking-wide text-zinc-400">
            pipelines
          </p>
          <p className="font-semibold text-amber-500">queued</p>
          <p>deploy → notify → audit</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 text-zinc-900 antialiased dark:from-black dark:via-zinc-950 dark:to-black">
      <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/80 backdrop-blur dark:border-zinc-800/80 dark:bg-black/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">
              NH
            </span>
            <div>
              <p className="text-sm font-semibold">Novahub Editor</p>
              <p className="text-xs text-zinc-500">
                Web IDE rápido, seguro y colaborativo
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-3 text-sm font-medium text-zinc-700 sm:flex dark:text-zinc-200">
            <button className="rounded-full px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Roadmap
            </button>
            <a href="/docs" className="rounded-full px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Docs
            </a>
            <a href="/workspace" className="rounded-full bg-zinc-900 px-4 py-2 text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
              Abrir workspace
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12 sm:py-16">
        <section className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30">
              Visual Studio Code, pero web y con turbo
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              Compila, prueba y colabora en cualquier lenguaje sin salir del
              navegador.
            </h1>
            <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">
              Novahub Editor une un IDE tipo VS Code con ejecuciones aisladas,
              entornos efímeros y colaboración en vivo. Abre un workspace,
              elige el runtime y dale build: el resto es automático.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-medium">
              <a href="/workspace" className="rounded-full bg-zinc-900 px-5 py-2 text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                Crear workspace
              </a>
              <a href="/docs" className="rounded-full border border-zinc-300 px-5 py-2 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800">
                Ver historial y notas
              </a>
              <button className="rounded-full bg-emerald-500/15 px-4 py-2 text-emerald-700 ring-1 ring-emerald-300 hover:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-500/30">
                Cloud sandbox incluida
              </button>
            </div>
            <div className="grid w-full grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  startup time
                </p>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-white">
                  &lt; 3s
                </p>
                <p className="text-xs text-zinc-500">Workspaces efímeros</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  lenguajes
                </p>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-white">
                  12+
                </p>
                <p className="text-xs text-zinc-500">
                  Runtimes listos para compilar
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  seguridad
                </p>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-white">
                  aislado
                </p>
                <p className="text-xs text-zinc-500">
                  Cada build en su propio worker
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <EditorPreview />
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                Lenguajes listos para compilar
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-300">
                Añade más runtimes en tu propia infraestructura o con workers
                gestionados.
              </p>
            </div>
            <button className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
              Ver plantillas
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {languages.map((lang) => (
              <span
                key={lang}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700"
              >
                {lang}
              </span>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-950 p-6 shadow-sm dark:border-zinc-800">
            <p className="text-sm font-semibold text-emerald-300">
              Ciclo de desarrollo
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Desde commit hasta preview en un flujo unificado.
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Define pipelines declarativos. Conecta repos, ejecuta tests,
              genera previews y comparte URLs seguras con tu equipo.
            </p>
            <div className="mt-6 space-y-4 text-sm text-white">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-semibold">Hook: push a main</p>
                  <p className="text-xs text-zinc-400">Trigger continuo</p>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                  activo
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-semibold">Job: lint + test</p>
                  <p className="text-xs text-zinc-400">
                    node18, cache inteligente
                  </p>
                </div>
                <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-200">
                  1m 21s
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-semibold">Preview deployment</p>
                  <p className="text-xs text-zinc-400">
                    URL segura, password opcional
                  </p>
                </div>
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200">
                  listo
                </span>
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            {featureList.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-transform dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {feature.title}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-300">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
