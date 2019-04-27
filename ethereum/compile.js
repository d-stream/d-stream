const solc = require('solc');
const fs = require('fs-extra');
const path = require('path');


const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const dstreamPath = path.resolve(__dirname, 'contracts', 'DStream.sol');
const source = fs.readFileSync(dstreamPath, 'utf8');
const output = solc.compile(source).contracts;

fs.ensureDirSync(buildPath);

for (let contract in output) {
    fs.outputJSONSync(
        path.resolve(buildPath, contract.replace(":", "") + '.json'),
        output[contract]
    );
}