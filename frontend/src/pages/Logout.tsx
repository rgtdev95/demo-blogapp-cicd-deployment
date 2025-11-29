import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function Logout() {
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    logout();
    toast.success('Logged out successfully');
  }, [logout]);

  return <Navigate to="/" replace />;
}
