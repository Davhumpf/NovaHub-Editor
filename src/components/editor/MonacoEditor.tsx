"use client";
import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { useTheme } from '@/contexts/ThemeContext';

interface MonacoEditorProps {
  value: string;
  language: string;
  theme?: 'dark' | 'light';
  onChange?: (value: string | undefined) => void;
  onCursorPositionChange?: (line: number, column: number) => void;
}

export default function MonacoEditor({ 
  value, 
  language, 
  theme: legacyTheme = 'dark',
  onChange,
  onCursorPositionChange
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!editorRef.current) return;

    // Create editor instance
    const editor = monaco.editor.create(editorRef.current, {
      value,
      language,
      theme: legacyTheme === 'dark' ? 'vs-dark' : 'vs-light',
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      fontLigatures: true,
      lineNumbers: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on',
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        useShadows: false,
      },
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
    });

    editorInstanceRef.current = editor;

    // Configure TypeScript/JavaScript
    const typescriptLanguage = (monaco.languages as any).typescript;

    typescriptLanguage?.typescriptDefaults.setCompilerOptions({
      jsx: typescriptLanguage.JsxEmit.React,
      target: typescriptLanguage.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: typescriptLanguage.ModuleResolutionKind.NodeJs,
      module: typescriptLanguage.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      allowJs: true,
      skipLibCheck: true,
      strict: false,
      noImplicitAny: false,
      allowSyntheticDefaultImports: true,
    });

    typescriptLanguage?.javascriptDefaults.setCompilerOptions({
      target: typescriptLanguage.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      allowJs: true,
      noEmit: true,
    });

    // Reduce diagnostics noise
    typescriptLanguage?.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: true,
    });

    typescriptLanguage?.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: true,
    });

    // Listen for content changes
    const changeDisposable = editor.onDidChangeModelContent(() => {
      onChange?.(editor.getValue());
    });

    // Listen for cursor position changes
    const cursorDisposable = editor.onDidChangeCursorPosition((e: monaco.editor.ICursorPositionChangedEvent) => {
      onCursorPositionChange?.(e.position.lineNumber, e.position.column);
    });

    // Keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save command - you can emit an event here
      console.log('Save triggered');
    });

    return () => {
      changeDisposable.dispose();
      cursorDisposable.dispose();
      editor.dispose();
    };
  }, []);

  // Update value when prop changes
  useEffect(() => {
    if (editorInstanceRef.current) {
      const currentValue = editorInstanceRef.current.getValue();
      if (currentValue !== value) {
        editorInstanceRef.current.setValue(value);
      }
    }
  }, [value]);

  // Update language when prop changes
  useEffect(() => {
    if (editorInstanceRef.current) {
      const model = editorInstanceRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  // Update theme when prop changes
  useEffect(() => {
    monaco.editor.setTheme(legacyTheme === 'dark' ? 'vs-dark' : 'vs-light');
  }, [legacyTheme]);

  return <div ref={editorRef} className="h-full w-full" />;
}
