import React from 'react';
import { observer, inject } from "mobx-react"
import { IconButton } from '@material-ui/core';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';

@inject('appStore')
@observer
class ThemeSwitcher extends React.PureComponent {
    handleClick = event => {
        const newMode = !this.props.appStore.preferDarkMode;
        this.props.appStore.setPreferDarkMode(newMode);
    };
    render() {
        let icon = this.props.appStore.preferDarkMode ? <Brightness7Icon/> : <Brightness4Icon/>;
        return <IconButton onClick={this.handleClick} className="themeSwitcher">{icon}</IconButton>;
    }
}
export default ThemeSwitcher;
