import React from 'react';
import { Link as RouterLink } from "react-router-dom";
import { inject } from 'mobx-react';
import LogoutLink from '../LogoutLink'
import { AppBar, Toolbar, Link } from '@material-ui/core';
import ThemeSwitcher from '../ThemeSwitcher';
import './index.scss';


@inject("userStore")
class Header extends React.Component {
    render() {
        const userStore = this.props.userStore;
        let links = [];
        switch(true) {
            case userStore.user:
            case userStore.isAdmin:
                links.push(
                    <LogoutLink/>,
                    <Link component={RouterLink} to="/events">Events</Link>,
                    <Link component={RouterLink} to={`/@${userStore.user.name}`}>Profile</Link>,
                );
                if (userStore.isAdmin) {
                    links.push(<Link component={RouterLink} to="/rooms">Rooms</Link>);
                }
                break;
            default:
                links.push(
                    <Link component={RouterLink} to="/login">Login</Link>,
                    <Link component={RouterLink} to="/register">Register</Link>,
                );

        }
        return (
            <AppBar position="static" color="default">
                <Toolbar className="linksBar">
                    <div className="navLinks">
                        {links}
                    </div>
                    <div className="linkThemeSwitcher">
                        <ThemeSwitcher/>
                    </div>
                </Toolbar>
            </AppBar>
        );
    }
}

export default Header;
