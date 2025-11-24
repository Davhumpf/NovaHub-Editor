import React from 'react';
import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiJson,
  SiMarkdown,
  SiHtml5,
  SiCss3,
  SiPython,
  SiCplusplus,
  SiPhp,
  SiGo,
  SiRust,
  SiRuby,
  SiYaml,
  SiSass,
  SiGraphql,
  SiDocker,
  SiGit,
  SiNodedotjs,
  SiNpm,
  SiSwift,
  SiKotlin,
  SiDart,
  SiVuedotjs,
  SiSvelte,
  SiAngular,
  SiWebpack,
  SiVite,
  SiNextdotjs,
  SiTailwindcss,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiShell,
} from 'react-icons/si';
import { FaFileAlt, FaFolder, FaFolderOpen, FaJava, FaDatabase } from 'react-icons/fa';
import { VscFile, VscFileCode, VscJson } from 'react-icons/vsc';

// Get file icon based on extension
export function getFileIcon(fileName: string, isExpanded?: boolean): React.ReactNode {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  // Folders
  if (fileName === 'folder') {
    return isExpanded ?
      <FaFolderOpen className="text-blue-400 h-4 w-4" /> :
      <FaFolder className="text-blue-400 h-4 w-4" />;
  }

  // Special files
  if (fileName === 'package.json') return <SiNodedotjs className="text-green-500 h-4 w-4" />;
  if (fileName === 'package-lock.json') return <SiNpm className="text-red-500 h-4 w-4" />;
  if (fileName === 'tsconfig.json') return <SiTypescript className="text-blue-500 h-4 w-4" />;
  if (fileName === 'Dockerfile') return <SiDocker className="text-blue-500 h-4 w-4" />;
  if (fileName === '.gitignore' || fileName === '.gitattributes') return <SiGit className="text-orange-600 h-4 w-4" />;
  if (fileName === 'tailwind.config.js' || fileName === 'tailwind.config.ts') return <SiTailwindcss className="text-cyan-400 h-4 w-4" />;
  if (fileName === 'next.config.js' || fileName === 'next.config.ts') return <SiNextdotjs className="text-white h-4 w-4" />;
  if (fileName === 'webpack.config.js') return <SiWebpack className="text-blue-400 h-4 w-4" />;
  if (fileName === 'vite.config.js' || fileName === 'vite.config.ts') return <SiVite className="text-purple-500 h-4 w-4" />;

  // Programming languages
  switch (extension) {
    // JavaScript/TypeScript
    case 'js':
    case 'mjs':
    case 'cjs':
      return <SiJavascript className="text-yellow-400 h-4 w-4" />;
    case 'ts':
    case 'mts':
    case 'cts':
      return <SiTypescript className="text-blue-500 h-4 w-4" />;
    case 'tsx':
    case 'jsx':
      return <SiReact className="text-cyan-400 h-4 w-4" />;

    // Web
    case 'html':
    case 'htm':
      return <SiHtml5 className="text-orange-600 h-4 w-4" />;
    case 'css':
      return <SiCss3 className="text-blue-600 h-4 w-4" />;
    case 'scss':
    case 'sass':
      return <SiSass className="text-pink-500 h-4 w-4" />;
    case 'vue':
      return <SiVuedotjs className="text-green-500 h-4 w-4" />;
    case 'svelte':
      return <SiSvelte className="text-orange-600 h-4 w-4" />;

    // Data formats
    case 'json':
    case 'jsonc':
      return <SiJson className="text-yellow-500 h-4 w-4" />;
    case 'yaml':
    case 'yml':
      return <SiYaml className="text-red-400 h-4 w-4" />;
    case 'xml':
      return <VscFileCode className="text-orange-500 h-4 w-4" />;
    case 'toml':
      return <VscFile className="text-gray-400 h-4 w-4" />;

    // Documentation
    case 'md':
    case 'mdx':
      return <SiMarkdown className="text-gray-300 h-4 w-4" />;
    case 'txt':
      return <FaFileAlt className="text-gray-400 h-4 w-4" />;

    // Backend languages
    case 'py':
    case 'pyc':
    case 'pyd':
    case 'pyo':
    case 'pyw':
    case 'pyz':
      return <SiPython className="text-blue-400 h-4 w-4" />;
    case 'java':
      return <FaJava className="text-red-500 h-4 w-4" />;
    case 'kt':
    case 'kts':
      return <SiKotlin className="text-purple-500 h-4 w-4" />;
    case 'swift':
      return <SiSwift className="text-orange-500 h-4 w-4" />;
    case 'dart':
      return <SiDart className="text-blue-400 h-4 w-4" />;
    case 'go':
      return <SiGo className="text-cyan-500 h-4 w-4" />;
    case 'rs':
      return <SiRust className="text-orange-700 h-4 w-4" />;
    case 'cpp':
    case 'cc':
    case 'cxx':
    case 'c++':
    case 'hpp':
    case 'hh':
    case 'hxx':
      return <SiCplusplus className="text-blue-500 h-4 w-4" />;
    case 'c':
    case 'h':
      return <VscFileCode className="text-blue-600 h-4 w-4" />;
    case 'cs':
      return <VscFileCode className="text-green-600 h-4 w-4" />;
    case 'php':
      return <SiPhp className="text-violet-400 h-4 w-4" />;
    case 'rb':
      return <SiRuby className="text-red-400 h-4 w-4" />;

    // GraphQL
    case 'graphql':
    case 'gql':
      return <SiGraphql className="text-pink-300 h-4 w-4" />;

    // Database
    case 'sql':
      return <FaDatabase className="text-orange-400 h-4 w-4" />;
    case 'prisma':
      return <FaDatabase className="text-blue-300 h-4 w-4" />;

    // Shell scripts
    case 'sh':
    case 'bash':
    case 'zsh':
    case 'fish':
      return <SiShell className="text-green-400 h-4 w-4" />;
    case 'bat':
    case 'cmd':
    case 'ps1':
      return <VscFile className="text-blue-300 h-4 w-4" />;

    // Config files
    case 'env':
      return <VscFile className="text-yellow-300 h-4 w-4" />;
    case 'ini':
    case 'cfg':
    case 'conf':
      return <VscFile className="text-gray-400 h-4 w-4" />;

    // Images
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
    case 'ico':
      return <VscFile className="text-purple-400 h-4 w-4" />;

    // Other
    case 'pdf':
      return <FaFileAlt className="text-red-400 h-4 w-4" />;
    case 'zip':
    case 'rar':
    case 'tar':
    case 'gz':
    case '7z':
      return <FaFileAlt className="text-yellow-600 h-4 w-4" />;

    default:
      return <VscFile className="text-gray-400 h-4 w-4" />;
  }
}

