import { db } from './db.ts';

console.log('[SmartStock Academic] Initializing and seeding relational database...');
db.resetToDefault();
const status = db.getEngineStatus();
console.log('[SmartStock Academic] Seeding complete!');
console.log('Engine:', status.engine);
console.log('Entities seeded:', status.counts);
console.log('Default credentials:');
console.log('  Admin:   username="admin"   password="admin123"');
console.log('  Cashier: username="cashier" password="cashier123"');
