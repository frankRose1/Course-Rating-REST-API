const request = require('supertest');
const Review = require('../src/models/reviewModel');
const User = require('../src/models/userModel');
const Course = require('../src/models/courseModel');
const { Types } = require('mongoose');

describe('/api/v1/courses/:courseId/reviews', () => {
  let token;
  let server;
  let review;
  let course;
  let user;
  let courseId;
  // this token will provide a different ID than the course owner's ID
  let newToken;

  beforeEach(async () => {
    server = require('../src/index');
    newToken = new User().generateAuthToken();
    user = new User({
      _id: Types.ObjectId(),
      fullName: 'Jane Smith',
      emailAddress: 'jane@aol.com',
      password: 'password'
    });
    token = user.generateAuthToken();
    review = {
      rating: 5,
      review: 'A great course!!'
    };
    course = new Course({
      title: 'First Test Course',
      user: user._id,
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
    });
    courseId = course._id
    await Promise.all([user.save(), course.save()]);
  });

  afterEach(async () => {
    await Promise.all([Course.deleteMany({}), User.deleteMany({}), Review.deleteMany({})]);
    await server.close();
  });

  const exec = () => {
    return request(server)
      .post(`/api/v1/courses/${courseId}/reviews`)
      .send(review)
      .set('Authorization', token);
  }

  describe('POST', () => {
    it('returns a 401 for an unauthorized request', async () => {
      token = '';
      const res = await exec()
      expect(res.status).toBe(401);
    });

    it('returns a 403 if a user is trying to review their own course', async () => {
      const res = await exec();
      expect(res.status).toBe(403);
      expect(res.body.message).toBe(
        "You can't post a review on your own course!"
      );
    });

    it('returns a 404 if a course does not exist', async () => {
      courseId = Types.ObjectId();
      const res = await exec()
      expect(res.status).toBe(404);
    });

    it('returns a 422 if a rating is not provided', async () => {
      // this token will provide a different user than the course owner
      token = newToken
      review.rating = '';
      const res = await exec()
      expect(res.status).toBe(422);
      expect(res.body.errors).toContain(
        'Please leave a rating between 1 and 5.'
      );
    });

    it('returns a 201 for a valid review and sets location headers to the reviewed course', async () => {
      token = newToken
      const res = await exec()
      expect(res.status).toBe(201);
      expect(res.headers.location).toBe(`/api/v1/courses/${courseId}`);
    });

    it('saves the review to the correct course in the database', async () => {
      token = newToken
      await exec();
      const reviewedCourse = await Course.findById(courseId);
      expect(reviewedCourse._id).toEqual(courseId)
      expect(reviewedCourse.reviews).toHaveLength(1)
      expect(reviewedCourse.reviews[0].rating).toBe(review.rating)
      expect(reviewedCourse.reviews[0].review).toBe(review.review)
    })
  });
});
