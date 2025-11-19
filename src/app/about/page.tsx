// src/app/about/page.tsx
'use client';

import Link from 'next/link';
import { GraduationCap, Search, SlidersIcon } from '@/components/Icons';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm flex-none">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Logo & Nav Group */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 text-decoration-none group">
                <GraduationCap className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
                <h1 className="text-2xl font-bold text-slate-800">
                  Med School Rankings
                </h1>
              </Link>

              {/* TEXT NAVIGATION */}
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                <Link href="/calculate" className="hover:text-blue-600 transition-colors">Customize</Link>
                <Link href="/about" className="text-blue-600">About</Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link 
                href="/calculate"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all transform shadow-md bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 ring-2 ring-purple-500 ring-offset-2"
              >
                <SlidersIcon className="w-4 h-4" />
                Customize Rankings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-6">About the Project</h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
          <p className="text-lg">
            <strong>MedicalSchoolRankings.org</strong> is an open-source, crowdsourced initiative designed to democratize the medical school admission process.
          </p>

          <p>
            Traditional rankings (like US News) rely on opaque methodologies and static weights that often don't reflect the priorities of actual applicants. One student might care deeply about <strong>NIH Research Funding</strong>, while another prioritizes <strong>Low Student Debt</strong> or <strong>Class Diversity</strong>.
          </p>

          <h3 className="text-xl font-bold text-slate-800 mt-8 mb-3">How It Works</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Customize:</strong> Use our <Link href="/calculate" className="text-blue-600 underline hover:text-blue-800">Interactive Calculator</Link> to adjust weights for over 10 different metrics. Real-time rankings update instantly as you slide.
            </li>
            <li>
              <strong>Contribute:</strong> Submit your preferred weights to our database. We aggregate these submissions to generate "Official" crowdsourced rankings.
            </li>
            <li>
              <strong>Compare:</strong> See how priorities shift between Pre-Meds, Medical Students, and Residents/Physicians.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-slate-800 mt-8 mb-3">Methodology</h3>
          <p>
            We normalize all metrics (GPA, MCAT, Cost, etc.) on a 0-100 scale. For "inverse" metrics like Debt or Tuition, lower values receive higher scores. Your custom score is a weighted sum of these normalized values based on the percentages you select.
          </p>

          <div className="mt-12 p-6 bg-blue-50 border border-blue-100 rounded-xl">
            <h4 className="font-bold text-blue-800 mb-2">Open Source</h4>
            <p className="text-sm text-blue-700">
              We believe in transparency. The code and data for this project are available for audit and contribution.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}