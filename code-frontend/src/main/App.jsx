'use strict';

const regeneratorRuntime = require("regenerator-runtime");
const React = require('react');
const ReactDOM = require('react-dom');
//TODO: change to use react-bootstrap
const bootstrap = require('bootstrap');
const css = require('./App.scss');
const boostrapCss = require('bootstrap/dist/css/bootstrap.min.css');
const config = require('config/config.json');
const Url = require('url-parse');

class App extends React.Component {
    constructor(props) {
        super(props);

        var url = Url(window.location.href, true);

        this.state = {
            selectionToken: url.query.selection || '',
            hatToken: url.query.hat || '',
            name: ''
        };
    }

    toJSONString(form) {
        const obj = {};
        const elements = form.querySelectorAll("input, select, textarea");
        for(let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const name = element.name;
            const value = element.value;

            if(name) {
                obj[name] = value;
            }
        }

        return JSON.stringify(obj);
    }

    async onPickNameSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        const form = event.target;

        if(form.checkValidity() === true) {
            this.setState({
                name: ''
            });
            const response = await fetch(config.host + '/pick-name', {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'omit',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: this.toJSONString(form)
            });
            const json = await response.json();
            this.setState({
                name: json.name || ''
            });
        }

        form.classList.add('was-validated');
    }

    async onRevealNameSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        const form = event.target;

        if(form.checkValidity() === true) {
            this.setState({
                name: ''
            });
            const response = await fetch(config.host + '/reveal-name', {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'omit',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: this.toJSONString(form)
            });
            const json = await response.json();
            this.setState({
                name: json.name || ''
            });
        }

        form.classList.add('was-validated');
    }

    render() {
        const { selectionToken, hatToken, name } = this.state;

        let pickNameForm = null;
        let pickNameResult = null;
        if(hatToken) {
            pickNameForm = <form className="needs-validation" noValidate onSubmit={this.onPickNameSubmit.bind(this)}>
                <div className="form-row">
                    <div className="col mb-3">
                        <h2>Pick a name</h2>
                        <div className="form-group">
                            <input type="hidden" name="hattoken" value={hatToken}/>
                            <input type="password" className="form-control" aria-label="Selection Password" placeholder="Selection Password" name="selectionpassword" required minLength="8" maxLength="20"/>
                            <small className="form-text text-muted">
                                Your password must be 8-20 characters long.
                            </small>
                            <div className="invalid-feedback">Please enter a password to secure your selection.</div>
                        </div>
                        <button className="btn btn-primary" type="submit">Pick Name</button>
                    </div>
                </div>
            </form>;

            if(name) {
                pickNameResult = <div className="alert alert-success pick-name-form-result" role="alert">
                    <p className="pick-name-form-result__selection-title">Selected Name.</p>
                    <p>{name}</p>
                </div>;
            }
        }

        let revealNameForm = null;
        let revealNameResult = null;
        if(selectionToken) {
            revealNameForm = <form className="needs-validation" noValidate onSubmit={this.onRevealNameSubmit.bind(this)}>
                <div className="form-row">
                    <div className="col mb-3">
                        <h2>Reveal your name</h2>
                        <div className="form-group">
                            <input type="hidden" name="selectiontoken" value={selectionToken}/>
                            <input type="password" className="form-control" aria-label="Selection Password" placeholder="Selection Password" name="selectionpassword" required minLength="8" maxLength="20"/>
                            <small className="form-text text-muted">
                                Please enter the password you used to secure your selection.
                            </small>
                            <div className="invalid-feedback">Password is required to reveal the name.</div>
                        </div>
                        <button className="btn btn-primary" type="submit">Reveal Name</button>
                    </div>
                </div>
            </form>;

            if(name) {
                revealNameResult = <div className="alert alert-success reveal-name-form-result" role="alert">
                    <p className="reveal-name-form-result__name-title">Selected Name.</p>
                    <p>{name}</p>
                </div>;
            }
        }

        return (
            <div className="container">
                <div className="row">
                    <div className="col">
                        <h1>Secret Santa</h1>
                        {pickNameForm}
                        {pickNameResult}
                        {revealNameForm}
                        {revealNameResult}
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
