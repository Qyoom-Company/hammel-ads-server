# API for Ad Campaign management

## Overview

This API allows users to create an account to create ad campaigns that will be reviewed by administration and then if approved will allow the user to pay money to show ads on the company mobile apps that are in use by millions of users.

## API endpoints

The API has the following endpoints available:

### AUTHENTICATION

-   **POST** `/register`: Register a new user account

-   **POST** `/login`: Login to an existing user account

-   **GET** `/reset`: Will send an email with verification token to the user email address to reset the password

-   **POST** `/newpassword`: Will allow to reset the password if specified the correct generated reset token

-   **POST** `/confirm/:token`: Once a new account has been created a confirmation email will be sent to verify the email address of the new user and this is The route responsible for verifying the email address.

-   **POST** `/verify/:token`: Verify a token for a user.

### USER MANAGEMENT

-   **GET** `/users/getuser`: Retrive user information of the current user with specified token

-   **GET** `/users/:id`: Get the user information of the user with specified id

-   **PATCH** `/users/updateuser`: Route responsible for updating user information

-   **POST** `/users/upload-profile-photo`: Route responsible for uploading and saving profile photos to the server

-   **DELETE** `/users/remove-profile-photo`: Route responsible for removing the profile photo of the current user

### CAMPAIGN MANAGEMENT

-   **POST** `/campaigns/`: Route responsible for creating a new campaign

-   **GET** `/campaigns/`: Route responsible for getting all the campaigns

-   **GET** `/campaigns/:id`: Route responsible for getting the campaign with the specified campaign id

-   **PATCH** `/campaigns/:id`: Route responsible for updating the campaign with the specified campaign id

-   **POST** `/campaigns/upload-campaign-photo`: Route responsible for uploading the campaign photo

## Authorization

To use the API, you'll need to include a valid JSON Web Token (JWT) in the `Authorization` header of each request. The JWT can be obtained by logging in to the API.

## Data Model

### User

-   `_id`: String
-   `firstName`: String
-   `lastName`: String
-   `email`: String
-   `phoneNumber`: String
-   `password`: String
-   `photoPath`: String
-   `usertype`: String
-   `isEmailConfirmed`: Boolean
-   `confirmationToken`: String or Null
-   `resetToken`: String or null

### Campaign

-   `_id`: String
-   `title`: String
-   `startDate`: Date
-   `endDate`: Date
-   `budget`: Number
-   `country`: String
-   `photoPath`: String
-   `link`: String
-   `status`: String
-   `userId`: String
-   `clicks`: Number
-   `clickRate`: Number
-   `views`: Number
-   `moneySpent`: Number
-   `createdAt`: Date

## Errors

The API may return the following error codes:

-   `400 Bad Request`: The request body was invalid

-   `401 Unauthorized`: The user is not autorized to perform the action

-   `404 Not Found`: The requested resource was not found

-   `500 Internal Server Error`: An error occured on the server.

## tech stack used:

### main

NodeJS+Express : backend logic
Mongodb + Mongoose : database

### tools

TypeScript : type safety
bcrypt, crypto: for all encryption related operations
body-parser: for formatting and parsing parameters
cors, helmet: for security
jsonwebtoken libary: for generating and managing jwt tokens
path: for managing file names and extensions
ts-node: for running the node app
express-rate-limit: for limiting the number of requests for a user in a time frame specified
express-validator: for validation forms
express-fileupload: for uploading files to the server
dotenv: for configuring the environment variables
nodemailer: for sending emails
@types/\*: for configuring the typescript types for any module
ts-node-dev: for rebuilding the node app on save on development mode
