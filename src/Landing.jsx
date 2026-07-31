import React, { useState } from 'react';
import { Sparkles, Zap, Lock, Layers, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { addToWaitlist } from './firebase';

export default function Landing() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [docType, setDocType] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email && name) {
      setLoading(true);
      setError(null);
      try {
        await addToWaitlist(name, email, docType);
        setSubmitted(true);
        setEmail('');
        setName('');
        setDocType('');
      } catch (err) {
        setError('Failed to join waitlist. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Helmet>
        <title>AI Word Document Generator — Turn Prompts into Clean .docx Files</title>
        <meta name="description" content="Looking for the best ai document generator? Turn text prompts into professionally formatted Word documents instantly with our ai document template generator. Join the Waitlist for DocReplacer." />
        <meta name="keywords" content="ai word document generator free, best ai document generator, ai document template generator" />
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .brand-font { font-family: 'Outfit', sans-serif !important; }
        
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
          <a href="#waitlist" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
            Join Waitlist
          </a>
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
            <span>Currently in Private Beta</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            AI Word Document Generator — <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Turn Prompts into Clean .docx Files</span>
          </h1>
          
          <h2 className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            The <strong>best ai document generator</strong> for submission-ready reports without formatting errors.
          </h2>

          {/* Waitlist Form */}
          <div id="waitlist" className="max-w-md mx-auto bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
            {submitted ? (
              <div className="p-4 flex flex-col items-center justify-center gap-3 text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
                <p className="font-semibold text-lg">You're on the list!</p>
                <p className="text-sm text-slate-500">We'll notify you when we launch.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-2">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border-none bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none text-base transition-all disabled:opacity-50"
                />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border-none bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none text-base transition-all disabled:opacity-50"
                />
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  disabled={loading}
                  required
                  className={`w-full px-4 py-3 rounded-xl border-none bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none text-base transition-all disabled:opacity-50 appearance-none ${docType === '' ? 'text-slate-400' : 'text-slate-900'}`}
                >
                  <option value="" disabled>What kind of document are you generating?</option>
                  <option value="Academic/University Report">Academic/University Report</option>
                  <option value="Business Proposal">Business Proposal</option>
                  <option value="Consulting Brief">Consulting Brief</option>
                  <option value="Executive Summary">Executive Summary</option>
                  <option value="Other">Other</option>
                </select>
                {error && <p className="text-red-500 text-sm font-medium px-2">{error}</p>}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-1 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Join Waitlist <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            )}
          </div>
          <p className="mt-4 text-xs text-slate-400 mb-20">Join 1,000+ others already on the waitlist.</p>

          {/* Visual Proof Section */}
          <div className="max-w-5xl mx-auto border border-slate-200 bg-white rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Stop fighting with formatting</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Before */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs">Before (Copy-Paste)</span>
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                </div>
                <div className="flex-1 rounded-2xl bg-slate-50 border border-slate-200 p-8 flex flex-col items-start min-h-[300px] relative overflow-hidden group">
                  <div className="w-full opacity-50 font-serif text-sm leading-relaxed text-slate-700 select-none pointer-events-none">
                    <div className="text-lg font-bold mb-4 font-sans text-black">## EXECUTIVE SUMMARY</div>
                    <p className="mb-4">The quick brown fox jumps over the lazy dog. **this should be bold**</p>
                    <p className="font-mono bg-slate-200 p-1 rounded inline-block mb-6">Broken font sizes & misaligned tables.</p>
                    <table className="w-full border-collapse border border-slate-400 text-xs">
                      <tbody>
                        <tr><td className="border border-slate-400 p-2">Row 1</td><td className="border border-slate-400 p-2 text-right">Misaligned</td></tr>
                        <tr><td className="border border-slate-400 p-2 text-right">Row 2</td><td className="border border-slate-400 p-2 w-12">Tiny</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="absolute inset-0 bg-red-500/5 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm">Formatting Errors</span>
                  </div>
                </div>
              </div>

              {/* After */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="font-semibold text-indigo-600 uppercase tracking-wider text-xs">After (DocReplacer)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                </div>
                <div className="flex-1 rounded-2xl bg-white border border-indigo-100 shadow-[0_8px_30px_rgba(99,102,241,0.08)] p-8 flex flex-col items-start min-h-[300px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-bl-xl text-xs font-bold flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Native .docx
                  </div>
                  <div className="w-full mt-2 font-sans text-sm leading-relaxed text-slate-800 select-none">
                    <div className="text-xl font-bold mb-4 text-indigo-950 border-b-2 border-indigo-50 pb-2">Executive Summary</div>
                    <p className="mb-5 text-slate-600 text-[13px] text-justify leading-relaxed">
                      The quick brown fox jumps over the lazy dog. <strong>This should be bold</strong>. A clean, natively formatted Word document opened in MS Word with standard headings, balanced margins, and sharp layout spacing.
                    </p>
                    <table className="w-full border-collapse text-[13px]">
                      <thead>
                        <tr className="bg-indigo-50/70 text-indigo-900 border-b border-indigo-100">
                          <th className="p-2.5 text-left font-semibold">Section</th>
                          <th className="p-2.5 text-left font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-50">
                          <td className="p-2.5 text-slate-600">Row 1</td>
                          <td className="p-2.5 font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Aligned</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-slate-600">Row 2</td>
                          <td className="p-2.5 font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Perfect</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Built for speed and privacy</h2>
            <p className="text-slate-500 text-lg">Everything you need to ship documents faster.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6 text-amber-500" />,
                title: "Streaming AI Generation",
                desc: "Watch your document come alive in real time. Sections appear as the AI writes — no waiting."
              },
              {
                icon: <Lock className="w-6 h-6 text-emerald-500" />,
                title: "Private Client-Side Build",
                desc: "Runs directly in your browser. Your private data never leaves your device."
              },
              {
                icon: <Layers className="w-6 h-6 text-indigo-500" />,
                title: "OpenXML .docx Control",
                desc: "Edit every block — paragraphs, tables, bullets, columns before native Word export."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 border border-slate-100">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/Logo.ico" alt="DocReplacer Logo" className="w-5 h-5 object-contain opacity-50" />
            <span className="text-sm text-slate-500 font-medium">© {new Date().getFullYear()} DocReplacer. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
