'use strict';

//react
const React = require('react');
const ReactDOM = require('react-dom');

//bootstrap
const regeneratorRuntime = require("regenerator-runtime");
const bootstrap = require('bootstrap');
//TODO: Modify bootstrap css so app is more festive
const boostrapCss = require('bootstrap/dist/css/bootstrap.min.css');
const { Container, Row, Col } = require('react-bootstrap');

//libs
const Url = require('url-parse');

//app specific
const css = require('./App.scss');

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
            <div>
                <h1 className="secret-santa__header">Secret Santa</h1>
                <Container>
                    <Row>
                        <Col sm={3}>
                        </Col>
                        <Col sm={6}>
                            {pickNameForm}
                            {revealNameForm}
                        </Col>
                        <Col sm={3}>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

const appContainer = document.getElementById('secret-santa-app');
if(appContainer) {
    ReactDOM.render(<App />, appContainer);
}
