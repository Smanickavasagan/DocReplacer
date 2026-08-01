const fs = require('fs');

let code = fs.readFileSync('src/DocxGenerator.jsx', 'utf8');

const newStep2Return = `return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Review & Edit Content</h2>
          <p className="text-slate-500 text-sm mt-0.5">Tweak the generated blocks or use the AI wand to rewrite.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold transition-all border border-slate-200">
            ← Regenerate
          </button>
          <button onClick={build} disabled={loading} className={\`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 \${loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:shadow-lg hover:bg-indigo-700'}\`}>
            {loading ? <><span className="animate-spin text-lg">⟳</span> Building...</> : <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> Build .docx</>}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar */}
        <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0 flex flex-col gap-5 sticky top-24">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Document Stats</h3>
            <div className="flex flex-col gap-4">
              {stats.map(({ label, value, icon }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                    <span className="text-xl text-slate-300">{icon}</span>{label}
                  </div>
                  <div className="text-2xl font-black text-slate-900">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/40">
            <StyleEditor docStyles={docStyles} setDocStyles={setDocStyles} />
          </div>
        </div>

        {/* Document Editor Area */}
        <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/40 p-4 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Document Blocks ({elements.length})</h3>
            <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-1.5 rounded-lg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              Click any block to edit
            </div>
          </div>
          
          <div className="space-y-4">
            {elements.map((el, idx) => (
              <TemplateBlock key={el.id} el={el} idx={idx} total={elements.length}
                onUpdate={(k, v) => updateEl(el.id, k, v)}
                onUpdateBatch={patches => updateElBatch(el.id, patches)}
                onRemove={() => removeEl(el.id)}
                onMoveUp={() => moveUp(idx)}
                onMoveDown={() => moveDown(idx)} />
            ))}
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm font-medium flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );`;
code = code.replace(/return\s*\(\s*<div className="w-full flex flex-col">[\s\S]*?\);\s*}/, newStep2Return + '\n}');

const newStep3Return = `return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
        
        <div className="w-24 h-24 bg-emerald-50 rounded-3xl mx-auto flex items-center justify-center mb-8 rotate-3 shadow-inner">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
        </div>
        
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Document Ready!</h2>
        <p className="text-slate-500 text-lg mb-10 max-w-sm mx-auto">Your professionally formatted .docx file has been compiled and is ready for download.</p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
          <button onClick={() => setShowPreview(true)} className="w-full py-4 px-6 rounded-2xl font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            Preview
          </button>
          
          <button onClick={runFileDownload} className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-emerald-600 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Download
          </button>
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-6 border-t border-slate-100 pt-8">
          <button onClick={onBack} className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1.5 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg> Back to Editor
          </button>
          <div className="w-1 h-1 rounded-full bg-slate-200"></div>
          <button onClick={onStartOver} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> Start Over
          </button>
        </div>
      </div>
      
      {showPreview && (
        <DocPreviewModal uint8={uint8} title={title} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );`;
code = code.replace(/return\s*\(\s*<div className="w-full flex flex-col items-center">[\s\S]*?\);\s*}/, newStep3Return + '\n}');

fs.writeFileSync('src/DocxGenerator.jsx', code);
