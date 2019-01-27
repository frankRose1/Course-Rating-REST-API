const request = require('supertest')
const Review = require('../src/models/reviewModel')
const User = require('../src/models/userModel')
const Course = require('../src/models/courseModel')
const {Types} = require('mongoose')

describe('/api/v1/courses/:courseId/reviews', () => {
  let token;
  let server;
  let review;
  let course;
  let user;

  beforeEach(async () => {
    server = require('../src/index')
    user = new User({
      _id: Types.ObjectId(),
      fullName: 'Jane Smith',
      emailAddress: 'jane@aol.com',
      password: 'password'
    })
    token = user.generateAuthToken()
    review = {
      rating: 5,
      review: 'A great course!!'
    }
    course = new Course ({
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
    await Promise.all([user.save(), course.save()])
  })

  afterEach(async () => {
    await Promise.all([
      Course.collection.deleteMany({}),
      User.collection.deleteMany({})
    ])
    await server.close()
  })

  describe('POST', () => {
    it('returns a 401 for an unauthorized request', async() => {
      token = ''
      const res = await request(server)
        .post(`/api/v1/courses/${course._id}/reviews`)
        .send(review)
        .set('Authorization', token)
      expect(res.status).toBe(401)
    });

    it('returns a 403 if a user is trying to review their own course', async ()=> {
      const res = await request(server)
        .post(`/api/v1/courses/${course._id}/reviews`)
        .send(review)
        .set('Authorization', token)
      expect(res.status).toBe(403)
      expect(res.body.message).toBe('You can\'t post a review on your own course!')
    })

    it('returns a 404 if a course does not exist', async () => {
      const res = await request(server)
        .post(`/api/v1/courses/${Types.ObjectId()}/reviews`)
        .send(review)
        .set('Authorization', token)
      expect(res.status).toBe(403)
    })
  })
})