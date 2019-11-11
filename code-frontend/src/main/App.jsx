'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col">
                        <h1>Hello!</h1>
                    </div>
                </div>
            </div>
        );
    }
}

const appContainer = document.getElementById('app');
if(appContainer) {
    ReactDOM.render(<App />, appContainer);
}
