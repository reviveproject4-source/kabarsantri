import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fugqdiuxnjwfgxpvxqsy.supabase.co';
const supabaseKey = 'sb_publishable_7H8TnQ3tHh86UowfOGZlwQ_W_J0YEsb';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSantri() {
  const { data, error, count } = await supabase.from('santri').select('*', { count: 'exact' });
  console.log('Santri error:', error);
  console.log('Santri count:', count);
  console.log('Santri sample:', data);
}

checkSantri();
