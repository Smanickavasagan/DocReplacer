import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Lock, Layers, ArrowRight, CheckCircle2, Loader2, Play, X, XCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Helmet>
        <title>AI Word Document Generator — Turn Prompts into Clean .docx Files</title>
        <meta name="description" content="Looking for the best ai document generator? Turn text prompts into professionally formatted Word documents instantly with our ai document template generator. Join the Waitlist for DocReplacer." />
        <meta name="keywords" content="ai word document generator free, best ai document generator, ai document template generator" />
      </Helmet>

      <style>{`
        .bg-grid {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl shadow-sm bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <img src="/Logo.ico" alt="DocReplacer Logo" className="w-6 h-6 object-contain" />
            </div>
            <div className="flex items-center">
              <span className="brand-font font-bold text-xl text-slate-900 tracking-tight mr-3">DocReplacer</span>
              <span className="text-slate-500 font-medium text-sm border-l border-slate-300 pl-3 hidden sm:inline-block">AI Document Studio</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="#waitlist" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors hidden sm:block">
              Join Waitlist
            </a>
            <Link to="/demo" className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              Try Out Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-grid z-0" />
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute bottom-20 left-0 -ml-40 w-96 h-96 rounded-full bg-violet-400/20 blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Currently in Alpha version</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            AI Word Document Generator — <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Turn Prompts into Clean .docx Files</span>
          </h1>
          
          <h2 className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-6 font-medium leading-relaxed">
            The <strong>best ai document generator</strong> for submission-ready reports without formatting errors.
          </h2>

          <div className="max-w-md mx-auto mb-6 flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm font-medium text-left shadow-sm">
            <span className="text-amber-500 shrink-0 mt-0.5">⚠️</span>
            <p><strong>Note:</strong> This is a very basic Alpha demo version of the app. The generated documents are sample work, and the AI may make mistakes or formatting errors. All issues and other problems will be fixed in the upcoming full version. Please verify generated documents.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/demo" className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 w-full sm:w-auto">
              <Play className="w-5 h-5 fill-current" /> Try Out Demo Now
            </Link>
            <a href="#waitlist" className="px-8 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center w-full sm:w-auto">
              Join Waitlist
            </a>
          </div>




        </div>
      </main>
      {/* Why DocReplacer Section */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why DocReplacer?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Stop fighting with formatting. See the difference between typical AI output and our clean, professional Word documents.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-2xl transition-all hover:shadow-md hover:bg-rose-50">
                <h3 className="text-xl font-semibold text-rose-900 flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center font-bold text-sm">X</span>
                  Other AI Generators
                </h3>
                <ul className="space-y-3 text-rose-700 font-medium">
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" /> Outputs unstructured text lacking hierarchy
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" /> Disregards standard formatting protocols
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" /> Incurs significant overhead in manual revision
                  </li>
                </ul>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <h3 className="text-xl font-semibold text-indigo-900 flex items-center gap-3 mb-4 relative z-10">
                  <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                  DocReplacer
                </h3>
                <ul className="space-y-3 text-indigo-800 font-medium relative z-10">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-indigo-500" /> Enforces strict adherence to professional formatting standards
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-indigo-500" /> Automates semantic structuring of headings, tables, and lists
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-indigo-500" /> Delivers client-ready documentation instantly upon generation
                  </li>
                </ul>
              </div>
            </div>

            <div 
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white group cursor-pointer"
              onClick={() => setIsImageOpen(true)}
            >
              <div className="absolute top-0 left-0 right-0 bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-2 z-10">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="text-xs text-slate-500 font-medium ml-2">Document Formatting Comparison</span>
              </div>
              <div className="pt-10 bg-slate-50">
                <img 
                  src="/DocReplacer.png" 
                  alt="Comparison between unformatted AI generated docx and beautifully formatted DocReplacer docx" 
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.02]" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/Logo.ico" alt="DocReplacer Logo" className="w-5 h-5 object-contain opacity-50" />
            <span className="text-sm text-slate-500 font-medium">© {new Date().getFullYear()} DocReplacer. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Modal for Image */}
      {isImageOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8" onClick={() => setIsImageOpen(false)}>
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsImageOpen(false);
            }}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src="/DocReplacer.png" 
            alt="Expanded Comparison" 
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
