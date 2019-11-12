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
            name: ''
        };
    }

    async onRevealNameSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        const form = event.target;

        if(form.checkValidity() === true) {
            this.setState({
                name: ''
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
            const json = await response.json();
            this.setState({
                name: json.name || ''
            });
        }

        form.classList.add('was-validated');
    }

    render() {
        let revealNameResult = null;
        if(this.state.name) {
            revealNameResult = <div className="alert alert-success reveal-name-form-result" role="alert">
                <p className="reveal-name-form-result__name-title">Selected Name.</p>
                <p>{this.state.name}</p>
            </div>;
        }

        return (
            <form className="needs-validation" noValidate onSubmit={this.onRevealNameSubmit.bind(this)}>
                <div className="form-row">
                    <div className="col mb-3">
                        <h2>Reveal your selection</h2>
                        <div className="form-group">
                            <input type="hidden" name="selectiontoken" value={this.props.selectionToken}/>
                            <input type="password" className="form-control" aria-label="Selection Password" placeholder="Selection Password" name="selectionpassword" required minLength="8" maxLength="20"/>
                            <small className="form-text text-muted">
                                Please enter the password you used to secure your selection.
                            </small>
                            <div className="invalid-feedback">Password is required to reveal the name.</div>
                        </div>
                        <button className="btn btn-primary" type="submit">Reveal Name</button>
                    </div>
                </div>
                <div className="form-row">
                    <div className="col mb-3">
                        {revealNameResult}
                    </div>
                </div>
            </form>
        );
    }
}
