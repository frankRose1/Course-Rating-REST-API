# Course Rating REST-API
This is the back-end for a course rating service, built with Node, Express, and MongoDB. Users can see a list of courses in a database, add courses to the database, and add reviews for a specific course. Certain routes can only be accessed with authorzation granted via custom middleware. There is also middleware to prevent user's from reviewing their own courses. Postman was used for testing all routes and manual tests were written for specific user stories for good measure.

## App Features

### Users
* ```GET /api/users 200``` - Returns the currently authenticated user
* ```POST /api/users 201``` - Creates a user, sets the Location header to "/", and returns no content

### Courses
* ```GET /api/courses 200``` - Returns the Course "_id" and "title" properties
* ```GET /api/course/:courseId 200``` - Returns all Course properties and related documents for the provided course ID
    * auto population and deep population is used to return only the ```fullName``` and ```_id``` fields on the user who created the course and the users who created the reviews
* ```POST /api/courses 201``` - Creates a course, sets the Location header, and returns no content
* ```PUT /api/courses/:courseId 204``` - Updates a course and returns no content
    * checks are made so that only the course owner can update the course
* ```POST /api/courses/:courseId/reviews 201``` - Creates a review for the specified course ID, sets the Location header to the related course, and returns no content

### Models
* User model has a pre-save hook that uses ```bcrypt``` to hash the user's password
* User model has a custom authentication method on statics
    * Attempts to find a user in the DB via emailAddress
    * If a user is found bcrypt compares the password provided with the hashed password in the DB
    * If they match the user document is returned in the callback
    * If they dont match an error is passed to the callback

### Permissions
* Custom middleware will check to see if a user is logged in by parsing the Auth headers
* If the authenticate method returns the user, the user document is added to the request so that each following middleware function has access to it

### Tests
* Mocha and chai used to test the following user stories: 
    * ```/api/users GET``` If a user is authenticated should respond with a 200 and the user's document
    * ```/api/users GET``` should respond with a 401 if a request is made with invalid credentials
    * ```/api/courses/:courseId PUT``` should respond with a 401 if a user tries to update a course with invalid credentials

## Author
Frank Rosendorf

