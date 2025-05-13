import api from '@/lib/api';
import { AxiosError } from 'axios';
import { useState } from 'react';

export default function LoginForm() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.post('/admin/auth/login', form);
            console.log('Login bem-sucedido: ', res.data);
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string }>;
            console.log(err);
            setError(error.response?.data?.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <h1>Login Form</h1>
    );
}