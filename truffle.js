//require('dotenv').config();
require('babel-register')({
  ignore: /node_modules\/(?!openzeppelin-solidity)/
});
require('babel-polyfill');

module.exports = {
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },   
    QA: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "3",
      gas: 2900000
    }
  }
};