'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { getMe, register, signIn, signOut, type Me } from '@/lib/auth';

export function AccountMenu() {
  const t = useTranslations('account');
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getMe()
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  if (me?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-[13.5px] text-muted sm:inline">
          {t('welcome', { name: me.user.name ?? me.user.email })}
        </span>
        <button
          onClick={async () => {
            await signOut();
            setMe(null);
          }}
          className="rounded-full border border-line px-3.5 py-2 text-[13px] font-semibold text-muted"
        >
          {t('signOut')}
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-line px-3.5 py-2 text-[13px] font-semibold text-cream"
      >
        {t('signIn')}
      </button>
      {open && <AuthModal onClose={() => setOpen(false)} onAuthed={(m) => { setMe(m); setOpen(false); }} />}
    </>
  );
}

function AuthModal({ onClose, onAuthed }: { onClose: () => void; onAuthed: (m: Me) => void }) {
  const t = useTranslations('account');
  const [tab, setTab] = useState<'signIn' | 'register'>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (tab === 'register') await register(email, password, name);
      else await signIn(email, password);
      onAuthed(await getMe());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const tabBtn = (key: 'signIn' | 'register', label: string) => (
    <button
      onClick={() => setTab(key)}
      className={`flex-1 rounded-[10px] py-2 text-[14px] font-bold ${
        tab === key ? 'bg-gold text-bg' : 'text-muted'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div onClick={onClose} className="fixed inset-0 z-[80] grid place-items-center bg-[#06101280] p-6 backdrop-blur-sm">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[400px] rounded-[20px] border border-line bg-bg p-6">
        <div className="mb-1 flex items-center gap-3">
          <span className="inline-block h-[26px] w-[26px] rotate-45 rounded-[5px] bg-gold" />
          <span className="font-display text-[18px] font-extrabold">Silk Road Drive</span>
        </div>
        <p className="mb-4 text-[13.5px] text-muted">{t('subtitle')}</p>

        <div className="mb-4 flex gap-1.5 rounded-[12px] border border-line p-1">
          {tabBtn('signIn', t('tabSignIn'))}
          {tabBtn('register', t('tabRegister'))}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-2.5">
          {tab === 'register' && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('name')}
              className="rounded-[11px] border border-line bg-bg2 px-3.5 py-3 text-[15px] text-cream outline-none focus:border-gold" />
          )}
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('email')}
            className="rounded-[11px] border border-line bg-bg2 px-3.5 py-3 text-[15px] text-cream outline-none focus:border-gold" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password')}
            className="rounded-[11px] border border-line bg-bg2 px-3.5 py-3 text-[15px] text-cream outline-none focus:border-gold" />
          {error && <p className="text-[13px] text-rose">{error}</p>}
          <button type="submit" disabled={busy}
            className="mt-1 rounded-[11px] bg-gold py-3 text-[15px] font-bold text-bg disabled:opacity-60">
            {busy ? '…' : tab === 'register' ? t('submitRegister') : t('submitSignIn')}
          </button>
        </form>
      </div>
    </div>
  );
}
