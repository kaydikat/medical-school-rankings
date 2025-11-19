'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { ROLE_UI_TO_DB } from '@/lib/roleMap';
import { XCircle, UploadCloud, AlertTriangle } from '@/components/Icons'; // Added AlertTriangle for error icon if you have it, otherwise generic is fine

// Zod Schema for Validation
const schema = z.object({
  email: z.string().email('Invalid email address'),
  roleUi: z.string().min(1, 'Please select a role'),
  mcat: z.string().optional(),
  gpa: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  weights: Record<string, number>;
}

export default function SubmitModal({ isOpen, onClose, weights }: SubmitModalProps) {
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (!isOpen) return null;

  const onSubmit = async (data: FormData) => {
    setMessage(null);

    // --- VALIDATION STEP: Check if weights sum to 100 ---
    const totalWeight = Object.values(weights).reduce((sum, val) => sum + (val || 0), 0);
    
    if (totalWeight !== 100) {
      setMessage({ 
        text: `Error: Your weights sum to ${totalWeight}%. They must equal exactly 100%. Please close this form, adjust your sliders, and try again.`, 
        type: 'error' 
      });
      return; // STOP here if invalid
    }
    // ----------------------------------------------------

    const roleDb = ROLE_UI_TO_DB[data.roleUi];

    try {
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

      if (error) throw error;

      setMessage({ text: 'Success! Your rankings have been contributed.', type: 'success' });
      
      // Close after a brief delay on success
      setTimeout(() => {
        reset();
        setMessage(null);
        onClose();
      }, 2000);

    } catch (error: any) {
      setMessage({ text: 'Error: ' + error.message, type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-600" />
            Contribute Rankings
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <p className="text-sm text-slate-500 mb-4">
            Submit your current weights to help build the crowdsourced rankings.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Email (Required)</label>
              <input 
                {...register('email')} 
                type="email" 
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Role (Required)</label>
              <select 
                {...register('roleUi')} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
              >
                <option value="">-- Select Role --</option>
                {Object.keys(ROLE_UI_TO_DB).map(label => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
              {errors.roleUi && <p className="text-red-500 text-xs mt-1">{errors.roleUi.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">MCAT <span className="font-normal text-gray-400 normal-case">(Optional)</span></label>
                <input {...register('mcat')} type="number" placeholder="515" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">GPA <span className="font-normal text-gray-400 normal-case">(Optional)</span></label>
                <input {...register('gpa')} type="number" step="0.01" placeholder="3.85" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
              </div>
            </div>

            {/* Error / Success Message Area */}
            {message && (
              <div className={`p-3 rounded text-sm font-medium flex items-start gap-2 ${
                message.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <span>{message.text}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isSubmitting ? 'Saving...' : 'Save Weights'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}