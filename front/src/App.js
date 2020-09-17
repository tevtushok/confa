import React from 'react';
import { inject, observer } from 'mobx-react';
import { Switch, withRouter } from "react-router-dom";

import PublicRoute from './routes/PublicRoute'
import PrivateRoute from './routes/PrivateRoute'

import Loader from './components/Loader';
import Header from './components/Header'
import Footer from './components/Footer'
import Login from './pages/Login';
import Register from './pages/Register'
import Profile from './pages/Profile'
import Schedule from './pages/Schedule'

import './App.scss'



@inject("userStore", "commonStore")
@withRouter
@observer
class App extends React.Component {
    async componentDidMount() {

    }

    render() {
        const isLoggedIn = this.props.userStore.isLoggedIn;
        return (
            <div className="app">
                <Loader/>
                <Header/>
                <Switch>
                    <PublicRoute path="/login" component={Login} exact
                        isLoggedIn={isLoggedIn} restricted={true} />
                    <PublicRoute path="/register" component={Register} exact
                        isLoggedIn={isLoggedIn} restricted={true}/>

                    <PrivateRoute path="/@:username" component={Profile} exact isLoggedIn={isLoggedIn}/>
                    <PrivateRoute path="/schedule" component={Schedule} exact isLoggedIn={isLoggedIn} />
                </Switch>
                <Footer/>
            </div>  
        );
    }

}

export default App;
