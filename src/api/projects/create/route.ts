import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { command, projectName, template } = await request.json();

    // Define el directorio base donde se crearán los proyectos
    const projectsDir = path.join(process.cwd(), 'projects');
    
    // Crear el directorio projects si no existe
    await fs.mkdir(projectsDir, { recursive: true });

    const projectPath = path.join(projectsDir, projectName);

    // Verificar si el proyecto ya existe
    try {
      await fs.access(projectPath);
      return NextResponse.json(
        { error: 'Un proyecto con ese nombre ya existe' },
        { status: 400 }
      );
    } catch {
      // El proyecto no existe, continuar
    }

    // Ejecutar el comando de creación
    const { stdout, stderr } = await execAsync(command, {
      cwd: projectsDir,
      timeout: 300000 // 5 minutos timeout
    });

    console.log('Project creation output:', stdout);
    if (stderr) console.error('Project creation stderr:', stderr);

    return NextResponse.json({
      success: true,
      projectPath,
      output: stdout
    });

  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 500 }
    );
  }
}
