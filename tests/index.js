const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.should()
chai.expect()
chai.use(chaiAsPromised)
const url = 'http://localhost:5000/'
const request = require('supertest')(url)
const faker = require('faker')

describe('user management', () => {
  it('returns all users', async (done) => {
    request.post('graphql')
      .send({ query: 'mutation { signup(input: { email: "foo2@example.com", password: "123456" }) { clientMutationId } }' })
      .expect(200)
      .send({ query: '{ allUsers { nodes { email } } }'})
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        res.body.data.allUsers.nodes[0].email.should.be.equal('foo2@example.com')
        done()
      })
  })

  it('return correct data for user', async (done) => {
  })

  it('signup works for anyone', async (done) => {
    request.post('graphql')
      .send({ query: 'mutation { signup(input: { email: "foo2@example.com", password: "123456" }) { clientMutationId } }' })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        res.body.data.signup.clientMutationId.should.be.equal(null)
        done()
      })
  })

  it('multi user signup is okay', async (done) => {
    for (const i = 0; i < 100; i++) {
      request.post('graphql')
        .send({ query: `mutation { signup(input: { email: "${faker.internet.email()}", password: "${faker.internet.password()}" }) { clientMutationId } }` })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)
          res.body.data.signup.clientMutationId.should.be.equal(null)
          done()
        })
    }
  })

  it('doesn\'t allow to register for existing user', async (done) => {
    request.post('graphql')
      .send({ query: 'mutation { signup(input: { email: "foo2@example.com", password: "123456" }) { clientMutationId } }'})
      .expect(200)
      .send({ query: 'mutation { signup(input: { email: "foo2@example.com", password: "123456" }) { clientMutationId } }'})
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        res.body.errors.message.should.be.equal("duplicate key value violates unique constraint \"users_email_key\"")
        done()
      })
  })

  it('password reset works for anyone', async (done) => {
  })

  describe('existing users', () => {
    it('user update works', async (done) => {
    })
  
    it('user delete works', async (done) => {
    })

    it('login ok for users', async (done) => {
    })
  
    it('login not ok for non-users', async (done) => {
    })
  
    it('validation works for new users', async (done) => {
    })
  
    it('wrong validation uuids not accepted', async (done) => {
    })

    it('change email available for anyone', async (done) => {
    })

    it('change role not available', async (done) => {
    })

    it('', async (done) => {
    })
  })
})

describe('cms', () => {
})

describe('blockchain', () => {
})
