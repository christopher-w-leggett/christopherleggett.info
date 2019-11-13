'use strict';

const React = require('react');
const css = require('./reveal-name-form.scss');
const config = require('../../../config/config.json');
const formUtils = require('../../lib/form-utils');

//TODO: change to use react-bootstrap
module.exports = class RevealNameForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            error: ''
        };
    }

    async onRevealNameSubmit(event) {
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
            const response = await fetch(config.host + '/secretsanta/reveal', {
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
                        error: 'Unable to reveal your selection.  Please verify the correct password has been entered.'
                    });
                } else {
                    this.setState({
                        error: 'Unknown error revealing your selection.'
                    });
                }
            } else {
                this.setState({
                    error: 'Unknown error revealing your selection.'
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
                <div className="col mb-0">
                    <div className="alert alert-danger" role="alert">
                        <p className="mb-0">{this.state.error}</p>
                    </div>
                </div>
            </div>;
        }

        let revealNameResult = null;
        if(this.state.name) {
            revealNameResult = <div className="form-row">
                <div className="col mb-3">
                    <div className="alert alert-success reveal-name-form-result" role="alert">
                        <p className="reveal-name-form__result__name-title">Selected Name</p>
                        <p className="mb-0">{this.state.name}</p>
                    </div>
                </div>
            </div>;
        }

        return (
            <form className="needs-validation reveal-name-form" noValidate onSubmit={this.onRevealNameSubmit.bind(this)}>
                <div className="form-row">
                    <div className="col mt-3">
                        <h2 className="reveal-name-form__header">Reveal your selection</h2>
                    </div>
                </div>
                {errorResult}
                <div className="form-row">
                    <div className="col mb-3">
                        <div className="form-group">
                            <input type="hidden" name="selectiontoken" value={this.props.selectionToken}/>
                            <input type="password" className="form-control" aria-label="Your Password" placeholder="Your Password" name="selectionpassword" required minLength="8" maxLength="20"/>
                            <small className="form-text text-muted">
                                Please enter the password you used to secure your selection.
                            </small>
                        </div>
                        <button className="btn btn-primary" type="submit">Reveal Name</button>
                    </div>
                </div>
                {revealNameResult}
            </form>
        );
    }
}
