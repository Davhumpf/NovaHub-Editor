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
} from 'react-icons/si';
import { FaFileAlt } from 'react-icons/fa';

// Usa React.ReactNode como tipo de retorno
export function getFileIcon(extension: string): React.ReactNode {
  switch (extension) {
    case 'js':   return <SiJavascript className="text-yellow-400 h-4 w-4" />;
    case 'ts':   return <SiTypescript className="text-blue-500 h-4 w-4" />;
    case 'tsx':
    case 'jsx':  return <SiReact className="text-cyan-400 h-4 w-4" />;
    case 'json': return <SiJson className="text-green-400 h-4 w-4" />;
    case 'md':   return <SiMarkdown className="text-gray-400 h-4 w-4" />;
    case 'html': return <SiHtml5 className="text-orange-600 h-4 w-4" />;
    case 'css':  return <SiCss3 className="text-blue-600 h-4 w-4" />;
    case 'py':   return <SiPython className="text-yellow-500 h-4 w-4" />;
    case 'cpp':  return <SiCplusplus className="text-blue-900 h-4 w-4" />;
    case 'php':  return <SiPhp className="text-violet-400 h-4 w-4" />;
    case 'go':   return <SiGo className="text-cyan-500 h-4 w-4" />;
    case 'rs':   return <SiRust className="text-orange-700 h-4 w-4" />;
    case 'rb':   return <SiRuby className="text-red-400 h-4 w-4" />;
    case 'yaml':
    case 'yml':  return <SiYaml className="text-blue-400 h-4 w-4" />;
    case 'scss':
    case 'sass': return <SiSass className="text-pink-500 h-4 w-4" />;
    case 'graphql':
    case 'gql':  return <SiGraphql className="text-pink-300 h-4 w-4" />;
    default:     return <FaFileAlt className="text-zinc-400 h-4 w-4" />;
  }
}
