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

      // 1. Initialize containers for arrays of values (for Median calculation)
      // We store every single value for every metric to sort them later
      const overallWeights: Record<string, number[]> = {};
      const roleWeights: Record<string, { weights: Record<string, number[]>; count: number }> = {};

      // 2. Collect all values into arrays
      data.forEach((row) => {
        const w = row.weights as Record<string, number>;
        const role = row.role;

        // --- Collect for "All" (Grand Total) ---
        Object.entries(w).forEach(([key, val]) => {
          if (typeof val === 'number') {
            if (!overallWeights[key]) overallWeights[key] = [];
            overallWeights[key].push(val);
          }
        });

        // --- Collect for Specific Role ---
        if (role) {
          if (!roleWeights[role]) {
            roleWeights[role] = { weights: {}, count: 0 };
          }
          roleWeights[role].count++; 
          Object.entries(w).forEach(([key, val]) => {
            if (typeof val === 'number') {
              if (!roleWeights[role].weights[key]) roleWeights[role].weights[key] = [];
              roleWeights[role].weights[key].push(val);
            }
          });
        }
      });

      // 3. Helper to calculate Median from an array of numbers
      const getMedian = (values: number[]): number => {
        if (values.length === 0) return 0;
        
        // Sort numerically
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        
        // If odd length, return middle. If even, return average of two middles.
        if (sorted.length % 2 !== 0) {
          return sorted[mid];
        }
        return (sorted[mid - 1] + sorted[mid]) / 2;
      };

      // 4. Compute Medians and Format Result
      const result: Aggregate[] = [];

      // "All" Aggregate
      const totalCount = data.length;
      if (totalCount > 0) {
        const medianWeights = Object.fromEntries(
            Object.entries(overallWeights).map(([k, vals]) => [k, getMedian(vals)])
        ) as Weights;

        result.push({
          role: 'overall',
          displayRole: `All (${totalCount})`,
          weights: medianWeights,
          count: totalCount,
        });
      }

      // Role Aggregates
      Object.entries(roleWeights).forEach(([role, stats]) => {
        const medianWeights = Object.fromEntries(
            Object.entries(stats.weights).map(([k, vals]) => [k, getMedian(vals)])
        ) as Weights;

        result.push({
          role,
          displayRole: `${ROLE_DB_TO_UI[role] || role} (${stats.count})`,
          weights: medianWeights,
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