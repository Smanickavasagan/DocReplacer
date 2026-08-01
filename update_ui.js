const fs = require('fs');
let code = fs.readFileSync('src/DocxGenerator.jsx', 'utf8');

// We will inject a completely new UI for DocxGenerator wrapper
// Let's replace the DocxGenerator return statement
code = code.replace(
  /<div className="relative min-h-screen text-slate-900 bg-slate-50 font-sans overflow-hidden">[\s\S]*?<\/div>\s*\);\s*}/g,
  `
  <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
    {/* Navigation */}
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl shadow-sm bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <img src="/Logo.ico" alt="DocReplacer Logo" className="w-6 h-6 object-contain" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">DocReplacer Studio</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm \${step >= 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}\`}>1</div>
            <span className={\`text-sm font-semibold \${step >= 0 ? 'text-slate-900' : 'text-slate-400'}\`}>Setup</span>
            <div className="w-8 h-[2px] bg-slate-200 mx-2"></div>
            <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm \${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}\`}>2</div>
            <span className={\`text-sm font-semibold \${step >= 1 ? 'text-slate-900' : 'text-slate-400'}\`}>Edit</span>
            <div className="w-8 h-[2px] bg-slate-200 mx-2"></div>
            <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm \${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}\`}>3</div>
            <span className={\`text-sm font-semibold \${step >= 2 ? 'text-slate-900' : 'text-slate-400'}\`}>Export</span>
          </div>
        </div>
      </div>
    </nav>
    <main className="max-w-7xl mx-auto px-6 py-12">
      {loadingPhase && <LoadingOverlay phase={loadingPhase} />}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
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
}`
);

fs.writeFileSync('src/DocxGenerator.jsx', code);
console.log("Updated DocxGenerator wrapper");
