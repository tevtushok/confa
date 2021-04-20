import React from 'react';
import { inject, observer } from 'mobx-react';
import { Switch, withRouter, Route } from "react-router-dom";

import authApi from './services/authApi'
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
import Page404 from './pages/Page404'
import ServerError from './pages/ServerError'

import adminRooms from './pages/admin/Rooms'

import Container from '@material-ui/core/Container';

import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { theme } from './themes/';



import './App.scss'


@inject("userStore", "commonStore")
@withRouter
@observer
class App extends React.Component {
    async componentDidMount() {
        const auth = await authApi.verify();
        const apiData = auth.response.getApiData();
        if (!auth.error && apiData.user) {
            console.info(apiData.user);
            this.props.userStore.setUser(apiData.user);
        }
        else {
            if ((500 === auth.response.status)) {
                this.props.commonStore.setServerError('Internal Server Error')
            }
        }
        this.props.commonStore.setAppLoaded();
    }

    render() {
        const isLoggedIn = this.props.userStore.loggedIn;
        const userRole = this.props.userStore.userRole;
        if (!this.props.commonStore.appLoaded) {
            return (
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    <div className="app">
                        <Header/>
                        <main>
                            <Bayan/>
                        </main>
                        <Footer/>
                    </div>
                </ThemeProvider>
            );
        }

        if (this.props.commonStore.getServerError()) {
            return (
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    <div className="app">
                        <Header/>
                        <main>
                            <Container maxWidth="lg">
                                <ServerError message={this.props.commonStore.getServerError}/>
                            </Container>
                        </main>
                        <Footer/>
                    </div>
                </ThemeProvider>
            );
        }

        return (
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <div className="app">
                    <Header/>
                    <main>
                        <Container maxWidth="lg">
                            <Switch>
                            <Route path="/login" component={Login} exact/>
                            <Route path="/register" component={Register} exact/>

                            <PrivateRoute path="/events" exact component={Events} isLoggedIn={this.props.userStore.isLoggedIn}/>
                            <PrivateRoute path="/events/add/:roomId?/:from?/:to?" component={AddEvent} isLoggedIn={this.props.userStore.isLoggedIn}/>
                            <PrivateRoute path="/events/change/:id" exact component={ChangeEvent} isLoggedIn={this.props.userStore.isLoggedIn}/>
                            <PrivateRoute path="/events/delete/:id" exact component={DeleteEvent} isLoggedIn={this.props.userStore.isLoggedIn}/>
                            <PrivateRoute path="/" exact component={Events} isLoggedIn={this.props.userStore.isLoggedIn}/>
                            <PrivateRoute path="/@:username" component={Profile} isLoggedIn={this.props.userStore.isLoggedIn}/>

                            <Route path="/rooms" component={adminRooms} userRole={userRole} isLoggedIn={isLoggedIn}/>

                            <Route component={Page404} />
                            </Switch>
                        </Container>
                    </main>
                    <Footer/>
                </div>
            </ThemeProvider>
        );
    }

}

export default App;
