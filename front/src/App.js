import React from 'react';
import { inject, observer } from 'mobx-react';
import { Switch, withRouter, Route } from "react-router-dom";

import authApi from './services/authApi';
import PrivateRoute from './routes/PrivateRoute'
import AdminRoute from './routes/AdminRoute'
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
import { RENDER_STATES } from './stores/appStore';

import adminRooms from './pages/admin/Rooms';

import Container from '@material-ui/core/Container';

import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import getMuiTheme from './themes/';

import './App.scss'


@inject('userStore', 'appStore')
@withRouter
@observer
class App extends React.Component {
    async componentDidMount() {
        const appStore = this.props.appStore;
        const userStore = this.props.userStore;
        if (!appStore.isOnline) {
            appStore.setRenderState(RENDER_STATES.OFFLINE);
            return;
        }

        authApi.verify()
            .then(({ response }) => {
                const apiData = response.getApiData();
                if (!apiData.user) {
                    appStore.setErrorMessage('Server error')
                    appStore.setRenderState(RENDER_STATES.ERROR);
                    console.log('invalid response', apiData);
                }

                userStore.setUser(apiData.user);
                this.props.appStore.setRenderState(RENDER_STATES.COMMON);
            })
            .catch(({ error, response }) => {
                if (error && error.response?.status !== 403) {
                    appStore.setErrorMessage('Server error')
                    appStore.setRenderState(RENDER_STATES.ERROR);
                    console.log(response.message);
                    return;
                }

                this.props.appStore.setRenderState(RENDER_STATES.COMMON);

            });

    }

    render() {
        console.info('App render', this.props.appStore.renderState);
        const userStore = this.props.userStore;
        const theme = getMuiTheme(this.props.appStore.darkMode);
        let page = null;
        switch(this.props.appStore.renderState) {
            case RENDER_STATES.LOADER:
                page = <Bayan/>;
                break;
            case RENDER_STATES.ERROR:
                page = <ServerError/>;
                break;
            case RENDER_STATES.OFFLINE:
                page = <Offline/>;
                break;
            case RENDER_STATES.COMMON:
                page = (
                    <Switch>
                    <Route path="/login" component={Login}/>
                    <Route path="/register" component={Register}/>

                    <PrivateRoute path="/events" exact component={Events} isLoggedIn={userStore.isLoggedIn}/>
                    <PrivateRoute path="/events/add/:roomId?/:from?/:to?" component={AddEvent} isLoggedIn={userStore.isLoggedIn}/>
                    <PrivateRoute path="/events/change/:id" exact component={ChangeEvent} isLoggedIn={userStore.isLoggedIn}/>
                    <PrivateRoute path="/events/delete/:id" exact component={DeleteEvent} isLoggedIn={userStore.isLoggedIn}/>
                    <PrivateRoute path="/" exact component={Events} isLoggedIn={userStore.isLoggedIn}/>
                    <PrivateRoute path="/@:username" component={Profile} isLoggedIn={userStore.isLoggedIn}/>

                    <AdminRoute path="/rooms" exact component={adminRooms} isAdmin={userStore.isAdmin} isLoggedIn={userStore.isLoggedIn}/>

                    <Route component={Page404} />
                    </Switch>
                );
                break;
            default:
                page = <AppError/>
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
