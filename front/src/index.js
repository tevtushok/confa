import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';

import { Provider } from 'mobx-react';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Router } from 'react-router';

import userStore from './stores/userStore';
import appStore from './stores/appStore';

import './index.scss';
import './App.scss'

import App from './App';
import * as serviceWorker from './serviceWorker';


const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();

const stores = { userStore, appStore, };

const history = syncHistoryWithStore(browserHistory, routingStore);

// <React.StrictMode>
//   <App />
// </React.StrictMode>
ReactDOM.render(
  <Provider {...stores}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
