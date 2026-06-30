import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { colors } from '@srd/config';
import { CLEANING, PRIORITY } from '../data/mock';
import { Pill } from '../components/ui';

export function Cleaning({ onCleaned }: { onCleaned: (msg: string) => void }) {
  const [cleaned, setCleaned] = useState<string[]>([]);
  const remaining = CLEANING.filter((c) => !cleaned.includes(c.id));

  const markClean = (id: string) => {
    setCleaned((p) => [...p, id]);
    onCleaned('Car marked as cleaned');
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1.75} sx={{ mb: 2.25 }}>
        <Pill label={`${remaining.length} cars awaiting clean-up`} fg={colors.gold} bg="rgba(224,169,59,.16)" />
        <Typography sx={{ color: colors.mutedAdmin, fontSize: 13 }}>
          Mark a car clean to return it to the available pool.
        </Typography>
      </Stack>

      {remaining.length === 0 ? (
        <Box sx={{ bgcolor: colors.surf, border: `1px solid ${colors.lineAdmin}`, borderRadius: '16px', p: 7.5, textAlign: 'center' }}>
          <Box sx={{ width: 60, height: 60, bgcolor: colors.teal, transform: 'rotate(45deg)', borderRadius: '14px', mx: 'auto', mb: 2.5, display: 'grid', placeItems: 'center' }}>
            <span style={{ transform: 'rotate(-45deg)', color: colors.bgAdmin, fontSize: 28, fontWeight: 800 }}>✓</span>
          </Box>
          <Typography sx={{ fontFamily: '"Bricolage Grotesque"', fontWeight: 800, fontSize: 22 }}>All caught up</Typography>
          <Typography sx={{ color: colors.mutedAdmin, fontSize: 14, mt: 1 }}>Every returned car has been cleaned and is back in the pool.</Typography>
        </Box>
      ) : (
        <Stack gap={1.5}>
          {remaining.map((c) => (
            <Box key={c.id} sx={{ bgcolor: colors.surf, border: `1px solid ${colors.lineAdmin}`, borderRadius: '14px', p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ width: 46, height: 46, borderRadius: '11px', bgcolor: '#143a44', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Box sx={{ width: 20, height: 20, transform: 'rotate(45deg)', border: '1.5px solid rgba(243,238,226,.3)' }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 150 }}>
                <Typography sx={{ fontFamily: '"Bricolage Grotesque"', fontWeight: 700, fontSize: 16 }}>{c.car}</Typography>
                <Typography sx={{ color: colors.mutedAdmin, fontSize: 13, fontFamily: 'ui-monospace,monospace', mt: 0.25 }}>{c.plate}</Typography>
              </Box>
              <Box sx={{ minWidth: 115 }}>
                <Typography sx={{ color: colors.mutedAdmin, fontSize: 12 }}>Returned</Typography>
                <Typography sx={{ fontWeight: 600, fontSize: 13.5 }}>{c.returned}</Typography>
              </Box>
              <Box sx={{ minWidth: 115 }}>
                <Typography sx={{ color: colors.mutedAdmin, fontSize: 12 }}>Location</Typography>
                <Typography sx={{ fontWeight: 600, fontSize: 13.5 }}>{c.location}</Typography>
              </Box>
              <Stack direction="row" alignItems="center" gap={1.75} sx={{ ml: 'auto' }}>
                <Pill label={PRIORITY[c.priority].label} fg={PRIORITY[c.priority].fg} bg={PRIORITY[c.priority].bg} />
                <Button variant="contained" color="secondary" onClick={() => markClean(c.id)}
                  sx={{ textTransform: 'none', fontWeight: 700, color: colors.bgAdmin, whiteSpace: 'nowrap' }}>
                  Mark cleaned
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
