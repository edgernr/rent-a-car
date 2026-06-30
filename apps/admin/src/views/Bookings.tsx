import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { colors } from '@srd/config';
import { BOOKINGS, BOOKING_STATUS, PRIORITY, AVATARS, initials, type BookingStatus } from '../data/mock';
import { Panel, Pill } from '../components/ui';

type Filter = 'all' | BookingStatus;
const FILTERS: [Filter, string][] = [
  ['all', 'All'], ['active', 'Active'], ['ending', 'Ending soon'], ['upcoming', 'Upcoming'], ['completed', 'Completed'],
];
const COLS = '1.4fr 1.3fr 1.1fr .9fr 1fr .8fr';

export function Bookings() {
  const [filter, setFilter] = useState<Filter>('all');
  const rows = filter === 'all' ? BOOKINGS : BOOKINGS.filter((b) => b.status === filter);

  return (
    <Box>
      <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2.25 }}>
        {FILTERS.map(([k, label]) => {
          const on = filter === k;
          return (
            <Button key={k} onClick={() => setFilter(k)}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 999, px: 1.9, py: 1,
                color: on ? colors.bgAdmin : colors.cream, bgcolor: on ? colors.gold : 'transparent',
                border: `1px solid ${on ? colors.gold : colors.lineAdmin}`, '&:hover': { bgcolor: on ? colors.gold : 'rgba(255,255,255,.03)' } }}>
              {label}
            </Button>
          );
        })}
      </Stack>

      <Panel sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: COLS, gap: 1.5, px: 2.5, py: 1.75, borderBottom: `1px solid ${colors.lineAdmin}`,
          color: colors.mutedAdmin, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>
          <span>Client</span><span>Car</span><span>Dates</span><span>Time left</span><span>Status</span><span style={{ textAlign: 'right' }}>Total</span>
        </Box>
        {rows.map((b, i) => {
          const dl = b.daysLeft < 0 ? { t: '—', c: BOOKING_STATUS.completed }
            : b.daysLeft === 0 ? { t: 'Due today', c: PRIORITY.high }
            : b.status === 'upcoming' ? { t: `in ${b.daysLeft}d`, c: BOOKING_STATUS.upcoming }
            : b.daysLeft <= 2 ? { t: `${b.daysLeft} days`, c: PRIORITY.medium }
            : { t: `${b.daysLeft} days`, c: PRIORITY.low };
          const st = BOOKING_STATUS[b.status];
          return (
            <Box key={b.id} sx={{ display: 'grid', gridTemplateColumns: COLS, gap: 1.5, px: 2.5, py: 1.9, borderTop: `1px solid ${colors.lineAdmin}`, alignItems: 'center' }}>
              <Stack direction="row" alignItems="center" gap={1.4} sx={{ minWidth: 0 }}>
                <Box sx={{ width: 34, height: 34, borderRadius: '9px', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, color: colors.bgAdmin, background: AVATARS[i % 4], fontFamily: '"Bricolage Grotesque"', flexShrink: 0 }}>
                  {initials(b.client)}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.client}</Typography>
                  <Typography sx={{ color: colors.mutedAdmin, fontSize: 12 }}>{b.country}</Typography>
                </Box>
              </Stack>
              <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{b.car}</Typography>
              <Typography sx={{ fontSize: 13, color: colors.mutedAdmin }}>{b.start} – {b.end}</Typography>
              <Box><Pill label={dl.t} fg={dl.c.fg} bg={dl.c.bg} /></Box>
              <Box><Pill label={st.label} fg={st.fg} bg={st.bg} /></Box>
              <Typography sx={{ textAlign: 'right', fontFamily: '"Bricolage Grotesque"', fontWeight: 700, fontSize: 15, color: colors.gold }}>${b.total}</Typography>
            </Box>
          );
        })}
      </Panel>
    </Box>
  );
}
