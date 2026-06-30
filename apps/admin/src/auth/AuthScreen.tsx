import { useState, type ChangeEvent } from 'react';
import { Box, Button, Stack, TextField, Typography, Tabs, Tab } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { colors } from '@srd/config';
import { login, registerVendor, ApiError } from '../lib/api';

export function AuthScreen() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const onAuthed = () => qc.invalidateQueries({ queryKey: ['me'] });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.bgAdmin, color: colors.cream, display: 'grid', placeItems: 'center', p: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Stack direction="row" alignItems="center" gap={1.5} justifyContent="center" sx={{ mb: 3 }}>
          <Box sx={{ width: 30, height: 30, bgcolor: colors.gold, transform: 'rotate(45deg)', borderRadius: '6px' }} />
          <Box>
            <Typography sx={{ fontFamily: '"Bricolage Grotesque"', fontWeight: 800, fontSize: 18, lineHeight: 1 }}>SILK ROAD DRIVE</Typography>
            <Typography sx={{ color: colors.gold, fontSize: 11, fontWeight: 700, letterSpacing: '.18em' }}>VENDOR CONSOLE</Typography>
          </Box>
        </Stack>

        <Box sx={{ bgcolor: colors.surf, border: `1px solid ${colors.lineAdmin}`, borderRadius: '18px', p: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ mb: 2.5 }}>
            <Tab value="login" label="Sign in" sx={{ textTransform: 'none', fontWeight: 700 }} />
            <Tab value="register" label="Register company" sx={{ textTransform: 'none', fontWeight: 700 }} />
          </Tabs>
          {tab === 'login' ? <LoginForm onDone={onAuthed} /> : <RegisterForm onDone={onAuthed} />}
        </Box>

        <Typography sx={{ color: colors.mutedAdmin, fontSize: 12.5, textAlign: 'center', mt: 2 }}>
          Tourists book on the storefront. This console is for rental vendors.
        </Typography>
      </Box>
    </Box>
  );
}

const field = { fullWidth: true, size: 'small' as const, sx: { mb: 1.5 } };

function LoginForm({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const m = useMutation({ mutationFn: () => login(email, password), onSuccess: onDone });

  return (
    <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }}>
      <TextField {...field} type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <TextField {...field} type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {m.isError && <Typography sx={{ color: colors.rose, fontSize: 13, mb: 1 }}>{(m.error as ApiError).message}</Typography>}
      <Button type="submit" variant="contained" fullWidth disabled={m.isPending} sx={{ textTransform: 'none', fontWeight: 700, py: 1.2 }}>
        {m.isPending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}

function RegisterForm({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ displayName: '', legalName: '', city: '', name: '', email: '', password: '' });
  const set = (k: keyof typeof f) => (e: ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const m = useMutation({
    mutationFn: () => registerVendor({ ...f, legalName: f.legalName || f.displayName }),
    onSuccess: onDone,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }}>
      <TextField {...field} label="Company name" value={f.displayName} onChange={set('displayName')} required />
      <TextField {...field} label="Legal entity (optional)" value={f.legalName} onChange={set('legalName')} />
      <TextField {...field} label="City" value={f.city} onChange={set('city')} />
      <TextField {...field} label="Your name" value={f.name} onChange={set('name')} />
      <TextField {...field} type="email" label="Work email" value={f.email} onChange={set('email')} required />
      <TextField {...field} type="password" label="Password (min 8 chars)" value={f.password} onChange={set('password')} required />
      {m.isError && <Typography sx={{ color: colors.rose, fontSize: 13, mb: 1 }}>{(m.error as ApiError).message}</Typography>}
      <Button type="submit" variant="contained" fullWidth disabled={m.isPending} sx={{ textTransform: 'none', fontWeight: 700, py: 1.2 }}>
        {m.isPending ? 'Creating…' : 'Create vendor account'}
      </Button>
      <Typography sx={{ color: colors.mutedAdmin, fontSize: 12, mt: 1.5 }}>
        New vendors start in review — you can add cars right away; they go live once approved.
      </Typography>
    </form>
  );
}
