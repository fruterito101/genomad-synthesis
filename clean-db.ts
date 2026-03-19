import { getDb } from './src/lib/db/client';
import { agents, breedingRequests, custodyShares, actionApprovals, verificationCodes } from './src/lib/db/schema';

async function cleanAll() {
  const db = getDb();
  
  console.log('🧹 Limpiando base de datos...\n');
  
  // Orden importante por foreign keys
  try {
    await db.delete(actionApprovals);
    console.log('✅ action_approvals - limpiado');
  } catch (e: any) { console.log('⚠️ action_approvals -', e.message?.slice(0,50)); }
  
  try {
    await db.delete(custodyShares);
    console.log('✅ custody_shares - limpiado');
  } catch (e: any) { console.log('⚠️ custody_shares -', e.message?.slice(0,50)); }
  
  try {
    await db.delete(breedingRequests);
    console.log('✅ breeding_requests - limpiado');
  } catch (e: any) { console.log('⚠️ breeding_requests -', e.message?.slice(0,50)); }
  
  try {
    await db.delete(verificationCodes);
    console.log('✅ verification_codes - limpiado');
  } catch (e: any) { console.log('⚠️ verification_codes -', e.message?.slice(0,50)); }
  
  try {
    await db.delete(agents);
    console.log('✅ agents - limpiado');
  } catch (e: any) { console.log('⚠️ agents -', e.message?.slice(0,50)); }
  
  console.log('\n✅ Base de datos limpia!');
  process.exit(0);
}

cleanAll();
