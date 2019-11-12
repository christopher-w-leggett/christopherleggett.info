'use strict';

const React = require('react');
const css = require('./pick-name-form.scss');
const config = require('../../../config/config.json');
const formUtils = require('../../lib/form-utils');

//TODO: change to use react-bootstrap
module.exports = class PickNameForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: ''
        };
    }

    async onPickNameSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        const form = event.target;

        if(form.checkValidity() === true) {
            this.setState({
                name: ''
            });
            const response = await fetch(config.host + '/secretsanta/pick', {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'omit',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formUtils.toJson(form))
            });
            const json = await response.json();
            this.setState({
                name: json.name || ''
            });
        }

        form.classList.add('was-validated');
    }

    render() {
        let pickNameResult = null;
        if(this.state.name) {
            pickNameResult = <div className="alert alert-success pick-name-form-result" role="alert">
                <p className="pick-name-form-result__selection-title">Selected Name.</p>
                <p>{this.state.name}</p>
            </div>;
        }

        return (
            <form className="needs-validation" noValidate onSubmit={this.onPickNameSubmit.bind(this)}>
                <div className="form-row">
                    <div className="col mb-3">
                        <h2>Pick a name</h2>
                        <div className="form-group">
                            <input type="hidden" name="hattoken" value={this.props.hatToken}/>
                            <input type="password" className="form-control" aria-label="Selection Password" placeholder="Selection Password" name="selectionpassword" required minLength="8" maxLength="20"/>
                            <small className="form-text text-muted">
                                Your password must be 8-20 characters long.
                            </small>
                            <div className="invalid-feedback">Please enter a password to secure your selection.</div>
                        </div>
                        <button className="btn btn-primary" type="submit">Pick Name</button>
                    </div>
                </div>
                <div className="form-row">
                    <div className="col mb-3">
                        {pickNameResult}
                    </div>
                </div>
            </form>
        );
    }
}
