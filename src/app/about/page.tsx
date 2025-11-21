// src/app/about/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, SlidersIcon, Menu, X } from '@/components/Icons';

export default function AboutPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm flex-none">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center justify-between w-full md:w-auto gap-8">
              <Link href="/" className="flex items-center gap-2 text-decoration-none group">
                <GraduationCap className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
                <h1 className="text-2xl font-bold text-slate-800">
                  Medical School Rankings
                </h1>
              </Link>

              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                <Link href="/calculate?open=true" className="hover:text-blue-600 transition-colors">Customize</Link>
                <Link href="/about" className="text-blue-600">About</Link>
              </nav>
               {/* Mobile Nav Toggle */}
               <div className="flex items-center gap-4 md:hidden">
                  {/* CUSTOMIZE BUTTON: Always visible */}
                   <Link 
                      href="/calculate?open=true"
                      className="flex items-center justify-center p-2 rounded-full bg-purple-600 text-white shadow-md"
                      title="Customize"
                   >
                      <SlidersIcon className="w-5 h-5" />
                   </Link>

                  <button 
                      className="text-slate-600" 
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                      {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
               </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link 
                href="/calculate?open=true"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all transform shadow-md bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 ring-2 ring-purple-500 ring-offset-2"
              >
                <SlidersIcon className="w-4 h-4" />
                Customize Rankings
              </Link>
            </div>
          </div>
        </div>
         {/* Mobile Menu Content */}
        {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 p-4 shadow-lg absolute top-full left-0 w-full z-50">
                <nav className="flex flex-col gap-4 text-sm font-medium text-slate-600">
                    <Link href="/" className="hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    <Link href="/calculate?open=true" className="hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>Customize</Link>
                    <Link href="/about" className="text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                </nav>
            </div>
        )}
      </div>

      {/* CONTENT */}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <article className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-6">About This Project</h1>

          <p className="text-lg text-slate-700 leading-relaxed">
            Given the absence of ordinal rankings from the historical go-to <em>U.S. News & World Report</em>, we decided to create a new ranking system. Rather than trying to unilaterally decide what makes a "good" medical school, we wanted to create an interactive platform that would allow anyone to adjust the parameters to create their own individualized rankings process.
          </p>

          <p className="text-lg text-slate-700 leading-relaxed">
            We only use <strong>publicly available data</strong>. We hope this will be useful for prospective medical students trying to identify target schools. Additionally, we'll create an overall "ranking" based on the cumulative preferences of everyone who contributes to the website.
          </p>

          <div className="mt-8 flex justify-start">
            <Link 
                href="/calculate?open=true"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all transform shadow bg-blue-600 text-white hover:bg-blue-700 hover:translate-y-[-2px]"
              >
                Start Customizing
                <SlidersIcon className="w-4 h-4" />
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}