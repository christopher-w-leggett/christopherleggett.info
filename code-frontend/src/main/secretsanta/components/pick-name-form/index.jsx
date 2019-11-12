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
            name: '',
            error: ''
        };
    }

    async onPickNameSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        const form = event.target;
        const submitButton = form.querySelector('.btn-primary');
        submitButton.disabled = true;

        if(form.checkValidity() === true) {
            this.setState({
                name: '',
                error: ''
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
            if(response.status === 200) {
                const json = await response.json();
                this.setState({
                    name: json.name || ''
                });
            } else if(response.status === 400) {
                const json = await response.json();
                if(json.error && json.error.code === 'ss-400-2') {
                    this.setState({
                        error: 'Unable to pick a name.  You may only pick a name once.'
                    });
                } else {
                    this.setState({
                        error: 'Unknown error picking a name.'
                    });
                }
            } else {
                this.setState({
                    error: 'Unknown error picking a name.'
                });
            }
        }

        form.classList.add('was-validated');
        submitButton.disabled = false;
    }

    render() {
        let errorResult = null;
        if(this.state.error) {
            errorResult = <div className="form-row">
                <div className="col mb-3">
                    <div className="alert alert-danger" role="alert">
                        <p>{this.state.error}</p>
                    </div>
                </div>
            </div>;
        }

        let pickNameResult = null;
        if(this.state.name) {
            pickNameResult = <div className="form-row">
                <div className="col mb-3">
                    <div className="alert alert-success pick-name-form-result" role="alert">
                        <p className="pick-name-form-result__selection-title">Selected Name.</p>
                        <p>{this.state.name}</p>
                    </div>
                </div>
            </div>;
        }

        return (
            <form className="needs-validation" noValidate onSubmit={this.onPickNameSubmit.bind(this)}>
                <div className="form-row">
                    <div className="col mb-3">
                        <h2>Pick a name</h2>
                    </div>
                </div>
                {errorResult}
                <div className="form-row">
                    <div className="col mb-3">
                        <div className="form-group">
                            <input type="hidden" name="hattoken" value={this.props.hatToken}/>
                            <input type="password" className="form-control" aria-label="Create a Password" placeholder="Create a Password" name="selectionpassword" required minLength="8" maxLength="20"/>
                            <small className="form-text text-muted">
                                Create a password to secure your selection.  Your password must be 8-20 characters long.
                            </small>
                            <div className="invalid-feedback">Please create a password to secure your selection.</div>
                        </div>
                        <button className="btn btn-primary" type="submit">Pick a Name</button>
                    </div>
                </div>
                {pickNameResult}
            </form>
        );
    }
}
