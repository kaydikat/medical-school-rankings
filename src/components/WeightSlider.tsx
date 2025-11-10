// src/components/WeightSlider.tsx
import { useState } from 'react';

interface WeightSliderProps {
  label: string;
  defaultValue: number;
  onChange: (value: number) => void;
}

export default function WeightSlider({ label, defaultValue, onChange }: WeightSliderProps) {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="weight-control d-flex align-items-center gap-3 mb-2">
      <div className="input-group input-group-sm" style={{ width: '100px' }}>
        <input type="number" className="form-control text-end" value={value} onChange={handleChange} min={0} max={100} />
        <span className="input-group-text">%</span>
      </div>
      <input type="range" className="form-range flex-grow-1" value={value} onChange={handleChange} min={0} max={100} />
      <label className="form-label mb-0">{label}</label>
    </div>
  );
}