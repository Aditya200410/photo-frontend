import React from 'react';

const OptionCard = ({ title, image, onClick }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full">
      <div className="relative h-64 w-full overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
      </div>

      <div className="absolute bottom-0 w-full p-6 flex justify-center">
        <button
          onClick={onClick}
          className="w-full relative overflow-hidden rounded-xl bg-white/20 backdrop-blur-md border border-white/30 py-3 px-6 text-lg font-bold text-white shadow-sm transition-all duration-300 hover:bg-white hover:text-slate-900 hover:scale-[1.02] active:scale-95"
        >
          {title}
        </button>
      </div>
    </div>
  );
};

export default OptionCard;
