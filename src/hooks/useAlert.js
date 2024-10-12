import { useState, useEffect } from 'react';

export const useAlert = () => {
  const [alert, setAlert] = useState({ message: '', type: '', onConfirm: null });

  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => setAlert({ message: '', type: '', onConfirm: null }), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const confirmAlert = () => {
    if (alert.onConfirm) {
      alert.onConfirm();
      setAlert({ message: '', type: '', onConfirm: null });
    }
  };

  return { alert, setAlert, confirmAlert };
};
