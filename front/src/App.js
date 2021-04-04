import React from 'react';
import { inject, observer } from 'mobx-react';
import { Switch, withRouter, Route } from "react-router-dom";

import { verifyAuthService } from './services/auth'
import PrivateRoute from './routes/PrivateRoute'
import Loader from './components/Loader';
import Header from './components/Header'
import Footer from './components/Footer'
import Login from './pages/Login';
import Register from './pages/Register'
import Profile from './pages/Profile'
import Events from './pages/Events'
import NewEvent from './pages/NewEvent'
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
        const auth = await verifyAuthService();
        if (!auth.error && auth.data.data.user) {
            this.props.userStore.setUser(auth.data.data.user);
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
            return (<Loader/>);
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

                            <PrivateRoute path="/events" component={Events} isLoggedIn={this.props.userStore.isLoggedIn}/>
                            <PrivateRoute path="/newEvent" component={NewEvent} isLoggedIn={this.props.userStore.isLoggedIn}/>
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
