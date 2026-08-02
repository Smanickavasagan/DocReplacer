import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Loader2, X } from 'lucide-react';
import { addToWaitlist } from './firebase';
import { useLocation, useNavigate } from 'react-router-dom';

export default function WaitlistModal() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [docType, setDocType] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const isOpen = location.hash === '#waitlist';

  const close = () => {
    // Remove hash without refreshing
    navigate(location.pathname + location.search, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email && name) {
      setLoading(true);
      setError(null);
      try {
        await addToWaitlist(email, name, docType || 'Unknown');
        setSubmitted(true);
      } catch (err) {
        setError('Something went wrong. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
        <button onClick={close} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Join the Waitlist</h2>
          <p className="text-slate-500 text-sm">Get early access and a lifetime discount on the full release.</p>
        </div>

        {submitted ? (
          <div className="p-8 flex flex-col items-center justify-center gap-4 text-emerald-600 bg-emerald-50 rounded-2xl border border-emerald-100">
            <CheckCircle2 className="w-12 h-12" />
            <div className="text-center">
              <p className="font-bold text-xl text-slate-900 mb-1">You're on the list!</p>
              <p className="text-sm text-slate-600">We'll notify you when we launch.</p>
            </div>
            <button onClick={close} className="mt-4 px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm font-medium transition-all disabled:opacity-50"
            />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm font-medium transition-all disabled:opacity-50"
            />
            <input
              type="text"
              list="doc-types"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              disabled={loading}
              required
              placeholder="What kind of document are you generating?"
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm font-medium transition-all disabled:opacity-50"
            />
            <datalist id="doc-types">
              <option value="Academic/University Report" />
              <option value="Business Proposal" />
              <option value="Consulting Brief" />
              <option value="Executive Summary" />
            </datalist>
            {error && <p className="text-red-500 text-sm font-medium px-2">{error}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
    </div>
  );
}
