'use client';

import { useEffect, useState } from 'react';
import schoolsData from '@/data/schools.json';
import { calculateRanks, DEFAULT_WEIGHTS } from '@/lib/calculateRanks';
import type { School, Weights } from '@/types/school';
import RankingsTable from '@/components/RankingsTable';
import { useAggregates } from '@/lib/useAggregates';

export default function HomePage() {
  const { aggregates, loading } = useAggregates();
  const [selectedWeights, setSelectedWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [rankedSchools, setRankedSchools] = useState<School[]>([]);

  // ← THIS IS THE KEY FIX: recalculate whenever aggregates change
  useEffect(() => {
    if (aggregates.length === 0) return;

    // Always use the first one (overall) as default view
    const overall = aggregates.find(a => a.role === 'overall') || aggregates[0];
    recalculate(overall.weights);
  }, [aggregates]);

  const recalculate = (weights: Weights) => {
    const ranked = calculateRanks(schoolsData as School[], weights);
    setRankedSchools(ranked);
    setSelectedWeights(weights);
  };

  if (loading) {
    return <div className="container py-5 text-center">Loading crowdsourced rankings...</div>;
  }

  return (
    <div className="container py-5">
      <h1 className="text-center mb-3">Medical School Rankings</h1>
      <p className="text-center text-muted mb-5">
        Crowdsourced from {aggregates[0]?.count || 0} submission(s) — live updating
      </p>

      {/* Role buttons */}
      <div className="text-center mb-4">
        <div className="btn-group flex-wrap" role="group">
          {aggregates.map((agg) => (
            <button
              key={agg.role}
              type="button"
              className={`btn m-1 ${
                JSON.stringify(selectedWeights) === JSON.stringify(agg.weights)
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              }`}
              onClick={() => recalculate(agg.weights)}
            >
              {agg.displayRole}
            </button>
          ))}
        </div>
      </div>

      {/* Current weights */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Active Weights</h5>
          <div className="row">
            {Object.entries(selectedWeights).map(([key, val]) => (
              <div key={key} className="col-md-4 col-sm-6 mb-2">
                <strong>{key}:</strong> {val}%
              </div>
            ))}
          </div>
        </div>
      </div>

      {rankedSchools.length > 0 && <RankingsTable data={rankedSchools} />}

      <div className="text-center mt-5">
        <a href="/calculate" className="btn btn-lg btn-success me-3">
          Create Your Own
        </a>
        <a href="/submit" className="btn btn-lg btn-outline-success">
          Contribute Yours
        </a>
      </div>
    </div>
  );
}