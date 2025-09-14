# Etch

Immutable notes on the blockchain.  
Etch is a simple React web-app that allows anyone to make permanent,immutable notes on any EVM chain.

## Installation

- Deploy the Etch.sol contract present in `/contracts` using [Foundry](https://getfoundry.sh/)/[Hardhat](https://hardhat.org/) or [Remix](https://remix.ethereum.org/) on a network of your choice (I'm using [Base Sepolia](https://docs.base.org/base-chain/quickstart/connecting-to-base)).
- Replace `0x` with your deployed contract address in `src/App.jsx`.
- Install dependencies with `npm install`.
- Run the app with `npm run dev`.

## TODO

- ~~Fetch notes~~
- Pagination
- Search notes
- View other users' notes
- Themes
