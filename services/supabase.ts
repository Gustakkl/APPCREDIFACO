
import { createClient } from '@supabase/supabase-js';

// URL e Chave do seu projeto Supabase fornecidas
const SUPABASE_URL = 'https://ifoaudqjwbjzfsghkphu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rPNCKvAEXaBL61bKruig8A_W3-wq186'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
