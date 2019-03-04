# Course Rating REST-API
This is the back-end for a course rating service, built with Node, Express, and MongoDB. Users can sign up, see a list of courses in the database, add courses to the database, and add reviews for a specific course. JWTs are used to authenticate users and protect certain routes. After registering/logging in a JWT will be sent to the client which is valid for 1 hour. There is also middleware to prevent user's from reviewing their own courses, posting multiple reviews, and server side validation for inputs. Custom aggregations are on the Course and User models. Tests were written with jest and supertest, see the ```test``` directory for more info.

## Heroku
* This app is deployed on heroku [here](https://review-my-course.herokuapp.com/) if you'd like to try it out!
* Note: many of the endpoints require auth so you will need to use a service like postman to send post requests to sign up and create courses/post reviews
* Routes such as ```/api/v1/courses``` and ```/api/v1/courses/:courseId``` do not require auth and can be viewed in the browser

## App Features
### Users
* ```GET /api/v1/users 200``` - Returns a list of users in the DB
* ```POST /api/v1/users 201``` - Creates a user, sends jwt to client
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
* ```POST /api/v1/courses 201``` - Creates a course, sets the Location headers, and returns created status code
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

### Reviews
* ```GET /api/v1/reviews/:reviewId 200``` - Returns the individual review and the author of the review
* ```PUT /api/v1/reviews/:reviewId 204```- Will allow a user to update a review if they are the one that created it. Sets location headers to the review.

### Models
* User model has a pre-save hook that uses ```bcryptjs``` to hash the user's password
* User and Course models have aggregations
* User model has a custom authentication method on statics
    * Attempts to find a user in the DB via emailAddress
    * If a user is found bcrypt compares the password provided with the hashed password in the DB
    * If they match the user document is returned in the callback
    * If they dont match an error is passed to the callback

### Auth
* Json web token should be sent as in the Authorization headers for protected routes:
    ```"Authorization": "yourJWThere"```
* Getting a token:
    * new users should use ```POST api/v1/users```
    * returning users should use ```POST /api/v1/auth``` with their credentials (email and password)
    * tokens are valid for 1 hour
* If a user is authenticated, the userId is added to the request so that each following middleware function has access to it

### Tests
* I used supertest and jest for testing, all tests can be found in the ```test``` directory
* A local test database is used
* To runtests you will need a MongoDB server running locally, then in a separate terminal enter ```npm run test```

### Packages Used
* mongoose
* express
* bcryptjs
* body-parser
* dotenv
* helmet
* express-validator
* validator
* jsonwebtoken
* supertest
* jest

## Author
Frank Rosendorf

