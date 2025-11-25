# Plan de Transformación: Editor Profesional NovaHub

## 📋 Resumen Ejecutivo

Transformar NovaHub-Editor en un editor profesional equivalente a Cursor, VS Code y Notepad++, manteniendo el diseño visual actual.

**Estado Actual:**
- ✅ Monaco Editor integrado (mismo core que VS Code)
- ✅ UI profesional estilo VS Code
- ✅ Integración GitHub completa
- ✅ Terminal visual (simulado)
- ✅ Sistema de temas
- ❌ Terminal funcional real
- ❌ Sistema de extensiones
- ❌ LSP para autocompletado avanzado
- ❌ Entorno de ejecución de código

---

## 🏗️ FASE 1: Sistema de Extensiones

### Arquitectura de Extensiones

#### 1.1 Sistema Base de Extensiones

**Tecnología:** API de extensiones custom + Monaco Editor API

```typescript
// src/types/extension-api.ts
export interface IExtension {
  id: string;
  name: string;
  version: string;
  publisher: string;
  description: string;
  main: string; // Punto de entrada
  contributes?: {
    languages?: LanguageContribution[];
    themes?: ThemeContribution[];
    commands?: CommandContribution[];
    keybindings?: KeybindingContribution[];
    grammars?: GrammarContribution[];
    snippets?: SnippetContribution[];
  };
  activationEvents?: string[]; // Cuándo activar la extensión
  engines: {
    novahub: string; // Versión compatible
  };
}

export interface IExtensionContext {
  subscriptions: Disposable[];
  extensionPath: string;
  globalState: Memento;
  workspaceState: Memento;
  secrets: SecretStorage;
  extensionUri: string;
  extensionMode: ExtensionMode;
}

export interface IExtensionAPI {
  // Commands API
  commands: {
    registerCommand(command: string, callback: (...args: any[]) => any): Disposable;
    executeCommand(command: string, ...args: any[]): Promise<any>;
  };

  // Languages API
  languages: {
    registerCompletionItemProvider(
      selector: DocumentSelector,
      provider: CompletionItemProvider
    ): Disposable;
    registerHoverProvider(selector: DocumentSelector, provider: HoverProvider): Disposable;
    registerDefinitionProvider(selector: DocumentSelector, provider: DefinitionProvider): Disposable;
    registerCodeActionsProvider(selector: DocumentSelector, provider: CodeActionProvider): Disposable;
    setLanguageConfiguration(languageId: string, configuration: LanguageConfiguration): Disposable;
  };

  // Editor API
  window: {
    activeTextEditor: TextEditor | undefined;
    visibleTextEditors: TextEditor[];
    onDidChangeActiveTextEditor: Event<TextEditor | undefined>;
    showInformationMessage(message: string, ...items: string[]): Promise<string | undefined>;
    showErrorMessage(message: string, ...items: string[]): Promise<string | undefined>;
    showWarningMessage(message: string, ...items: string[]): Promise<string | undefined>;
    createOutputChannel(name: string): OutputChannel;
    createTerminal(options: TerminalOptions): Terminal;
  };

  // Workspace API
  workspace: {
    workspaceFolders: WorkspaceFolder[] | undefined;
    onDidChangeTextDocument: Event<TextDocumentChangeEvent>;
    onDidOpenTextDocument: Event<TextDocument>;
    onDidSaveTextDocument: Event<TextDocument>;
    getConfiguration(section?: string): WorkspaceConfiguration;
    fs: FileSystem;
  };

  // Themes API
  themes: {
    registerTheme(theme: ITheme): Disposable;
  };
}
```

#### 1.2 Extension Host (Sandbox)

**Tecnología:** Web Workers para aislamiento de extensiones

```typescript
// src/services/ExtensionHost.ts
export class ExtensionHost {
  private worker: Worker;
  private loadedExtensions = new Map<string, LoadedExtension>();
  private messageHandlers = new Map<string, (data: any) => void>();

  constructor() {
    this.worker = new Worker('/workers/extension-host.worker.js', {
      type: 'module'
    });

    this.worker.onmessage = this.handleWorkerMessage.bind(this);
  }

  async loadExtension(extensionPath: string): Promise<void> {
    // Cargar manifest de la extensión
    const manifest = await this.loadManifest(extensionPath);

    // Validar compatibilidad
    this.validateExtension(manifest);

    // Cargar en worker
    this.worker.postMessage({
      type: 'LOAD_EXTENSION',
      extensionPath,
      manifest
    });
  }

  async activateExtension(extensionId: string, activationEvent: string): Promise<void> {
    const extension = this.loadedExtensions.get(extensionId);

    if (!extension) {
      throw new Error(`Extension ${extensionId} not loaded`);
    }

    if (extension.isActive) {
      return;
    }

    // Activar en worker
    this.worker.postMessage({
      type: 'ACTIVATE_EXTENSION',
      extensionId,
      activationEvent
    });

    extension.isActive = true;
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data;

    const handler = this.messageHandlers.get(type);
    if (handler) {
      handler(data);
    }
  }
}
```

#### 1.3 Extension Marketplace

**Backend:** API routes en Next.js para gestionar extensiones

```typescript
// src/app/api/extensions/marketplace/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Conexión con marketplace (puede ser propio o VS Code Marketplace)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  const category = searchParams.get('category');

  // Buscar en marketplace
  const extensions = await searchExtensions({ query, category });

  return NextResponse.json({ extensions });
}

export async function POST(req: NextRequest) {
  const { extensionId } = await req.json();

  // Descargar extensión
  const extensionData = await downloadExtension(extensionId);

  // Instalar localmente (IndexedDB o sistema de archivos virtual)
  await installExtension(extensionData);

  return NextResponse.json({ success: true });
}
```

**Frontend:** Panel de extensiones mejorado

