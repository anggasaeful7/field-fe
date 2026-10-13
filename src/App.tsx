import { RouterProvider } from 'react-router';
import router from './routes/Router';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import './css/globals.css';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
