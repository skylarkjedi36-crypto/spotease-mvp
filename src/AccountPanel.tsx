import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export function accountName(user: User | null) {
  return user?.user_metadata?.full_name?.trim() || user?.email?.split('@')[0] || 'Guest';
}

export function accountInitials(user: User | null) {
  if (!user) return '';
  const parts = accountName(user).split(/[\s._-]+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2)).toUpperCase();
}

function errorMessage(message: string) {
  if (/invalid login credentials/i.test(message)) return 'Email or password is incorrect. Please try again.';
  if (/email not confirmed/i.test(message)) return 'Please confirm your email using the link in your inbox before signing in.';
  if (/rate limit|too many requests|security purposes/i.test(message)) return 'Too many attempts. Please wait a little before trying again.';
  if (/failed to fetch|network|load failed/i.test(message)) return 'Unable to connect. Check your internet connection and try again.';
  return message;
}

export default function AccountPanel({ user, loading, checkoutPending, onAuthenticated, onLoggedOut, onBack }: {
  user: User | null;
  loading: boolean;
  checkoutPending: boolean;
  onAuthenticated: () => void;
  onLoggedOut: () => void;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return <section className="account-page">
    <button className="back-link" onClick={onBack}>← Back to Explore</button>
    <div className="account-card">
      <div className="account-emblem">{user ? accountInitials(user) : 'P'}</div>
      <div className="eyebrow">YOUR SPOTEASE ACCOUNT</div>
      {loading ? <div className="auth-loading" role="status">Checking your session…</div> : user ? <>
        <h1>A smoother journey,<br/>{accountName(user)}.</h1>
        <p className="account-subtitle">You’re signed in and ready for your next VIP arrival.</p>
        <dl className="account-details"><div><dt>Name</dt><dd>{accountName(user)}</dd></div><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Account</dt><dd><span className="status-tag">Signed in</span></dd></div></dl>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="dark-button full" disabled={busy} onClick={async () => {
          setBusy(true); setError('');
          try {
            const { error } = await supabase.auth.signOut({ scope: 'local' });
            if (error) throw error;
            onLoggedOut();
          } catch (err) { setError(errorMessage(err instanceof Error ? err.message : 'Could not log out. Please try again.')); }
          finally { setBusy(false); }
        }}>{busy ? 'Logging out…' : 'Log out'}</button>
        <p className="account-footnote">Logging out clears your local booking, favorites, and vehicle details.</p>
      </> : <>
        <h1>{mode === 'login' ? 'Welcome back.' : 'Your VIP journey starts here.'}</h1>
        <p className="account-subtitle">{checkoutPending ? 'Sign in to continue to your VIP checkout.' : 'A little certainty. Wherever you’re headed.'}</p>
        <div className="auth-mode" aria-label="Account options">{(['login', 'signup'] as const).map(value => <button key={value} type="button" disabled={busy} className={mode === value ? 'selected' : ''} onClick={() => { setMode(value); setPassword(''); setConfirmPassword(''); setError(''); setMessage(''); }}>{value === 'login' ? 'Log in' : 'Sign up'}</button>)}</div>
        <form onSubmit={async e => {
          e.preventDefault(); setError(''); setMessage('');
          if (mode === 'signup' && !name.trim()) { setError('Please enter your name.'); return; }
          if (mode === 'signup' && password.length < 8) { setError('Use at least 8 characters for your password.'); return; }
          if (mode === 'signup' && password !== confirmPassword) { setError('Your passwords do not match.'); return; }
          setBusy(true);
          try {
            const result = mode === 'login'
              ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
              : await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() }, emailRedirectTo: window.location.origin } });
            if (result.error) throw result.error;
            setPassword(''); setConfirmPassword('');
            if (result.data.session) onAuthenticated();
            else setMessage('Check your inbox for a confirmation email. Confirm your address, then return here to log in. If you already have an account, use Log in.');
          } catch (err) { setError(errorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')); }
          finally { setBusy(false); }
        }}>
          <fieldset disabled={busy}>
            {mode === 'signup' && <><label htmlFor="account-name">Full name</label><input id="account-name" autoComplete="name" required maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder="Your name"/></>}
            <label htmlFor="account-email">Email address</label><input id="account-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"/>
            <label htmlFor="account-password">Password</label><div className="password-input"><input id="account-password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={mode === 'signup' ? 8 : undefined} value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}/><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(v => !v)}>{showPassword ? 'Hide' : 'Show'}</button></div>
            {mode === 'signup' && <><label htmlFor="account-confirm">Confirm password</label><input id="account-confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your password"/></>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            {message && <p className="auth-message" role="status">{message}</p>}
            <button className="dark-button full" type="submit">{busy ? (mode === 'login' ? 'Logging in…' : 'Creating account…') : mode === 'login' ? 'Log in' : 'Create account'}</button>
          </fieldset>
        </form>
        <p className="account-footnote">Secure sign-in powered by Supabase. Never share your password.</p>
        <button className="home-link" disabled={busy} onClick={onBack}>Continue browsing as a guest</button>
      </>}
    </div>
  </section>;
}
