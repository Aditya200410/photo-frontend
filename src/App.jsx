import { Routes, Route, Outlet } from 'react-router-dom';
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
import AdminSettings from './pages/AdminSettings';
import PhotoIndex from './pages/PhotoIndex';
import PhotoAssembly from './pages/PhotoAssembly';
import PhotoNagarNigam from './pages/PhotoNagarNigam';
import PhotoGramPanchayat from './pages/PhotoGramPanchayat';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ContactSupport from './pages/ContactSupport';
import FloatingButtons from './components/FloatingButtons';
import ScrollToTop from './components/ScrollToTop';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminPrivacyPolicy from './pages/AdminPrivacyPolicy';
import AdminTerms from './pages/AdminTerms';

function App() {
  return (
    <>
      <ScrollToTop />
      <FloatingButtons />
      <Routes>
      <Route path="/" element={<PhotoIndex />} />
      <Route path="/option/1" element={<Option1 />} />
      <Route path="/option/2" element={<Option2 />} />
      <Route path="/option/3" element={<Option3 />} />
      <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
        <Route index element={<Admin />} />
        <Route path="add-excel" element={<AdminAddExcel />} />
        <Route path="add-excel/assembly" element={<AdminAddExcelAssembly />} />
        <Route path="add-excel/nagar-nigam" element={<AdminAddExcelNagarNigam />} />
        <Route path="add-excel/panchayat" element={<AdminAddExcelPanchayat />} />
        <Route path="print-data" element={<AdminPrintData />} />
        <Route path="print-data/assembly" element={<AdminPrintDataAssembly />} />
        <Route path="print-data/nagar-nigam" element={<AdminPrintDataNagarNigam />} />
        <Route path="print-data/panchayat" element={<AdminPrintDataPanchayat />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="privacy-policy" element={<AdminPrivacyPolicy />} />
        <Route path="terms" element={<AdminTerms />} />
      </Route>
      <Route path="/photo" element={<Home />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/contact-support" element={<ContactSupport />} />
      </Routes>
    </>
  );
}

export default App;
