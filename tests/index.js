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

  it('signup works for anyone', (done) => {
    request.post('graphql')
      .send({ query: `mutation { signup(input: { email: "${faker.internet.email()}", password: "${faker.internet.password()}" }) { clientMutationId } }` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.should.have.property('body');
        res.body.data.should.have.property('signup');
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
    const email = 'foo@example.com';
    const password = 'test';
    request.post('graphql')
      .send({ query: `mutation { signup(input: { email: "${email}", password: "${password}" }) { clientMutationId } }`})
      .expect(200)
      .send({ query: `mutation { signup(input: { email: "${email}", password: "${password}" }) { clientMutationId } }` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.errors[0].should.have.property('message');
        done();
      });
  });

  it('login ok for users', (done) => {
    const email = 'foo2@example.co.uk';
    const password = 'test';

    request.post('graphql')
      .send({ query: `mutation { signup(input: { email: "${email}", password: "${password}" }) { clientMutationId } }` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.data.should.have.property('signup');
      });
    const token = fs.readFileSync(path.resolve(__dirname, './last_validation_token'));
    request.post('graphql')
      .send({ query: `mutation {validate(input: { tok: "${token.toString()}" }) {clientMutationId}}` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.data.should.have.property('validate');
      });
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
    const password = 'test';
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
    const password = 'test';
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
  it('password reset works for user', (done) => {
    request.post('graphql')
      .send({ query: 'mutation { signup(input: { email: "foo60@example.com", password: "123456" }) { clientMutationId } }' })
      .expect(200)
      //validate
      .send({ query: 'mutation {login(input: {email: "foo6@example.com", password: "123456"}) {json}}' })
      .expect(200)
      //request
      .send({ query: 'mutation {requestPasswordReset(input: {email: "foo2@example.com"}) {clientMutationId}}' })
      .expect(200)
      //reset
      .send({ query: 'mutation {resetPassword(input: {email: "foo2@example.com", token:"df82e332-623a-41ab-a39e-91d8e67b5b3a", password:"615555321"}) {clientMutationId}}' })
      .expect(200)
      //try to login with new pass
      .send({ query: 'mutation {login(input: {email: "foo6@example.com", password: "123456"}) {json}}' })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        res.login.json.should.have.property('token')
        done()
      })
  })
  */
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
