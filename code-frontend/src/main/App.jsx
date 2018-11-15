'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <h1>Hello From React</h1>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
