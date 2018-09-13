const fs = require('fs');
const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const should = chai.should();
const expect = chai.expect();
chai.use(chaiAsPromised);
const url = 'http://localhost:5000/';
const request = require('supertest')(url);
const faker = require('faker');
const apiBenchmark = require('api-benchmark');
const { read } = require('./fileFunctions');

describe('user management', () => {
  it('returns all users', (done) => {
    request.post('graphql')
      .send({ query: `mutation { signup(input: { email: "${faker.internet.email()}", password: "${faker.internet.password()}" }) { clientMutationId } }` })
      .expect(200)
      .send({ query: '{ allUsers { nodes { email } } }'})
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.should.have.property('body');
        res.body.data.allUsers.should.have.property('nodes');
        done();
      });
  });

  it('multi user signup is okay', (done) => {
    for (let i = 0; i < 100; i++) {
      request.post('graphql')
        .send({ query: `mutation { signup(input: { email: "${faker.internet.email()}", password: "${faker.internet.password()}" }) { clientMutationId } }` })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.property('body');
          res.body.data.should.have.property('signup');
        });
    }
    done();
  });

  it('doesn\'t allow to register for existing user', (done) => {
    const email = 'foo2@example.co.uk';
    const password = 'test';
    request.post('graphql')
      .send({ query: `mutation { signup(input: { email: "${email}", password: "${password}" }) { clientMutationId } }` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.errors[0].should.have.property('message');
        done();
      });
  });

  it('signup works', (done) => {
    const email = 'foo2@example.co.uk';
    const password = 'test';
    request.post('graphql')
      .send({ query: `mutation { signup(input: { email: "${email}", password: "${password}" }) { clientMutationId } }` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.should.have.property('body');
        res.body.data.should.have.property('signup');
        done();
      });
  });

  it('validation works', (done) => {
    const token = fs.readFileSync(path.resolve(__dirname, './last_validation_token'));
    request.post('graphql')
      .send({ query: `mutation {validate(input: { tok: "${token.toString()}" }) {clientMutationId}}` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.data.should.have.property('validate');
      });
  });

  it('login works', (done) => {
    const email = 'foo2@example.co.uk';
    const password = 'test';
    request.post('graphql')
      .send({ query: `mutation {login(input: {email: "${email}", password: "${password}"}) {json}}` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.login.json.should.have.property('token');
        done();
      });
  });

  it('password reset request works', (done) => {
    const email = 'foo2@example.co.uk';
    request.post('graphql')
      .send({ query: `mutation {requestPasswordReset(input: {email: "${email}"}) {clientMutationId}}` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        console.log('res.body.requestPasswordReset');
        console.log(res.body.requestPasswordReset);
        res.body.requestPasswordReset.should.have.property('token');
        done();
      });
  });

  it('password reset works', (done) => {
    const email = 'foo2@example.co.uk';
    const newPassword = 'test2';
    const token = fs.readFileSync(path.resolve(__dirname, './last_reset_token'));

    request.post('graphql')
      .send({ query: `mutation {resetPassword(input: {email: "${email}", token:"${token}", password:"${newPassword}"}) {clientMutationId}}` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        console.log('res.body.resetPassword');
        console.log(res.body.resetPassword);
        res.body.resetPassword.should.have.property('token');
        done();
      });
  });

  it('login works after password reset', (done) => {
    const email = 'foo2@example.co.uk';
    const password = 'test2';
    request.post('graphql')
      .send({ query: `mutation {login(input: {email: "${email}", password: "${password}"}) {json}}` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.login.json.should.have.property('token');
        done();
      });
  });

  it('login not ok for non-users', (done) => {
    request.post('graphql')
      .send({ query: `mutation {login(input: {email: "${faker.internet.email()}", password: "${faker.internet.password()}"}) {json}}` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.errors[0].message.should.be.equal('Invalid role.');
        done();
      });
  });

  it('wrong validation uuids not accepted', (done) => {
    request.post('graphql')
      .send({ query: 'mutation {validate(input: { tok: "a31938c6-b29d-4413-a4a4-c0c844356527" }) {clientMutationId}}' })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.errors[0].message.should.be.equal('No such validation token.');
        done();
      });
  });

  it('user update works', (done) => {
    const email = 'foo2@example.co.uk';
    const password = 'test2';
    request.post('graphql')
      .send({ query: `mutation {updateUserInfo(input: {mail: "${email}", password: "${password}", firstname: "First", lastname: "Last", _about: "About me"}) {clientMutationId}}` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.data.should.have.property('updateUserInfo');
        done();
      });
  });

  it('user delete works', (done) => {
    const email = 'foo2@example.co.uk';
    const password = 'test2';
    request.post('graphql')
      .send({ query: `mutation {deleteUserAccount(input: {mail: "${email}", password: "${password}"}) {clientMutationId}}` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.login.json.should.have.property('token');
        done();
      });
  });

  /*
  describe('existing users', () => {
    it('change email available for anyone', (done) => {
    })

    it('change role not available for ordinary users', (done) => {
    })
  })*/
});

/*describe('cms', () => {
})

describe('blockchain', () => {
})
*/

const service = {
  server: `${url}`,
};

const routes = {
  route: { name: 'Registration', route: 'graphql', method: 'post', data: { query: `mutation { signup(input: { email: "${faker.internet.email()}", password: "${faker.internet.password()}" }) { clientMutationId } }` } },
};

apiBenchmark.measure(service, routes, (err, res) => {
  console.log(`Mean for ${res.server.route.name}: ${res.server.route.stats.mean}`);
});
