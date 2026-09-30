import React from 'react';

function PrintModal({ isOpen, onClose, onGenerate, isGenerating, progress, pagesCount, setPagesCount, optionNumber, voterData, setVoterData }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Print Voter Slips</h2>

        {isGenerating ? (
          <div className="space-y-6">
            <p className="text-slate-600 font-medium text-center">Generating PDF... Please wait.</p>
            <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-slate-500">{Math.round(progress)}% Complete</p>
          </div>
        ) : (
          <div className="space-y-6">
            {optionNumber === 1 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Poster Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setVoterData({ ...voterData, topImage: event.target.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100 mb-4"
                />
                {voterData?.topImage && (
                  <img src={voterData.topImage} alt="Preview" className="w-full h-32 object-contain border border-slate-200 rounded-lg mb-4 bg-slate-50" />
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Pages (8 slips per page)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={pagesCount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setPagesCount('');
                  } else {
                    setPagesCount(parseInt(val, 10));
                  }
                }}
                className="w-full rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium"
              />
              <p className="text-sm text-slate-500 mt-2">This will generate {pagesCount ? pagesCount * 8 : 0} total slips.</p>
              
              {/* Error Message */}
              {pagesCount === 0 || pagesCount === '' || pagesCount < 1 ? (
                 <p className="text-sm text-red-500 mt-2 font-medium">Please enter a valid number of pages (minimum 1).</p>
              ) : null}
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pagesCount && pagesCount >= 1) {
                    onGenerate();
                  } else {
                    alert('Please enter a valid number of pages (minimum 1).');
                  }
                }}
                className="px-6 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!pagesCount || pagesCount < 1}
              >
                Start Print
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PrintModal;
