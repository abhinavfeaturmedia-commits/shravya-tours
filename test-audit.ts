import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL as string,
    process.env.VITE_SUPABASE_ANON_KEY as string
);

async function testInsert() {
    console.log('Testing insert into audit_logs...');
    const { data, error } = await supabase.from('audit_logs').insert([{
        action: 'Test',
        module: 'System',
        details: 'Testing audit logs',
        severity: 'Info',
        performed_by: 'Admin',
        // timestamp is omitted so Supabase uses DEFAULT now()
    }]);

    console.log('Error:', error);
    console.log('Data:', data);
}

testInsert();
