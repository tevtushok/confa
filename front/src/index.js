import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import { HashRouter } from "react-router-dom";
import userStore from './stores/userStore';
import appStore from './stores/appStore';
import profileStore from './stores/profileStore';
import authStore from './stores/authStore';
import App from './App';
import './index.scss';


const stores = { userStore, appStore, profileStore, authStore };

// <React.StrictMode>
//   <App />
// </React.StrictMode>
ReactDOM.render(
    <Provider {...stores}>
        <HashRouter>
            <React.StrictMode>
                <App />
            </React.StrictMode>
        </HashRouter>
    </Provider>,
    document.getElementById('root')
);
