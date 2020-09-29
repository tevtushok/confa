import { createMuiTheme, colors } from '@material-ui/core';

const textColor = '#fff';
const contrastText = '#fff';
const paletteType = 'dark';

export const theme = createMuiTheme({
  palette: {
    type: paletteType,
    background: {
      default: paletteType === 'dark' ? '#191919' : '#fff'
    },
    primary: {
      main: '#282828',
      textColor: textColor,
      contrastText: contrastText,
    },
    secondary: {
      main: colors.pink[600],
      contrastText: contrastText,
    },
  },
  overrides: {
    MuiTypography: {
      colorPrimary: {
        color: textColor
      }
    },
    MuiCssBaseline: {
      '@global': {
        html: {
          fontFamily: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue','sans-serif'].join(', '),
          WebkitFontSmoothing: 'antialiased',
          fontSize: 16,
        }
      }
    }
  }
});
