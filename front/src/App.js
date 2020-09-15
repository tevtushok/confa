import React from 'react';
import { inject, observer } from 'mobx-react';
import UserStore from './stores/UserStore';

import './App.scss';

import Login from './pages/Login';
import LogoutButton from './components/LogoutButton'
import Loader from './components/Loader';


@inject('routing')
@observer
class App extends React.Component {
    async componentDidMount() {
        try {
            let res = await fetch('/api/v1/auth/verify', {
                method: 'get',
            });

            let result = await res.json();

            if (result && result.success) {
                UserStore.loading = false;
                UserStore.isLoggedIn = true;
                // UserStore.username = result.username;
            }
            else {
                UserStore.loading = false;
                UserStore.isLoggedIn = false;
            }
        }

        catch (e) {
            UserStore.loading = false;
            UserStore.isLoggedIn = false;
        }
    }

    render() {
        return (
            <div className="app">
                <Loader/>
            </div>
        );
    }

}

export default observer(App);
