# CRUD API using Node.js
This is a simple CRUD (Create, Read, Update, Delete) API built with Node.js and TypeScript. 

## Installation
1. Clone the repository
2. Install dependencies: npm install
3. Create a .env file in the root directory of project and add: PORT=3000
4. Running the Application:

   - Development mode: 
          - npm run build
          - npm run start:dev
   - Production mode: 
          - npm run build
          - npm run start:prod
   - Multi-process mode: npm run start:multi

## API Endpoints:

GET /api/users - get all users
GET /api/users/{userId} - get a user by ID
POST /api/users - create a new user
PUT /api/users/{userId} - update a user
DELETE /api/users/{userId} - delete a user

## User Format

  {
    "id": "uuid",
    "username": "string",
    "age": "number",
    "hobbies": ["string"]
  }
