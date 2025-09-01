import Dexie from 'dexie';

// Local offline DB
const db = new Dexie('OfflineAppDB');
db.version(1).stores({
  users: '++id,name,email,synced' // 'synced' flag for sync tracking
});

export default db;
