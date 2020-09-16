import React from 'react';
import { inject, observer } from 'mobx-react';
import { Switch, Route, Redirect, withRouter } from "react-router-dom";

import Loader from './components/loader';
import Header from './components/header'
import Footer from './components/footer'
import Login from './pages/login';
import Register from './pages/register'
import Profile from './pages/profile'

import {verifyAuthService} from './services/auth';

import './App.scss'



@inject("routing", "userStore", "commonStore")
@withRouter
@observer
class App extends React.Component {
    async componentDidMount() {
        const auth = await verifyAuthService();

        const userStore = {}
        if (auth.success) {
            userStore.loading = false;
            userStore.isLoggedIn = true;
            userStore.name = auth.name;
        }

        else {
            userStore.loading = false;
            userStore.isLoggedIn = false;
            console.log('redirecting to login')
            
        }
    }

    render() {
            console.log(this.props.location.pathname);
  
        if (!this.props.userStore.isLoggedIn &&
            this.props.location.pathname !== '/login') {
            this.props.userStore.setLoggedIn();
            return (
                <Redirect to="/login"/>
            );
        }

        return (
            <div className="app">
                <Loader/>
                <Header/>
                <Switch>
                    <Route path="/login" component={Login} />
                    <Route path="/register" component={Register} />
                    <Route path="/profile" component={Profile} />
                </Switch>
                <Footer/>
            </div>  
        );
    }

}

export default App;