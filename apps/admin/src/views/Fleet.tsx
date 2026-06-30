import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { colors, statusColors } from '@srd/config';
import { fetchMyVehicles, toUsd, type Vehicle } from '../lib/api';
import { Pill } from '../components/ui';

type Filter = 'all' | 'AVAILABLE' | 'RENTED' | 'CLEANING' | 'MAINTENANCE';
const FILTERS: [Filter, string][] = [
  ['all', 'All'],
  ['AVAILABLE', 'Available'],
  ['RENTED', 'Rented'],
  ['CLEANING', 'Cleaning'],
  ['MAINTENANCE', 'Maintenance'],
];
const CAT_LABEL: Record<string, string> = {
  ECONOMY: 'Economy', SEDAN: 'Sedan', SUV: 'SUV', SEVEN_SEATER: '7-seater', ELECTRIC: 'Electric',
};

export function Fleet() {
  const [filter, setFilter] = useState<Filter>('all');
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['my-vehicles'], queryFn: fetchMyVehicles });

  if (isLoading) return <Typography sx={{ color: colors.mutedAdmin }}>Loading fleet…</Typography>;
  if (isError)
    return <Typography sx={{ color: colors.rose }}>Could not load fleet: {(error as Error).message}</Typography>;

  const vehicles = data ?? [];
  const counts = vehicles.reduce<Record<string, number>>((acc, v) => {
    acc[v.status] = (acc[v.status] ?? 0) + 1;
    return acc;
  }, {});
  const visible = filter === 'all' ? vehicles : vehicles.filter((v) => v.status === filter);

  return (
    <Box>
      <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2.25 }}>
        {FILTERS.map(([k, label]) => {
          const on = filter === k;
          const count = k === 'all' ? vehicles.length : (counts[k] ?? 0);
          return (
            <Button key={k} onClick={() => setFilter(k)}
              sx={{
                textTransform: 'none', fontWeight: 600, borderRadius: 999, px: 1.9, py: 1,
                color: on ? colors.bgAdmin : colors.cream,
                bgcolor: on ? colors.gold : 'transparent',
                border: `1px solid ${on ? colors.gold : colors.lineAdmin}`,
                '&:hover': { bgcolor: on ? colors.gold : 'rgba(255,255,255,.03)' },
              }}>
              {label}<span style={{ opacity: 0.6, marginLeft: 6 }}>{count}</span>
            </Button>
          );
        })}
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2 }}>
        {visible.map((v: Vehicle) => {
          const sc = statusColors[v.status.toLowerCase() as keyof typeof statusColors] ?? statusColors.available;
          return (
            <Box key={v.id} sx={{ bgcolor: colors.surf, border: `1px solid ${colors.lineAdmin}`, borderRadius: '16px', overflow: 'hidden' }}>
              <Box sx={{ position: 'relative', height: 128, bgcolor: '#143a44', display: 'grid', placeItems: 'center',
                backgroundImage: 'repeating-linear-gradient(60deg,rgba(224,169,59,.09) 0 1px,transparent 1px 22px),repeating-linear-gradient(-60deg,rgba(224,169,59,.09) 0 1px,transparent 1px 22px)' }}>
                <Box sx={{ width: 60, height: 60, transform: 'rotate(45deg)', borderRadius: '9px', border: '1.5px solid rgba(243,238,226,.16)' }} />
                <Box sx={{ position: 'absolute', left: 12, top: 12 }}>
                  <Pill label={sc.label ?? v.status} fg={sc.fg} bg={sc.bg} />
                </Box>
                {v.plate && (
                  <Typography sx={{ position: 'absolute', left: 13, bottom: 10, fontFamily: 'ui-monospace,monospace', fontSize: 10.5, color: 'rgba(243,238,226,.6)' }}>
                    {v.plate}
                  </Typography>
                )}
              </Box>
              <Box sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Box>
                    <Typography sx={{ fontFamily: '"Bricolage Grotesque"', fontWeight: 700, fontSize: 16.5, lineHeight: 1.1 }}>
                      {v.make} {v.model}
                    </Typography>
                    <Typography sx={{ color: colors.teal, fontSize: 12.5, fontWeight: 600, mt: 0.25 }}>
                      {CAT_LABEL[v.category] ?? v.category}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Typography component="span" sx={{ fontFamily: '"Bricolage Grotesque"', fontWeight: 800, fontSize: 18, color: colors.gold }}>
                      ${toUsd(v.dailyRateUzs)}
                    </Typography>
                    <Typography component="span" sx={{ color: colors.mutedAdmin, fontSize: 11 }}>/day</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" gap={1.5} sx={{ mt: 1.4, color: colors.mutedAdmin, fontSize: 12 }}>
                  <span>{v.seats} seats</span><span>·</span>
                  <span>{v.transmission === 'AUTOMATIC' ? 'Automatic' : 'Manual'}</span><span>·</span>
                  <span>{v.year}</span>
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="space-between"
                  sx={{ mt: 1.75, pt: 1.6, borderTop: `1px solid ${colors.lineAdmin}` }}>
                  <Typography sx={{ color: colors.mutedAdmin, fontSize: 12.5 }}>
                    {v.moderationStatus === 'APPROVED' ? 'Published' : v.moderationStatus}
                  </Typography>
                  <Button size="small" sx={{ textTransform: 'none', color: colors.cream, border: `1px solid ${colors.lineAdmin}`, borderRadius: '9px', fontSize: 12.5 }}>
                    Manage
                  </Button>
                </Stack>
              </Box>
            </Box>
          );
        })}
        {visible.length === 0 && (
          <Typography sx={{ color: colors.mutedAdmin }}>No cars in this status.</Typography>
        )}
      </Box>
    </Box>
  );
}
