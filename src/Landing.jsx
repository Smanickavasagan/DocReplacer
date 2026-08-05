import React, { useState, useEffect } from 'react';
import { CheckCircle2, Play, X, XCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { addToWaitlist } from './firebase';
import { Link } from 'react-router-dom';

export default function Landing() {
  const [isImageOpen, setIsImageOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsImageOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">

      {/* Nav — borderless, white, tight */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/Logo.ico" alt="DocReplacer Logo" className="w-5 h-5 object-contain" />
            <span className="font-semibold text-base text-slate-900 tracking-tight">DocReplacer</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#waitlist" className="text-sm text-slate-500 hover:text-slate-900 transition-colors hidden sm:block">
              Waitlist
            </a>
            <Link to="/demo" className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Try Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — pure type, no blobs, no badges */}
      <main className="pt-40 pb-24 px-6">
        <div className="max-w-2xl mx-auto">

          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">Alpha</p>

          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
            Turn a prompt into a<br />clean Word document.
          </h1>

          <p className="text-lg text-slate-500 mb-4 leading-relaxed max-w-xl">
            DocReplacer generates submission-ready <code className="text-sm bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">.docx</code> files — proper headings, tables, and structure — from a single text prompt.
          </p>

          <p className="text-sm text-slate-400 mb-10 max-w-md">
            This is an early alpha. The AI may produce formatting errors. Verify documents before submitting.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/demo" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
              <Play className="w-4 h-4 fill-current" /> Try the Demo
            </Link>
            <a href="#waitlist" className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:border-slate-400 transition-colors">
              Join Waitlist
            </a>
          </div>
        </div>
      </main>

      {/* Divider */}
      <div className="border-t border-slate-100" />

      {/* Comparison — text-only, no colored cards */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Why DocReplacer?</h2>
            <p className="text-slate-500 text-base">Most AI tools dump unformatted text. We output structure.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">

            {/* Left: comparison list */}
            <div className="space-y-8">
              {/* Others */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Other AI generators</p>
                <ul className="space-y-3">
                  {[
                    'Unstructured text, no hierarchy',
                    'Ignores formatting standards',
                    'Hours of manual cleanup after',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-slate-500 text-sm">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-slate-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* DocReplacer */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">DocReplacer</p>
                <ul className="space-y-3">
                  {[
                    'Proper headings, tables, and lists',
                    'Follows professional .docx standards',
                    'Download and submit immediately',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-slate-900 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: image — no fake browser chrome */}
            <div
              className="rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:border-slate-400 transition-colors"
              onClick={() => setIsImageOpen(true)}
            >
              <img
                src="/DocReplacer.png"
                alt="Comparison between unformatted AI output and DocReplacer's structured document"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-slate-100" />
      <footer className="py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-10">
          
          {/* Featured On Marquee */}
          <div className="w-full flex flex-col items-center gap-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Featured On</span>
            <div className="w-full overflow-hidden relative">
              <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
              
              <div className="animate-marquee flex gap-12 items-center">
                {[...Array(4)].map((_, i) => (
                  <React.Fragment key={i}>
                    <a href="https://dang.ai" target="_blank" rel="dofollow noopener" className="shrink-0">
                      <img
                        src="https://assets.dang.ai/badges/dang-verified-light.png"
                        alt="Verified on DANG!"
                        className="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
                      />
                    </a>
                    <a href="https://openhunts.com" target="_blank" title="OpenHunts Club" className="shrink-0">
                      <img 
                        alt="OpenHunts Club Member" 
                        src="https://cdn.openhunts.com/badges/club.webp" 
                        className="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity" 
                      />
                    </a>
                    <a href="https://earlyhunt.com/project/free-docx-generator-from-text-prompts" target="_blank" rel="noopener" className="shrink-0">
                      <img 
                        src="https://earlyhunt.com/badges/earlyhunt-badge-light.svg" 
                        alt="Featured on EarlyHunt" 
                        className="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity" 
                      />
                    </a>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <img src="/Logo.ico" alt="" className="w-4 h-4 object-contain opacity-40" />
            <span className="text-xs text-slate-400">© {new Date().getFullYear()} DocReplacer</span>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {isImageOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 md:p-12"
          onClick={() => setIsImageOpen(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsImageOpen(false); }}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src="/DocReplacer.png"
            alt="Expanded Comparison"
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}