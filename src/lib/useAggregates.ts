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

      // Group by role
      const grouped = data.reduce((acc, row) => {
        const role = row.role || 'overall';
        if (!acc[role]) {
          acc[role] = { weights: {}, count: 0 };
        }
        acc[role].count += 1;

        Object.entries(row.weights as Weights).forEach(([key, val]) => {
          if (typeof val === 'number') {
            acc[role].weights[key] = (acc[role].weights[key] || 0) + val;
          }
        });

        return acc;
      }, {} as Record<string, { weights: Partial<Weights>; count: number }>);

      // Average the weights
      const result: Aggregate[] = [];

      // Overall first
      if (grouped.overall) {
        const avgWeights = Object.fromEntries(
          Object.entries(grouped.overall.weights).map(([k, sum]) => [
            k,
            Number((sum / grouped.overall.count).toFixed(1)),
          ])
        );
        result.push({
          role: 'overall',
          displayRole: `Overall (${grouped.overall.count} submissions)`,
          weights: avgWeights as Weights,
          count: grouped.overall.count,
        });
        delete grouped.overall;
      }

      // Then per role
      Object.entries(grouped).forEach(([role, { weights, count }]) => {
        const avgWeights = Object.fromEntries(
          Object.entries(weights).map(([k, sum]) => [
            k,
            Number((sum / count).toFixed(1)),
          ])
        );
        result.push({
          role,
          displayRole: `${ROLE_DB_TO_UI[role] || role} (${count})`,
          weights: avgWeights as Weights,
          count,
        });
      });

      setAggregates(result);
      setLoading(false);
    }

    fetchAggregates();

    // Optional: live updates
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