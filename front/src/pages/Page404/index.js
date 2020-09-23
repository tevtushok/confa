import React from 'react';

import './index.scss'

 const Page404 = ({ location }) => (
   <div className="page404 component container-fluid">
      <h3 className="text-center">No match found for <code>{location.pathname}</code></h3>
   </div>
);

export default Page404;