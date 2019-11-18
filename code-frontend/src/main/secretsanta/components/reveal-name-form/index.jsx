'use strict';

const React = require('react');
const { Form, Col, Alert, Button } = require('react-bootstrap');
const css = require('./reveal-name-form.scss');
const config = require('../../../config/config.json');
const formUtils = require('../../lib/form-utils');

module.exports = class RevealNameForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            validated: false,
            submitting: false,
            name: '',
            error: ''
        };
    }

    async onRevealNameSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        const form = event.target;
        let name = '';
        let error = '';

        this.setState({
            submitting: true,
            name: name,
            error: error
        });
        if(form.checkValidity() === true) {
            try {
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
                    name = json.name || '';
                } else if(response.status === 400) {
                    const json = await response.json();
                    if(json.error && json.error.code === 'ss-400-2') {
                        error = 'Unable to reveal your selection.  Please verify the correct password has been entered.';
                    } else {
                        error = 'Unknown error revealing your selection.';
                    }
                } else {
                    error = 'Unknown error revealing your selection.';
                }
            } catch(error) {
                error = 'Unknown error revealing your selection.';
            }
        }

        this.setState({
            validated: true,
            submitting: false,
            name: name,
            error: error
        });
    }

    render() {
        let errorResult = null;
        if(this.state.error) {
            errorResult = <Form.Row>
                <Form.Group as={Col} className="mb-0">
                    <Alert variant="danger">
                        <p className="mb-0">{this.state.error}</p>
                    </Alert>
                </Form.Group>
            </Form.Row>;
        }

        let revealNameResult = null;
        if(this.state.name) {
            revealNameResult = <Form.Row>
                <Form.Group as={Col}>
                    <Alert variant="success" className="reveal-name-form-result">
                        <p className="reveal-name-form__result__name-title">Selected Name</p>
                        <p className="mb-0">{this.state.name}</p>
                    </Alert>
                </Form.Group>
            </Form.Row>;
        }

        return (
            <Form noValidate validated={this.state.validated} onSubmit={this.onRevealNameSubmit.bind(this)}>
                <Form.Row>
                    <Form.Group as={Col} className="mt-3 mb-0">
                        <h2 className="reveal-name-form__header">Reveal your selection</h2>
                    </Form.Group>
                </Form.Row>
                {errorResult}
                <Form.Row>
                    <Form.Group as={Col}>
                        <Form.Control type="hidden" name="selectiontoken" value={this.props.selectionToken}/>
                        <Form.Control type="password" aria-label="Your Password" placeholder="Your Password" name="selectionpassword" required minLength="8" maxLength="20"/>
                        <Form.Text className="text-muted">
                            Please enter the password you used to secure your selection.
                        </Form.Text>
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col}>
                        <Button variant="primary" type="submit" disabled={this.state.submitting}>Reveal Name</Button>
                    </Form.Group>
                </Form.Row>
                {revealNameResult}
            </Form>
        );
    }
}
