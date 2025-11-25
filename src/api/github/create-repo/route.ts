import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { name, description, private: isPrivate, auto_init } = await request.json();

    // Crear repositorio en GitHub
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Failed to create repository' },
        { status: response.status }
      );
    }

    const repo = await response.json();

    return NextResponse.json(repo);

  } catch (error: any) {
    console.error('Error creating GitHub repo:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create repository' },
      { status: 500 }
    );
  }
}
