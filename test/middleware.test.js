const authenticate = require('../src/middleware/auth');
const { Types } = require('mongoose');
const User = require('../src/models/userModel');

xdescribe('middleware', () => {
  afterEach(() => {
    delete process.env.APP_SECRET;
  });
  describe('authenticate', () => {
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
      authenticate(req, res, next);
      expect(req.user.id).toBe(user._id);
    });
  });
});
