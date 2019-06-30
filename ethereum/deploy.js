//NOTE!
//AN ALREADY EXISTING CONTARCT IS CREATED
//THE ADDRESS IS IN THE FILE NAMED 'ADDRESS'
//ONLY EXECUTE THIS CODE TO CREATE A NEW CONTRACT INSTANCE
//DO NOT FORGET TO ADD YOUR METAMASK SECRET PHRASE
//AND YOUR INFURA GATEWAY TO RINKEBY NETWORK 



const Web3 = require('Web3');
const compiledDstream = require('./build/DStream.json');
const HDWalletProvider = require('truffle-hdwallet-provider');
const provider = new HDWalletProvider(
    'auto sister sound rigid impose above assault hamster resource evidence gentle material',
    'https://rinkeby.infura.io/v3/f53e99e4b51a45859fcc2c0e15bb51da'
);

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);

    console.log(`Attempting to deploy from ${accounts[0]}`);
    const result = await new web3.eth.Contract(JSON.parse(compiledDstream.interface))
        .deploy({ data: compiledDstream.bytecode })
        .send({ from: accounts[0], gas: '1500000' });

    console.log(`Contract successfully deployed on: ${result.options.address}`);

};
deploy();