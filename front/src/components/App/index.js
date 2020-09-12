import React from 'react';
import { inject, observer } from 'mobx-react';
import UserStore from '../../stores/UserStore';

import './index.scss';

import Login from '../Login';
import LogoutButton from '../LogoutButton'
import Loader from '../Loader';


@inject('routing')
@observer
class App extends React.Component {
    async componentDidMount() {
        try {
            let res = await fetch('/isLoggedIn', {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json'
                },
            });

            let result = await res.json();

            if (result && result.success) {
                UserStore.loading = false;
                UserStore.isLoggedIn = true;
                UserStore.username = result.username;
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
    async doLogout() {
        try {
            let res = await fetch('/logout', {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json'
                },
            });

            let result = await res.json();

            if (result && result.success) {
                UserStore.isLoggedIn = false;
            }
        }

        catch (e) {
            console.log(e);
        }
    }
    doRo() {
        //routingStore.go('Register');
    }
    render() {
        const { location, push, goBack } = this.props.routing;
        if (UserStore.loading) {
            return (
                <div className="app">
                    <Loader/>
                </div>
            );
        }
        else {
            if (UserStore.isLoggedIn) {
              return (
                <div className="app">
                  <div className="conteiner">
                      Welcome {UserStore.username}
                      <button 
                      onClick={ () => this.doLogout()}>
                        logout
                      </button>
                      <LogoutButton
                        onClick={ (this.doLogout())}
                      />
                  </div>
                </div>
              );
            }
        }
      return (
        <div className="app">
          <div className="container">
            <Login/>
            <button onClick={() => (this.doRo())}>Change url</button>
          </div>
        </div>
      );
    }

}

export default observer(App);
