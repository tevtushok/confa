import React from 'react';
import Alert from '@material-ui/lab/Alert'

export default class ServerError extends React.Component {
    constructor(props) {
        super(props);
        this.data = []
        if (typeof this.props.data === 'string' || this.props.data instanceof String) {
            this.data.push(this.props.data);
        }
        else {
            this.data = this.props.data;
        }
        this.severity = this.props.severity || 'error';
    }
    render() {
        return (
            <Alert className="ServerError" severity={this.severity}>
                {this.data.map((row, index) => (
                    <div key={index}>{row}</div>
                ))}
            </Alert>
        );
    }
}
