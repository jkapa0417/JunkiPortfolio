import './App.css';
import './locales/i18n';
import { AppRouter } from './router';
import { AuthProvider } from './lib/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;