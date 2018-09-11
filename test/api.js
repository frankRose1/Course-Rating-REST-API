const server = require('../src/index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const {expect} = chai;
const should = chai.should();

chai.use(chaiHttp);

describe('API Endpoints', function(){
    this.timeout(4000); //taking a while to connect to the DB

    describe('/api/users GET', () => {
        it('should respond with a 200 and the authenticated user\'s document', done => {
            chai.request(server)
            .get('/api/users')
            .set('Authorization', 'Basic am9lQHNtaXRoLmNvbTpwYXNzd29yZA==')
            .end( (err, res) => {
                if (err) {
                    return done(err);
                }
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                
                done();
            });
        });
    });

    describe('/api/courses/:courseId PUT', () => {
        it('should respond with a 401 if a user has invalid credentials', done => {
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
