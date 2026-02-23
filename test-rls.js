import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkRLS() {
    console.log('Using RPC to check policies, or standard fetch...');
    // The easiest way is to try an insert as an anon user and see the exact error it returns.
    // Let's create an unauthenticated insert and catch the error.
    const { data, error } = await supabase.from('audit_logs').insert([{
        action: 'Test',
        module: 'System',
        details: 'Testing RLS',
        severity: 'Info',
        performed_by: 'Unknown User'
    }]);

    console.log('Insert Error:', error);
}

checkRLS();
