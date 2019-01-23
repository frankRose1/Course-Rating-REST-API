const User = require('../src/models/userModel');
const request = require('supertest');
let server;

const testUser1 = {
  fullName: 'John Doe',
  emailAddress: 'john@doe.com',
  password: 'password',
  confirmPassword: 'password',
  interests: ['Art', 'Fitness']
};

const testUser2 = {
  fullName: 'Jane Doe',
  emailAddress: 'jane@doe.com',
  password: 'password',
  confirmPassword: 'password',
  interests: ['Fitness', 'Music']
};

describe('/api/v1/users', () => {
  beforeEach(() => {
    server = require('../src/index');
  });

  afterEach(async () => {
    await User.remove({});
    server.close();
  });

  describe('GET /', () => {
    it('returns a list of users excluding the password and email', async () => {
      await User.collection.insertMany([testUser1, testUser2]);
      const res = await request(server).get('/api/v1/users');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });
  });
});
