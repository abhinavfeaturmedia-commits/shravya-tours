import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function testFetch() {
    console.log('Fetching audit logs...');
    const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(10);
    console.log('Error:', error);
    console.log('Data count:', data ? data.length : 0);
    console.log('Data:', data);
}

testFetch();
