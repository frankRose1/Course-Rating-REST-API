const request = require('supertest');
const Course = require('../src/models/courseMode');
let server;

describe('/api/v1/courses', () => {
  beforeEach(() => {
    server = require('../src/index');
  });

  afterEach(async () => {
    server.close();
    await Course.deleteMany({});
  });

  describe('GET /', () => {
    it('should return a list of courses in the database _id and title', async () => {
      const res = await request(server).get('/api/v1/courses');
    });
  });
});
