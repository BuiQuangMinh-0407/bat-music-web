// App.jsx — chỉ chứa routing, không có logic hay UI
import { Routes, Route } from 'react-router-dom';
import HomePage  from '@/pages/Home/index';
import AdminPage from '@/pages/Admin/index';
import AuthPage  from '@/pages/Auth/index';
import ProfilePage from '@/pages/Profile/index';
import NotFoundPage from '@/pages/NotFound/index';

export default function App() {
  return (
    <Routes>
      <Route path="/"      element={<HomePage />}  />
      <Route path="/login"  element={<AuthPage />}  />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*"      element={<NotFoundPage />} />
    </Routes>
  );
}
