import { Link } from 'react-router-dom';
import OptionCard from '../components/OptionCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />

      <header className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-block bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 text-indigo-200 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            🖨️ High Quality Print Ready
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Voter Slip <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Generator</span>
          </h1>
          <p className="text-lg text-indigo-200/80 max-w-2xl mx-auto">
            Choose your preferred design layout to generate professional voter slips effortlessly. Select an option below to get started.
          </p>
        </div>
      </header>

      {/* Main content - Options grid */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-20 -mt-10 relative z-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/option/1" className="block transform transition-transform hover:-translate-y-2 hover:shadow-2xl rounded-2xl">
            <OptionCard
              title="Text with Image"
              image="/option1.jpg"
              onClick={() => { }}
            />
          </Link>
          <Link to="/option/2" className="block transform transition-transform hover:-translate-y-2 hover:shadow-2xl rounded-2xl">
            <OptionCard
              title="Only Text"
              image="/option2.jpg"
              onClick={() => { }}
            />
          </Link>
          <Link to="/option/3" className="block transform transition-transform hover:-translate-y-2 hover:shadow-2xl rounded-2xl">
            <OptionCard
              title="Right Side Image"
              image="/option3.jpg"
              onClick={() => { }}
            />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
