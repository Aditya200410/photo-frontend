import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Option1 from './pages/Option1';
import Option2 from './pages/Option2';
import Option3 from './pages/Option3';
import Admin from './pages/Admin';
import AdminAddExcel from './pages/AdminAddExcel';
import AdminAddExcelAssembly from './pages/AdminAddExcelAssembly';
import AdminAddExcelNagarNigam from './pages/AdminAddExcelNagarNigam';
import AdminAddExcelPanchayat from './pages/AdminAddExcelPanchayat';
import AdminPrintData from './pages/AdminPrintData';
import AdminPrintDataAssembly from './pages/AdminPrintDataAssembly';
import AdminPrintDataNagarNigam from './pages/AdminPrintDataNagarNigam';
import AdminPrintDataPanchayat from './pages/AdminPrintDataPanchayat';
import PhotoIndex from './pages/PhotoIndex';
import PhotoAssembly from './pages/PhotoAssembly';
import PhotoNagarNigam from './pages/PhotoNagarNigam';
import PhotoGramPanchayat from './pages/PhotoGramPanchayat';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/option/1" element={<Option1 />} />
      <Route path="/option/2" element={<Option2 />} />
      <Route path="/option/3" element={<Option3 />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/add-excel" element={<AdminAddExcel />} />
      <Route path="/admin/add-excel/assembly" element={<AdminAddExcelAssembly />} />
      <Route path="/admin/add-excel/nagar-nigam" element={<AdminAddExcelNagarNigam />} />
      <Route path="/admin/add-excel/panchayat" element={<AdminAddExcelPanchayat />} />
      <Route path="/admin/print-data" element={<AdminPrintData />} />
      <Route path="/admin/print-data/assembly" element={<AdminPrintDataAssembly />} />
      <Route path="/admin/print-data/nagar-nigam" element={<AdminPrintDataNagarNigam />} />
      <Route path="/admin/print-data/panchayat" element={<AdminPrintDataPanchayat />} />
      <Route path="/photo" element={<PhotoIndex />} />
      <Route path="/photo/assembly" element={<PhotoAssembly />} />
      <Route path="/photo/nagar-nigam" element={<PhotoNagarNigam />} />
      <Route path="/photo/gram-panchayat" element={<PhotoGramPanchayat />} />
    </Routes>
  );
}

export default App;
