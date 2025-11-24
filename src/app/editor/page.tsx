'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import EditorLayout from '@/components/editor/EditorLayout';

export default function EditorPage() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  return (
    <div className="h-screen overflow-hidden">
      <EditorLayout theme={theme} />
    </div>
  );
}
