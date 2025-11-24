'use client';

import React, { useRef, useEffect } from 'react';
import Editor, { OnMount, Monaco } from '@monaco-editor/react';
import type * as monacoEditor from 'monaco-editor';

interface MonacoEditorProps {
  value: string;
  language: string;
  theme?: 'dark' | 'light';
  onChange?: (value: string | undefined) => void;
  onCursorPositionChange?: (line: number, column: number) => void;
  readOnly?: boolean;
}

export default function MonacoEditor({
  value,
  language,
  theme = 'dark',
  onChange,
  onCursorPositionChange,
  readOnly = false,
}: MonacoEditorProps) {
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure TypeScript/JavaScript defaults
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React,
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      esModuleInterop: true,
      allowJs: true,
      allowSyntheticDefaultImports: true,
      skipLibCheck: true,
      strict: false,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      allowJs: true,
      noEmit: true,
    });

    // Reduce excessive diagnostics
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: true,
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: true,
    });

    // Track cursor position changes
    if (onCursorPositionChange) {
      editor.onDidChangeCursorPosition((e) => {
        onCursorPositionChange(e.position.lineNumber, e.position.column);
      });
    }

    // Focus the editor
    editor.focus();
  };

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={onChange}
      onMount={handleEditorMount}
      theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
      options={{
        minimap: {
          enabled: true,
          maxColumn: 120,
        },
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
        fontLigatures: true,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        wordWrap: 'on',
        renderWhitespace: 'selection',
        bracketPairColorization: {
          enabled: true,
        },
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        suggestOnTriggerCharacters: true,
        quickSuggestions: {
          other: true,
          comments: false,
          strings: true,
        },
        parameterHints: {
          enabled: true,
        },
        formatOnPaste: true,
        formatOnType: true,
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        autoIndent: 'full',
        folding: true,
        foldingStrategy: 'indentation',
        showFoldingControls: 'always',
        readOnly,
        scrollbar: {
          vertical: 'auto',
          horizontal: 'auto',
          useShadows: false,
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
        },
        overviewRulerBorder: false,
        padding: {
          top: 10,
          bottom: 10,
        },
      }}
      loading={
        <div className="flex h-full items-center justify-center text-zinc-500">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
            <span className="text-sm">Loading editor...</span>
          </div>
        </div>
      }
    />
  );
}
