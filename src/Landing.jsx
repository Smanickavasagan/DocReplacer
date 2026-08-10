import React, { useState, useEffect } from 'react';
import { CheckCircle2, Play, X, XCircle, ArrowDown, FileText, Briefcase, Map, PenTool, Book, Lightbulb, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { addToWaitlist } from './firebase';
import { Link } from 'react-router-dom';

export default function Landing() {
  const [isImageOpen, setIsImageOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Intentionally left empty as modal is removed
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/Logo.ico" alt="DocReplacer Logo" className="w-5 h-5 object-contain" />
            <span className="font-semibold text-base text-slate-900 tracking-tight">DocReplacer</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-slate-500 hover:text-slate-900 transition-colors hidden sm:block">
              How It Works
            </a>
            <a href="#waitlist" className="text-sm text-slate-500 hover:text-slate-900 transition-colors hidden sm:block">
              Waitlist
            </a>
            <Link to="/demo" className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Create a Document
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="pt-40 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">Alpha</p>

          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
            Turn your ideas into<br />polished Word documents.
          </h1>

          <p className="text-lg text-slate-500 mb-4 leading-relaxed max-w-xl">
            Describe what you want to create. DocReplacer turns your idea into a structured, polished, editable Word document.
          </p>

          <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-6 mb-8 max-w-xl">
            <h3 className="text-base md:text-lg font-bold text-indigo-900 mb-2">
              Be among the first to create documents this way.
            </h3>
            <p className="text-sm text-indigo-700 leading-relaxed">
              DocReplacer is currently in early alpha. Join the waitlist to get early access as we build a simpler way to turn ideas into polished Word documents.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/demo" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
              <Play className="w-4 h-4 fill-current" /> Create a Document
            </Link>
            <a href="#how-it-works" className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:border-slate-400 transition-colors">
              See How It Works
            </a>
            <a href="#waitlist" className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:border-slate-400 transition-colors">
              Join Waitlist
            </a>
          </div>
        </div>
      </main>

      <div className="border-t border-slate-100" />

      {/* Visual Section */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">From a simple idea to a polished document.</h2>
          
          <div className="flex flex-col items-center gap-8">
            {/* Input */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-md w-full text-left">
              <p className="text-sm text-slate-500 mb-2 font-medium">Input</p>
              <p className="text-slate-900 text-lg font-medium">“Create a project report about our AI automation system…”</p>
            </div>
            
            <ArrowDown className="w-6 h-6 text-slate-400" />
            
            {/* DocReplacer */}
            <div className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow-sm">
              DocReplacer
            </div>

            <ArrowDown className="w-6 h-6 text-slate-400" />

            {/* Output Mock Document */}
            <div className="w-full max-w-3xl text-left">
              <p className="text-sm text-slate-500 mb-4 font-medium text-center">Output</p>
              <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm mx-auto overflow-hidden">
                {/* Mock Word Document Content */}
                <div className="max-w-xl mx-auto space-y-6 text-left">
                  {/* Title */}
                  <div className="space-y-2 border-b border-slate-200 pb-4">
                    <h1 className="text-3xl font-bold text-slate-900 font-serif">Project Report: AI Automation System</h1>
                    <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold">October 2026</p>
                  </div>

                  {/* Executive Summary */}
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-800">1. Executive Summary</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      This document outlines the proposed architecture and implementation phases for the enterprise AI automation system. By integrating LLM-based workflows, we project a 40% reduction in manual data processing tasks.
                    </p>
                  </div>

                  {/* Structured Data Table */}
                  <div className="space-y-3 pt-2">
                    <h2 className="text-xl font-bold text-slate-800">2. Implementation Phases</h2>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2">Phase</th>
                            <th className="px-4 py-2">Deliverable</th>
                            <th className="px-4 py-2">Timeline</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600">
                          <tr>
                            <td className="px-4 py-2 font-medium">Q1</td>
                            <td className="px-4 py-2">Data Infrastructure & Security Audit</td>
                            <td className="px-4 py-2">4 Weeks</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-medium">Q2</td>
                            <td className="px-4 py-2">Model Fine-Tuning & Integration</td>
                            <td className="px-4 py-2">6 Weeks</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-medium">Q3</td>
                            <td className="px-4 py-2">Beta Testing & Employee Onboarding</td>
                            <td className="px-4 py-2">4 Weeks</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bulleted List */}
                  <div className="space-y-3 pt-2">
                    <h2 className="text-xl font-bold text-slate-800">3. Key Benefits</h2>
                    <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                      <li>Streamlined data entry processes</li>
                      <li>Enhanced decision making through predictive analytics</li>
                      <li>Scalable infrastructure for future AI modules</li>
                    </ul>
                  </div>
                  
                  {/* Skeleton lines to imply more content */}
                  <div className="space-y-2 pt-4 opacity-50">
                    <div className="h-2 bg-slate-200 rounded w-full"></div>
                    <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-2 bg-slate-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-slate-100" />

      {/* Comparison */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">From idea to finished document.</h2>
            <p className="text-slate-500 text-base">Stop starting every document from a blank Word file.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left: comparison list */}
            <div className="space-y-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">The usual workflow</p>
                <ul className="space-y-3">
                  {[
                    'Start with a blank document',
                    'Figure out the structure',
                    'Write and organize everything',
                    'Fix formatting manually',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-slate-500 text-sm">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-slate-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: DocReplacer benefits */}
            <div className="space-y-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">With DocReplacer</p>
                <ul className="space-y-3">
                  {[
                    'Describe what you need',
                    'AI builds the structure',
                    'AI creates and formats the document',
                    'Review, refine, and export',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-slate-900 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-slate-100" />

      {/* Workflow Section */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">How it works</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold text-indigo-600">01 — Describe</p>
              <p className="text-slate-600 text-sm">Tell DocReplacer what you want to create.</p>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-semibold text-indigo-600">02 — Create</p>
              <p className="text-slate-600 text-sm">AI structures the document and generates the content.</p>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-semibold text-indigo-600">03 — Refine</p>
              <p className="text-slate-600 text-sm">Make changes with simple instructions.</p>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-semibold text-indigo-600">04 — Export</p>
              <p className="text-slate-600 text-sm">Download your polished .docx.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-slate-100" />

      {/* What can you create? */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Create more than one kind of document.</h2>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {[
              { name: 'Reports', Icon: FileText },
              { name: 'Proposals', Icon: Briefcase },
              { name: 'Plans', Icon: Map },
              { name: 'Briefs', Icon: PenTool },
              { name: 'Documentation', Icon: Book },
              { name: 'Research', Icon: Lightbulb },
              { name: 'And more', Icon: Sparkles },
            ].map((item, idx) => (
              <div 
                key={item.name}
                className={`group flex items-center gap-2.5 px-6 py-3.5 rounded-2xl border bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default ${
                  idx === 6 ? 'border-indigo-200 bg-indigo-50/50 text-indigo-700' : 'border-slate-200 text-slate-700'
                }`}
              >
                <item.Icon className={`w-5 h-5 ${idx === 6 ? 'text-indigo-500' : 'text-slate-400 group-hover:text-indigo-500 transition-colors'}`} />
                <span className="font-semibold">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-10">
          
          <div className="w-full flex flex-col items-center gap-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">As featured in</span>
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
                    <a href="https://productburst.com/product/docreplacer" target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <img 
                        src="https://3188a5210b07f4ad511bbcdc967bc67b.cdn.bubble.io/f1747781918344x939992978866771600/pB-Badge.png" 
                        alt="Featured on ProductBurst" 
                        className="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity" 
                      />
                    </a>
                    <a href="https://tools.launchllama.co?utm_source=badge&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <img 
                        src="https://tools.launchllama.co/featured-badge.png?v=2" 
                        alt="As seen on Launch Llama Newsletter" 
                        className="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity" 
                      />
                    </a>
                    <a href="https://aiai.tools/" target="_blank" rel="noopener noreferrer" className="shrink-0 group">
                      <div className="h-12 flex items-center justify-center px-4 rounded-lg bg-slate-900 border border-slate-700 opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-semibold text-sm tracking-wide">Ai Tools List</span>
                      </div>
                    </a>
                    <a href="https://www.aidirectori.es" target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <img 
                        src="https://cdn.aidirectori.es/ai-tools/badges/light-mode.png" 
                        alt="AI Directories Badge" 
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

    </div>
  );
}