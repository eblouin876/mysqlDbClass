## mysqlDbClass

## Description
This is a file that exports a class database. The purpose of this project is to create a simplified and widely useable class to interact with mysql databases. 

## Languages and Modules Used
* Javascript
* DotEnv
* mysql

## Instructions
To use the database class in a node based project, clone database.js into your directory. Make sure you have dotenv and mysql installed for your project (run ```npm install mysql dotenv``` if you don't). Create a .env file with 
```
DB_USER='my_user'
DB_PASS='my_pass'
```
In the file that you are working in, declare your database (or databases) at the top.
```javascript
let Database = require('./database.js')

async function initDbs() {

let myDb = new Database('myDb')
let myOtherDb new Database('myOtherDb')

await myDb.connect()
await myOtherDb.connect()
}

initDbs()
```
Utilizing the async/await syntax allows us to avoid callback hell. When this is initialized in this way, the methods on myDb or myOtherDb will be available globally. When running .connect(), the app will connect to the mysql database with the name you passed into the constructor (myDb and myOtherDb in this case). If the database does not exist, it will create a new database with that name. 

## Methods
* .create(table, columns, values)
* .read(table, properties, identifiers)
* .update(table, update, keys)
* .delete(table, key
* .makeTable(table, columns,  other, otherCol, identifiers)
* .query(command, values)
* .connect()
* .endConnection()
* .getDatabases()

# .create(table, columns, values)
Create takes in the name of the table where you want to insert information, the columns that you want to add to, and the values that you want to add in those columns. Table should be a string, where columns and valuse will be arrays of the same length. The table you are referencing must already exist in the database. If it does not already exist, you can run .makeTable() first.

## Support
If you come across any bugs or have any suggestions to improve the code, please feel free to comment! I would love to improve the code and increase the usability, readibility, and utility of this to (hopefully) become an npm package. 

## Project Status
This project came as a result of a coding bootcamp I am currently attending. I wanted to streamline using databases with their common operations (CRUD) and make it easier for my projects. I would love to expand this and continue to build out the functionality. 
