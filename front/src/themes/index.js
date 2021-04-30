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
            main: '#282828',
            textColor: textColor,
            contrastText: contrastText,
        },
        secondary: {
            main: colors.green[700],
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
        MuiPaper: {
            root: {
                backgroundColor: 'rgb(51 51 51 / 30%)',
            },
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


// primary.main
// secondary.main
// error.main
// warning.main
// info.main
// success.main
// text.primary
// text.secondary
// text.disabled
