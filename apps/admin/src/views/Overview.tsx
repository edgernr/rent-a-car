import { Box, Stack, Typography, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { colors, statusColors } from '@srd/config';
import { fetchMyVehicles } from '../lib/api';
import { BOOKINGS, CLEANING, CHART, PRIORITY, AVATARS, initials } from '../data/mock';
import { Panel, Pill } from '../components/ui';

export function Overview({ goBookings }: { goBookings: () => void }) {
  const { data: vehicles = [] } = useQuery({ queryKey: ['my-vehicles'], queryFn: fetchMyVehicles });

  const counts = { AVAILABLE: 0, RENTED: 0, CLEANING: 0, MAINTENANCE: 0 } as Record<string, number>;
  vehicles.forEach((v) => (counts[v.status] = (counts[v.status] ?? 0) + 1));
  const total = vehicles.length || 1;

  const kpis = [
    { label: 'Active clients', value: '18', trend: '+3 this week', accent: colors.teal },
    { label: 'Bookings (June)', value: '42', trend: '+12% vs May', accent: colors.blue },
    { label: 'Cars to clean', value: String(CLEANING.length), trend: '2 high priority', accent: colors.gold },
    { label: 'Returns ≤ 48h', value: '6', trend: 'across 3 locations', accent: colors.gold },
    { label: 'Fleet size', value: String(vehicles.length), trend: 'live from your fleet', accent: colors.teal },
    { label: 'Revenue (MTD)', value: '$14,820', trend: '+9% vs target', accent: colors.gold },
  ];

  const cmax = Math.max(...CHART.map((c) => c.v));
  const ending = BOOKINGS.filter((b) => b.status === 'ending' || b.status === 'active')
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 4);

  return (
    <Box>
      {/* KPI grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3,1fr)' }, gap: 2 }}>
        {kpis.map((k) => (
          <Panel key={k.label}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ color: colors.mutedAdmin, fontSize: 13.5, fontWeight: 600 }}>{k.label}</Typography>
              <Box sx={{ width: 30, height: 30, borderRadius: '9px', display: 'grid', placeItems: 'center', bgcolor: 'rgba(224,169,59,.14)' }}>
                <Box sx={{ width: 11, height: 11, transform: 'rotate(45deg)', borderRadius: '2px', bgcolor: k.accent }} />
              </Box>
            </Stack>
            <Typography sx={{ fontFamily: '"Bricolage Grotesque"', fontWeight: 800, fontSize: 38, lineHeight: 1.05, mt: 1.5, color: k.accent }}>
              {k.value}
            </Typography>
            <Typography sx={{ color: colors.mutedAdmin, fontSize: 12.5, mt: 0.5 }}>{k.trend}</Typography>
          </Panel>
        ))}
      </Box>

      {/* two columns */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' }, gap: 2, mt: 2 }}>
        <Stack gap={2}>
          {/* chart */}
          <Panel>
            <Stack direction="row" alignItems="baseline" justifyContent="space-between">
              <Typography sx={{ fontFamily: '"Bricolage Grotesque"', fontWeight: 700, fontSize: 17 }}>Bookings this week</Typography>
              <Typography sx={{ color: colors.teal, fontSize: 13, fontWeight: 700 }}>52 total · +14%</Typography>
            </Stack>
            <Stack direction="row" alignItems="flex-end" gap={1.75} sx={{ height: 150, mt: 2.5 }}>
              {CHART.map((c, i) => (
                <Stack key={c.d} alignItems="center" gap={1} sx={{ flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                  <Typography sx={{ fontSize: 11.5, color: colors.mutedAdmin }}>{c.v}</Typography>
                  <Box sx={{ width: '100%', borderRadius: '7px 7px 0 0', height: `${Math.round((c.v / cmax) * 100)}%`, bgcolor: i === 5 ? colors.gold : 'rgba(43,184,173,.55)' }} />
                  <Typography sx={{ fontSize: 11.5, color: colors.mutedAdmin, fontWeight: 600 }}>{c.d}</Typography>
                </Stack>
              ))}
            </Stack>
          </Panel>

          {/* ending soon */}
          <Panel>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.75 }}>
              <Typography sx={{ fontFamily: '"Bricolage Grotesque"', fontWeight: 700, fontSize: 17 }}>Returns ending soon</Typography>
              <Button onClick={goBookings} sx={{ textTransform: 'none', color: colors.gold, fontWeight: 700, fontSize: 13, minWidth: 0 }}>
                All bookings →
              </Button>
            </Stack>
            {ending.map((b, i) => {
              const dl = b.daysLeft <= 0 ? { t: 'Due today', c: PRIORITY.high } : b.daysLeft <= 2 ? { t: `${b.daysLeft} days`, c: PRIORITY.medium } : { t: `${b.daysLeft} days`, c: PRIORITY.low };
              return (
                <Stack key={b.id} direction="row" alignItems="center" gap={1.75} sx={{ py: 1.6, borderTop: `1px solid ${colors.lineAdmin}` }}>
                  <Box sx={{ width: 38, height: 38, borderRadius: '10px', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14, color: colors.bgAdmin, background: AVATARS[i % 4], fontFamily: '"Bricolage Grotesque"' }}>
                    {initials(b.client)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>{b.car}</Typography>
                    <Typography sx={{ color: colors.mutedAdmin, fontSize: 12.5 }}>{b.client} · {b.loc}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Pill label={dl.t} fg={dl.c.fg} bg={dl.c.bg} />
                    <Typography sx={{ color: colors.mutedAdmin, fontSize: 12, mt: 0.5 }}>ends {b.end}</Typography>
                  </Box>
                </Stack>
              );
            })}
          </Panel>
        </Stack>

        <Stack gap={2}>
          {/* fleet status (real) */}
          <Panel>
            <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 2.25 }}>
              <Typography sx={{ fontFamily: '"Bricolage Grotesque"', fontWeight: 700, fontSize: 17 }}>Fleet status</Typography>
              <Typography sx={{ color: colors.mutedAdmin, fontSize: 13 }}>{vehicles.length} cars</Typography>
            </Stack>
            <Stack gap={1.9}>
              {(['available', 'rented', 'cleaning', 'maintenance'] as const).map((k) => {
                const sc = statusColors[k];
                const count = counts[k.toUpperCase()] ?? 0;
                return (
                  <Box key={k}>
                    <Stack direction="row" alignItems="center" gap={1.1} sx={{ mb: 0.9 }}>
                      <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: sc.dot }} />
                      <Typography sx={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{sc.label}</Typography>
                      <Typography sx={{ fontFamily: '"Bricolage Grotesque"', fontWeight: 700, fontSize: 15 }}>{count}</Typography>
                    </Stack>
                    <Box sx={{ height: 7, borderRadius: 6, bgcolor: 'rgba(226,221,206,.08)', overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', borderRadius: 6, bgcolor: sc.dot, width: `${Math.round((count / total) * 100)}%` }} />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Panel>

          {/* cleaning queue */}
          <Panel>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
              <Typography sx={{ fontFamily: '"Bricolage Grotesque"', fontWeight: 700, fontSize: 17 }}>Cleaning queue</Typography>
              <Pill label={`${CLEANING.length} cars`} fg={colors.gold} bg="rgba(224,169,59,.16)" />
            </Stack>
            {CLEANING.slice(0, 3).map((c) => (
              <Stack key={c.id} direction="row" alignItems="center" gap={1.5} sx={{ py: 1.6, borderTop: `1px solid ${colors.lineAdmin}` }}>
                <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: PRIORITY[c.priority].dot, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{c.car}</Typography>
                  <Typography sx={{ color: colors.mutedAdmin, fontSize: 12 }}>{c.location} · {c.returned}</Typography>
                </Box>
              </Stack>
            ))}
          </Panel>
        </Stack>
      </Box>
    </Box>
  );
}
