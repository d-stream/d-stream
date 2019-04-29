const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

//Delete the entire build folder if it exists

// Getting path of build folder
const buildPath = path.resolve(__dirname, 'build');

// Removing build folder sismilar to rm -r builder
fs.removeSync(buildPath);

// Getting path of Dstream Contract file
const dstreamPath = path.resolve(__dirname, 'contracts', 'DStream.sol');

// Reading content of the contract file
const source = fs.readFileSync(dstreamPath, 'utf8');

// Compiling the source file
const output = solc.compile(source, 1).contracts;

// Create the build directory again
fs.ensureDirSync(buildPath);

/* Writing the contracts as json to the build folder in order to be used without compiling the entrie 
contract again */
for (let contract in output) {
    fs.outputJSONSync(
        path.resolve(buildPath, contract.replace(":", "") + '.json'),
        output[contract]
    );
}