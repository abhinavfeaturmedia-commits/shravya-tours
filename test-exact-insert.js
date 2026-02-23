import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function testExactInsert() {
    const log = {
        action: 'Create',
        module: 'Packages',
        details: 'Created Package: Test Pkg',
        severity: 'Info',
        performedBy: 'System',
        timestamp: new Date().toISOString()
    };

    const dbLog = { ...log, performed_by: log.performedBy };
    delete dbLog.performedBy;

    console.log('Inserting:', dbLog);
    const { data, error } = await supabase.from('audit_logs').insert([dbLog]);
    console.log('Insert Error:', error);
}

testExactInsert();
