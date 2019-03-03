const request = require('supertest');
const Course = require('../src/models/courseModel');
const User = require('../src/models/userModel');
const { Types } = require('mongoose');

const testUser = {
  fullName: 'John Smith',
  emailAddress: 'john@smith.com',
  _id: Types.ObjectId(),
  password: 'password',
  confirmPassword: 'password'
};

const testCourse1 = {
  title: 'First Test Course',
  user: testUser._id,
  _id: Types.ObjectId(),
  description: 'The is the first course to be testing the the application!',
  estimatedTime: '2 hours',
  materialsNeeded: 'Code editor, testing documentation',
  steps: [
    {
      stepNumber: 1,
      title: 'Testing your API',
      description: 'First you will need to install dev dependencies...'
    },
    {
      stepNumber: 2,
      title: 'Settting up Testing Environment',
      description:
        'Environment variables in Node can be used to set up a testing env...'
    }
  ]
};

const testCourse2 = {
  title: 'Node & GraphQL',
  user: testUser._id,
  description: "Learn how to start building your API's with Node and GraphQL!",
  estimatedTime: '15 hours',
  steps: [
    {
      stepNumber: 1,
      title: 'What is GraphQL',
      description:
        'GraphQL is a query language that makes querying much cleaner and faster...'
    }
  ]
};

// Missing Fields ==> title, description, estimatedTime
const invalidCourse = {
  user: testUser._id,
  materialsNeeded: 'blah blah',
  steps: [
    {
      stepNumber: 1,
      title: 'What is GraphQL',
      description:
        'GraphQL is a query language that makes querying much cleaner and faster...'
    }
  ]
};

describe('/api/v1/courses', () => {
  let server;
  let token;

  beforeEach(() => {
    server = require('../src/index');
    token = new User().generateAuthToken();
  });

  afterEach(async () => {
    await Promise.all([Course.deleteMany({}), User.deleteMany({})]);
    await server.close();
  });

  describe('GET /', () => {
    it('should return a list of courses in the database', async () => {
      await Promise.all([
        User.collection.insertOne(testUser),
        Course.collection.insertMany([testCourse1, testCourse2])
      ]);
      const res = await request(server).get('/api/v1/courses');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body.some(c => c.title === testCourse1.title)).toBeTruthy();
      expect(res.body.some(c => c.title === testCourse2.title)).toBeTruthy();
    });
  });

  describe('POST /', () => {
    it('should return a 201 and set the location header to the newly created course', async () => {
      const res = await request(server)
        .post('/api/v1/courses')
        .set('Authorization', token)
        .send(testCourse1);
      expect(res.status).toBe(201);
      expect(res.headers.location).toBe(`/api/v1/courses/${testCourse1._id}`);
    });

    it('should return a 401 for an unauthenticated user', async () => {
      token = '';
      const res = await request(server)
        .post('/api/v1/courses')
        .send(testCourse1)
        .set('Authorization', token);
      expect(res.status).toBe(401);
    });

    it('should return a 422 and error messages for a course with invalid fields', async () => {
      const res = await request(server)
        .post('/api/v1/courses')
        .set('Authorization', token)
        .send(invalidCourse);
      expect(res.status).toBe(422);
      expect(res.body.errors).toContain(
        'Please provide a course title at least 5 characters long.'
      );
      expect(res.body.errors).toContain(
        'Please provide a course description at least 10 characters long.'
      );
      expect(res.body.errors).toContain(
        'Please provide an estimated time of course completion.'
      );
    });
  });

  describe('GET /:courseId', () => {
    it('should return a course for a valid ID', async () => {
      const course = new Course(testCourse1);
      const user = new User(testUser);
      await Promise.all([course.save(), user.save()]);
      const res = await request(server).get(`/api/v1/courses/${course._id}`);
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(course._id.toHexString());
      expect(res.body.user._id).toBe(user._id.toHexString());
      expect(res.body.estimatedTime).toBe(course.estimatedTime);
      expect(res.body.title).toBe(course.title);
    });

    it("should return a 404 for a course that doesn't exist", async () => {
      const nonExistingId = Types.ObjectId();
      const res = await request(server).get(`/api/v1/courses/${nonExistingId}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Course not found.');
    });
  });
});
