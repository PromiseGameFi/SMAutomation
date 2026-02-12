import solc from 'solc';
import fs from 'fs';
import path from 'path';

const contractPath = path.resolve('contracts', 'ReactiveExecutor.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'ReactiveExecutor.sol': {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
};

console.log('Compiling ReactiveExecutor.sol...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
    output.errors.forEach((err) => {
        console.error(err.formattedMessage);
    });
    if (output.errors.some(x => x.severity === 'error')) process.exit(1);
}

const contract = output.contracts['ReactiveExecutor.sol']['ReactiveExecutor'];
const artifact = {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
};

if (!fs.existsSync('artifacts')) fs.mkdirSync('artifacts');
fs.writeFileSync(
    path.resolve('artifacts', 'ReactiveExecutor.json'),
    JSON.stringify(artifact, null, 2)
);
console.log('Compilation successful! Artifact saved to artifacts/ReactiveExecutor.json');
