'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ROLE_UI_TO_DB } from '@/lib/roleMap';

const schema = z.object({
  email: z.string().email('Invalid email'),
  roleUi: z.string().min(1, 'Select a role'),
  mcat: z.string().optional(),
  gpa: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SubmitPage() {
  const [message, setMessage] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setMessage('');
    const weights = JSON.parse(localStorage.getItem('msr-weights') || '{}');
    const roleDb = ROLE_UI_TO_DB[data.roleUi];

    const { error } = await supabase
      .from('submissions')
      .upsert({
        email: data.email,
        role: roleDb,
        mcat: data.mcat ? Number(data.mcat) : null,
        gpa: data.gpa ? Number(data.gpa) : null,
        weights,
        verified: true,
      }, { onConflict: 'email' });

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Success! Your weights are saved.');
      setTimeout(() => router.push('/calculate'), 1500);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1 className="text-center mb-4">Submit Your Rankings</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="card p-4">
            <div className="mb-3">
              <label className="form-label">Email (required)</label>
              <input {...register('email')} type="email" className="form-control" />
              {errors.email && <p className="text-danger small">{errors.email.message}</p>}
            </div>

            <div className="mb-3">
              <label className="form-label">Who are you? (required)</label>
              <select {...register('roleUi')} className="form-select">
                <option value="">-- Select --</option>
                {Object.keys(ROLE_UI_TO_DB).map(label => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
              {errors.roleUi && <p className="text-danger small">{errors.roleUi.message}</p>}
            </div>

            <div className="mb-3">
              <label className="form-label">MCAT (optional)</label>
              <input {...register('mcat')} type="number" className="form-control" placeholder="515" />
              {errors.mcat && <p className="text-danger small">{errors.mcat.message}</p>}
            </div>

            <div className="mb-3">
              <label className="form-label">GPA (optional, 4.0 scale)</label>
              <input {...register('gpa')} type="number" step="0.01" className="form-control" placeholder="3.85" />
              {errors.gpa && <p className="text-danger small">{errors.gpa.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-success w-100">
              {isSubmitting ? 'Saving...' : 'Save Weights'}
            </button>
          </form>

          {message && (
            <div className={`alert mt-3 ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}