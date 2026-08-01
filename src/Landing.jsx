import React, { useState } from 'react';
import { Sparkles, Zap, Lock, Layers, ArrowRight, CheckCircle2, Loader2, Play } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { addToWaitlist } from './firebase';
import { Link } from 'react-router-dom';

export default function Landing() {


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
            <p><strong>Note:</strong> This is an Alpha demo version. The AI may make mistakes or formatting errors. Please verify generated documents.</p>
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



      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/Logo.ico" alt="DocReplacer Logo" className="w-5 h-5 object-contain opacity-50" />
            <span className="text-sm text-slate-500 font-medium">© {new Date().getFullYear()} DocReplacer. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
