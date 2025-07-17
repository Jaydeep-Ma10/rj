// src/pages/Callback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 2000); // Redirect to home after 2 sec

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center mt-20">
      <h1 className="text-3xl font-bold text-green-600">✅ Payment Successful</h1>
      <p className="text-lg mt-2">Redirecting to your wallet...</p>
    </div>
  );
};

export default Callback;
