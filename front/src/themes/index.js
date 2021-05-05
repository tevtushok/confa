import { createMuiTheme } from '@material-ui/core/styles';
import { colors } from '@material-ui/core/';
import memoizeOne from 'memoize-one';

const getMuiTheme = memoizeOne((darkMode = true) => {
    let palette = {}, textColor = '#fff';
    switch(darkMode) {
        case true:
            textColor = '#fff';
            palette =  {
                type: 'dark',
                background: {
                    default: '#191919',
                    paper: '#313131',
                },
                primary: {
                    textColor: '#fff',
                    main: colors.green[700],
                    dark: colors.green[900],
                    light: colors.green[700],
                },
                secondary: {
                    main: colors.indigo[500],
                    light: colors.indigo[400],
                    dark: colors.indigo[900],
                },
                error: {
                    main: colors.red[300],
                },
                text: {
                    primary: '#fff',
                },
                status: {
                    available: colors.green[700],
                    pending: colors.yellow[500],
                    reserved: colors.red[500],
                }
            };
            break;
        default:
            textColor = '#000';
            palette =  {
                type: 'light',
                background: {
                    default: '#fff',
                    paper: '#eee'
                },
                primary: {
                    main: colors.green[500],
                    light: colors.green[400],
                    dark: colors.green[900],
                },
                status: {
                    available: colors.green[700],
                    pending: colors.yellow[600],
                    reserved: colors.red[500],
                }
            };
            break;
    };
    const theme = createMuiTheme({
        palette: palette,
        overrides: {
            MuiTypography: {
                colorPrimary: {
                    color: textColor,
                }
            },
        }
    });
    return theme;
});

export default getMuiTheme;




// primary.main
// secondary.main
// error.main
// warning.main
// info.main
// success.main
// text.primary
// text.secondary
// text.disabled
