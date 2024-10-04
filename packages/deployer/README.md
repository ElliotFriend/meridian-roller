# deployer JS

JS library for interacting with [Soroban](https://soroban.stellar.org/) smart contract `deployer` via Soroban RPC.

This library was automatically generated by Soroban CLI using a command similar to:

```bash
soroban contract bindings ts \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015" \
  --contract-id CAPAFWGKU4OX66NT53DTT5NOH6NPES5ZKBNPUVINUH6P562NAQ2MNPOD \
  --output-dir ./path/to/deployer
```

The network passphrase and contract ID are exported from [index.ts](./src/index.ts) in the `networks` constant. If you are the one who generated this library and you know that this contract is also deployed to other networks, feel free to update `networks` with other valid options. This will help your contract consumers use this library more easily.

# To publish or not to publish

This library is suitable for publishing to NPM. You can publish it to NPM using the `npm publish` command.

But you don't need to publish this library to NPM to use it. You can add it to your project's `package.json` using a file path:

```json
"dependencies": {
  "deployer": "./path/to/this/folder"
}
```

However, we've actually encountered [frustration](https://github.com/stellar/soroban-example-dapp/pull/117#discussion_r1232873560) using local libraries with NPM in this way. Though it seems a bit messy, we suggest generating the library directly to your `node_modules` folder automatically after each install by using a `postinstall` script. We've had the least trouble with this approach. NPM will automatically remove what it sees as erroneous directories during the `install` step, and then regenerate them when it gets to your `postinstall` step, which will keep the library up-to-date with your contract.

```json
"scripts": {
  "postinstall": "soroban contract bindings ts --rpc-url https://soroban-testnet.stellar.org --network-passphrase \"Test SDF Network ; September 2015\" --id CAPAFWGKU4OX66NT53DTT5NOH6NPES5ZKBNPUVINUH6P562NAQ2MNPOD --name deployer"
}
```

Obviously you need to adjust the above command based on the actual command you used to generate the library.

# Use it

Now that you have your library up-to-date and added to your project, you can import it in a file and see inline documentation for all of its exported methods:

```js
import { Contract, networks } from "deployer"

const contract = new Contract({
  ...networks.futurenet, // for example; check which networks this library exports
  rpcUrl: '...', // use your own, or find one for testing at https://soroban.stellar.org/docs/reference/rpc#public-rpc-providers
})

contract.|
```

As long as your editor is configured to show JavaScript/TypeScript documentation, you can pause your typing at that `|` to get a list of all exports and inline-documentation for each. It exports a separate [async](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) function for each method in the smart contract, with documentation for each generated from the comments the contract's author included in the original source code.