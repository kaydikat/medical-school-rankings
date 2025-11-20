'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { ROLE_UI_TO_DB } from '@/lib/roleMap';
import { XCircle, UploadCloud, RefreshCw, GraduationCap } from '@/components/Icons';

// Schema for the initial form
const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  roleUi: z.string().min(1, 'Please select a role'),
  mcat: z.string().optional(),
  gpa: z.string().optional(),
  
  // FIX STARTS HERE
  // 1. Define the consent field as a boolean that MUST be true
  consent: z.boolean(), 
  
// 2. Refine the ENTIRE schema to check if consent is true, and provide the error
}).refine(data => data.consent === true, {
  message: "You must agree to the data usage policy.", // The custom error message
  path: ['consent'], // Apply this error specifically to the consent field
});

type FormData = z.infer<typeof formSchema>;

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  weights: Record<string, number>;
}

export default function SubmitModal({ isOpen, onClose, weights }: SubmitModalProps) {
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [emailForOtp, setEmailForOtp] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    reset
  } = useForm<FormData>({ 
    resolver: zodResolver(formSchema),
    defaultValues: {
      consent: false, // Default to unchecked
    }
  });

  if (!isOpen) return null;

  const onRequestOtp = async (data: FormData) => {
    setMessage(null);
    setIsLoading(true);

    // VALIDATION: Weights must sum to 100
    const totalWeight = Object.values(weights).reduce((sum, val) => sum + (val || 0), 0);
    if (totalWeight !== 100) {
      setMessage({ 
        text: `Error: Weights sum to ${totalWeight}%. They must equal 100%.`, 
        type: 'error' 
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.email === data.email) {
         console.log("User already verified. Skipping email step.");
         setMessage({ text: 'You are already verified! Saving now...', type: 'success' });
         await saveData(data);
         return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: { shouldCreateUser: true }
      });

      if (error) throw error;

      setEmailForOtp(data.email);
      setStep('OTP');
      setMessage({ text: `Code sent to ${data.email}`, type: 'success' });

    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyAndSave = async () => {
    setMessage(null);
    setIsLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: emailForOtp,
        token: otpCode,
        type: 'email',
      });

      if (verifyError) throw verifyError;
      const formData = getValues();
      await saveData(formData);

    } catch (error: any) {
      setMessage({ text: 'Invalid code or error saving. ' + error.message, type: 'error' });
      setIsLoading(false);
    }
  };

  const saveData = async (data: FormData) => {
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

    if (error) throw error;

    setMessage({ text: 'Success! Rankings saved.', type: 'success' });
    setTimeout(() => {
      reset();
      setStep('FORM');
      setOtpCode('');
      setMessage(null);
      onClose();
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100" onClick={(e) => e.stopPropagation()}>
        
        <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-600" />
            {step === 'FORM' ? 'Contribute Rankings' : 'Verify Email'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 'FORM' && (
            <form onSubmit={handleSubmit(onRequestOtp)} className="space-y-4">
              <p className="text-sm text-slate-500 mb-4">
                Submit your weights to help build the crowdsourced rankings.
              </p>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Email (Required)</label>
                <input {...register('email')} type="email" placeholder="you@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Role (Required)</label>
                <select {...register('roleUi')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
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
                  <input {...register('mcat')} type="number" placeholder="515" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">GPA <span className="font-normal text-gray-400 normal-case">(Optional)</span></label>
                  <input {...register('gpa')} type="number" step="0.01" placeholder="3.85" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              {/* NEW: Research Consent Checkbox */}
              <div className="flex items-start gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="consent"
                  {...register('consent')}
                  className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="consent" className="text-xs text-slate-600 cursor-pointer leading-tight">
                  I agree to contribute my de-identified submission data for inclusion in the public dataset. I understand this data may be used for general academic research purposes.
                </label>
              </div>
              {errors.consent && <p className="text-red-500 text-xs">{errors.consent.message}</p>}

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-700 transition-all shadow-sm flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Send Verification Code'}
              </button>
            </form>
          )}

          {/* Step 2 (OTP) remains unchanged... */}
          {step === 'OTP' && (
            <div className="space-y-4">
              <div className="text-center">
                <GraduationCap className="w-12 h-12 text-emerald-100 bg-emerald-600 rounded-full p-2 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800">Check your email</h4>
                <p className="text-sm text-slate-500">We sent a 6-digit code to <span className="font-medium text-slate-800">{emailForOtp}</span></p>
              </div>

              <input 
                type="text" 
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center text-2xl tracking-widest font-bold px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                maxLength={6}
              />

              <button 
                onClick={onVerifyAndSave} 
                disabled={isLoading || otpCode.length < 6} 
                className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm flex justify-center items-center gap-2"
              >
                 {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify & Save'}
              </button>

              <button 
                onClick={() => setStep('FORM')} 
                className="w-full text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Go back / Wrong email
              </button>
            </div>
          )}

          {message && (
            <div className={`mt-4 p-3 rounded text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}