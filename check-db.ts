import { getDb } from './src/lib/db/client';
import { agents } from './src/lib/db/schema';

async function check() {
  const db = getDb();
  const allAgents = await db.select().from(agents);
  
  console.log('\n=== ESTADO REAL EN LA BASE DE DATOS ===\n');
  console.log('Total agentes:', allAgents.length);
  console.log('\n');
  
  allAgents.forEach(agent => {
    console.log(`📦 ${agent.name}`);
    console.log(`   ID: ${agent.id.slice(0,8)}...`);
    console.log(`   isActive: ${agent.isActive ? '✅ ACTIVO' : '❌ INACTIVO'}`);
    console.log(`   ownerId: ${agent.ownerId === '00000000-0000-0000-0000-000000000000' ? '🔓 SIN VINCULAR' : agent.ownerId.slice(0,8) + '... (vinculado)'}`);
    console.log(`   Generation: ${agent.generation}`);
    console.log(`   Fitness: ${agent.fitness.toFixed(1)}`);
    console.log('');
  });
  
  process.exit(0);
}

check().catch(console.error);
