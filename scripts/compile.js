import solc from 'solc';
import fs from 'fs';
import path from 'path';

const contracts = ['ReactiveExecutor.sol', 'TestToken.sol'];
const sources = {};

contracts.forEach(file => {
    const contractPath = path.resolve('contracts', file);
    sources[file] = { content: fs.readFileSync(contractPath, 'utf8') };
});

const input = {
    language: 'Solidity',
    sources: sources,
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
};

console.log('Compiling contracts...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
    output.errors.forEach((err) => {
        console.error(err.formattedMessage);
    });
    if (output.errors.some(x => x.severity === 'error')) process.exit(1);
}

if (!fs.existsSync('artifacts')) fs.mkdirSync('artifacts');

for (const file of contracts) {
    const contractName = file.replace('.sol', '');
    const contract = output.contracts[file][contractName];
    const artifact = {
        abi: contract.abi,
        bytecode: contract.evm.bytecode.object,
    };
    fs.writeFileSync(
        path.resolve('artifacts', `${contractName}.json`),
        JSON.stringify(artifact, null, 2)
    );
    console.log(`Artifact saved: artifacts/${contractName}.json`);
}
console.log('Compilation successful!');
