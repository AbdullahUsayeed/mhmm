import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ykpsbzbwyctburjesrod.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kHCzuXOC8mpoMHAV7grCpA_nRVgQYYj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const RAISA_GLOBE_SLUG = 'raisa';
