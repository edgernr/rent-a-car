import type { ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { colors } from '@srd/config';
import { getMe, ApiError } from '../lib/api';
import { AuthScreen } from './AuthScreen';
import { PlatformApp } from '../PlatformApp';

export function AuthGate({ children }: { children: ReactNode }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
  });

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: colors.bgAdmin, display: 'grid', placeItems: 'center' }}>
        <CircularProgress sx={{ color: colors.gold }} />
      </Box>
    );
  }

  // 401 → not logged in → show the auth screen. Other errors also fall through
  // to the auth screen (e.g. API down shows the form rather than a blank page).
  if (isError || !data) {
    void (error as ApiError | undefined);
    return <AuthScreen />;
  }

  // Platform staff/admin → platform console (vendor approvals).
  if (data.user.platformRole === 'PLATFORM_ADMIN' || data.user.platformRole === 'PLATFORM_STAFF') {
    return <PlatformApp />;
  }

  // Vendor member → vendor console.
  if (data.vendor) {
    return <>{children}</>;
  }

  // Logged in as a plain customer — no console access.
  return <AuthScreen />;
}
