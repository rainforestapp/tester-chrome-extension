import expect from 'expect';

describe('tester chrome extension', () => {
  describe('startApp', ()=> {
    it('fires when chrome extension gets message with worker uuid and endpoint');

    it('sets the infoHash uuid and endpoint');

    it('sends back a response with {ok: true}');

    it('saves user info in chrome storage');

    it('fires setChecking');
  });

  describe('togglePolling', () => {
    it('sets the badge colour to red and the badge text to OFF if disabled');

    it('fires checkForWork if enabled');
  });
});