// Get language from file extension for Monaco Editor
export function getLanguageFromFileName(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  const languageMap: { [key: string]: string } = {
    // JavaScript/TypeScript
    js: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    mts: 'typescript',
    cts: 'typescript',

    // Web
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',

    // Data
    json: 'json',
    jsonc: 'jsonc',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    toml: 'toml',

    // Documentation
    md: 'markdown',
    mdx: 'markdown',
    txt: 'plaintext',

    // Programming languages
    py: 'python',
    java: 'java',
    kt: 'kotlin',
    swift: 'swift',
    dart: 'dart',
    go: 'go',
    rs: 'rust',
    cpp: 'cpp',
    cc: 'cpp',
    cxx: 'cpp',
    'c++': 'cpp',
    c: 'c',
    cs: 'csharp',
    php: 'php',
    rb: 'ruby',

    // GraphQL
    graphql: 'graphql',
    gql: 'graphql',

    // Database
    sql: 'sql',

    // Shell
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    fish: 'shell',
    bat: 'bat',
    cmd: 'bat',
    ps1: 'powershell',

    // Config
    env: 'plaintext',
    ini: 'ini',
    cfg: 'ini',
    conf: 'ini',

    // Docker
    dockerfile: 'dockerfile',

    // Other
    prisma: 'prisma',
    vue: 'vue',
    svelte: 'svelte',
  };

  // Check for special filenames
  if (fileName === 'Dockerfile') return 'dockerfile';
  if (fileName.endsWith('.config.js') || fileName.endsWith('.config.ts')) return fileName.endsWith('.ts') ? 'typescript' : 'javascript';

  return languageMap[extension] || 'plaintext';
}
