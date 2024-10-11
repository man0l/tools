import { useState, useEffect } from 'react';

export const useAlert = () => {
  const [alert, setAlert] = useState({ message: '', type: '' });

  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => setAlert({ message: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return { alert, setAlert };
};