```typescript
// src/components/panels/ExtensionsPanel.tsx
export function ExtensionsPanel() {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [installed, setInstalled] = useState<Extension[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const searchExtensions = async (query: string) => {
    const response = await fetch(`/api/extensions/marketplace?q=${query}`);
    const data = await response.json();
    setExtensions(data.extensions);
  };

  const installExtension = async (extensionId: string) => {
    await fetch('/api/extensions/marketplace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extensionId })
    });

    // Recargar lista de instaladas
    loadInstalledExtensions();
  };

  return (
    <div className="extensions-panel">
      <input
        type="text"
        placeholder="Buscar extensiones..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          searchExtensions(e.target.value);
        }}
      />

      <div className="extensions-list">
        {extensions.map(ext => (
          <ExtensionCard
            key={ext.id}
            extension={ext}
            onInstall={() => installExtension(ext.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 🧠 FASE 2: Language Server Protocol (LSP)

### Arquitectura LSP

#### 2.1 Language Server Client

**Tecnología:** vscode-languageserver-protocol + Web Workers

```typescript
// src/services/LanguageClient.ts
import {
  createMessageConnection,
  MessageConnection,
  InitializeRequest,
  InitializeParams,
  TextDocumentItem,
  DidOpenTextDocumentNotification,
  CompletionRequest,
  HoverRequest,
  DefinitionRequest
} from 'vscode-languageserver-protocol/browser';

export class LanguageClient {
  private connection: MessageConnection;
  private languageId: string;
  private serverWorker: Worker;

  constructor(languageId: string, serverPath: string) {
    this.languageId = languageId;
    this.serverWorker = new Worker(serverPath, { type: 'module' });

    // Crear conexión mensaje
    this.connection = this.createConnection();
    this.initialize();
  }

  private createConnection(): MessageConnection {
    const reader = new BrowserMessageReader(this.serverWorker);
    const writer = new BrowserMessageWriter(this.serverWorker);

    const connection = createMessageConnection(reader, writer);
    connection.listen();

    return connection;
  }

  private async initialize(): Promise<void> {
    const params: InitializeParams = {
      processId: null,
      rootUri: null,
      capabilities: {
        textDocument: {
          completion: {
            completionItem: {
              snippetSupport: true,
              documentationFormat: ['markdown', 'plaintext']
            }
          },
          hover: {
            contentFormat: ['markdown', 'plaintext']
          },
          definition: {
            linkSupport: true
          }
        }
      },
      workspaceFolders: null
    };

    await this.connection.sendRequest(InitializeRequest.type, params);
  }

  async sendDocumentOpen(uri: string, languageId: string, version: number, text: string): Promise<void> {
    const textDocument: TextDocumentItem = {
      uri,
      languageId,
      version,
      text
    };

    await this.connection.sendNotification(
      DidOpenTextDocumentNotification.type,
      { textDocument }
    );
  }

  async getCompletions(uri: string, line: number, character: number): Promise<CompletionItem[]> {
    const result = await this.connection.sendRequest(CompletionRequest.type, {
      textDocument: { uri },
      position: { line, character }
    });

    return result?.items || [];
  }

  async getHover(uri: string, line: number, character: number): Promise<Hover | null> {
    return await this.connection.sendRequest(HoverRequest.type, {
      textDocument: { uri },
      position: { line, character }
    });
  }

  async getDefinition(uri: string, line: number, character: number): Promise<Location[]> {
    return await this.connection.sendRequest(DefinitionRequest.type, {
      textDocument: { uri },
      position: { line, character }
    });
  }
}
```

#### 2.2 Integración con Monaco Editor

```typescript
// src/components/editor/MonacoEditor.tsx (actualización)
import * as monaco from 'monaco-editor';
import { LanguageClient } from '@/services/LanguageClient';

export function MonacoEditor({ file, content, onChange }: MonacoEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const languageClients = useRef<Map<string, LanguageClient>>(new Map());

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    const languageId = model.getLanguageId();

    // Obtener o crear cliente LSP para este lenguaje
    let client = languageClients.current.get(languageId);

    if (!client) {
      client = new LanguageClient(languageId, `/lsp-servers/${languageId}.worker.js`);
      languageClients.current.set(languageId, client);
    }

    // Notificar apertura de documento
    client.sendDocumentOpen(
      model.uri.toString(),
      languageId,
      model.getVersionId(),
      model.getValue()
    );

    // Registrar provider de completado
    const completionProvider = monaco.languages.registerCompletionItemProvider(languageId, {
      async provideCompletionItems(model, position) {
        const completions = await client!.getCompletions(
          model.uri.toString(),
          position.lineNumber - 1,
          position.column - 1
        );

        return {
          suggestions: completions.map(item => ({
            label: item.label,
            kind: mapCompletionKind(item.kind),
            insertText: item.insertText || item.label,
            documentation: item.documentation,
            detail: item.detail
          }))
        };
      }
    });

    // Registrar provider de hover
    const hoverProvider = monaco.languages.registerHoverProvider(languageId, {
      async provideHover(model, position) {
        const hover = await client!.getHover(
          model.uri.toString(),
          position.lineNumber - 1,
          position.column - 1
        );

        if (!hover) return null;

        return {
          contents: hover.contents.map(content => ({ value: content }))
        };
      }
    });

    // Registrar provider de definición
    const definitionProvider = monaco.languages.registerDefinitionProvider(languageId, {
      async provideDefinition(model, position) {
        const locations = await client!.getDefinition(
          model.uri.toString(),
          position.lineNumber - 1,
          position.column - 1
        );

        return locations.map(loc => ({
          uri: monaco.Uri.parse(loc.uri),
          range: new monaco.Range(
            loc.range.start.line + 1,
            loc.range.start.character + 1,
            loc.range.end.line + 1,
            loc.range.end.character + 1
          )
        }));
      }
    });

    return () => {
      completionProvider.dispose();
      hoverProvider.dispose();
      definitionProvider.dispose();
    };
  }, [file, languageClients]);

  return (
    <Editor
      defaultLanguage={getLanguageFromFileName(file)}
      value={content}
      onChange={onChange}
      onMount={(editor) => { editorRef.current = editor; }}
      options={{
        // Opciones mejoradas para LSP
        quickSuggestions: true,
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnCommitCharacter: true,
        snippetSuggestions: 'inline',
        wordBasedSuggestions: 'matchingDocuments',
        parameterHints: { enabled: true },
        suggest: {
          showMethods: true,
          showFunctions: true,
          showConstructors: true,
          showFields: true,
          showVariables: true,
          showClasses: true,
          showStructs: true,
          showInterfaces: true,
          showModules: true,
          showProperties: true,
          showEvents: true,
          showOperators: true,
          showUnits: true,
          showValues: true,
          showConstants: true,
          showEnums: true,
          showEnumMembers: true,
          showKeywords: true,
          showWords: true,
          showColors: true,
          showFiles: true,
          showReferences: true,
          showFolders: true,
          showTypeParameters: true,
          showSnippets: true,
        }
      }}
    />
  );
}
```

#### 2.3 Language Servers Pre-integrados

Implementar servidores para lenguajes principales:

**JavaScript/TypeScript:**
- Usar `typescript-language-server` en Web Worker
- Ya incluido con Monaco, pero mejorar configuración

**Python:**
```bash
npm install pyright
```

**Go, Rust, Java, C++:**
- Wasm compilations de language servers
- Alternativa: Proxy a servidores remotos

---

## 💻 FASE 3: Terminal Funcional Real

### Arquitectura Terminal

#### 3.1 Backend Terminal Server

**Tecnología:** WebSocket + Node.js PTY

```typescript
// src/app/api/terminal/route.ts (WebSocket upgrade)
import { Server } from 'socket.io';
import * as pty from 'node-pty';

