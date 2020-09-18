import React from 'react';
import Bayan from '../../components/Bayan'
import './index.scss';


class Register extends React.Component {
    render() {
      return (
        <div className="register container">
        <div className="row">
			<form className="register-form">
				<div className="form-group">
					<label htmlFor="email">Name:</label>
					<input type="text" className="form-control" name="name" id="name"/>
					<small className="text-danger">Name is required</small>
				</div>
				<div className="form-group">
					<label htmlFor="email">Last Name:</label>
					<input type="text" className="form-control" name="lastname" id="lastname"/>
					<small className="text-danger">Last Name is required</small>
				</div>
				<div className="form-group">
					<label htmlFor="email">Password:</label>
					<input type="text" className="form-control" name="password" id="password"/>
					<small className="text-danger">Password is required</small>
				</div>
				<div className="form-group">
					<label htmlFor="email">Password confirm:</label>
					<input type="text" className="form-control" name="password" id="password"/>
					<small className="text-danger">Password confirm is required</small>
				</div>
				<Bayan/>
				<button type="submit" className="btn btn-block btn-danger">Register</button>
			</form>
		</div>
		</div>
      );
    }

}

export default Register;
