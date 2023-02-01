# API for Ad Campaign management

## overview

this api allows users to create an account to create ad campaigns that will be reviewed by administration and then if approved will allow the user to pay money to show ads on the company mobile apps that are in use by millions of users.

## API endpoints

the api has the following endpoints available:

### AUTHENTICATION

-   **POST** `/register`: Register a new user account

-   **POST** `/login`: Login to an existing user account

-   **GET** `/reset`: will send an email with verification token to the user email address to reset the password

-   **POST** `/newpassword`: will allow to reset the password if specified the correct generated reset token

-   **POST** `/confirm/:token`: once a new account has been created a confirmation email will be sent to verify the email address of the new user and this is the route responsible for verifying the email address.

-   **POST** `/verify/:token`: verify a token for a user.

### USER MANAGEMENT

-   **GET** `/users/getuser`: retrive user information of the current user with specified token

-   **GET** `/users/:id`: get the user information of the user with specified id

-   **PATCH** `/users/updateuser`: route responsible for updating user information

-   **POST** `/users/upload-profile-photo`: route responsible for uploading and saving profile photos to the server

-   **DELETE** `/users/remove-profile-photo`: route responsible for removing the profile photo of the current user

### CAMPAIGN MANAGEMENT

-   **POST** `/campaigns/`: route responsible for creating a new campaign

-   **GET** `/campaigns/`: route responsible for getting all the campaigns

-   **GET** `/campaigns/:id`: route responsible for getting the campaign with the specified campaign id

-   **PATCH** `/campaigns/:id`: route responsible for updating the campaign with the specified campaign id

-   **POST** `/campaigns/upload-campaign-photo`: route responsible for uploading the campaign photo

## Authorization

To use the API, you'll need to include a valid JSON Web Token (JWT) in the `Authorization` header of each request. The JWT can be obtained by logging in to the API.

## Data Model

### User

-   `_id`: string
-   `firstName`: string
-   `lastName`: string
-   `email`: string
-   `phoneNumber`: string
-   `password`: string
-   `photoPath`: string
-   `usertype`: string
-   `isEmailConfirmed`: boolean
-   `confirmationToken`: string or null
-   `resetToken`: string or null

### Campaign

-   `_id`: string
-   `title`: string
-   `startDate`: date
-   `endDate`: date
-   `budget`: number
-   `country`: string
-   `photoPath`: string
-   `link`: string
-   `status`: string
-   `userId`: string
-   `clicks`: number
-   `clickRate`: number
-   `views`: number
-   `moneySpent`: number
-   `createdAt`: date

## Errors

The API may return the following error codes:

-   `400 Bad Request`: The request body was invalid

-   `401 Unauthorized`: The user is not autorized to perform the action

-   `404 Not Found`: the requested resource was not found

-   `500 Internal Server Error`: An error occured on the server.

## tech stack used:

NodeJS+Express
TypeScript
Mongodb + Mongoose
