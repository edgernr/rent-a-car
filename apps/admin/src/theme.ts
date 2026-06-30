import { createTheme } from '@mui/material/styles';
import { colors, fonts } from '@srd/config';

// MUI theme built from the shared design tokens.
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: colors.gold, contrastText: colors.bgAdmin },
    secondary: { main: colors.teal },
    info: { main: colors.blue },
    background: { default: colors.bgAdmin, paper: colors.surf },
    text: { primary: colors.cream, secondary: colors.mutedAdmin },
    divider: colors.lineAdmin,
  },
  typography: {
    fontFamily: fonts.body,
    h1: { fontFamily: fonts.display, fontWeight: 800 },
    h2: { fontFamily: fonts.display, fontWeight: 800 },
    h3: { fontFamily: fonts.display, fontWeight: 700 },
    h4: { fontFamily: fonts.display, fontWeight: 700 },
  },
  shape: { borderRadius: 14 },
});
