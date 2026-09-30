import React from 'react';

function TemplateSelectorModal({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in duration-200">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800">Select Slip Template</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => onSelect(1)}
              className="flex flex-col items-center group text-left"
            >
              <div className="w-full aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all shadow-md">
                <img src="/option1.jpg" alt="Option 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h4 className="mt-4 font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-center">Text with Image</h4>
            </button>

            <button 
              onClick={() => onSelect(2)}
              className="flex flex-col items-center group text-left"
            >
              <div className="w-full aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all shadow-md">
                <img src="/option2.jpg" alt="Option 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h4 className="mt-4 font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-center">Only Text</h4>
            </button>

            <button 
              onClick={() => onSelect(3)}
              className="flex flex-col items-center group text-left"
            >
              <div className="w-full aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all shadow-md">
                <img src="/option3.jpg" alt="Option 3" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h4 className="mt-4 font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-center">Right Side Image</h4>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateSelectorModal;
