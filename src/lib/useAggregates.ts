// src/lib/useAggregates.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ROLE_DB_TO_UI } from '@/lib/roleMap';
import type { Weights } from '@/lib/calculateRanks';

type Aggregate = {
  role: string;
  displayRole: string;
  weights: Weights;
  count: number;
};

export function useAggregates() {
  const [aggregates, setAggregates] = useState<Aggregate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAggregates() {
      const { data, error } = await supabase
        .from('submissions')
        .select('role, weights')
        .eq('verified', true);

      if (error || !data) {
        setLoading(false);
        return;
      }

      // 1. Initialize containers for "All" and specific roles
      const overallStats = { weights: {} as Record<string, number>, count: 0 };
      const byRole: Record<string, { weights: Record<string, number>; count: number }> = {};

      // 2. Iterate once through all data
      data.forEach((row) => {
        const w = row.weights as Record<string, number>;
        const role = row.role;

        // --- Update "All" (Grand Total) ---
        overallStats.count++;
        Object.entries(w).forEach(([key, val]) => {
          if (typeof val === 'number') {
            overallStats.weights[key] = (overallStats.weights[key] || 0) + val;
          }
        });

        // --- Update Specific Role ---
        if (role) {
          if (!byRole[role]) {
            byRole[role] = { weights: {}, count: 0 };
          }
          byRole[role].count++;
          Object.entries(w).forEach(([key, val]) => {
            if (typeof val === 'number') {
              byRole[role].weights[key] = (byRole[role].weights[key] || 0) + val;
            }
          });
        }
      });

      // 3. Calculate Averages and Format Result
      const result: Aggregate[] = [];

      // Helper to compute average weights
      const computeAverage = (accumulatedWeights: Record<string, number>, totalCount: number) => {
        return Object.fromEntries(
          Object.entries(accumulatedWeights).map(([k, sum]) => [
            k,
            Number((sum / totalCount).toFixed(1)),
          ])
        ) as Weights;
      };

      // Add "All" first (Default)
      if (overallStats.count > 0) {
        result.push({
          role: 'overall',
          // UPDATED: Removed " submissions" to match format "All (1)"
          displayRole: `All (${overallStats.count})`, 
          weights: computeAverage(overallStats.weights, overallStats.count),
          count: overallStats.count,
        });
      }

      // Add Specific Roles
      Object.entries(byRole).forEach(([role, stats]) => {
        result.push({
          role,
          displayRole: `${ROLE_DB_TO_UI[role] || role} (${stats.count})`,
          weights: computeAverage(stats.weights, stats.count),
          count: stats.count,
        });
      });

      setAggregates(result);
      setLoading(false);
    }

    fetchAggregates();

    // Live updates
    const channel = supabase
      .channel('submissions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, fetchAggregates)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { aggregates, loading };
}