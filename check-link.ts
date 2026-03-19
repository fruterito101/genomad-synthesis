import { getDb } from './src/lib/db/client';
import { agents, users } from './src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function check() {
  const db = getDb();
  
  // Get users
  const allUsers = await db.select().from(users);
  
  console.log('\n=== USUARIOS (de Privy) ===');
  allUsers.forEach(u => {
    console.log(`👤 ${u.id.slice(0,8)}...`);
    console.log(`   Privy: ${u.privyId?.slice(0,20)}...`);
    console.log(`   Telegram: ${u.telegramId}`);
    console.log(`   Wallet: ${u.walletAddress?.slice(0,10)}...`);
    console.log('');
  });
  
  // Get agents with owner info
  const allAgents = await db.select().from(agents);
  
  console.log('=== AGENTES Y SU DUEÑO ===');
  allAgents.forEach(a => {
    const owner = allUsers.find(u => u.id === a.ownerId);
    console.log(`🤖 ${a.name}`);
    console.log(`   ownerId: ${a.ownerId.slice(0,8)}...`);
    if (owner) {
      console.log(`   → Vinculado a Telegram: ${owner.telegramId}`);
    } else if (a.ownerId === '00000000-0000-0000-0000-000000000000') {
      console.log(`   → ❌ SIN VINCULAR`);
    }
    console.log('');
  });
  
  process.exit(0);
}

check().catch(console.error);
