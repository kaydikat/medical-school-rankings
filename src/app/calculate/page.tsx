'use client';

import { useState, useEffect } from 'react';
import schoolsData from '@/data/schools.json';
import { calculateRanks, DEFAULT_WEIGHTS, type Weights } from '@/lib/calculateRanks';
import type { School } from '@/types/school';
import WeightSlider from '@/components/WeightSlider';
import RankingsTable from '@/components/RankingsTable';

const WEIGHT_KEYS = Object.keys(DEFAULT_WEIGHTS) as (keyof Weights)[];

export default function CalculatePage() {
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [rankedSchools, setRankedSchools] = useState<School[]>([]);
  const [total, setTotal] = useState(100);

  useEffect(() => {
    const saved = localStorage.getItem('msr-weights');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWeights(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    setTotal(sum);
    localStorage.setItem('msr-weights', JSON.stringify(weights));
  }, [weights]);

  const handleWeightChange = (key: keyof Weights, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const handleCalculate = () => {
    const ranked = calculateRanks(schoolsData as School[], weights);
    setRankedSchools(ranked);
  };

  const handleReset = () => {
    setWeights(DEFAULT_WEIGHTS);
    handleCalculate();
  };

  useEffect(() => {
    handleCalculate();
  }, []);

  return (
    <>
      <div className="container py-5">
        <h1 className="text-center mb-4">Interactive Medical School Rankings</h1>
        <p className="text-center text-muted mb-5">
          Adjust weights to create your custom ranking. Total must be 100%.
        </p>

        <div className="row justify-content-center">
          <div className="col-lg-10">
            {WEIGHT_KEYS.map(key => (
              <WeightSlider
                key={key}
                label={key}
                defaultValue={weights[key]}
                onChange={(val) => handleWeightChange(key, val)}
              />
            ))}
          </div>
        </div>

        <div className="text-center my-4 p-4 bg-light rounded">
          <p className="mb-0">
            Total Weight: <strong className={total === 100 ? 'text-success' : 'text-danger'}>{total}%</strong>
          </p>
          <button
            className="btn btn-primary btn-lg me-3"
            onClick={handleCalculate}
            disabled={total !== 100}
          >
            Calculate Rankings
          </button>
          <button className="btn btn-outline-secondary btn-lg" onClick={handleReset}>
            Reset to Default
          </button>
        </div>

        <hr className="my-5" />

        {rankedSchools.length > 0 && <RankingsTable data={rankedSchools} />}
      </div>
    </>
  );
}