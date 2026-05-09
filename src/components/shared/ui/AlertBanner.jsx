import { toast } from 'react-toastify';

export const showSuccess = (msg) => toast.success(msg, { position: 'top-right', autoClose: 3000 });
export const showError = (msg) => toast.error(msg, { position: 'top-right', autoClose: 4000 });
export const showWarning = (msg) => toast.warn(msg, { position: 'top-right', autoClose: 3500 });

export default function AlertBanner({ type = 'success', message }) {
  if (!message) return null;
  return <div className={`alert-glass ${type}`}>{message}</div>;
}
