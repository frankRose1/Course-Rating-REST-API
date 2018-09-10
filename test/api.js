const server = require('../src/index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const {expect} = chai;
const should = chai.should();

chai.use(chaiHttp);

describe('/api/users GET', () => {
    it('should repond with a 200 and the authenticated user\'s document', done => {
        chai.request(server)
        .get('/api/users')
        .set('Authorization', 'Basic am9lQHNtaXRoLmNvbTpwYXNzd29yZA==')
        .end( (err, res) => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            
            done();
        });
    });
});