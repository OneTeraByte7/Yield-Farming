import cron from 'node-cron';
import { PoolSyncService } from '../services/poolSync.service';

const poolSyncService = new PoolSyncService();

export const startPoolSync = () => {
  // Run every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    try {
      await poolSyncService.syncPools();
    } catch (error) {
      console.error('Failed to sync pools:', error);
    }
  });

  // Kick off an initial sync so data is available immediately after startup
  void (async () => {
    try {
      await poolSyncService.syncPools(500);
    } catch (error) {
      console.error('Initial pool sync failed:', error);
    }
  })();
};