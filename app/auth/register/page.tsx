'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }
    if (!isSupabaseConfigured()) {
      setError('Supabase не настроен. Добавьте ключи в .env.local')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="auth-gradient relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      {/* Decorative orbs */}
      <div className="orb w-96 h-96 bg-white -top-20 -right-20" style={{ position: 'absolute' }} />
      <div className="orb w-72 h-72 bg-purple-300 bottom-10 left-10" style={{ position: 'absolute' }} />
      <div className="orb w-48 h-48 bg-indigo-300 top-1/4 left-1/3" style={{ position: 'absolute' }} />

      <div className="glass-card fade-in-up relative z-10 w-full max-w-md rounded-2xl p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-300/50">
            <span className="text-lg font-black text-white">ОРТ</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Создайте аккаунт</h1>
          <p className="mt-1 text-sm text-slate-500">Начните подготовку к ОРТ прямо сейчас</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-indigo-400 focus:outline-none focus:ring-3 focus:ring-indigo-100"
              placeholder="email@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-indigo-400 focus:outline-none focus:ring-3 focus:ring-indigo-100"
              placeholder="Минимум 6 символов"
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Подтвердите пароль</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-indigo-400 focus:outline-none focus:ring-3 focus:ring-indigo-100"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-5 text-base font-semibold shadow-lg shadow-indigo-300/40 transition-all hover:shadow-xl hover:shadow-indigo-400/40 hover:-translate-y-0.5 active:translate-y-0"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Создаём...
              </span>
            ) : 'Зарегистрироваться'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Уже есть аккаунт?{' '}
          <Link href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
