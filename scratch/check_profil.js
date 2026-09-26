import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fugqdiuxnjwfgxpvxqsy.supabase.co';
const supabaseKey = 'sb_publishable_7H8TnQ3tHh86UowfOGZlwQ_W_J0YEsb';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfil() {
  const { data: profil, error } = await supabase.from('profil').select('*');
  console.log('Profil error:', error);
  console.log('Profil list:', profil);

  const { data: yayasan } = await supabase.from('yayasan').select('*');
  console.log('Yayasan list:', yayasan);
}

checkProfil();
