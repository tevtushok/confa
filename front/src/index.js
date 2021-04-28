import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import { HashRouter } from "react-router-dom";
import reportWebVitals from './reportWebVitals';
import userStore from './stores/userStore';
import appStore from './stores/appStore';
import profileStore from './stores/profileStore';
import authStore from './stores/authStore';
import App from './App';
import './index.scss';


const stores = { userStore, appStore, profileStore, authStore };

if (process.env.NODE_ENV !== "development")
    console.log = () => {};

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


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
