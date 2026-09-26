import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gjddqtmeezbzugmnuhkx.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_6ECo2Fm4Z6dEChfCurghxw_xR7RdbZo';

export const supabase = createClient(supabaseUrl, supabaseKey);
