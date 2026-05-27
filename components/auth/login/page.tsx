"use client";
import React, { useState } from 'react'
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPageLogin() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function LoginHandler(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      router.push('/');
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  }

  return (
    <div className='text-white'>
      <form onSubmit={LoginHandler} className='flex flex-col items-center font-work-sans justify-center h-screen gap-4'>
        <h1 className='font-playwrite-at text-3xl mb-4'>cloudm</h1>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <input
          type="text"
          className='px-8 py-2 border hover:border-white/15 transition-all duration-300 border-white/5 rounded-2xl'
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className='px-8 py-2 mb-2 border hover:border-white/15 transition-all duration-300 border-white/5 rounded-2xl'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className='px-10 py-2 border hover:border-white/15 transition-all duration-300 border-white/5 rounded-2xl' disabled={isLoading}>
          {isLoading ? 'Загрузка...' : 'Начать путишествее'}
        </button>
        <Link href='/authorization/register' className='text-white/30 text-sm hover:text-white/50 transition-all duration-300'>Создать аккаунт</Link>
      </form>
    </div>
  )
}