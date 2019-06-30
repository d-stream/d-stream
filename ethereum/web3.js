const Web3 = require('web3');
const axios = require('axios');
const HDWalletProvider = require('truffle-hdwallet-provider');
let web3;
//checking if the window variable is defined or not
//if it's defined, it will return an object
// then check if metamask injected web3 to window object
if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {


    (async () => {
        web3 = new Web3(window.web3.currentProvider);
        const accounts = await web3.eth.getAccounts();
        await axios({
            url: `http://localhost:4000/db/register`,
            method: 'post',
            data: {

                address: accounts[0]
            }
        });



    })();

} else {
    //We are on the server *OR* the user is not running metamask

    //set up or own provider that connects 
    //to the rinkeby test network through infura.io

    //this is just a gateway to access rinkeby network, no
    //problem in making it available to the public since it's free
    const provider = new HDWalletProvider(
        "auto sister sound rigid impose above assault hamster resource evidence gentle material",
        "https://rinkeby.infura.io/v3/f53e99e4b51a45859fcc2c0e15bb51da"
    );
    web3 = new Web3(provider);
    let acc;
    (async () => {
        acc = await web3.eth.getAccounts();
    })();
}

module.exports = web3;