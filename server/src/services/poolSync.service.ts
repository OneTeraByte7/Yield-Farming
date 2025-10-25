import { request } from 'undici';
import supabase from '../config/supabase';
import {
  DefiLlamaPool,
  DefiLlamaResponse,
  NormalizedPool,
} from '../types/pool.types';

export class PoolSyncService {
  private baseUrl = 'https://yields.llama.fi';

  async syncPools(maxPools: number = 500) {
    try {
      // First, remove any duplicate pools in the database
      await this.removeDuplicatePools();

      // Fetch pools from DefiLlama
      const pools = await this.fetchPools();
      const normalizedPools = pools
        .map((pool) => this.normalizePool(pool))
        .filter((pool): pool is NormalizedPool => pool !== null);

      // Filter for quality pools - BASE CHAIN ONLY
      const filteredPools = normalizedPools
        .filter((pool) =>
          pool.chain.toLowerCase() === 'base' && // Only Base chain
          pool.tvlUsd > 10000 && // Minimum $10k TVL
          pool.apy > 0 && // Valid APY
          pool.apy < 1000 // Filter out suspicious extremes
        )
        .sort((a, b) => b.tvlUsd - a.tvlUsd) // Sort by TVL
        .slice(0, maxPools);

      // Update database
      for (const pool of filteredPools) {
        await this.upsertPool(pool);
      }

      return filteredPools;
    } catch (error) {
      console.error('❌ Error syncing pools:', error);
      throw error;
    }
  }

  private async removeDuplicatePools() {
    try {
      // Get all pools
      const { data: allPools, error } = await supabase
        .from('pools')
        .select('id, name, description, created_at')
        .order('created_at', { ascending: true });

      if (error || !allPools) {
        return;
      }

      // Track unique pools by name
      const seenNames = new Map<string, string>();
      const duplicateIds: string[] = [];

      for (const pool of allPools) {
        const existingId = seenNames.get(pool.name);

        if (existingId) {
          // This is a duplicate, mark for deletion (keep the older one)
          duplicateIds.push(pool.id);
        } else {
          seenNames.set(pool.name, pool.id);
        }
      }

      // Delete duplicates
      if (duplicateIds.length > 0) {
        await supabase
          .from('pools')
          .delete()
          .in('id', duplicateIds);
      }
    } catch (error) {
      console.error('❌ Error removing duplicates:', error);
    }
  }

  private async upsertPool(pool: NormalizedPool) {
    const poolData = {
      name: pool.name,
      description: pool.description,
      token_symbol: pool.symbol,
      apy: pool.apy,
      total_staked: pool.tvlUsd,
      min_stake_amount: 0.01,
      max_stake_per_user: 1000000,
      is_active: true,
      // Essential DefiLlama fields for Base chain
      chain: pool.chain,
      project: pool.project,
      pool_id: pool.poolId,
      tvl_usd: pool.tvlUsd,
      url: pool.url,
    };

    // Check if pool exists by pool ID in description (most reliable)
    const { data: existingByPoolId } = await supabase
      .from('pools')
      .select('id')
      .ilike('description', `%${pool.poolId}%`)
      .limit(1);

    // If not found by pool ID, check by exact name match
    const { data: existingByName } = !existingByPoolId?.length ? await supabase
      .from('pools')
      .select('id')
      .eq('name', poolData.name)
      .limit(1) : { data: null };

    const existing = existingByPoolId?.[0] || existingByName?.[0];

    if (existing?.id) {
      // Update existing pool
      await supabase
        .from('pools')
        .update({
          ...poolData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Create new pool
      await supabase
        .from('pools')
        .insert(poolData);
    }
  }

  async getTopPools(limit: number = 10) {
    const pools = await this.fetchPools();

    return pools
      .map((pool) => this.normalizePool(pool))
      .filter((pool): pool is NormalizedPool =>
        pool !== null &&
        pool.tvlUsd > 0 &&
        pool.apy >= 0
      )
      .sort((a, b) => b.apy - a.apy)
      .slice(0, limit);
  }

  private async fetchPools(): Promise<DefiLlamaPool[]> {
    try {
      const { statusCode, body } = await request(`${this.baseUrl}/pools`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const responseText = await body.text();

      if (statusCode < 200 || statusCode >= 300) {
        throw new Error(`Failed to fetch pools: received status ${statusCode}`);
      }

      const response: DefiLlamaResponse = JSON.parse(responseText);

      if (response.status !== 'success' || !Array.isArray(response.data)) {
        return [];
      }

      return response.data;
    } catch (error) {
      console.error('❌ Error fetching pools from DefiLlama:', error);
      throw error;
    }
  }

  private normalizePool(pool: DefiLlamaPool): NormalizedPool | null {
    try {
      // Extract pool data from DefiLlama structure
      const poolId = pool.pool;
      const chain = pool.chain;
      const project = pool.project;
      const symbol = pool.symbol;
      const tvlUsd = pool.tvlUsd || 0;

      // DefiLlama provides APY components
      const apy = pool.apy || 0;
      const apyBase = pool.apyBase || 0;
      const apyReward = pool.apyReward || 0;

      // Token arrays
      const rewardTokens = pool.rewardTokens || [];
      const underlyingTokens = pool.underlyingTokens || [];

      // Pool metadata
      const poolMeta = pool.poolMeta || '';

      // Predictions data
      const predictedClass = pool.predictions?.predictedClass;
      const predictedProbability = pool.predictions?.predictedProbability;
      const binnedConfidence = pool.predictions?.binnedConfidence;

      // Risk and exposure data
      const ilRisk = pool.ilRisk;
      const exposure = pool.exposure;

      // Create a descriptive name
      const name = `${project} ${symbol}`;

      // Build description with key information
      const descriptionParts = [
        `${project} pool on ${chain}`,
        `Symbol: ${symbol}`,
      ];

      if (tvlUsd > 0) {
        descriptionParts.push(`TVL: $${this.formatNumber(tvlUsd)}`);
      }

      if (apyBase > 0) {
        descriptionParts.push(`Base APY: ${apyBase.toFixed(2)}%`);
      }

      if (apyReward > 0) {
        descriptionParts.push(`Reward APY: ${apyReward.toFixed(2)}%`);
      }

      if (rewardTokens.length > 0) {
        descriptionParts.push(`Rewards: ${rewardTokens.join(', ')}`);
      }

      if (underlyingTokens.length > 0) {
        descriptionParts.push(`Assets: ${underlyingTokens.join(', ')}`);
      }

      if (poolMeta) {
        descriptionParts.push(poolMeta);
      }

      // Add prediction info if available
      if (predictedClass) {
        descriptionParts.push(`Risk: ${predictedClass}`);
      }

      if (ilRisk) {
        descriptionParts.push(`IL Risk: ${ilRisk}`);
      }

      if (exposure) {
        descriptionParts.push(`Exposure: ${exposure}`);
      }

      const description = `Pool ID: ${poolId} • ${descriptionParts.join(' • ')}`;

      return {
        poolId,
        chain,
        project,
        symbol,
        tvlUsd,
        apy,
        apyBase,
        apyReward,
        rewardTokens,
        underlyingTokens,
        poolMeta,
        name,
        description,
        url: pool.url || '',
        predictedClass,
        predictedProbability,
        binnedConfidence,
        ilRisk,
        exposure,
      };
    } catch (error) {
      console.error(`Error normalizing pool ${pool.pool}:`, error);
      return null;
    }
  }

  private formatNumber(value: number): string {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(2)}K`;
    }
    return value.toFixed(2);
  }
}