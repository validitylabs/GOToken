module.exports = {
    port: 8555,
    copyNodeModules: false,
    testrpcOptions: '--port 8555 --defaultBalanceEther 1000000', // --defaultBalanceEther: Amount of ether to assign each test account. Default is 100.
    copyPackages: ['openzeppelin-solidity'],
    norpc: false
};
