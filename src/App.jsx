import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Option1 from './pages/Option1';
import Option2 from './pages/Option2';
import Option3 from './pages/Option3';
import Admin from './pages/Admin';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/option/1" element={<Option1 />} />
      <Route path="/option/2" element={<Option2 />} />
      <Route path="/option/3" element={<Option3 />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;
