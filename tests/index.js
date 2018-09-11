const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.should()
chai.use(chaiAsPromised)
const url = 'http://localhost:5000/'
const request = require('supertest')(url)

describe('GraphQL', () => {
  it('returns all users', async (done) => {
    request.post('graphql')
      .send({ query: '{ allUsers { nodes { email } } }'})
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        res.body.data.allUsers.nodes[0].email.should.be.equal('foo2@example.com')
        done()
      })
    })
})
