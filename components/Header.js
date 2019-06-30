import React, { Component } from "react";
import { Menu } from "semantic-ui-react";
import { Link } from "../routes";
import Search from '../components/Search';
import web3 from '../ethereum/web3';
class Header extends Component {
    state = {
        address:''
    }
    componentDidMount = async () => {
        const accounts = await web3.eth.getAccounts();
        this.setState({
            address: accounts[0]
        });

    }
    render() {
        return (
            <Menu borderless style={{ marginBottom: "0px" }}>
                <Link route="/">
                    <a className="item" style={{ fontSize: "20px" }}>
                        DStream
            </a>
                </Link>

                <Menu.Item position="right" style={{ width: "55%" }}>
                    <Search />
                </Menu.Item>

                <Menu.Menu position="right">
                    <Link route="/videos/upload">
                        <a className="item" style={{ fontSize: "17px" }}>
                            Upload Video
              </a>
                    </Link>
                <Link route={`/profile/${this.state.address}`}>
                    <a className="item" style={{ fontSize: "17px" }}>
                        Profile
                    
              </a>
              </Link>

                </Menu.Menu>
            </Menu>
        );
    }
   
};
export default Header;
