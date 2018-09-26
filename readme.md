# Course Rating REST-API
This is the back-end for a course rating service, built with Node, Express, and MongoDB. Users can sign up, see a list of courses in the database, add courses to the database, and add reviews for a specific course. Sessions are used to log users in and out as well as to grant permissions to certain routes. There is also middleware to prevent user's from reviewing their own courses. Postman was used for testing all routes and manual tests were written for specific user stories for good measure.

## App Features

### Users
* ```GET /api/users 200``` - Returns a list of users in the DB
* ```POST /api/users/register 201``` - Creates a user, logs the user in, redirects the user to their profile
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
* ```GET /api/users/profile 200 ``` - 

### Courses
* ```GET /api/courses 200``` - Returns the Course "_id" and "title" properties for all courses in the DB
* ```GET /api/course/:courseId 200``` - Returns all Course properties and related documents for the provided course ID
    * auto population and deep population is used to return only the ```fullName``` and ```_id``` fields on the user who created the course and the users who created the reviews
* ```POST /api/courses 201``` - Creates a course, sets the Location header, and returns no content
    * "estimatedTime" and "materialsNeeded" are optional
    ```javascript
        {
            "title": "Painting 101",
            "description": "This course will go over the basics of painting and have you making artwork in no time!",
            "estimatedTime": "2 weeks",
            "materialsNeeded": "Pen, notebook, easle, easle pad, paintbrush, and paint",
            "steps" : [
                {
                    "title": "Course Intro",
                    "description": "blah blah blah..."
                },
                {
                    "title": "The basics",
                    "description": "blah blah blah..."
                }
            ]
        }
    ```
* ```PUT /api/courses/:courseId 204``` - Updates a course and returns no content
    * checks are made so that only the course owner can update the course
    * "review" is optional:
    ```javascript
        {
            "rating": 5,
            "review": "Best course ever!"
        }
    ```
* ```POST /api/courses/:courseId/reviews 201``` - Creates a review for the specified course ID, sets the Location header to the related course, and returns no content

### Models
* User model has a pre-save hook that uses ```bcrypt``` to hash the user's password
* User model has a custom authentication method on statics
    * Attempts to find a user in the DB via emailAddress
    * If a user is found bcrypt compares the password provided with the hashed password in the DB
    * If they match the user document is returned in the callback
    * If they dont match an error is passed to the callback

### Permissions/Auth
* Sessions are used to log users in/out and grant permissions to certain routes
* ```/api/login``` - initializes a session for an existing user and redirect the user to their profile ```/api/users/profile```
* ```/api/logout``` - destroys the session and redirect the user the home page 
* When a user logs in, if the authenticate method returns the user, the userId is added to the request so that each following middleware function has access to it

### Tests
* Mocha and chai used to test the following user stories: 
    * ```/api/users GET``` If a user is logged in it should respond with a 200 and users in the DB
    * ```/api/users GET``` should respond with a 401 if a request is made with invalid credentials
    * ```/api/courses/:courseId PUT``` should respond with a 401 if a user tries to update a course with invalid credentials

### Packages Used
* mongoose
* express
* bcrypt
* body-parser
* connect-mongo
* dotenv
* express-session
* morgan
* validator
* mocha
* chai
* chai-http

## Author
Frank Rosendorf

