import { createMuiTheme } from '@material-ui/core/styles';
import { colors } from '@material-ui/core/'

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
            textColor: textColor,
            main: colors.green[700],
            dark: colors.green[900],
            light: colors.green[700],
            contrastText: contrastText,
        },
        secondary: {
            main: colors.indigo[500],
            light: colors.indigo[400],
            dark: colors.indigo[900],
            contrastText: contrastText,
        },
        error: {
            main: colors.red[300],
            contrastText: contrastText,
        },
    },
    overrides: {
        MuiTypography: {
            colorPrimary: {
                color: textColor
            }
        },
    }
});


// primary.main
// secondary.main
// error.main
// warning.main
// info.main
// success.main
// text.primary
// text.secondary
// text.disabled
