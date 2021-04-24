import React from 'react';
import { inject, observer } from 'mobx-react';
import { Switch, withRouter, Route } from "react-router-dom";

import authApi from './services/authApi';
import PrivateRoute from './routes/PrivateRoute'
import Loader from './components/Loader';
import Bayan from './components/Bayan';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Events from './pages/Events';
import AddEvent from './pages/AddEvent';
import ChangeEvent from './pages/ChangeEvent';
import DeleteEvent from './pages/DeleteEvent';
import Page404 from './pages/Page404';
import ServerError from './pages/ServerError';
import AppError from './pages/AppError';
import Offline from './pages/Offline';
import { RENDERED_PAGES } from './includes/app';

import adminRooms from './pages/admin/Rooms';

import Container from '@material-ui/core/Container';

import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { theme } from './themes/';

import './App.scss'


@inject("userStore", "appStore")
@withRouter
@observer
class App extends React.Component {
    async componentDidMount() {
        const appStore = this.props.appStore;
        const userStore = this.props.userStore;
        if (!appStore.isOnLine()) {
            console.log(111);
            appStore.setPage(RENDERED_PAGES.OFFLINE);
            return;
        }

        const auth = await authApi.verify();
        const apiData = auth.response.getApiData();
        if (auth.error) {
            console.log(auth.error);
            console.log(222);
            if (auth.response.status !== 403) {
                appStore.setErrorMessage('Server error')
                appStore.setPage(RENDERED_PAGES.ERROR);
                console.log(auth.response.message);
                return;
            }
        }
        else {
            console.log(333);
            if (!apiData.user) {
                console.log(33344);
                appStore.setErrorMessage('Server error')
                appStore.setPage(RENDERED_PAGES.ERROR);
                console.log('invalid response');
                return;
            }
            else {
                userStore.setLoggedIn(true);
                console.log(44411111);
            }
        }
            console.log(444);
        appStore.setPage(RENDERED_PAGES.COMMON);
    }

    render() {
        console.info('App render', this.props.appStore.page);
        const appStore = this.props.appStore;
        const userStore = this.props.userStore;

        const isLoggedIn = userStore.loggedIn;
        const isAdmin = userStore.isAdmin;
        let page = null;
        switch(appStore.page) {
            case RENDERED_PAGES.LOADER:
                page = <Bayan/>;
                break;
            case RENDERED_PAGES.ERROR:
                page = <ServerError/>;
                break;
            case RENDERED_PAGES.OFFLINE:
                page = <Offline/>;
                break;
            case RENDERED_PAGES.COMMON:
                page = (
                    <Switch>
                    <Route path="/login" component={Login} exact/>
                    <Route path="/register" component={Register} exact/>

                    <PrivateRoute path="/events" exact component={Events} isLoggedIn={userStore.isLoggedIn}/>
                    <PrivateRoute path="/events/add/:roomId?/:from?/:to?" component={AddEvent} isLoggedIn={userStore.isLoggedIn}/>
                    <PrivateRoute path="/events/change/:id" exact component={ChangeEvent} isLoggedIn={userStore.isLoggedIn}/>
                    <PrivateRoute path="/events/delete/:id" exact component={DeleteEvent} isLoggedIn={userStore.isLoggedIn}/>
                    <PrivateRoute path="/" exact component={Events} isLoggedIn={userStore.isLoggedIn}/>
                    <PrivateRoute path="/@:username" component={Profile} isLoggedIn={userStore.isLoggedIn}/>

                    <Route path="/rooms" component={adminRooms} isAdmin={isAdmin} isLoggedIn={isLoggedIn}/>

                    <Route component={Page404} />
                    </Switch>
                );
                break;
            default:
                page = <AppError message="Something weng wrong"/>
        }
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <div className="app">
                    <Header/>
                    <main>
                        <Container maxWidth="lg">
                            {page}
                        </Container>
                    </main>
                    <Footer/>
                </div>
            </ThemeProvider>
        );

    }

}

export default App;
