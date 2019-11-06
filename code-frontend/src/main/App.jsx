'use strict';

const regeneratorRuntime = require("regenerator-runtime");
const React = require('react');
const ReactDOM = require('react-dom');
const bootstrap = require('bootstrap');
const css = require('./App.scss');
const boostrapCss = require('bootstrap/dist/css/bootstrap.min.css');

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selection: '',
            hat: '',
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
                selection: '',
                hat: ''
            });
            const response = await fetch('http://localhost:3000/pick-name', {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'omit',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.toJSONString(form))
            });
            const json = await response.json();
            this.setState({
                selection: json.selection || '',
                hat: json.hat || ''
            });
        }

        form.classList.add('was-validated');
    }

    async onRevealNameSubmit(event) {
        const form = event.target;

        if(form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }

        console.log(this.toJSONString(form));
        form.classList.add('was-validated');
    }

    render() {
        const { selection, hat, name } = this.state;

        let pickNameResult = null;
        if(selection && hat) {
            pickNameResult = <div className="alert alert-success pick-name-form-result" role="alert">
                <p className="pick-name-form-result__selection-title">Your selection.  Keep it in a safe place and use the Reveal your name form to see who you picked.</p>
                <p>{selection}</p>
                <p className="pick-name-form-result__new-hat-title">Pass the following hat to the next person.</p>
                <p>{hat}</p>
            </div>;
        }

        return (
            <div className="container">
                <div className="row">
                    <div className="col">
                        <h1>Secret Santa</h1>
                        <form className="needs-validation" noValidate onSubmit={this.onPickNameSubmit.bind(this)}>
                            <div className="form-row">
                                <div className="col mb-3">
                                    <h2>Pick a name</h2>
                                    <div className="form-group">
                                        <input type="text" className="form-control" aria-label="Hat" placeholder="Enter Hat (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1MTYyMzkwMjJ9.tbDepxpstvGdW8TC3G8zg4B6rUYAOvfzdceoH48wgRQ)" name="hat-token" required pattern="^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$"/>
                                        <div className="invalid-feedback">
                                            Please enter a valid hat to pick a name.
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <select className="custom-select" name="user-name" required>
                                            <option value="">Select Your Name</option>
                                            <option value="stacy">Stacy</option>
                                            <option value="chris">Chris</option>
                                            <option value="kathleen">Kathleen</option>
                                            <option value="karen">Karen</option>
                                            <option value="ryan">Ryan</option>
                                            <option value="kyle">Kyle</option>
                                            <option value="tara">Tara</option>
                                        </select>
                                        <div className="invalid-feedback">Please select your name.</div>
                                    </div>
                                    <button className="btn btn-primary" type="submit">Pick Name</button>
                                </div>
                            </div>
                        </form>
                        {pickNameResult}
                        <form className="needs-validation" noValidate onSubmit={this.onRevealNameSubmit.bind(this)}>
                            <div className="form-row">
                                <div className="col mb-3">
                                    <h2>Reveal your name</h2>
                                    <div className="form-group">
                                        <input type="text" className="form-control" aria-label="Selection" placeholder="Enter Selection (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1MTYyMzkwMjJ9.tbDepxpstvGdW8TC3G8zg4B6rUYAOvfzdceoH48wgRQ)" name="selection-token" required pattern="^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$"/>
                                        <div className="invalid-feedback">
                                            Please enter a valid selection to reveal your name.
                                        </div>
                                    </div>
                                    <button className="btn btn-primary" type="submit">Pick Name</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
