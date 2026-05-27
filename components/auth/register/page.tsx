"use client";
import React, { useState } from 'react'
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPageRegister() {
  const { register } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function RegisterHandler(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await register(username, email, password);

    if (result.success) {
      router.push('/authorization/login'); // ← после регистрации на логин
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  }

  return (
    <div className='text-white'>
      <form onSubmit={RegisterHandler} className='flex flex-col items-center font-work-sans justify-center h-screen gap-4'>
        <h1 className='font-playwrite-at text-3xl mb-4'>Register</h1>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <input
          type="text"
          placeholder="Username"
          className='px-8 py-2 border hover:border-white/15 transition-all duration-300 border-white/5 rounded-2xl'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className='px-8 py-2 border hover:border-white/15 transition-all duration-300 border-white/5 rounded-2xl'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className='px-8 py-2 mb-2 border hover:border-white/15 transition-all duration-300 border-white/5 rounded-2xl'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className='px-10 py-2 border hover:border-white/15 transition-all duration-300 border-white/5 rounded-2xl' disabled={isLoading}>
          {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
        </button>
        <Link href='/authorization/login' className='text-white/30 text-sm hover:text-white/50 transition-all duration-300'>Войти в аккаунт</Link>
      </form>
    </div>
  )
}