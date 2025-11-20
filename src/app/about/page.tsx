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
          <h1 className="text-4xl font-extrabold text-slate-900 mb-6">We Need Better Medical School Rankings</h1>

          <p>
                        Medical school rankings have entered a confusing new era.
 After Harvard and other elite programs <a href="https://observer.com/2023/01/harvard-leads-an-exodus-of-medical-schools-withdrawing-from-us-news-rankings/" target="_blank" rel="noreferrer">withdrew from <em>U.S. News & World Report</em></a>, the system shifted to broad tiers—essentially buckets of schools <a href="https://www.chronicle.com/article/u-s-news-medical-school-rankings-are-out-except-theyre-not-really-rankings" target="_blank" rel="noreferrer">with minimal differentiation</a>. While the stated goals around <a href="https://www.mountsinai.org/about/newsroom/2023/us-news-medical-school-rankings" target="_blank" rel="noreferrer">promoting diversity</a> and avoiding reductive comparisons are laudable, this change has created <strong>less transparency</strong> for prospective students and <strong>fewer incentives</strong> for schools to cater to student priorities.
          </p>

          <p>
            Yes, all accredited U.S. medical schools produce qualified physicians. But dismissing rankings entirely ignores their practical value: helping students identify target programs with high quality clinical training and cutting-edge research; encouraging schools to innovate to attract top applicants; and providing evidence of program selectivity to residency directors or future employers.
          </p>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6 rounded-r-lg italic text-slate-700">
            Here&apos;s the paradox: just as medical schools moved away from rankings, residency programs began leaning <em>more heavily</em> on medical school prestige.
          </div>

          <p>
            USMLE Step 1 <a href="https://www.doximity.com/articles/210fde6e-2ce2-43c8-b35b-c3a2b55f5903" target="_blank" rel="noreferrer">shifted to pass/fail</a>, eliminating a key metric. Now residency directors <a href="https://doi.org/10.1016/j.wneu.2020.07.053" target="_blank" rel="noreferrer">increasingly rely on the reputation of applicants&apos; medical schools</a> to evaluate candidates. Medical schools want to de-emphasize rankings precisely when rankings matter most to their graduates&apos; career prospects.
          </p>

          <h2 className="text-2xl mt-12 mb-4 text-slate-800 border-b pb-2">The Case for Reformed Rankings</h2>

          <h3 className="text-lg font-bold mt-6 text-slate-900">1. Elite Schools Are Pulling Up the Ladder</h3>
          <p>
            When top programs withdrew, they protected their reputations while making it nearly impossible for rising schools to prove their worth. The University of South Florida&apos;s incoming class <a href="https://www.usf.edu/health/delivering-health-excellence/2025/usnwr-mcom-2025.aspx#:~:text=Our%20incoming%20students%E2%80%99%20median%20MCAT%20scores%20have%20soared%3B%20this%20year%E2%80%99s%20class%20median%20score%20is%20520%2C%20placing%20them%20among%20the%20top%203%25%20of%20students%20nationwide." target="_blank" rel="noreferrer">now outscores Harvard and Stanford</a> on MCAT and GPA—yet without rankings, USF remains overshadowed by legacy prestige.
          </p>
          <p>
            The irony is striking: Columbia&apos;s dean condemned rankings as <a href="https://www.cuimc.columbia.edu/news/medical-school-rankings#:~:text=Physicians%20and%20Surgeons.-,The%20USNWR%20medical%20school%20rankings%20perpetuate%20a%20narrow%20and%20elitist%20perspective%20on%20medical%20education.,-Their%20emphasis%20is" target="_blank" rel="noreferrer">&quot;perpetuat[ing] a narrow and elitist perspective on medical education&quot;</a>—yet by withdrawing, elite schools have <em>entrenched</em> that very elitism. Their reputations remain unassailable while rising programs lose any pathway to recognition.
          </p>
          <p>
            As Harvard medical student <a href="https://opmed.doximity.com/articles/the-medical-school-rankings-mess-a-lose-lose-for-students-and-schools" target="_blank" rel="noreferrer">Aditya Jain writes</a>: &quot;Elite medical schools gain a great advantage without formal rankings... By refusing to participate, these prestigious institutions are essentially pulling up the ladder behind them.&quot;
          </p>

          <h3 className="text-lg font-bold mt-8 text-slate-900">2. Competition Drives Student-Centered Innovation</h3>
          <p>
            NYU Grossman&apos;s <a href="https://www.nytimes.com/2018/08/16/nyregion/nyu-free-tuition-medical-school.html" target="_blank" rel="noreferrer">decision to eliminate tuition</a> catapulted them to <a href="https://nyulangone.org/news/321-impossible-math-it-all-adds-nyu-langone-health#:~:text=NYU%20Grossman%20School%20of%20Medicine%20climbed%20to%20the%20No.%202%20spot%20for%20research%20on%20U.S.%20News%20%26%20World%20Report%E2%80%99s%202022%E2%80%9323" target="_blank" rel="noreferrer">#2 nationally</a> and triggered a nationwide response. Rankings create a feedback loop between student preferences and school behavior. If schools stop attracting strong applicants, their rankings <em>should</em> drop—that signal tells you the school isn&apos;t serving students well.
          </p>

          <h3 className="text-lg font-bold mt-8 text-slate-900">3. The Rankings Vacuum will be Filled—One Way or Another</h3>
          <p>
            Without official rankings, informal systems have proliferated, often with <a href="https://med.admit.org/school-rankings" target="_blank" rel="noreferrer">poorly documented methodologies</a> or <a href="https://nyunews.com/news/2025/10/28/grossman-woke-ranking/" target="_blank" rel="noreferrer">questionable incentives</a>.
          </p>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 my-10">
            <h2 className="text-2xl font-bold text-blue-900 mt-0 mb-4">Our Solution: Transparent, Community-Driven Rankings</h2>
            <p className="text-blue-800">
              We use <strong>exclusively public data</strong> with <strong>community-sourced weights</strong>:
            </p>
            <ul className="list-none pl-0 space-y-2 text-blue-900 font-medium">
              <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> <strong>Academics:</strong> GPA, MCAT</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 bg-purple-500 rounded-full"></span> <strong>Research:</strong> NIH funding total and per faculty</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> <strong>Finances:</strong> Tuition, debt, total cost</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 bg-orange-500 rounded-full"></span> <strong>Clinical Excellence:</strong> Specialty reputation</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 bg-pink-500 rounded-full"></span> <strong>Student Body:</strong> Representation in medicine</li>
            </ul>
            <p className="text-blue-800 mt-4 text-sm">
              No peer assessment popularity contests. No hidden methodology. The community determines category importance through crowdsourced median preferences.
            </p>
          </div>

          <h2 className="text-2xl mb-4 text-slate-800 border-b pb-2">Limitations We Acknowledge</h2>
          <p>
            We acknowledge the MCAT and GPA are imperfect proxies for academic ability and are strongly correlated with socioeconomic status. We include them because they remain key admissions criteria; and for all their flaws, are <a href="https://doi.org/10.1016/j.jnma.2025.08.108" target="_blank" rel="noreferrer">highly predictive of medical school and board exam performance</a>.
          </p>
          <p>
            They also help close a crucial feedback loop: if schools want to be highly ranked (or at least not fall behind), they must attract competitive applicants; to attract competitive applicants, they must cater to student priorities; thus, including MCAT and GPA as an index of school rank helps align incentives and drives innovation across the competitive landscape of medical education.
          </p>
          <p>
            We lack Step 2 scores, unmatched rates, and detailed diversity data—the AAMC has released progressively less information. We&apos;d welcome more transparency on socioeconomic status, race, and first-generation representation. We&apos;re working with the best available public dataset, even if incomplete.
          </p>
          <p>
            Rankings aren&apos;t perfect. But in their absence, opacity and entrenched prestige win. Better rankings—transparent, data-driven, and accountable—serve students and schools alike.
          </p>
        </article>
      </main>
    </div>
  );
}