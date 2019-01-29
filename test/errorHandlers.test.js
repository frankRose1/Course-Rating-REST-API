const request = require('supertest');
const { globalErrorHandler } = require('../src/handlers/errorHandlers');

xdescribe('errorHandlers', () => {
  describe('notFound', () => {
    let server;
    beforeEach(() => {
      server = require('../src/index');
    });

    afterEach(async () => {
      await server.close();
    });

    it('should return a 404 and a message for an unhandled route', async () => {
      const res = await request(server).get('/does/not/exist');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Route not found.');
    });
  });

  describe('globalErrorHandler', () => {
    it('should provide a default status code of 500', () => {
      const error = {};
      const req = {};
      const res = {
        status: function() {
          this.status = error.status || 500;
        },
        json: jest.fn()
      };
      const next = jest.fn();
      globalErrorHandler(error, req, res, next);
      expect(res.status).toBe(500);
    });

    it("should return the error's status code and message if provided", () => {
      const error = {
        status: 400,
        message: 'Bad Request'
      };
      const req = {};
      const res = {
        status: function() {
          this.status = error.status || 500;
        },
        json: function(payload) {
          this.body = payload;
        },
        body: {}
      };
      const next = jest.fn();
      globalErrorHandler(error, req, res, next);
      expect(res.status).toBe(error.status);
      expect(res.body.message).toBe(error.message);
    });
  });
});
