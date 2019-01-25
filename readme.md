# Course Rating REST-API
This is the back-end for a course rating service, built with Node, Express, and MongoDB. Users can sign up, see a list of courses in the database, add courses to the database, and add reviews for a specific course. JWTs are used to authenticate users and protect certain routes. After registering/logging in a JWT will be sent to the client which is valid for 1 hour. There is also middleware to prevent user's from reviewing their own courses and server side validation for inputs. Custom aggregations are on the Course and User models. Postman was used for testing all routes and manual tests were written for specific user stories for good measure.

## Heroku
* This app is deployed on heroku [here](https://review-my-course.herokuapp.com/) if you'd like to try it out!
* Note: many of the endpoints require auth so you will need to use a service like postman to send post requests to sign up and create courses/post reviews
* Routes such as ```/api/v1/courses``` and ```/api/v1/courses/:courseId``` do not require auth and can be viewed in the browser

## App Features
### Users
* ```GET /api/v1/users 200``` - Returns a list of users in the DB
* ```POST /api/v1/users/register 201``` - Creates a user, sends jwt to client
    * "interests" are optional:
    ```javascript
        {
            "fullName": "Jane Doe",
            "emailAddress": "jane@doe.com",
            "password": "secretPassword123",
            "confirmPassword": "secretPassword123",
            "interests" ["Programming", "Literature"]
        }
    ```
* ```GET /api/v1/users/profile 200 ``` - Returns currently signed in users profile
* ```GET /api/v1/users/interests 200 ``` - Aggregates and returns a list of interests and the number of users with a particular interest
* ```GET /api/v1/users/interests/:interest 200 ``` - Returns users who have the interest provided in the params

### Courses
* ```GET /api/v1/courses 200``` - Returns the Course "_id" and "title" properties for all courses in the DB
* ```GET /api/v1/courses/:courseId 200``` - Returns all Course properties and related documents for the provided course ID
    * auto population and deep population is used to return only the ```fullName```, ```_id``` and ```avatar``` fields on the user who created the course and the users who created the reviews
* ```GET /api/v1/courses/top-rated 200``` - Aggregates the top rated courses and sorts them by average rating. Course needs to have at least 2 reviews to be considered. Also limits results to a max of 10; 
* ```POST /api/v1/courses 201``` - Creates a course, sets the Location header, and returns created status code
    * "steps" and "materialsNeeded" are optional
    ```javascript
        {
            "title": "Painting 101",
            "description": "This course will go over the basics of painting and have you making artwork in no time!",
            "estimatedTime": "2 weeks",
            "materialsNeeded": "Pen, notebook, easle, easle pad, paintbrush, and paint",
            "steps" : [
                {   
                    "stepNumber": 1,
                    "title": "Course Intro",
                    "description": "blah blah blah..."
                },
                {   
                    "stepNumber": 2,
                    "title": "The basics",
                    "description": "blah blah blah..."
                }
            ]
        }
    ```
* ```PUT /api/v1/courses/:courseId 204``` - Updates a course and returns no content
    * checks are made so that only the course owner can update the course
    * "review" is optional:
    ```javascript
        {
            "rating": 5,
            "review": "Best course ever!"
        }
    ```
* ```POST /api/v1/courses/:courseId/reviews 201``` - Creates a review for the specified course ID, sets the Location header to the related course, and returns no content

### Models
* User model has a pre-save hook that uses ```bcryptjs``` to hash the user's password
* User and Course models have aggregations
* User model has a custom authentication method on statics
    * Attempts to find a user in the DB via emailAddress
    * If a user is found bcrypt compares the password provided with the hashed password in the DB
    * If they match the user document is returned in the callback
    * If they dont match an error is passed to the callback

### Permissions/Auth
* Json web token should be sent as a Bearer token in the authorization headers for protected routes:
    ```"Authorization": "Bearer yourJWThere"```
* ```/api/v1/login``` and ```api/v1/users/register - will generate a JWT and send it back to the client. tokens are valid for 1 h
* When a user logs in, if the authenticate method returns the user, the userId is added to the request so that each following middleware function has access to it

### Tests
* Mocha and chai used to test the following user stories: 
    * ```/api/v1/users GET``` If a user is logged in it should respond with a 200 and users in the DB
    * ```/api/v1/users GET``` should respond with a 401 if a request is made with invalid credentials
    * ```/api/v1/courses/:courseId PUT``` should respond with a 401 if a user tries to update a course with invalid credentials

### Packages Used
* mongoose
* express
* bcryptjs
* body-parser
* dotenv
* morgan
* express-validator
* validator
* jsonwebtoken
* passport
* passport-jwt
* mocha
* chai
* chai-http

## Author
Frank Rosendorf

