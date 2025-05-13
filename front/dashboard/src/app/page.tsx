'use client';

import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import Loading from '@/components/ui/Loading';
import api from '@/lib/api';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(true);

  useEffect(() => {
    api.get('/admin/auth/check-root-exists').then((res) => {
      setShowRegister(!res.data.data.exists);
    }).catch((err) => {
      setShowRegister(false);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <main>
      {loading ? (
        <Loading />
      ) : showRegister ? (<RegisterForm />) : (<LoginForm />)}
    </main>
  );
}
