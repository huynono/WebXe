import React, { useEffect, useRef } from 'react';

interface LogoutOnInactivityProps {
  onLogout: () => void;  // onLogout là hàm không nhận tham số, không trả về gì
}

const LogoutOnInactivity: React.FC<LogoutOnInactivityProps> = ({ onLogout }) => {
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const logout = () => {
    localStorage.removeItem('email');
    localStorage.removeItem('token'); // xóa token
    localStorage.clear(); // xóa tất cả key trong localStorage
    onLogout();
  };

  const resetTimer = () => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(logout, 600000);
  };

  useEffect(() => {
    resetTimer();

    const events = ['mousemove', 'keydown', 'scroll', 'click'];

    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, []);

  return null;
};

export default LogoutOnInactivity;
