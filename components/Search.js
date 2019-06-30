import React, { Component } from 'react';
import { Input } from 'semantic-ui-react';
import { Router } from '../routes';
class Search extends Component {
    state = {
        input: ''
    }

    render() {
        return (
            <Input
                onChange={event => this.setState({ input: event.target.value })}
                value={this.state.input}
                action={{
                    icon: {
                        name: "search",
                        style: { margin: "0 auto !important", padding: "0 !important" }
                    },
                    style: { width: "60px" },
                    onClick: () => {
                        Router.pushRoute(`/search/${this.state.input}`);
                    }

                }}

                placeholder="Search..."

            />
        );
    }

}
export default Search
