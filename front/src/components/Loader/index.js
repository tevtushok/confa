import React from 'react';

import './index.scss';

class Loader extends React.Component {
	render() {
		return (
			<div className="loader">
				<div className="loaderFrame"></div>
			</div>
		);
	}
}

export default Loader;