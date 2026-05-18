import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://ykpsbzbwyctburjesrod.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kHCzuXOC8mpoMHAV7grCpA_nRVgQYYj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
