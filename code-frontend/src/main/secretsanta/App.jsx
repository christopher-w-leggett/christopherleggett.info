'use strict';

const regeneratorRuntime = require("regenerator-runtime");
const bootstrap = require('bootstrap');
const boostrapCss = require('bootstrap/dist/css/bootstrap.min.css');
const React = require('react');
const ReactDOM = require('react-dom');
const Url = require('url-parse');

//components
const PickNameForm = require('./components/pick-name-form/index.jsx');
const RevealNameForm = require('./components/reveal-name-form/index.jsx');

class App extends React.Component {
    constructor(props) {
        super(props);

        var url = Url(window.location.href, true);

        this.state = {
            selectionToken: url.query.selection || '',
            hatToken: url.query.hat || ''
        };
    }

    render() {
        const { selectionToken, hatToken } = this.state;

        let pickNameForm = null;
        if(hatToken) {
            pickNameForm = <PickNameForm hatToken={hatToken}/>
        }

        let revealNameForm = null;
        if(selectionToken) {
            revealNameForm = <RevealNameForm selectionToken={selectionToken}/>
        }

        return (
            <div className="container">
                <div className="row">
                    <div className="col">
                        <h1>Secret Santa</h1>
                        {pickNameForm}
                        {revealNameForm}
                    </div>
                </div>
            </div>
        );
    }
}

const appContainer = document.getElementById('secret-santa-app');
if(appContainer) {
    ReactDOM.render(<App />, appContainer);
}
