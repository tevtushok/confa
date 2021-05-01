import React from 'react';
import { Route } from 'react-router-dom';
import Page403 from '../pages/Page403';

const AdminRoute = ({component: Component, ...rest}) => {
    return (

        // Show the component only when the user is logged in
        // Otherwise, load 403 page

        <Route {...rest} render={props => (
            rest.isLoggedIn && rest.isAdmin ?
                <Component {...props} />
                : <Page403 {...props} />
        )} />
    );
};

export default AdminRoute;
