// ********************** Initialize server **********************************

const server = require('../index.js');

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

// ********************************************************************************
describe('Testing Add User API', () => {
    it('should register a new user successfully and redirect to /login', done => {
      chai
        .request(server)
        .post('/register')
        .send({ fullname: 'Kayo', username: 'nvm', password: 'password123' })
        .redirects(0)
        .end((err, res) => {
          expect(res).to.have.status(302);
          expect(res.headers['location']).to.include('/login'); // Check for path inclusion
          done();
        });
    });
  
    it('should fail when the username is already taken and redirect to /register', done => {
      chai
        .request(server)
        .post('/register')
        .send({ fullname: 'MJ', username: 'nvm', password: 'password123' }) // Use the same username for failure
        .redirects(0)
        .end((err, res) => {
          expect(res).to.have.status(302);
          expect(res.headers['location']).to.include('/register'); // Check for path inclusion
          done();
        });
    });
  });



// *********************** TODO: WRITE 2 UNIT TESTCASES PART C **************************






  describe('Testing Login API', () => {
    it('should log in a user successfully and redirect to /dashboard', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: 'nvm', password: 'password123' }) // Correct username and password
        .redirects(0) // Ensure no further redirects happen
        .end((err, res) => {
          expect(res).to.have.status(302); // Expect a redirect on successful login
          expect(res.headers['location']).to.include('/home'); // Check for path inclusion in the redirect URL
          done();
        });
    });
  
    it('should fail when the username or password is incorrect and redirect to /login', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: 'nvm', password: 'wrongPassword' }) // Incorrect password
        .redirects(0)
        .end((err, res) => {
          expect(res).to.have.status(302); // Expect a redirect due to invalid credentials
          expect(res.headers['location']).to.include('/login'); // Check for path inclusion in the redirect URL
          done();
        });
    });
  });
  
  describe('Testing Profile Update API', () => {
    // Mock login to set session user for testing
    let agent = chai.request.agent(server);
  
    before(done => {
      agent
        .post('/login')
        .send({ username: 'nvm', password: 'password123' }) // Replace with a valid username and password
        .end((err, res) => {
          expect(res).to.have.status(302); // Expect a redirect on successful login
          done();
        });
    });
  
    it('should update the password successfully and redirect to /home', done => {
      agent
        .post('/profile') // Assuming you changed your app.put() to app.post()
        .send({ newPassword: 'newPassword123' })
        .redirects(0)
        .end((err, res) => {
          expect(res).to.have.status(302); // Expect a redirect after successful update
          expect(res.headers['location']).to.include('/home'); // Verify redirect location
          done();
        });
    });
  
    it('should fail when no new password is provided and return a 400 status', done => {
      agent
        .post('/profile')
        .send({}) // Send an empty body to simulate missing password
        .end((err, res) => {
          expect(res).to.have.status(400); // Expect a bad request status
          assert.strictEqual(res.text, 'Invalid request: Missing username or password'); // Match error message
          done();
        });
    });
  });
