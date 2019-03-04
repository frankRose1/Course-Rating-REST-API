const request = require('supertest');
const Review = require('../src/models/reviewModel');
const User = require('../src/models/userModel');
const { Types } = require('mongoose');

/**
 * This endpoint lets users get and update individual reviews
 */
describe('/api/v1/reviews', () => {
  let review;
  let token;
  let server;
  let reviewId;

  beforeEach(async () => {
    server = require('../src/index');
    user = new User({
      _id: Types.ObjectId(),
      fullName: 'Jane Smith',
      emailAddress: 'jane@aol.com',
      password: 'password'
    });
    token = user.generateAuthToken();
    review = new Review({
      rating: 3,
      user: user._id
    });
    reviewId = review._id;
    await Promise.all([user.save(), review.save()]);
  });

  afterEach(async () => {
    await Promise.all([User.deleteMany({}), Review.deleteMany({})]);
    await server.close();
  });

  const execGet = () => {
    return request(server).get(`/api/v1/reviews/${reviewId}`);
  };

  const execPut = () => {
    return request(server)
      .put(`/api/v1/reviews/${reviewId}`)
      .send({ rating: 2 })
      .set('Authorization', token);
  };

  describe('GET :id', () => {
    it('should return a 400 for an invalid ID', async () => {
      reviewId = 'invalidID';
      const res = await execGet();
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('The provided object ID is invalid.');
    });

    it("should return a 404 if a review doesn't exist", async () => {
      reviewId = Types.ObjectId();
      const res = await execGet();
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Review not found.');
    });

    it('should return the appropriate review for a given id', async () => {
      const res = await execGet();
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(reviewId.toString());
    });
  });

  describe('PUT :id', () => {
    it("should return a 404 if a review doesn't exist", async () => {
      reviewId = Types.ObjectId();
      const res = await execPut();
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Review not found.');
    });

    it('should return a 401 user is unauthenticated', async () => {
      token = '';
      const res = await execPut();
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized. No token provided.');
    });

    it('should return a 403 if a user other than the author is making the request', async () => {
      token = new User().generateAuthToken();
      const res = await execPut();
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Only the review author can make updates.');
    });

    it('should return a 204 for a valid request and set location headers to the review', async () => {
      const res = await execPut();
      expect(res.status).toBe(204);
      expect(res.headers.location).toBe(`/api/v1/reviews/${review._id}`);
    });
  });
});
