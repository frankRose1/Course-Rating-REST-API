const server = require('../src/index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const {expect} = chai;

chai.use(chaiHttp);

/**
 * You may want to comment out the console.error(err.stack) in "src/handlers/errorHandlers.js" 
 *  it clutters up the console when testing
 */

describe('API Endpoints', function(){
    this.timeout(4000); //taking a while to connect to the DB

    /**
     * The auth token in headers belong to a test user in the db --> emailAddress: joe@smith.com
     */
    describe('/api/users GET', () => {

        //with credentials
        it('should respond with a 200 and the authenticated user\'s document', done => {
            chai.request(server)
            .get('/api/users')
            .set('Authorization', 'Basic am9lQHNtaXRoLmNvbTpwYXNzd29yZA==')
            .end( (err, res) => {
                if (err) {
                    return done(err);
                }
                expect(res).to.have.status(200);
                expect(res.body.emailAddress).to.equal('joe@smith.com');
                expect(res).to.be.json;

                done();
            });
        });

        //without credentials
        it('should respond with a 401 if a request is made with invalid credentials', done => {
            chai.request(server)
                .get('/api/users')
                .set('Authorization', 'notARealUser')
                .end( (err, res) => {
                    expect(res).to.have.status(401);
                    done();
                });
        });
    });


    describe('/api/courses/:courseId PUT', () => {
        it('should respond with a 401 if a user tries to update a course with invalid credentials', done => {
            chai.request(server)
            .put('/api/courses/57029ed4795118be119cc43d')
            .set('Authorization', 'invalidCredentials')
            .end( (err, res) => {
                if (err) {
                    return done(err);
                }

                expect(res).to.have.status(401);
                done();
            })
        });
    });

});
