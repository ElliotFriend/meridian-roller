import 'dotenv/config';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { sync as glob } from 'glob';

// Load environment variables starting with PUBLIC_ into the environment,
// so we don't need to specify duplicate variables in .env
for (const key in process.env) {
    if (key.startsWith('PUBLIC_')) {
        process.env[key.substring(7)] = process.env[key];
    }
}

console.log('###################### Initializing ########################');

// Get dirname (equivalent to the Bash version)
const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

// Function to execute and log shell commands
function exe(command) {
    console.log(command);
    execSync(command, { stdio: 'inherit' });
}

function fundAll() {
    exe(`stellar keys generate --overwrite ${process.env.STELLAR_ACCOUNT}`);
}

function removeFiles(pattern) {
    console.log(`remove ${pattern}`);
    glob(pattern).forEach((entry) => rmSync(entry));
}

function buildAll() {
    removeFiles(`${dirname}/target/wasm32-unknown-unknown/release/*.wasm`);
    removeFiles(`${dirname}/target/wasm32-unknown-unknown/release/*.d`);
    exe(`stellar contract build`);
}

function optimize(wasm) {
    exe(`stellar contract optimize --wasm `);
}

function filenameNoExtension(filename) {
    return path.basename(filename, path.extname(filename));
}

function deploy(wasm) {
    const alias = filenameNoExtension(wasm);
    let constructor_args = '';
    switch (alias) {
        case 'dice_game':
            constructor_args = `-- --admin ${process.env.STELLAR_ACCOUNT} --token_address ${process.env.NATIVE_CONTRACT_ADDRESS} --num_faces 6`;
        default:
            '';
    }

    exe(
        `stellar contract deploy --wasm ${wasm} --ignore-checks --alias ${filenameNoExtension(wasm)} ${constructor_args}`
    );
}

function deployAll() {
    const contractsDir = `${dirname}/.stellar/contract-ids`;
    mkdirSync(contractsDir, { recursive: true });

    const wasmFiles = glob(`${dirname}/target/wasm32-unknown-unknown/release/*.wasm`);

    wasmFiles.forEach(deploy);
}

function contracts() {
    const contractFiles = glob(`${dirname}/.stellar/contract-ids/*.json`);

    return contractFiles
        .map((path) => ({
            alias: filenameNoExtension(path),
            ...JSON.parse(readFileSync(path))
        }))
        .filter((data) => data.ids[process.env.STELLAR_NETWORK_PASSPHRASE])
        .map((data) => ({
            alias: data.alias,
            id: data.ids[process.env.STELLAR_NETWORK_PASSPHRASE]
        }));
}

function bind({ alias, id }) {
    exe(
        `stellar contract bindings typescript --contract-id ${id} --output-dir ${dirname}/packages/${alias} --overwrite`
    );

    exe(`cd ${dirname}/packages/${alias} && pnpm install && pnpm run build && cd ../..`);
}

function bindAll() {
    contracts().forEach(bind);
}

function importContract({ alias }) {
    const outputDir = `${dirname}/src/lib/contracts/`;

    mkdirSync(outputDir, { recursive: true });

    const importContent =
        `import * as Client from '${alias}';\n` +
        `import { PUBLIC_STELLAR_RPC_URL } from '$env/static/public';\n\n` +
        `export default new Client.Client({\n` +
        `    ...Client.networks.${process.env.STELLAR_NETWORK},\n` +
        `    rpcUrl: PUBLIC_STELLAR_RPC_URL,\n` +
        `});\n`;

    const outputPath = `${outputDir}/${alias}.ts`;

    writeFileSync(outputPath, importContent);

    console.log(`Created import for ${alias}`);
}

function importAll() {
    contracts().forEach(importContract);
}

// Calling the functions (equivalent to the last part of your bash script)
fundAll();
buildAll();
deployAll();
bindAll();
importAll();
