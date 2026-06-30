import { Box, Stack, Typography } from '@mui/material';
import { colors } from '@srd/config';
import { CLIENTS, BOOKING_STATUS, AVATARS, initials } from '../data/mock';
import { Panel, Pill } from '../components/ui';

const COLS = '1.5fr 1fr .7fr 1.3fr 1fr';

export function Clients() {
  return (
    <Panel sx={{ p: 0, overflow: 'hidden' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: COLS, gap: 1.5, px: 2.5, py: 1.75, borderBottom: `1px solid ${colors.lineAdmin}`,
        color: colors.mutedAdmin, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>
        <span>Client</span><span>Country</span><span>Trips</span><span>Current rental</span><span>Status</span>
      </Box>
      {CLIENTS.map((c, i) => {
        const st = BOOKING_STATUS[c.status];
        return (
          <Box key={c.email} sx={{ display: 'grid', gridTemplateColumns: COLS, gap: 1.5, px: 2.5, py: 1.9, borderTop: `1px solid ${colors.lineAdmin}`, alignItems: 'center' }}>
            <Stack direction="row" alignItems="center" gap={1.4} sx={{ minWidth: 0 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '9px', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, color: colors.bgAdmin, background: AVATARS[i % 4], fontFamily: '"Bricolage Grotesque"', flexShrink: 0 }}>
                {initials(c.name)}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>{c.name}</Typography>
                <Typography sx={{ color: colors.mutedAdmin, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</Typography>
              </Box>
            </Stack>
            <Typography sx={{ fontSize: 13.5 }}>{c.country}</Typography>
            <Typography sx={{ fontFamily: '"Bricolage Grotesque"', fontWeight: 700, fontSize: 15 }}>{c.trips}</Typography>
            <Typography sx={{ fontSize: 13.5, color: colors.mutedAdmin }}>{c.current}</Typography>
            <Box><Pill label={st.label} fg={st.fg} bg={st.bg} /></Box>
          </Box>
        );
      })}
    </Panel>
  );
}
