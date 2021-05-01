import React from 'react';

import './index.scss'

 const Page403 = ({ location }) => (
   <div className="page403 page">
      <h3 className="text-center">You dont have permission to <code>{location.pathname}</code></h3>
   </div>
);

export default Page403;
