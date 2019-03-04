const auth = require('../src/middleware/auth');
const { Types } = require('mongoose');
const User = require('../src/models/userModel');

describe('middleware', () => {
  afterEach(() => {
    delete process.env.APP_SECRET;
  });
  describe('auth', () => {
    process.env.APP_SECRET = 'testing auth;';
    it('should populate req.user with the decoded token', async () => {
      const user = {
        _id: Types.ObjectId().toHexString()
      };
      const token = new User(user).generateAuthToken();

      const res = {};
      const req = {
        header: jest.fn().mockReturnValue(token)
      };
      const next = jest.fn();
      auth(req, res, next);
      expect(req.user.id).toBe(user._id);
    });
  });
});
