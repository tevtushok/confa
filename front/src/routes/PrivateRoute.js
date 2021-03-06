import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({component: Component, ...rest}) => {
    return (
        // Show the component only when the user is logged in
        // Otherwise, redirect the user to /login page
        <Route {...rest} render={props => (
            rest.isLoggedIn ?
                <Component {...props} />
                : <Redirect to={{
                    pathname: "/login",
                    from: rest.location.pathname,
                }} />
        )} />
    );
};

export default PrivateRoute;
