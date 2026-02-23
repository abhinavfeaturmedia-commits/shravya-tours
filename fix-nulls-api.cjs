const fs = require('fs');
const file = 'src/lib/api.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/return data as ([a-zA-Z\[\]]+);/g, 'return (data || []) as $1;');
code = code.replace(/setVendors\(v as Vendor\[\]\)/g, 'setVendors((v || []) as Vendor[])');
code = code.replace(/setAccounts\(a as Account\[\]\)/g, 'setAccounts((a || []) as Account[])');
code = code.replace(/setMasterLocations\(locs as MasterLocation\[\]\)/g, 'setMasterLocations((locs || []) as MasterLocation[])');

fs.writeFileSync(file, code);
console.log('Fixed api.ts');
