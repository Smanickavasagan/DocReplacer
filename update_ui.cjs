const fs = require('fs');

let code = fs.readFileSync('src/DocxGenerator.jsx', 'utf8');

// Replace the main wrapper in DocxGenerator
const newDocxGeneratorReturn = `return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* Navbar with Progress */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl shadow-sm bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <img src="/Logo.ico" alt="DocReplacer Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight brand-font">DocReplacer Studio</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            {[ 
              { s: 0, label: 'Setup' }, 
              { s: 1, label: 'Editor' }, 
              { s: 2, label: 'Export' } 
            ].map((st, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm \${step >= st.s ? 'bg-indigo-600 text-white shadow-indigo-600/20' : 'bg-slate-100 text-slate-400 border border-slate-200'}\`}>
                    {st.s + 1}
                  </div>
                  <span className={\`text-sm font-semibold hidden sm:block \${step >= st.s ? 'text-slate-900' : 'text-slate-400'}\`}>{st.label}</span>
                </div>
                {i < 2 && <div className="w-4 sm:w-8 h-[2px] rounded-full bg-slate-200"></div>}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col">
        {loadingPhase && <LoadingOverlay phase={loadingPhase} />}
        
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out flex flex-col">
          {step === 0 && (
            <Step1Prompt
              onDone={({ elements: els, docTitle, pages, prompt }) => {
                setElements(els);
                setTargetPages(pages);
                setStep(1);
              }} />
          )}

          {step === 1 && (
            <Step2Editor
              elements={elements}
              setElements={setElements}
              docStyles={docStyles}
              setDocStyles={setDocStyles}
              targetPages={targetPages}
              setLoadingPhase={setLoadingPhase}
              onBack={() => setStep(0)}
              onDone={r => { setResult(r); setStep(2); }} />
          )}

          {step === 2 && result && (
            <Step3Result
              result={result}
              onBack={() => setStep(1)}
              onStartOver={() => { setStep(0); setElements([]); setResult(null); }} />
          )}
        </div>
      </main>
    </div>
  );
}`;
code = code.replace(/return\s*\(\s*<div className="relative min-h-screen[\s\S]*?\);\s*}/, newDocxGeneratorReturn + '\n}');

// Replace Step1Prompt return
const newStep1Return = `return (
    <div className="w-full flex flex-col lg:flex-row gap-10">
      {/* Left Column: Context & Prompt */}
      <div className="flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4 leading-tight">
            Create your document <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">in seconds.</span>
          </h1>
          <p className="text-slate-600 text-lg max-w-xl">
            Describe what you need. The AI will structure, write, and format a native Word document instantly.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col flex-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-50 text-indigo-200 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2.41L18.59 9H13V4.41zM18 20H6V4h5v7h7v9z"/></svg>
          </div>
          
          <label className="block text-sm font-bold text-slate-900 mb-3 relative z-10 flex items-center gap-2">
            Document Prompt <span className="text-indigo-600">*</span>
          </label>
          <textarea 
            rows={7} 
            value={prompt} 
            onChange={e => setPrompt(e.target.value)} 
            disabled={loading}
            placeholder='e.g. "A comprehensive market analysis report for Q3, targeting stakeholders. Include a competitor comparison table and bullet points for growth strategies."'
            className="w-full flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-y text-base leading-relaxed placeholder:text-slate-400 font-medium relative z-10" 
          />
          <div className="flex items-center justify-between mt-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <p className="text-xs text-slate-500 font-medium">Ready to generate</p>
            </div>
            <p className={\`text-xs font-semibold \${prompt.length > 20 ? 'text-indigo-600' : 'text-slate-400'}\`}>{prompt.length} chars</p>
          </div>
        </div>
      </div>

      {/* Right Column: Settings */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Document Type</h3>
              <p className="text-xs text-slate-500">Sets the formatting style</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {DOC_TYPES.map(dt => {
              const a = docType === dt.value;
              return (
                <button key={dt.value} onClick={() => setDocType(dt.value)} disabled={loading}
                  className={\`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all \${a ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-transparent border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}\`}>
                  <span className={\`text-lg \${a ? 'opacity-100' : 'opacity-60'}\`}>{dt.icon}</span>
                  {dt.label}
                  {a && <span className="ml-auto text-indigo-600 font-black">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2.41L18.59 9H13V4.41z"/></svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Page Length</h3>
              <p className="text-xs text-slate-500">Target output size</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-200 mb-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setPages(n)} disabled={loading}
                className={\`flex-1 h-10 rounded-xl text-sm font-bold transition-all \${pages === n ? 'bg-white text-indigo-700 shadow border border-slate-200 scale-105' : 'text-slate-500 hover:bg-slate-100'}\`}>
                {n}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-200">
            {[6, 7, 8, 9, 10].map(n => (
              <button key={n} onClick={() => setPages(n)} disabled={loading}
                className={\`flex-1 h-10 rounded-xl text-sm font-bold transition-all \${pages === n ? 'bg-white text-indigo-700 shadow border border-slate-200 scale-105' : 'text-slate-500 hover:bg-slate-100'}\`}>
                {n}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 font-medium mt-4">Target: {pageLabel} (~{pages * 400} words)</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm font-medium flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            <p>{error}</p>
          </div>
        )}

        <div className="mt-auto">
          <button onClick={go} disabled={loading || !prompt.trim()}
            className={\`w-full py-4 px-8 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all \${loading || !prompt.trim()
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/30 hover:-translate-y-0.5'
              }\`}>
            {loading ? <><span className="animate-spin inline-block text-xl">⟳</span> Building...</> : <>Generate Document <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></>}
          </button>
          
          {loading && (
            <div className="mt-4 flex flex-col items-center">
              <div className="text-sm font-semibold text-indigo-600 animate-pulse">{streamLog || "Initializing generation..."}</div>
              <button onClick={cancel} className="mt-3 text-xs text-slate-500 hover:text-red-500 font-bold uppercase tracking-wider transition-colors">Cancel Generation</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );`;
code = code.replace(/return\s*\(\s*<div className="w-full max-w-3xl mx-auto flex flex-col items-center">[\s\S]*?\);\s*}/, newStep1Return + '\n}');

fs.writeFileSync('src/DocxGenerator.jsx', code);
