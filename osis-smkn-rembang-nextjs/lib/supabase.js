import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uuiussmjdxbjkosuhtwv.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable__wWKWgwF94jeeZ42tUp8XQ_Cg7c8sHr';

export const supabase = createClient(supabaseUrl, supabaseKey);
