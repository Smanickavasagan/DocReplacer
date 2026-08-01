const fs = require('fs');

const filePath = 'src/DocxGenerator.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace main background
content = content.replace(/bg-\[\#0a0a0f\]/g, 'bg-slate-50');

// Replace white text variations
content = content.replace(/text-white\/[0-9]+/g, 'text-slate-500');
content = content.replace(/text-white(?![A-Za-z0-9\/-])/g, 'text-slate-900');

// Replace dark backgrounds/borders for cards and inputs
// bg-white/[0.02], bg-white/[0.03], bg-white/[0.04], etc.
content = content.replace(/bg-white\/\[[0-9.]+\]/g, 'bg-white');
// border-white/[0.06], etc.
content = content.replace(/border-white\/\[[0-9.]+\]/g, 'border-slate-200');

// Fix specific shadows and rings
content = content.replace(/shadow-\[0_8px_32px_rgba\(0,0,0,0\.4\)\]/g, 'shadow-xl');
content = content.replace(/shadow-\[0_8px_24px_rgba\(99,102,241,0\.35\)\]/g, 'shadow-md shadow-indigo-600/20');
content = content.replace(/shadow-\[0_8px_32px_rgba\(99,102,241,0\.5\)\]/g, 'shadow-lg shadow-indigo-600/30');

// Header gradient text if any
// Update specific icons or states
content = content.replace(/text-indigo-400/g, 'text-indigo-600');
content = content.replace(/text-indigo-300/g, 'text-indigo-600');
content = content.replace(/text-indigo-200/g, 'text-indigo-700');
content = content.replace(/bg-indigo-500\/10/g, 'bg-indigo-50');
content = content.replace(/bg-indigo-500\/20/g, 'bg-indigo-100');
content = content.replace(/border-indigo-500\/20/g, 'border-indigo-100');
content = content.replace(/border-indigo-500\/30/g, 'border-indigo-200');

// Fix text-slate-500/90 or similar if generated
content = content.replace(/text-slate-500\/[0-9]+/g, 'text-slate-500');

// Update input styles
content = content.replace(/placeholder:text-slate-500/g, 'placeholder:text-slate-400');
// Some inputs might have bg-white border-2 border-slate-200 focus:ring-4 focus:ring-indigo-500/20
content = content.replace(/border-2 border-slate-200/g, 'border-2 border-slate-200');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Theme replaced successfully.');
