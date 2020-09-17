import React from 'react';
import { inject, observer } from 'mobx-react';
import { Switch, withRouter, Route } from "react-router-dom";

import PrivateRoute from './routes/PrivateRoute'
import { verifyAuthService } from './services/auth'

import Loader from './components/Loader';
import Header from './components/Header'
import Footer from './components/Footer'
import Login from './pages/Login';
import Register from './pages/Register'
import Profile from './pages/Profile'
import Schedule from './pages/Schedule'
import Page404 from './pages/Page404'


import './App.scss'


@inject("userStore", "commonStore")
@withRouter
@observer
class App extends React.Component {
    async componentDidMount() {
        await verifyAuthService()
            .then((res) => {
                if (!res.error) {
                    this.props.userStore.setLoggedIn();
                }
            });
        this.props.commonStore.setAppLoaded();
    }

    render() {
        const isLoggedIn = this.props.userStore.isLoggedIn;
        const appLoaded = this.props.commonStore.appLoaded;
        if (!appLoaded) {
            return (<Loader/>);
        }

        return (
            <div className="app">
                {/* 
                <Loader/>
                */}  
                <Header/>
                <main>
                    <Switch>
                        
                            <Route path="/login" component={Login} exact/>
                            <Route path="/register" component={Register} exact/>

                            <PrivateRoute path="/@:username" component={Profile} isLoggedIn={isLoggedIn}/>
                            <PrivateRoute path="/schedule" component={Schedule} isLoggedIn={isLoggedIn} />
                            <PrivateRoute path="/" component={Schedule} exact isLoggedIn={isLoggedIn} />
                            <Route component={Page404} />
                        
                    </Switch>
                </main>
                <Footer/>
            </div>  
        );
    }

}

export default App;
