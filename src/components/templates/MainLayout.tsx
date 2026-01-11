import { Outlet } from 'react-router-dom';
import Navigation from '../organisms/Navigation';
import Footer from '../organisms/Footer';
import '../../styles/glass.css';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;