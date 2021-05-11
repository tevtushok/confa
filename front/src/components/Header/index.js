import React from 'react';
import { Link as RouterLink } from "react-router-dom";
import { inject } from 'mobx-react';
import LogoutLink from '../LogoutLink'
import { AppBar, Toolbar, Link } from '@material-ui/core';
import ThemeSwitcher from '../ThemeSwitcher';
import './index.scss';


@inject('userStore')
@inject('appStore')
class Header extends React.Component{
    render() {
        const userStore = this.props.userStore;
        let links = [];
        switch(true) {
            case userStore.isLoggedIn:
            case userStore.isAdmin:
				console.warn('logg u', userStore.user, userStore.isAdmin);
                links.push(
                    <LogoutLink key="logout"/>,
                    <Link key="events" component={RouterLink} to="/events">Events</Link>,
                    <Link key="profile" component={RouterLink} to={`/@${userStore.user.name}`}>Profile</Link>,
                );
                if (userStore.isAdmin) {
                    links.push(<Link key="rooms" component={RouterLink} to="/rooms">Rooms</Link>);
                }
                break;
            default:
				console.warn('logg defaultl');
                links.push(
                    <Link key="login" component={RouterLink} to="/login">Login</Link>,
                    <Link key="register" component={RouterLink} to="/register">Register</Link>,
                );

        }
        return (
            <AppBar position="static" color={this.props.appStore.darkMode ? 'default' : 'primary'}>
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
