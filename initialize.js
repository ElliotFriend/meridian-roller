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

// variable for later setting pinned version of soroban in "$(dirname/target/bin/soroban)"
const cli = 'stellar';

// Function to execute and log shell commands
function exe(command) {
    console.log(command);
    execSync(command, { stdio: 'inherit' });
}

function fundAll() {
    exe(`${cli} keys generate --overwrite ${process.env.STELLAR_ACCOUNT}`);
}

function removeFiles(pattern) {
    console.log(`remove ${pattern}`);
    glob(pattern).forEach((entry) => rmSync(entry));
}

function buildAll() {
    removeFiles(`${dirname}/target/wasm32-unknown-unknown/release/*.wasm`);
    removeFiles(`${dirname}/target/wasm32-unknown-unknown/release/*.d`);
    exe(`${cli} contract build`);
}

function optimize(wasm) {
    exe(
        `${cli} contract optimize --wasm `
    )

}

function filenameNoExtension(filename) {
    return path.basename(filename, path.extname(filename));
}

function deploy(wasm) {
    exe(
        `${cli} contract deploy --wasm ${wasm} --ignore-checks --alias ${filenameNoExtension(wasm)}`
    );
}

function deployAll() {
    const contractsDir = `${dirname}/.soroban/contract-ids`;
    mkdirSync(contractsDir, { recursive: true });

    const wasmFiles = glob(`${dirname}/target/wasm32-unknown-unknown/release/*optimized.wasm`);

    wasmFiles.forEach(deploy);
}

function contracts() {
    const contractFiles = glob(`${dirname}/.soroban/contract-ids/*.json`);

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
        `${cli} contract bindings typescript --contract-id ${id} --output-dir ${dirname}/packages/${alias} --overwrite`
    );
}

function bindAll() {
    contracts().forEach(bind);
}

function importContract({ alias }) {
    const outputDir = `${dirname}/src/lib/contracts/`;

    mkdirSync(outputDir, { recursive: true });

    const importContent =
        `import * as Client from '${alias}';\n` +
        `import { RPC_URL } from './util';\n\n` +
        `export default new Client.Client({\n` +
        `    ...Client.networks.${process.env.STELLAR_NETWORK},\n` +
        `    rpcUrl: RPC_URL,\n` +
        `});\n`;

    const outputPath = `${outputDir}/${alias}.ts`;

    writeFileSync(outputPath, importContent);

    console.log(`Created import for ${alias}`);
}

function importAll() {
    contracts().forEach(importContract);
}

function init({ id, alias }) {
    if (alias === 'dice_game') {
        exe(
            `${cli} contract invoke --id ${id} -- init --admin ${process.env.STELLAR_ACCOUNT} --token_address CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC --num_faces 6`
        );
    }
}

function initAll() {
    contracts().forEach(init);
}

// Calling the functions (equivalent to the last part of your bash script)
fundAll();
buildAll();
deployAll();
bindAll();
// importAll();
initAll();
