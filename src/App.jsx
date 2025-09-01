import React, { useEffect, useState } from 'react';
import db from './db';

export default function App() {
  const [users, setUsers] = useState([]);
  const [online, setOnline] = useState(navigator.onLine);
  const API_URL = 'http://localhost:5000/api/users';

  // Load users from local DB
  useEffect(() => {
    db.users.toArray().then(setUsers);
  }, []);

  // Sync logic
  const sync = async () => {
    if (!navigator.onLine) return;

    console.log('🔄 Starting sync...');

    // Push unsynced
    const unsynced = await db.users.where('synced').equals(0).toArray();
    console.log('Unsynced users:', unsynced);

    for (let u of unsynced) {
      try {
        let res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: u.name, email: u.email })
        });
        const data = await res.json();
        console.log('POST response:', data);

        if (res.ok) {
          await db.users.update(u.id, { synced: 1 });
        }
      } catch (err) {
        console.error('❌ Sync failed:', err);
      }
    }

    // Pull latest from server
    try {
      const res = await fetch(API_URL);
      const remoteUsers = await res.json();
      console.log('Remote users:', remoteUsers);

      await db.users.clear();
      for (let u of remoteUsers) {
        await db.users.add({ id: u.id, name: u.name, email: u.email, synced: 1 });
      }
      setUsers(await db.users.toArray());
    } catch (err) {
      console.error('❌ Fetch failed:', err);
    }
  };

  // Online/offline listeners
  useEffect(() => {
    const handleOnline = () => { setOnline(true); sync(); };
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (online) sync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [online]);

  // Add user
  const addUser = async () => {
    const name = prompt('Enter name');
    const email = prompt('Enter email');
    if (!name || !email) return;

    await db.users.add({ name, email, synced: online ? 1 : 0 });
    setUsers(await db.users.toArray());

    if (online) {
      await sync(); // ✅ directly sync
    }
  };

  return (
    <div className="app">
      <p>Status: <strong>{online ? <span className="green">Online</span> : <span className="red">Offline</span>}</strong></p>

      <div className="box">
        <header>
          <div className="box-title systemDataFlow">
            <h1>System Data Flows</h1>
            <p>Information Movement Throughout the Platform</p>
          </div>

          <div className="box-content">  
            <button onClick={addUser}>Add User</button>
            <ul>
              {users.map(u => (
                <li key={u.id}>
                  {u.name} ({u.email}) {u.synced ? '' : '(pending sync)'}
                </li>
              ))}
            </ul>
          </div>
        </header>
      </div>    
    </div>
  );
}
