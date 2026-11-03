import React, { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, Eye, EyeOff, KeyRound, Leaf, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { AppTab } from './Header';
import { authConfigured, supabase } from '../services/supabase';

type AuthPageMode = Extract<AppTab, 'sign-in' | 'sign-up' | 'reset-password'>;

interface AuthPageProps {
  mode: AuthPageMode;
  onNavigate: (tab: AppTab) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onNavigate }) => {
  const prefersReducedMotion = useReducedMotion();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [accountType, setAccountType] = useState<'buyer' | 'farmer'>('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsUpdatingPassword(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setErrorMessage('');

    if (!supabase) {
      setErrorMessage('Account access is not configured yet. Add the Supabase project URL and public anon key to .env.local, then restart the app.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isUpdatingPassword) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage('Password updated. You can now sign in with your new password.');
        setIsUpdatingPassword(false);
        setPassword('');
        return;
      }

      if (mode === 'sign-up') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, account_type: accountType },
            emailRedirectTo: `${window.location.origin}/account/sign-in`,
          },
        });
        if (error) throw error;
        if (data.session) {
          onNavigate('marketplace');
        } else {
          setMessage('Check your email for a confirmation link to finish creating your account.');
        }
        return;
      }

      if (mode === 'reset-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/account/reset-password`,
        });
        if (error) throw error;
        setMessage('If an account exists for that address, a password reset link is on its way.');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onNavigate('marketplace');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Account request failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = isUpdatingPassword
    ? 'Choose a new password'
    : mode === 'sign-up'
    ? 'Create your Agroline account'
    : mode === 'reset-password'
    ? 'Reset your password'
    : 'Welcome back';

  const description = isUpdatingPassword
    ? 'Use a new password for your account.'
    : mode === 'sign-up'
    ? 'Join the marketplace as a buyer or producer.'
    : mode === 'reset-password'
    ? 'We’ll email you a secure password reset link.'
    : 'Sign in to continue to your Agroline workspace.';

  return (
    <section className="auth-scene relative isolate mx-auto grid min-h-[min(720px,calc(100vh-150px))] max-w-5xl items-center gap-8 overflow-hidden rounded-[2rem] px-4 py-8 sm:px-8 lg:grid-cols-[1fr_440px] lg:gap-16">
      <div className="auth-ambient" aria-hidden="true">
        <span className="auth-orb auth-orb-one" />
        <span className="auth-orb auth-orb-two" />
        <span className="auth-orb auth-orb-three" />
        <span className="auth-grid" />
      </div>
      <motion.div
        className="relative z-10 hidden lg:block"
        initial={prefersReducedMotion ? false : { opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.65, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <motion.div
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D5C3A] text-[#F7B500] shadow-lg shadow-emerald-950/15"
          animate={prefersReducedMotion ? undefined : { y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Leaf className="h-6 w-6" />
        </motion.div>
        <p className="text-sm font-bold uppercase text-[#0D5C3A]">Agroline Trade Network</p>
        <h1 className="mt-3 max-w-lg font-display text-4xl font-bold leading-tight text-stone-900">
          One account for every part of the trade.
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-stone-700">
          Keep your buyer or producer profile connected to listings, conversations, and order records.
        </p>
        <div className="mt-8 flex gap-3 text-sm text-stone-700">
          {['Marketplace', 'Producer tools', 'Trade messages'].map((feature, index) => (
            <motion.span
              key={feature}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + index * 0.1, duration: 0.4 }}
              className="rounded-full border border-stone-300/80 bg-white/75 px-3 py-1.5 shadow-sm backdrop-blur-sm"
            >
              {feature}
            </motion.span>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
        className="relative z-10 w-full rounded-2xl border border-white/80 bg-white/95 p-6 shadow-[0_24px_70px_-35px_rgba(6,51,31,0.42)] backdrop-blur-xl sm:p-8"
      >
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-stone-900">{title}</h1>
          <p className="mt-1 text-sm text-stone-600">{description}</p>
        </div>

        {!authConfigured && (
          <div role="status" className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-stone-800">
            <p className="font-semibold">Account service needs configuration</p>
            <p className="mt-1 text-stone-700">Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env.local</code> to enable account access.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'sign-up' && !isUpdatingPassword && (
            <>
              <label className="block text-sm font-semibold text-stone-800">
                Full name
                <span className="relative mt-1.5 block">
                  <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input required autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="min-h-11 w-full rounded-md border border-stone-300 bg-white pl-10 pr-3 text-sm font-normal outline-none focus-visible:border-[#0D5C3A]" />
                </span>
              </label>
              <fieldset>
                <legend className="mb-1.5 text-sm font-semibold text-stone-800">I’m joining as</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(['buyer', 'farmer'] as const).map((type) => (
                    <button key={type} type="button" aria-pressed={accountType === type} onClick={() => setAccountType(type)} className={`min-h-10 rounded-md border px-3 text-sm font-semibold capitalize ${accountType === type ? 'border-[#0D5C3A] bg-[#EAF3EC] text-[#0D5C3A]' : 'border-stone-300 bg-white text-stone-700'}`}>
                      {type === 'farmer' ? 'Producer' : 'Buyer'}
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          {!isUpdatingPassword && (
            <label className="block text-sm font-semibold text-stone-800">
              Email address
              <span className="relative mt-1.5 block">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-11 w-full rounded-md border border-stone-300 bg-white pl-10 pr-3 text-sm font-normal outline-none focus-visible:border-[#0D5C3A]" />
              </span>
            </label>
          )}

          {(mode === 'sign-in' || mode === 'sign-up' || isUpdatingPassword) && (
            <label className="block text-sm font-semibold text-stone-800">
              {isUpdatingPassword ? 'New password' : 'Password'}
              <span className="relative mt-1.5 block">
                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input required type={showPassword ? 'text' : 'password'} minLength={8} autoComplete={isUpdatingPassword ? 'new-password' : mode === 'sign-up' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-11 w-full rounded-md border border-stone-300 bg-white pl-10 pr-11 text-sm font-normal outline-none focus-visible:border-[#0D5C3A]" />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-stone-500 hover:bg-stone-100">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>
          )}

          {message && <p role="status" className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-900">{message}</p>}
          {errorMessage && <p role="alert" className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">{errorMessage}</p>}

          <button type="submit" disabled={!authConfigured || isSubmitting} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#0D5C3A] px-4 text-sm font-bold text-white transition hover:bg-[#094B2E] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600">
            {isSubmitting ? 'Please wait…' : isUpdatingPassword ? 'Update password' : mode === 'sign-up' ? 'Create account' : mode === 'reset-password' ? 'Send reset link' : 'Sign in'}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-4 text-sm">
          {mode === 'sign-in' && !isUpdatingPassword && <button onClick={() => onNavigate('reset-password')} className="font-semibold text-[#0D5C3A] hover:underline">Forgot password?</button>}
          {mode === 'sign-up' || mode === 'reset-password' || isUpdatingPassword ? (
            <button onClick={() => onNavigate('sign-in')} className="font-semibold text-[#0D5C3A] hover:underline">Back to sign in</button>
          ) : (
            <button onClick={() => onNavigate('sign-up')} className="ml-auto font-semibold text-[#0D5C3A] hover:underline">Create an account</button>
          )}
        </div>
      </motion.div>
    </section>
  );
};