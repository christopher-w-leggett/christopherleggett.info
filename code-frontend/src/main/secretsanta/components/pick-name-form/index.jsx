'use strict';

const React = require('react');
const { Form, Col, Alert, Button } = require('react-bootstrap');
const css = require('./pick-name-form.scss');
const config = require('../../../config/config.json');
const formUtils = require('../../lib/form-utils');

module.exports = class PickNameForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            validated: false,
            submitting: false,
            name: '',
            error: ''
        };
    }

    async onPickNameSubmit(event) {
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
                    name = json.name || '';
                } else if(response.status === 400) {
                    const json = await response.json();
                    if(json.error && json.error.code === 'ss-400-2') {
                        error = 'Unable to pick a name.  You may only pick a name once.';
                    } else {
                        error = 'Unknown error picking a name.';
                    }
                } else {
                    error = 'Unknown error picking a name.';
                }
            } catch(error) {
                error = 'Unknown error picking a name.';
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

        let pickNameResult = null;
        if(this.state.name) {
            pickNameResult = <Form.Row>
                <Form.Group as={Col}>
                    <Alert variant="success" className="pick-name-form-result">
                        <p className="pick-name-form__result__selection-title">Selected Name</p>
                        <p className="mb-0">{this.state.name}</p>
                    </Alert>
                </Form.Group>
            </Form.Row>;
        }

        return (
            <Form noValidate validated={this.state.validated} onSubmit={this.onPickNameSubmit.bind(this)}>
                <Form.Row>
                    <Form.Group as={Col} className="mt-3 mb-0">
                        <h2 className="pick-name-form__header">Pick a name</h2>
                    </Form.Group>
                </Form.Row>
                {errorResult}
                <Form.Row>
                    <Form.Group as={Col}>
                        <Form.Control type="hidden" name="hattoken" value={this.props.hatToken}/>
                        <Form.Control type="password" aria-label="Create a Password" placeholder="Create a Password" name="selectionpassword" required minLength="8" maxLength="20"/>
                        <Form.Text className="text-muted">
                            Creating a password secures your selection so that only you can reveal the name.  Your password must be 8-20 characters long.
                        </Form.Text>
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col}>
                        <Button variant="primary" type="submit" disabled={this.state.submitting}>Pick a Name</Button>
                    </Form.Group>
                </Form.Row>
                {pickNameResult}
            </Form>
        );
    }
}