const terminals = new Map<string, pty.IPty>();

export async function GET(req: Request) {
  // Upgrade a WebSocket
  const { socket, response } = upgradeWebSocket(req);

  socket.on('create-terminal', (data: { id: string; shell?: string }) => {
    const shell = data.shell || (process.platform === 'win32' ? 'powershell.exe' : 'bash');

    const term = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 30,
      cwd: process.env.HOME,
      env: process.env as any
    });

    terminals.set(data.id, term);

    term.onData((data) => {
      socket.emit('terminal-output', { id: data.id, data });
    });

    term.onExit(() => {
      terminals.delete(data.id);
      socket.emit('terminal-exit', { id: data.id });
    });
  });

  socket.on('terminal-input', (data: { id: string; input: string }) => {
    const term = terminals.get(data.id);
    if (term) {
      term.write(data.input);
    }
  });

  socket.on('resize-terminal', (data: { id: string; cols: number; rows: number }) => {
    const term = terminals.get(data.id);
    if (term) {
      term.resize(data.cols, data.rows);
    }
  });

  return response;
}
```

#### 3.2 Frontend Terminal Client

```typescript
// src/components/editor/Terminal.tsx (actualización)
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { io, Socket } from 'socket.io-client';

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm>();
  const fitAddonRef = useRef<FitAddon>();
  const socketRef = useRef<Socket>();
  const [terminals, setTerminals] = useState<TerminalInstance[]>([]);
  const [activeTerminal, setActiveTerminal] = useState<string>();

  useEffect(() => {
    // Conectar WebSocket
    socketRef.current = io('/api/terminal', {
      transports: ['websocket']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Terminal WebSocket connected');
    });

    socket.on('terminal-output', (data: { id: string; data: string }) => {
      const term = terminals.find(t => t.id === data.id);
      if (term && activeTerminal === data.id) {
        xtermRef.current?.write(data.data);
      }
    });

    socket.on('terminal-exit', (data: { id: string }) => {
      setTerminals(prev => prev.filter(t => t.id !== data.id));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createTerminal = () => {
    const id = `term-${Date.now()}`;

    const xterm = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Fira Code, monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#cccccc',
      }
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    xterm.loadAddon(fitAddon);
    xterm.loadAddon(webLinksAddon);

    if (terminalRef.current) {
      xterm.open(terminalRef.current);
      fitAddon.fit();
    }

    // Enviar input al backend
    xterm.onData((data) => {
      socketRef.current?.emit('terminal-input', { id, input: data });
    });

    // Crear en backend
    socketRef.current?.emit('create-terminal', { id, shell: 'bash' });

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    setTerminals(prev => [...prev, { id, xterm, name: `Terminal ${prev.length + 1}` }]);
    setActiveTerminal(id);
  };

  const handleResize = () => {
    if (fitAddonRef.current && xtermRef.current && activeTerminal) {
      fitAddonRef.current.fit();
      const dims = fitAddonRef.current.proposeDimensions();
      if (dims) {
        socketRef.current?.emit('resize-terminal', {
          id: activeTerminal,
          cols: dims.cols,
          rows: dims.rows
        });
      }
    }
  };

  return (
    <div className="terminal-container">
      <div className="terminal-tabs">
        {terminals.map(term => (
          <button
            key={term.id}
            onClick={() => setActiveTerminal(term.id)}
            className={activeTerminal === term.id ? 'active' : ''}
          >
            {term.name}
          </button>
        ))}
        <button onClick={createTerminal}>+</button>
      </div>
      <div ref={terminalRef} className="terminal-wrapper" />
    </div>
  );
}
```

---

## 🔍 FASE 4: Búsqueda Global y Reemplazo

### Implementación de Búsqueda

```typescript
// src/services/SearchService.ts
export class SearchService {
  async searchInWorkspace(
    query: string,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    const {
      caseSensitive = false,
      wholeWord = false,
      useRegex = false,
      includePattern = '**/*',
      excludePattern = '**/node_modules/**,**/.git/**'
    } = options;

    const files = await this.getWorkspaceFiles(includePattern, excludePattern);
    const results: SearchResult[] = [];

    for (const file of files) {
      const content = await this.readFile(file.path);
      const matches = this.searchInContent(content, query, {
        caseSensitive,
        wholeWord,
        useRegex
      });

      if (matches.length > 0) {
        results.push({
          file: file.path,
          matches: matches.map(match => ({
            line: match.line,
            column: match.column,
            text: match.text,
            preview: this.getMatchPreview(content, match.line)
          }))
        });
      }
    }

    return results;
  }

  async replaceInWorkspace(
    query: string,
    replacement: string,
    options: SearchOptions
  ): Promise<ReplaceResult[]> {
    const searchResults = await this.searchInWorkspace(query, options);
    const replaceResults: ReplaceResult[] = [];

    for (const result of searchResults) {
      const content = await this.readFile(result.file);
      const newContent = this.replaceInContent(content, query, replacement, options);

      await this.writeFile(result.file, newContent);

      replaceResults.push({
        file: result.file,
        replacements: result.matches.length
      });
    }

    return replaceResults;
  }

  private searchInContent(
    content: string,
    query: string,
    options: { caseSensitive: boolean; wholeWord: boolean; useRegex: boolean }
  ): Match[] {
    const matches: Match[] = [];
    const lines = content.split('\n');

    let regex: RegExp;

    if (options.useRegex) {
      regex = new RegExp(query, options.caseSensitive ? 'g' : 'gi');
    } else {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = options.wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery;
      regex = new RegExp(pattern, options.caseSensitive ? 'g' : 'gi');
    }

    lines.forEach((line, lineIndex) => {
      let match: RegExpExecArray | null;

      while ((match = regex.exec(line)) !== null) {
        matches.push({
          line: lineIndex + 1,
          column: match.index + 1,
          text: match[0]
        });
      }
    });

    return matches;
  }
}
```

```typescript
// src/components/panels/SearchPanel.tsx (actualización)
export function SearchPanel() {
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [includePattern, setIncludePattern] = useState('**/*');
  const [excludePattern, setExcludePattern] = useState('**/node_modules/**');

  const searchService = useMemo(() => new SearchService(), []);

  const handleSearch = async () => {
    const searchResults = await searchService.searchInWorkspace(query, {
      caseSensitive,
      wholeWord,
      useRegex,
      includePattern,
      excludePattern
    });

    setResults(searchResults);
  };

  const handleReplace = async () => {
    await searchService.replaceInWorkspace(query, replacement, {
      caseSensitive,
      wholeWord,
      useRegex,
      includePattern,
      excludePattern
    });

    // Refrescar búsqueda
    await handleSearch();
  };

  return (
    <div className="search-panel">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Buscar"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />

        <div className="search-options">
          <button
            className={caseSensitive ? 'active' : ''}
            onClick={() => setCaseSensitive(!caseSensitive)}
            title="Coincidir mayúsculas/minúsculas"
          >
            Aa
          </button>
          <button
            className={wholeWord ? 'active' : ''}
            onClick={() => setWholeWord(!wholeWord)}
            title="Coincidir palabra completa"
          >
            Ab|
          </button>
          <button
            className={useRegex ? 'active' : ''}
            onClick={() => setUseRegex(!useRegex)}
            title="Usar expresión regular"
          >
            .*
          </button>
        </div>
      </div>

      <div className="replace-input-container">
        <input
          type="text"
          placeholder="Reemplazar"
          value={replacement}
          onChange={(e) => setReplacement(e.target.value)}
        />
        <button onClick={handleReplace}>Reemplazar todo</button>
      </div>

      <div className="filter-inputs">
        <input
          type="text"
          placeholder="Archivos a incluir"
          value={includePattern}
          onChange={(e) => setIncludePattern(e.target.value)}
        />
        <input
          type="text"
          placeholder="Archivos a excluir"
          value={excludePattern}
          onChange={(e) => setExcludePattern(e.target.value)}
        />
      </div>

      <div className="search-results">
        {results.map((result, index) => (
          <div key={index} className="result-file">
            <div className="result-file-header">
              <span className="result-file-path">{result.file}</span>
              <span className="result-count">{result.matches.length}</span>
            </div>
            {result.matches.map((match, matchIndex) => (
              <div
                key={matchIndex}
                className="result-match"
                onClick={() => {
                  // Navegar al archivo y línea
                  openFileAtLine(result.file, match.line, match.column);
                }}
              >
                <span className="result-line-number">{match.line}</span>
                <span className="result-preview">{match.preview}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🖥️ FASE 5: Micro-PC Interna (Code Execution Engine)

### Arquitectura de Ejecución

#### 5.1 Sistema de Contenedores Virtuales

**Opción 1: WebContainers (Recomendado)**

```bash
npm install @webcontainer/api
```

```typescript
// src/services/CodeExecutor.ts
import { WebContainer } from '@webcontainer/api';

export class CodeExecutor {
  private container: WebContainer | null = null;
  private isBooting = false;

  async initialize(): Promise<void> {
    if (this.container || this.isBooting) return;

    this.isBooting = true;

    try {
      this.container = await WebContainer.boot();
      console.log('WebContainer initialized');
    } catch (error) {
      console.error('Failed to initialize WebContainer:', error);
    } finally {
      this.isBooting = false;
    }
  }

  async executeCode(
    code: string,
    language: string,
    options?: ExecutionOptions
  ): Promise<ExecutionResult> {
    if (!this.container) {
      await this.initialize();
    }

    if (!this.container) {
      throw new Error('WebContainer not available');
    }

    const executor = this.getExecutor(language);
    return await executor.execute(this.container, code, options);
  }

  private getExecutor(language: string): LanguageExecutor {
    switch (language) {
      case 'javascript':
      case 'typescript':
        return new JSExecutor();
      case 'python':
        return new PythonExecutor();
      case 'go':
        return new GoExecutor();
      case 'rust':
        return new RustExecutor();
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }
}

// Ejecutor para JavaScript/TypeScript
class JSExecutor implements LanguageExecutor {
  async execute(
    container: WebContainer,
    code: string,
    options?: ExecutionOptions
  ): Promise<ExecutionResult> {
    // Crear archivo temporal
    const fileName = 'temp.js';
    await container.fs.writeFile(fileName, code);

    // Ejecutar con Node.js
    const process = await container.spawn('node', [fileName]);

    const output: string[] = [];
    const errors: string[] = [];

    process.output.pipeTo(
      new WritableStream({
        write(data) {
          output.push(data);
        }
      })
    );

    const exitCode = await process.exit;

    return {
      output: output.join(''),
      errors: errors.join(''),
      exitCode,
      executionTime: 0 // Implementar medición
    };
  }
}

// Ejecutor para Python (usando Pyodide en Web Worker)
class PythonExecutor implements LanguageExecutor {
  private pyodide: any = null;
  private worker: Worker | null = null;

  async execute(
    container: WebContainer,
    code: string,
    options?: ExecutionOptions
  ): Promise<ExecutionResult> {
    if (!this.worker) {
      this.worker = new Worker('/workers/python.worker.js');

      // Inicializar Pyodide
      await new Promise((resolve) => {
        this.worker!.onmessage = (e) => {
          if (e.data.type === 'ready') {
            resolve(true);
          }
        };
        this.worker!.postMessage({ type: 'init' });
      });
    }

    return new Promise((resolve) => {
      this.worker!.onmessage = (e) => {
        if (e.data.type === 'result') {
          resolve({
            output: e.data.output,
            errors: e.data.errors,
            exitCode: e.data.exitCode,
            executionTime: e.data.executionTime
          });
        }
      };

      this.worker!.postMessage({
        type: 'execute',
        code
      });
    });
  }
}
```

**Python Worker:**

```typescript
// public/workers/python.worker.js
importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js');

let pyodide = null;

self.onmessage = async (e) => {
  const { type, code } = e.data;

  if (type === 'init') {
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
    });

    self.postMessage({ type: 'ready' });
    return;
  }

  if (type === 'execute') {
    const startTime = performance.now();

    try {
      // Capturar stdout
      await pyodide.runPythonAsync(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
        sys.stderr = StringIO()
      `);

      // Ejecutar código
      await pyodide.runPythonAsync(code);

      // Obtener output
      const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()');
      const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()');

      const endTime = performance.now();

      self.postMessage({
        type: 'result',
        output: stdout,
        errors: stderr,
        exitCode: 0,
        executionTime: endTime - startTime
      });
    } catch (error) {
      const endTime = performance.now();

      self.postMessage({
        type: 'result',
        output: '',
        errors: error.message,
        exitCode: 1,
        executionTime: endTime - startTime
      });
    }
  }
};
```

#### 5.2 UI para Ejecución de Código

```typescript
// src/components/editor/CodeExecutionPanel.tsx
export function CodeExecutionPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [errors, setErrors] = useState<string>('');
  const { activeFile, files } = useEditorStore();
  const codeExecutor = useMemo(() => new CodeExecutor(), []);

  const runCode = async () => {
    if (!activeFile) return;

    const file = files.find(f => f.path === activeFile);
    if (!file) return;

    setIsRunning(true);
    setOutput('');
    setErrors('');

    try {
      const language = getLanguageFromFileName(file.name);
      const result = await codeExecutor.executeCode(file.content, language);

      setOutput(result.output);
      setErrors(result.errors);
    } catch (error) {
      setErrors(error.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="code-execution-panel">
      <div className="execution-toolbar">
        <button onClick={runCode} disabled={isRunning}>
          {isRunning ? 'Ejecutando...' : 'Ejecutar'}
        </button>
        <button onClick={() => { setOutput(''); setErrors(''); }}>
          Limpiar
        </button>
      </div>

      <div className="execution-output">
        {output && (
          <div className="output-section">
            <h4>Output:</h4>
            <pre>{output}</pre>
          </div>
        )}

        {errors && (
          <div className="errors-section">
            <h4>Errors:</h4>
            <pre className="text-red-500">{errors}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Opción 2: Iframe Sandbox (Alternativa Ligera)**

Para código web (HTML/CSS/JS):

```typescript
// src/components/editor/PreviewPanel.tsx
export function PreviewPanel() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { files, activeFile } = useEditorStore();

  const runPreview = () => {
    if (!iframeRef.current) return;

    const htmlFile = files.find(f => f.name.endsWith('.html'));
    const cssFile = files.find(f => f.name.endsWith('.css'));
    const jsFile = files.find(f => f.name.endsWith('.js'));

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssFile?.content || ''}</style>
        </head>
        <body>
          ${htmlFile?.content || ''}
          <script>${jsFile?.content || ''}</script>
        </body>
      </html>
    `;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
  };

  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <button onClick={runPreview}>Refrescar</button>
      </div>
      <iframe
        ref={iframeRef}
        className="preview-iframe"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
```

---

## 🎨 FASE 6: Sistema de Temas VS Code Compatible

### Importación de Temas

```typescript
// src/services/ThemeImporter.ts
export class ThemeImporter {
  async importVSCodeTheme(themeJson: any): Promise<ITheme> {
    // Convertir formato VS Code a formato NovaHub
    const theme: ITheme = {
      id: themeJson.name.toLowerCase().replace(/\s+/g, '-'),
      name: themeJson.name,
      type: themeJson.type || 'dark',
      colors: this.convertColors(themeJson.colors),
      tokenColors: this.convertTokenColors(themeJson.tokenColors)
    };

    return theme;
  }

  private convertColors(colors: any): ThemeColors {
    return {
      'editor.background': colors['editor.background'],
      'editor.foreground': colors['editor.foreground'],
      'activityBar.background': colors['activityBar.background'],
      'activityBar.foreground': colors['activityBar.foreground'],
      'sideBar.background': colors['sideBar.background'],
      'sideBar.foreground': colors['sideBar.foreground'],
      'statusBar.background': colors['statusBar.background'],
      'statusBar.foreground': colors['statusBar.foreground'],
      'titleBar.activeBackground': colors['titleBar.activeBackground'],
      'titleBar.activeForeground': colors['titleBar.activeForeground'],
      // ... más colores
    };
  }

  private convertTokenColors(tokenColors: any[]): TokenColor[] {
    return tokenColors.map(token => ({
      scope: Array.isArray(token.scope) ? token.scope : [token.scope],
      settings: {
        foreground: token.settings.foreground,
        background: token.settings.background,
        fontStyle: token.settings.fontStyle
      }
    }));
  }

  async loadThemeFromURL(url: string): Promise<ITheme> {
    const response = await fetch(url);
    const themeJson = await response.json();
    return this.importVSCodeTheme(themeJson);
  }

  async loadThemeFromFile(file: File): Promise<ITheme> {
    const text = await file.text();
    const themeJson = JSON.parse(text);
    return this.importVSCodeTheme(themeJson);
  }
}
```

```typescript
// src/components/settings/ThemeSettings.tsx
export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const [customThemes, setCustomThemes] = useState<ITheme[]>([]);
  const themeImporter = useMemo(() => new ThemeImporter(), []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const theme = await themeImporter.loadThemeFromFile(file);
      setCustomThemes(prev => [...prev, theme]);
      setTheme(theme);
    } catch (error) {
      console.error('Failed to import theme:', error);
    }
  };

  const popularThemes = [
    { name: 'One Dark Pro', url: '/themes/one-dark-pro.json' },
    { name: 'Dracula', url: '/themes/dracula.json' },
    { name: 'Monokai', url: '/themes/monokai.json' },
    { name: 'Solarized Dark', url: '/themes/solarized-dark.json' },
    { name: 'GitHub Dark', url: '/themes/github-dark.json' },
    { name: 'Nord', url: '/themes/nord.json' }
  ];

  const loadPopularTheme = async (url: string) => {
    const theme = await themeImporter.loadThemeFromURL(url);
    setTheme(theme);
  };

  return (
    <div className="theme-settings">
      <h3>Temas Populares</h3>
      <div className="popular-themes-grid">
        {popularThemes.map(t => (
          <button
            key={t.name}
            onClick={() => loadPopularTheme(t.url)}
            className="theme-preview-card"
          >
            {t.name}
          </button>
        ))}
      </div>

      <h3>Importar Tema</h3>
      <input
        type="file"
        accept=".json"
        onChange={handleFileUpload}
      />

      <h3>Temas Personalizados</h3>
      <div className="custom-themes-list">
        {customThemes.map(t => (
          <button key={t.id} onClick={() => setTheme(t)}>
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## ⚡ FASE 7: Optimización de Rendimiento

### 7.1 Virtualización de Listas

```bash
npm install react-window
```

```typescript
// src/components/editor/FileExplorer.tsx (optimizado)
import { FixedSizeList as List } from 'react-window';

export function FileExplorer() {
  const { fileTree } = useEditorStore();
  const flattenedFiles = useMemo(() => flattenFileTree(fileTree), [fileTree]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = flattenedFiles[index];

    return (
      <div style={style} className="file-tree-item">
        <FileTreeItem item={item} />
      </div>
    );
  };

  return (
    <List
      height={600}
      itemCount={flattenedFiles.length}
      itemSize={24}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

### 7.2 Code Splitting y Lazy Loading

```typescript
// src/components/editor/EditorLayoutNew.tsx (optimizado)
import dynamic from 'next/dynamic';

// Lazy load componentes pesados
const MonacoEditor = dynamic(() => import('./MonacoEditor'), {
  ssr: false,
  loading: () => <div>Cargando editor...</div>
});

const Terminal = dynamic(() => import('./Terminal'), {
  ssr: false,
  loading: () => <div>Cargando terminal...</div>
});

const GitPanel = dynamic(() => import('../panels/GitPanel'), {
  ssr: false
});

const ExtensionsPanel = dynamic(() => import('../panels/ExtensionsPanel'), {
  ssr: false
});
```

### 7.3 Web Workers para Operaciones Pesadas

```typescript
// src/workers/file-search.worker.ts
self.onmessage = async (e: MessageEvent) => {
  const { type, files, query } = e.data;

  if (type === 'search') {
    const results = [];

    for (const file of files) {
      const matches = searchInFile(file, query);
      if (matches.length > 0) {
        results.push({ file, matches });
      }
    }

    self.postMessage({ type: 'results', results });
  }
};

function searchInFile(file: any, query: string) {
  // Implementar búsqueda eficiente
  const matches = [];
  const lines = file.content.split('\n');

  lines.forEach((line, index) => {
    if (line.includes(query)) {
      matches.push({ line: index + 1, text: line });
    }
  });

  return matches;
}
```

### 7.4 Memoización y useMemo

```typescript
// src/store/useEditorStore.ts (optimizado)
export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      files: [],
      activeFile: null,

      // Memoizar operaciones costosas
      getFilesByType: (type: string) => {
        const { files } = get();
        return files.filter(f => f.name.endsWith(type));
      },

      // Batch updates
      updateFiles: (updates: FileUpdate[]) => {
        set(state => ({
          files: state.files.map(file => {
            const update = updates.find(u => u.path === file.path);
            return update ? { ...file, ...update } : file;
          })
        }));
      }
    }),
    {
      name: 'novahub-editor-storage',
      // Optimizar serialización
      serialize: (state) => JSON.stringify(state),
      deserialize: (str) => JSON.parse(str)
    }
  )
);
```

### 7.5 IndexedDB para Archivos Grandes

```typescript
// src/services/FileStorage.ts
import localforage from 'localforage';

export class FileStorage {
  private db: LocalForage;

  constructor() {
    this.db = localforage.createInstance({
      name: 'novahub-files',
      storeName: 'files'
    });
  }

  async saveFile(path: string, content: string): Promise<void> {
    await this.db.setItem(path, content);
  }

  async getFile(path: string): Promise<string | null> {
    return await this.db.getItem(path);
  }

  async deleteFile(path: string): Promise<void> {
    await this.db.removeItem(path);
  }

  async getAllFiles(): Promise<{ path: string; content: string }[]> {
    const keys = await this.db.keys();
    const files = [];

    for (const key of keys) {
      const content = await this.db.getItem<string>(key);
      if (content) {
        files.push({ path: key, content });
      }
    }

    return files;
  }
}
```

---

## ⌨️ FASE 8: Atajos de Teclado y Multi-cursor

### 8.1 Sistema de Atajos Avanzado

```typescript
// src/hooks/useKeyBindings.ts (expandido)
export function useKeyBindings() {
  const { executeCommand } = useCommandPalette();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      // Editor actions
      if (ctrl && e.key === 's') {
        e.preventDefault();
        executeCommand('editor.action.save');
      }

      if (ctrl && e.key === 'f') {
        e.preventDefault();
        executeCommand('editor.action.startFindReplaceAction');
      }

      if (ctrl && shift && e.key === 'F') {
        e.preventDefault();
        executeCommand('workbench.action.findInFiles');
      }

      // Multi-cursor
      if (ctrl && alt && e.key === 'ArrowDown') {
        e.preventDefault();
        executeCommand('editor.action.insertCursorBelow');
      }

      if (ctrl && alt && e.key === 'ArrowUp') {
        e.preventDefault();
        executeCommand('editor.action.insertCursorAbove');
      }

      if (ctrl && e.key === 'd') {
        e.preventDefault();
        executeCommand('editor.action.addSelectionToNextFindMatch');
      }

      // Navigation
      if (ctrl && e.key === 'p') {
        e.preventDefault();
        executeCommand('workbench.action.quickOpen');
      }

      if (ctrl && shift && e.key === 'P') {
        e.preventDefault();
        executeCommand('workbench.action.showCommands');
      }

      // Terminal
      if (ctrl && e.key === '`') {
        e.preventDefault();
        executeCommand('workbench.action.terminal.toggleTerminal');
      }

      // Refactoring
      if (e.key === 'F2') {
        e.preventDefault();
        executeCommand('editor.action.rename');
      }

      if (ctrl && shift && e.key === 'R') {
        e.preventDefault();
        executeCommand('editor.action.refactor');
      }

      // Code actions
      if (ctrl && e.key === '.') {
        e.preventDefault();
        executeCommand('editor.action.quickFix');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executeCommand]);
}
```

### 8.2 Command Palette

```typescript
// src/components/editor/CommandPalette.tsx
export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [commands, setCommands] = useState<Command[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allCommands: Command[] = [
    { id: 'editor.action.save', label: 'Guardar Archivo', category: 'Editor' },
    { id: 'workbench.action.findInFiles', label: 'Buscar en Archivos', category: 'Búsqueda' },
    { id: 'workbench.action.quickOpen', label: 'Ir a Archivo', category: 'Navegación' },
    { id: 'editor.action.formatDocument', label: 'Formatear Documento', category: 'Editor' },
    { id: 'editor.action.commentLine', label: 'Comentar Línea', category: 'Editor' },
    { id: 'editor.action.rename', label: 'Renombrar Símbolo', category: 'Refactoring' },
    // ... más comandos
  ];

  useEffect(() => {
    if (query) {
      const filtered = allCommands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
      );
      setCommands(filtered);
    } else {
      setCommands(allCommands);
    }
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsOpen(true);
      }

      if (e.key === 'Escape') {
        setIsOpen(false);
      }

      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, commands.length - 1));
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          executeCommand(commands[selectedIndex].id);
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, commands]);

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay">
      <div className="command-palette">
        <input
          type="text"
          placeholder="Buscar comandos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        <div className="command-list">
          {commands.map((cmd, index) => (
            <div
              key={cmd.id}
              className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => {
                executeCommand(cmd.id);
                setIsOpen(false);
              }}
            >
              <span className="command-label">{cmd.label}</span>
              <span className="command-category">{cmd.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 🐛 FASE 9: Panel de Problemas Funcional

### 9.1 Integración con Linters

```typescript
// src/services/LintingService.ts
import * as monaco from 'monaco-editor';

export class LintingService {
  private diagnostics = new Map<string, monaco.editor.IMarkerData[]>();

  async lintFile(file: { path: string; content: string; language: string }): Promise<Diagnostic[]> {
    const linter = this.getLinter(file.language);
    const diagnostics = await linter.lint(file.content);

    // Convertir a markers de Monaco
    const markers = diagnostics.map(d => ({
      severity: this.mapSeverity(d.severity),
      startLineNumber: d.line,
      startColumn: d.column,
      endLineNumber: d.endLine || d.line,
      endColumn: d.endColumn || d.column + 1,
      message: d.message,
      source: d.source
    }));

    this.diagnostics.set(file.path, markers);

    return diagnostics;
  }

  getProblems(): Problem[] {
    const problems: Problem[] = [];

    this.diagnostics.forEach((markers, filePath) => {
      markers.forEach(marker => {
        problems.push({
          file: filePath,
          line: marker.startLineNumber,
          column: marker.startColumn,
          severity: marker.severity,
          message: marker.message,
          source: marker.source || 'unknown'
        });
      });
    });

    return problems;
  }

  private getLinter(language: string): Linter {
    switch (language) {
      case 'javascript':
      case 'typescript':
        return new ESLintLinter();
      case 'python':
        return new PyLintLinter();
      default:
        return new NoOpLinter();
    }
  }

  private mapSeverity(severity: DiagnosticSeverity): monaco.MarkerSeverity {
    switch (severity) {
      case 'error':
        return monaco.MarkerSeverity.Error;
      case 'warning':
        return monaco.MarkerSeverity.Warning;
      case 'info':
        return monaco.MarkerSeverity.Info;
      default:
        return monaco.MarkerSeverity.Hint;
    }
  }
}

// ESLint en browser
class ESLintLinter implements Linter {
  private eslint: any;

  constructor() {
    // Usar ESLint WASM o browser bundle
    import('eslint-linter-browserify').then(module => {
      this.eslint = new module.Linter();
    });
  }

  async lint(code: string): Promise<Diagnostic[]> {
    if (!this.eslint) {
      return [];
    }

    const messages = this.eslint.verify(code, {
      env: { browser: true, es2021: true },
      extends: 'eslint:recommended',
      parserOptions: { ecmaVersion: 12, sourceType: 'module' }
    });

    return messages.map((msg: any) => ({
      line: msg.line,
      column: msg.column,
      endLine: msg.endLine,
      endColumn: msg.endColumn,
      severity: msg.severity === 2 ? 'error' : 'warning',
      message: msg.message,
      source: 'eslint'
    }));
  }
}
```

```typescript
// src/components/panels/ProblemsPanel.tsx
export function ProblemsPanel() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filter, setFilter] = useState<'all' | 'errors' | 'warnings'>('all');
  const lintingService = useMemo(() => new LintingService(), []);
  const { files, openFile } = useEditorStore();

  useEffect(() => {
    // Lint all files
    const lintAllFiles = async () => {
      for (const file of files) {
        await lintingService.lintFile({
          path: file.path,
          content: file.content,
          language: getLanguageFromFileName(file.name)
        });
      }

      setProblems(lintingService.getProblems());
    };

    lintAllFiles();
  }, [files, lintingService]);

  const filteredProblems = useMemo(() => {
    if (filter === 'errors') {
      return problems.filter(p => p.severity === monaco.MarkerSeverity.Error);
    }
    if (filter === 'warnings') {
      return problems.filter(p => p.severity === monaco.MarkerSeverity.Warning);
    }
    return problems;
  }, [problems, filter]);

  const errorCount = problems.filter(p => p.severity === monaco.MarkerSeverity.Error).length;
  const warningCount = problems.filter(p => p.severity === monaco.MarkerSeverity.Warning).length;

  return (
    <div className="problems-panel">
      <div className="problems-toolbar">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Todos ({problems.length})
        </button>
        <button
          className={filter === 'errors' ? 'active' : ''}
          onClick={() => setFilter('errors')}
        >
          Errores ({errorCount})
        </button>
        <button
          className={filter === 'warnings' ? 'active' : ''}
          onClick={() => setFilter('warnings')}
        >
          Advertencias ({warningCount})
        </button>
      </div>

      <div className="problems-list">
        {filteredProblems.map((problem, index) => (
          <div
            key={index}
            className="problem-item"
            onClick={() => {
              openFile(problem.file);
              // Navegar a línea
              navigateToLine(problem.line, problem.column);
            }}
          >
            <span className={`problem-severity severity-${problem.severity}`}>
              {problem.severity === monaco.MarkerSeverity.Error ? '✖' : '⚠'}
            </span>
            <span className="problem-message">{problem.message}</span>
            <span className="problem-location">
              {problem.file}:{problem.line}:{problem.column}
            </span>
            <span className="problem-source">{problem.source}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📦 FASE 10: Instalación de Dependencias

### 10.1 Package Manager

```bash
# Core dependencies
npm install @webcontainer/api pyodide socket.io socket.io-client node-pty

# LSP
npm install vscode-languageserver-protocol vscode-languageserver-types

# Performance
npm install react-window

# Linting
npm install eslint-linter-browserify

# Adicionales
npm install fuse.js  # Fuzzy search para command palette
npm install monaco-themes  # Temas adicionales de Monaco
```

### 10.2 Actualización package.json

```json
{
  "dependencies": {
    "@monaco-editor/react": "^4.7.0",
    "@webcontainer/api": "^1.1.0",
    "@xterm/xterm": "^5.3.0",
    "@xterm/addon-fit": "^0.8.0",
    "@xterm/addon-web-links": "^0.9.0",
    "vscode-languageserver-protocol": "^3.17.5",
    "socket.io": "^4.7.0",
    "socket.io-client": "^4.7.0",
    "react-window": "^1.8.10",
    "fuse.js": "^7.0.0",
    "eslint-linter-browserify": "^9.0.0",
    "monaco-themes": "^0.4.4"
  },
  "devDependencies": {
    "node-pty": "^1.0.0"
  }
}
```

---

## 🎯 RESUMEN DE ARQUITECTURA

### Stack Tecnológico Final

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js 16)           │
├─────────────────────────────────────────┤
│  • Monaco Editor (Core)                 │
│  • React 19 + TypeScript                │
│  • Zustand (State Management)           │
│  • Tailwind CSS v4                      │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│       Extension System                  │
├─────────────────────────────────────────┤
│  • Extension Host (Web Worker)          │
│  • API compatible con VS Code           │
│  • Marketplace integration              │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│      Language Intelligence              │
├─────────────────────────────────────────┤
│  • LSP Client (Web Workers)             │
│  • Language Servers (TS, Python, etc.)  │
│  • Linting (ESLint, PyLint)             │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│      Code Execution Engine              │
├─────────────────────────────────────────┤
│  • WebContainers (Node.js)              │
│  • Pyodide (Python)                     │
│  • Sandbox iframes (Web)                │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│          Terminal Backend               │
├─────────────────────────────────────────┤
│  • WebSocket Server                     │
│  • node-pty (Real shells)               │
│  • Multiple shell support               │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│         GitHub Integration              │
├─────────────────────────────────────────┤
│  • OAuth 2.0 (NextAuth)                 │
│  • Octokit REST API                     │
│  • Git operations                       │
└─────────────────────────────────────────┘
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### ✅ Ya Implementado
- [x] Monaco Editor integrado
- [x] UI estilo VS Code
- [x] Sistema de temas básico
- [x] GitHub OAuth y operaciones de archivos
- [x] Terminal UI (simulado)
- [x] Tabs de editor
- [x] File explorer
- [x] Activity bar y paneles

### 🔨 Por Implementar

#### Alta Prioridad
- [ ] **Sistema de extensiones** (Fase 1)
  - [ ] Extension Host con Web Workers
  - [ ] API de extensiones
  - [ ] Marketplace UI

- [ ] **LSP Integration** (Fase 2)
  - [ ] Language Client base
  - [ ] TypeScript/JavaScript LSP
  - [ ] Python LSP
  - [ ] Integración con Monaco

- [ ] **Terminal funcional** (Fase 3)
  - [ ] WebSocket server
  - [ ] node-pty integration
  - [ ] Multiple shells

- [ ] **Code execution** (Fase 5)
  - [ ] WebContainers setup
  - [ ] Pyodide worker
  - [ ] Execution UI

#### Prioridad Media
- [ ] **Búsqueda global** (Fase 4)
  - [ ] SearchService completo
  - [ ] Replace functionality
  - [ ] Search panel funcional

- [ ] **Panel de problemas** (Fase 9)
  - [ ] LintingService
  - [ ] ESLint integration
  - [ ] Problems panel UI

- [ ] **Command Palette** (Fase 8)
  - [ ] Command registry
  - [ ] Fuzzy search
  - [ ] Keybindings avanzados

#### Prioridad Baja
- [ ] **Temas VS Code** (Fase 6)
  - [ ] Theme importer
  - [ ] Popular themes library
  - [ ] Theme settings UI

- [ ] **Optimizaciones** (Fase 7)
  - [ ] Virtual scrolling
  - [ ] Code splitting
  - [ ] IndexedDB storage
  - [ ] Web Workers para search

---

## 🚀 PLAN DE EJECUCIÓN

### Semana 1-2: Core Features
1. Implementar sistema de extensiones base
2. Integrar LSP para TypeScript/JavaScript
3. Terminal funcional con WebSocket

### Semana 3-4: Advanced Features
1. Code execution engine (WebContainers + Pyodide)
2. Búsqueda global y replace
3. Panel de problemas con linting

### Semana 5-6: Polish & Optimization
1. Command palette y atajos avanzados
2. Sistema de temas mejorado
3. Optimizaciones de rendimiento
4. Testing y bug fixes

---

## 🎨 PRESERVACIÓN DEL DISEÑO ACTUAL

**Garantía de no alteración visual:**

1. Todos los nuevos componentes usarán las mismas clases CSS existentes
2. Los colores y tipografías permanecen iguales
3. Layout de Activity Bar, Sidebar, Editor Area se mantiene
4. Nuevas funcionalidades se integran en los paneles existentes
5. No se modificarán archivos de estilos globales sin necesidad

**Estrategia:**
- Los componentes nuevos extenderán los existentes
- Se usarán las mismas variables CSS y tema actual
- Cualquier UI nueva seguirá los patrones visuales establecidos

---

## 📈 MÉTRICAS DE ÉXITO

1. **Funcionalidad:**
   - Extensiones instalables y funcionales
   - Autocompletado inteligente en al menos 3 lenguajes
   - Terminal ejecutando comandos reales
   - Código ejecutándose en el navegador

2. **Rendimiento:**
   - Tiempo de carga inicial < 3 segundos
   - Lag de escritura < 50ms
   - Búsqueda en 1000 archivos < 2 segundos

3. **UX:**
   - Todos los atajos de VS Code funcionando
   - Diseño visual idéntico al actual
   - Sin regresiones en funcionalidad existente

---

## 🔧 PRÓXIMOS PASOS

1. **Revisar y aprobar este plan**
2. **Instalar dependencias base**
3. **Comenzar con Fase 1: Sistema de Extensiones**
4. **Iterar fase por fase con testing continuo**

---

**Nota:** Este plan es modular y se puede implementar fase por fase. Cada fase es independiente y añade funcionalidad sin romper lo existente.
