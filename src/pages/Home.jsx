import { Link } from 'react-router-dom';
import OptionCard from '../components/OptionCard';

function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white py-12 px-6 text-center relative">
        <div className="absolute top-6 right-6">
          <Link to="/admin" className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-xl border border-white/20 transition-all font-medium text-sm flex items-center shadow-lg">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Admin Panel
          </Link>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Welcome to voter slip Generator
        </h1>
      </header>

      {/* Main content - Options grid */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/option/1" className="block">
            <OptionCard
              title="text with image"
              image="/option1.jpg"
              onClick={() => { }}
            />
          </Link>
          <Link to="/option/2" className="block">
            <OptionCard
              title="only text"
              image="/option2.jpg"
              onClick={() => { }}
            />
          </Link>
          <Link to="/option/3" className="block">
            <OptionCard
              title="right side image"
              image="/option3.jpg"
              onClick={() => { }}
            />
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Home;
