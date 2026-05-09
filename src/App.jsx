import { ToastContainer } from 'react-toastify';
import AppRouter from './routes/AppRouter';

export default function App() {
  return (
    <>
      <AppRouter />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        toastStyle={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.875rem',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      />
    </>
  );
}
