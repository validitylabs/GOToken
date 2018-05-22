const GotToken = artifacts.require('GotToken');

contract('GotToken', function(accounts) {
  it("should assert true", function(done) {
    var got_token = GotToken.deployed();
    assert.isTrue(true);
    done();
  });
});
