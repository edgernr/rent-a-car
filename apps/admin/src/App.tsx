import { useState } from 'react';
import { Box, Button, Stack, Typography, Snackbar } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { colors } from '@srd/config';
import { fetchMyVehicles, getMe, logout } from './lib/api';
import { BOOKINGS, CLIENTS, CLEANING } from './data/mock';
import { AddCarModal } from './components/AddCarModal';
import { Overview } from './views/Overview';
import { Fleet } from './views/Fleet';
import { Bookings } from './views/Bookings';
import { Clients } from './views/Clients';
import { Cleaning } from './views/Cleaning';

type View = 'overview' | 'fleet' | 'bookings' | 'clients' | 'cleaning';

export function App() {
  const qc = useQueryClient();
  const [view, setView] = useState<View>('overview');
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState('');
  const { data: vehicles = [] } = useQuery({ queryKey: ['my-vehicles'], queryFn: fetchMyVehicles });
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: getMe });

  const onLogout = async () => {
    await logout();
    qc.clear();
    qc.invalidateQueries({ queryKey: ['me'] });
  };

  const activeBookings = BOOKINGS.filter((b) => b.status === 'active' || b.status === 'ending').length;
  const nav: { key: View; label: string; badge?: number; alert?: boolean }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'fleet', label: 'Fleet', badge: vehicles.length },
    { key: 'bookings', label: 'Bookings', badge: activeBookings },
    { key: 'clients', label: 'Clients', badge: CLIENTS.length },
    { key: 'cleaning', label: 'Cleaning', badge: CLEANING.length, alert: true },
  ];
  const titles: Record<View, [string, string]> = {
    overview: ['Overview', 'Welcome back · Monday, 30 June 2026'],
    fleet: ['Fleet', `${vehicles.length} cars listed`],
    bookings: ['Bookings', `${activeBookings} active right now`],
    clients: ['Clients', `${CLIENTS.length} travelers on the books`],
    cleaning: ['Cleaning queue', `${CLEANING.length} cars awaiting clean-up`],
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: colors.bgAdmin, color: colors.cream }}>
      {/* Sidebar */}
      <Box component="aside" sx={{ width: 252, flexShrink: 0, bgcolor: colors.bg2, borderRight: `1px solid ${colors.lineAdmin}`,
        display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        <Stack direction="row" alignItems="center" gap={1.5} sx={{ p: 2.5, borderBottom: `1px solid ${colors.lineAdmin}` }}>
          <Box sx={{ width: 26, height: 26, bgcolor: colors.gold, transform: 'rotate(45deg)', borderRadius: '5px' }} />
          <Box sx={{ lineHeight: 1.05 }}>
            <Typography sx={{ fontFamily: '"Bricolage Grotesque"', fontWeight: 800, fontSize: 15 }}>SILK ROAD DRIVE</Typography>
            <Typography sx={{ color: colors.gold, fontSize: 10.5, fontWeight: 700, letterSpacing: '.18em' }}>VENDOR CONSOLE</Typography>
          </Box>
        </Stack>

        <Stack sx={{ p: 1.5, gap: 0.5, flex: 1 }}>
          {nav.map((n) => {
            const on = view === n.key;
            return (
              <Button key={n.key} onClick={() => setView(n.key)}
                sx={{ justifyContent: 'flex-start', gap: 1.5, px: 1.6, py: 1.3, borderRadius: '11px', textTransform: 'none',
                  fontSize: 14.5, fontWeight: on ? 700 : 600, color: on ? colors.cream : colors.mutedAdmin,
                  bgcolor: on ? 'rgba(224,169,59,.12)' : 'transparent', '&:hover': { bgcolor: on ? 'rgba(224,169,59,.12)' : 'rgba(255,255,255,.03)' } }}>
                <Box sx={{ width: 7, height: 7, transform: 'rotate(45deg)', bgcolor: on ? colors.gold : 'rgba(226,221,206,.35)' }} />
                <Box component="span" sx={{ flex: 1, textAlign: 'left' }}>{n.label}</Box>
                {n.badge ? (
                  <Box component="span" sx={{ fontSize: 11, fontWeight: 700, px: 1, py: 0.25, borderRadius: 999,
                    bgcolor: n.alert ? 'rgba(224,169,59,.2)' : 'rgba(226,221,206,.1)', color: n.alert ? colors.gold : colors.mutedAdmin }}>
                    {n.badge}
                  </Box>
                ) : null}
              </Button>
            );
          })}
        </Stack>

        <Box sx={{ p: 1.5, borderTop: `1px solid ${colors.lineAdmin}` }}>
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ bgcolor: colors.surf, border: `1px solid ${colors.lineAdmin}`, borderRadius: '13px', p: 1.4 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: '10px', background: `linear-gradient(135deg, ${colors.teal}, ${colors.blue})`, display: 'grid', placeItems: 'center', fontWeight: 800, color: colors.bgAdmin, flexShrink: 0 }}>
              {(me?.vendor?.displayName ?? 'V').slice(0, 2).toUpperCase()}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {me?.vendor?.displayName ?? 'Vendor'}
              </Typography>
              <Typography sx={{ color: colors.mutedAdmin, fontSize: 11.5 }}>
                {me?.vendor?.status === 'APPROVED' ? 'Verified' : 'In review'} · {me?.user.email}
              </Typography>
            </Box>
          </Stack>
          <Button onClick={onLogout} fullWidth sx={{ mt: 1, textTransform: 'none', fontSize: 12.5, color: colors.mutedAdmin, border: `1px solid ${colors.lineAdmin}`, borderRadius: '10px' }}>
            Sign out
          </Button>
        </Box>
      </Box>

      {/* Main */}
      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: 30, bgcolor: 'rgba(9,24,32,.82)', backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${colors.lineAdmin}`, px: 3.5, py: 2, display: 'flex', alignItems: 'center' }}>
          <Box>
            <Typography variant="h1" sx={{ fontSize: 24 }}>{titles[view][0]}</Typography>
            <Typography sx={{ color: colors.mutedAdmin, fontSize: 13 }}>{titles[view][1]}</Typography>
          </Box>
          <Button variant="contained" onClick={() => setAddOpen(true)} sx={{ ml: 'auto', textTransform: 'none', fontWeight: 700 }}>
            + Add car
          </Button>
        </Box>

        <Box sx={{ p: 3.5 }}>
          {view === 'overview' && <Overview goBookings={() => setView('bookings')} />}
          {view === 'fleet' && <Fleet />}
          {view === 'bookings' && <Bookings />}
          {view === 'clients' && <Clients />}
          {view === 'cleaning' && <Cleaning onCleaned={setToast} />}
        </Box>
      </Box>

      <AddCarModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={setToast} />

      <Snackbar
        open={!!toast}
        autoHideDuration={2800}
        onClose={() => setToast('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={toast}
        ContentProps={{ sx: { bgcolor: colors.teal, color: colors.bgAdmin, fontWeight: 700, justifyContent: 'center' } }}
      />
    </Box>
  );
}
