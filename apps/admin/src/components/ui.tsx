import { Box, Card } from '@mui/material';
import type { ReactNode } from 'react';
import { colors } from '@srd/config';

export function Pill({ label, fg, bg }: { label: string; fg: string; bg: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.4,
        py: 0.5,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        color: fg,
        bgcolor: bg,
      }}
    >
      {label}
    </Box>
  );
}

export function Panel({ children, sx }: { children: ReactNode; sx?: object }) {
  return (
    <Card sx={{ bgcolor: colors.surf, border: `1px solid ${colors.lineAdmin}`, borderRadius: '16px', p: 2.75, ...sx }}>
      {children}
    </Card>
  );
}
