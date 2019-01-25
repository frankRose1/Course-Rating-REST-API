const request = require('supertest');
const Course = require('../src/models/courseModel');
const User = require('../src/models/userModel');
const { Types } = require('mongoose');
let server;

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

describe('/api/v1/courses', () => {
  beforeEach(() => {
    server = require('../src/index');
  });

  afterEach(async () => {
    await Promise.all([
      Course.collection.deleteMany({}),
      User.collection.deleteMany({})
    ]);
    server.close();
  });

  describe('GET /', () => {
    it('should return a list of courses in the database', async () => {
      await Promise.all([
        User.collection.insertOne(testUser),
        Course.collection.insertMany([testCourse1, testCourse2])
      ]);
      const res = await request(server).get('/api/v1/courses');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(c => c.title === testCourse1.title)).toBeTruthy();
      expect(res.body.some(c => c.title === testCourse2.title)).toBeTruthy();
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
      expect(res.body.message).toBe('Could not find a course with that ID.');
    });
  });
});
