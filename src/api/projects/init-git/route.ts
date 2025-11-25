import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { projectPath, repoUrl } = await request.json();

    // Comandos Git
    const commands = [
      'git init',
      'git add .',
      'git commit -m "Initial commit from Novahub Editor"',
      `git remote add origin ${repoUrl}`,
      'git branch -M main',
      'git push -u origin main'
    ];

    let output = '';

    for (const command of commands) {
      const { stdout, stderr } = await execAsync(command, {
        cwd: projectPath,
        timeout: 60000
      });
      output += stdout + '\n';
      if (stderr) output += stderr + '\n';
    }

    return NextResponse.json({
      success: true,
      output
    });

  } catch (error: any) {
    console.error('Error initializing Git:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize Git' },
      { status: 500 }
    );
  }
}
