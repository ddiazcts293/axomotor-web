import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabaseUrl = "https://ikpwbjzrbkonpeumsrja.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrcHdianpyYmtvbnBldW1zcmphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMyMTM4NCwiZXhwIjoyMDY5ODk3Mzg0fQ.KHjOxd1sZj-AtmsT-vOSNNzDPvvt6nZHUnX9njiofeQ";
export const supabase = createClient(supabaseUrl, supabaseKey);


export const firebaseConfig = {};
export const axomotorApiUrl = 'http://localhost:5219/api';
