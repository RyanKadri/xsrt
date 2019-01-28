import { red, teal } from "@material-ui/core/colors";
import { createMuiTheme } from "@material-ui/core/styles";

export const appTheme = createMuiTheme({
    palette: {
      primary: teal,
      secondary: red,
    },
    typography: {
        useNextVariants: true
    }
});
