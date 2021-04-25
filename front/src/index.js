import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { Provider } from 'mobx-react';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Router } from 'react-router';
import reportWebVitals from './reportWebVitals';
import userStore from './stores/userStore';
import appStore from './stores/appStore';
import App from './App';
import './index.scss';



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
        <React.StrictMode>
          <App />
        </React.StrictMode>
    </Router>
  </Provider>,
  document.getElementById('root')
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
