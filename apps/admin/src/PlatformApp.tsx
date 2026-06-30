import { Box, Button, Stack, Typography, Snackbar } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { colors } from '@srd/config';
import { listVendors, approveVendor, suspendVendor, logout, getMe, type Vendor } from './lib/api';
import { Panel, Pill } from './components/ui';

const STATUS_PILL: Record<Vendor['status'], { fg: string; bg: string }> = {
  DRAFT: { fg: colors.mutedAdmin, bg: 'rgba(141,162,170,.14)' },
  PENDING_REVIEW: { fg: '#ECB65E', bg: 'rgba(224,169,59,.16)' },
  APPROVED: { fg: '#3ECABB', bg: 'rgba(43,184,173,.15)' },
  SUSPENDED: { fg: '#E6A684', bg: 'rgba(217,140,106,.17)' },
  REJECTED: { fg: '#E6A684', bg: 'rgba(217,140,106,.17)' },
};
const COLS = '1.6fr 1fr .8fr 1fr 1.3fr';

export function PlatformApp() {
  const qc = useQueryClient();
  const [toast, setToast] = useState('');
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: getMe });
  const { data: vendors = [], isLoading } = useQuery({ queryKey: ['vendors'], queryFn: listVendors });

  const approve = useMutation({
    mutationFn: approveVendor,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendors'] }); setToast('Vendor approved — its cars are now live'); },
  });
  const suspend = useMutation({
    mutationFn: suspendVendor,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendors'] }); setToast('Vendor suspended'); },
  });

  const onLogout = async () => { await logout(); qc.clear(); qc.invalidateQueries({ queryKey: ['me'] }); };
  const pending = vendors.filter((v) => v.status === 'PENDING_REVIEW').length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.bgAdmin, color: colors.cream }}>
      <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: 30, bgcolor: 'rgba(9,24,32,.82)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.lineAdmin}`, px: 3.5, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 26, height: 26, bgcolor: colors.gold, transform: 'rotate(45deg)', borderRadius: '5px' }} />
        <Box>
          <Typography sx={{ fontFamily: '"Bricolage Grotesque"', fontWeight: 800, fontSize: 18, lineHeight: 1 }}>SILK ROAD DRIVE</Typography>
          <Typography sx={{ color: colors.gold, fontSize: 10.5, fontWeight: 700, letterSpacing: '.18em' }}>PLATFORM ADMIN</Typography>
        </Box>
        <Stack direction="row" alignItems="center" gap={1.5} sx={{ ml: 'auto' }}>
          <Typography sx={{ color: colors.mutedAdmin, fontSize: 13 }}>{me?.user.email}</Typography>
          <Button onClick={onLogout} sx={{ textTransform: 'none', color: colors.mutedAdmin, border: `1px solid ${colors.lineAdmin}`, borderRadius: '10px', fontSize: 13 }}>Sign out</Button>
        </Stack>
      </Box>

      <Box sx={{ p: 3.5, maxWidth: 1100, mx: 'auto' }}>
        <Stack direction="row" alignItems="baseline" gap={2} sx={{ mb: 2.5 }}>
          <Typography variant="h1" sx={{ fontSize: 26 }}>Vendors</Typography>
          <Pill label={`${pending} awaiting review`} fg={colors.gold} bg="rgba(224,169,59,.16)" />
        </Stack>

        <Panel sx={{ p: 0, overflow: 'hidden' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: COLS, gap: 1.5, px: 2.5, py: 1.75, borderBottom: `1px solid ${colors.lineAdmin}`,
            color: colors.mutedAdmin, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>
            <span>Vendor</span><span>City</span><span>Cars</span><span>Status</span><span style={{ textAlign: 'right' }}>Actions</span>
          </Box>
          {isLoading && <Typography sx={{ p: 2.5, color: colors.mutedAdmin }}>Loading vendors…</Typography>}
          {vendors.map((v) => (
            <Box key={v.id} sx={{ display: 'grid', gridTemplateColumns: COLS, gap: 1.5, px: 2.5, py: 1.9, borderTop: `1px solid ${colors.lineAdmin}`, alignItems: 'center' }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{v.displayName}</Typography>
                <Typography sx={{ color: colors.mutedAdmin, fontSize: 12 }}>{v.legalName}</Typography>
              </Box>
              <Typography sx={{ fontSize: 13.5, color: colors.mutedAdmin }}>{v.city ?? '—'}</Typography>
              <Typography sx={{ fontFamily: '"Bricolage Grotesque"', fontWeight: 700, fontSize: 15 }}>{v._count?.vehicles ?? 0}</Typography>
              <Box><Pill label={v.status.replace('_', ' ')} fg={STATUS_PILL[v.status].fg} bg={STATUS_PILL[v.status].bg} /></Box>
              <Stack direction="row" gap={1} justifyContent="flex-end">
                {v.status !== 'APPROVED' && (
                  <Button size="small" variant="contained" onClick={() => approve.mutate(v.id)} disabled={approve.isPending}
                    sx={{ textTransform: 'none', fontWeight: 700 }}>Approve</Button>
                )}
                {v.status === 'APPROVED' && (
                  <Button size="small" onClick={() => suspend.mutate(v.id)} disabled={suspend.isPending}
                    sx={{ textTransform: 'none', color: colors.rose, border: `1px solid ${colors.lineAdmin}`, borderRadius: '9px' }}>Suspend</Button>
                )}
              </Stack>
            </Box>
          ))}
        </Panel>
      </Box>

      <Snackbar open={!!toast} autoHideDuration={2800} onClose={() => setToast('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} message={toast}
        ContentProps={{ sx: { bgcolor: colors.teal, color: colors.bgAdmin, fontWeight: 700, justifyContent: 'center' } }} />
    </Box>
  );
}
