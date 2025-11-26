import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if credentials are available
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials not found. Some features may not work.');
}

export { supabase };

// Tipos para el progreso del usuario
export interface UserProgress {
  user_id: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  completed_lessons: string[];
  current_lesson?: string;
  updated_at: string;
}

// Funciones de utilidad para el progreso
export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user progress:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProgress:', error);
    return null;
  }
}

export async function updateUserProgress(
  userId: string,
  progress: Partial<UserProgress>
): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return false;
  }

  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        ...progress,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error updating user progress:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateUserProgress:', error);
    return false;
  }
}

export async function markLessonComplete(
  userId: string,
  lessonId: string
): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return false;
  }

  try {
    const currentProgress = await getUserProgress(userId);
    const completedLessons = currentProgress?.completed_lessons || [];

    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    }

    return await updateUserProgress(userId, {
      completed_lessons: completedLessons,
    });
  } catch (error) {
    console.error('Error in markLessonComplete:', error);
    return false;
  }
}
