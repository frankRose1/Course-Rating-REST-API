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

const invalidUser = {
  fullName: 'Joe Shmoe',
  emailAddress: 'notAnEmail',
  password: 'password',
  confirmPassword: 'lol'
};

describe('/api/v1/users', () => {
  beforeEach(() => {
    server = require('../src/index');
  });

  afterEach(async () => {
    await User.deleteMany({});
    server.close();
  });

  describe('GET /', () => {
    it('returns a list of users excluding the password and email', async () => {
      await User.collection.insertMany([testUser1, testUser2]);
      const token = new User().generateAuthToken();
      const res = await request(server)
        .get('/api/v1/users')
        .set('Authorization', token);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].password).toBeUndefined();
      expect(res.body[0].emailAddress).toBeUndefined();
    });

    it('returns a 401 for unauthenticated users', async () => {
      const res = await request(server)
        .get('/api/v1/users')
        .set('Authorization', '');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /', () => {
    it('should return a 201 and a token for a valid register', async () => {
      const res = await request(server)
        .post('/api/v1/users')
        .send(testUser1);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
    });

    it('should return a 422 for invalid inputs', async () => {
      const res = await request(server)
        .post('/api/v1/users')
        .send(invalidUser);
      expect(res.status).toBe(422);
    });

    it('should return a 422 and error message if an email is already in use', async () => {
      await new User(testUser1).save();
      const userWithEmail = {
        fullName: 'New User',
        emailAddress: testUser1.emailAddress,
        password: 'password',
        confirmPassword: 'password'
      };
      const res = await request(server)
        .post('/api/v1/users')
        .send(userWithEmail);
      expect(res.status).toBe(422);
      expect(res.body.errors).toContain(
        'A user with that email address already exists!'
      );
    });
  });

  describe('GET /profile', () => {
    it('should return the current users profile', async () => {
      const user = await new User(testUser1).save();
      const token = user.generateAuthToken();
      const res = await request(server)
        .get('/api/v1/users/profile')
        .set('Authorization', token);
      expect(res.status).toBe(200);
      expect(res.body.currentUser).toHaveProperty(
        'fullName',
        testUser1.fullName
      );
      expect(res.body.currentUser).toHaveProperty(
        'interests',
        testUser1.interests
      );
    });
  });
});
