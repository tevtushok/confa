import React from 'react';

export default class ServiceMessage extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                {JSON.stringify(this.props)}
            </div>
        );
    }
}
