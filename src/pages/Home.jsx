import { Link } from 'react-router-dom';
import OptionCard from '../components/OptionCard';

function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header section */}
      <header className="bg-slate-900 text-white py-12 px-6 text-center">
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
