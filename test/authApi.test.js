const request = require('supertest')
const User = require('../src/models/userModel');

xdescribe('/api/v1/auth', () => {
  let server;
  let authPayload;
  let user;

  beforeEach(async () => {
    server = require('../src/index')
    authPayload = {
      emailAddress: 'test@test.com',
      password: 'password'
    }
    user = new User({
      fullName: 'Test User',
      emailAddress: 'test@test.com',
      password: 'password'
    });
  })

  afterEach( async() => {
    await User.deleteMany({})
    await server.close()
  })

  const exec = () => {
    return request(server)
      .post('/api/v1/auth')
      .send(authPayload);
  }

  describe('POST /', () => {
    it('should return a 400 for an invalid email', async () => {
      const res = await exec()
      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Invalid email or password')
    })

    it('should return a 400 for an invalid password', async () => {
      user.password = 'invalidPassword'
      await user.save()
      const res = await exec();
      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Invalid email or password')
    })

    it('should return a 200 and a JWT for a valid email/password', async () => {
      await user.save();
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token')
    })
  })
})