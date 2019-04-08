## mysqlDbClass

## Description

This is a file that exports a class database. The purpose of this project is to create a simplified and widely useable class to interact with mysql databases.

## Languages and Modules Used

- Javascript
- DotEnv
- mysql

## Instructions

To use the database class in a node based project, clone database.js into your directory. Make sure you have dotenv and mysql installed for your project (run `npm install mysql dotenv` if you don't). Create a .env file with

```
DB_USER='my_user'
DB_PASS='my_pass'
```

In the file that you are working in, declare your database (or databases) at the top.

```javascript
let Database = require("./database.js");

let myDb = "";

async function initDb() {
  let myDb = new Database("myDb");

  await db.connect();
}

initDb();
```

Utilizing the async/await syntax allows us to avoid callback hell. When this is initialized in this way, the methods on myDb or myOtherDb will be available globally. When running .connect(), the app will connect to the mysql database with the name you passed into the constructor (myDb and myOtherDb in this case). If the database does not exist, it will create a new database with that name.

## Methods

- .create(table, values)
- .read(table, properties, identifiers)
- .update(table, update, key)
- .delete(table, key)
- .makeTable(table, columns, other, otherCol, identifiers)
- .query(command, values)
- .connect()
- .endConnection()
- .getDatabases()

### .create(table, values)

Create takes in the name of the table where you want to insert information, an array of the columns that you want to add to, and the values that you want to add in those columns. Table should be a string, values will be an object with key value pairs of the column and value to be entered. The table you are referencing must already exist in the database. If it does not already exist, you can run .makeTable() first.

### .read(table, properties, identifiers)

Returns all the values as an array. Table should be a string, properties should be an array of the columns you would like returned, identifiers is optional and should contain an object where the {key: value} pairs represent the column and identifier you wish to taget. {unique_column: unique_id}

**This runs async, so you should either use .then().catch() or use the async/await syntax**

`let results = await myDb.read("myTable", ["name"], "id = 5")`
`let results = await myDb.read("myTable", "*", "id = 5")`

### .update(table, update, key)

Updates a given entry in the table identified. Table should be a string, update is an object of key value pairs where the key is the column being updated and the value is what you are changing that column's value to. Key is an object where the key: value pairs represent the column and identifier you wish to taget. {unique_column: unique_id}.

### .delete(table, key)

Deletes an entry in the table identified. Table should be a string. Key is optional, and is the unique identifier of the entry you want to delete as an object where the key: value pairs represent the column and identifier you wish to taget. {unique_column: unique_id}

### .makeTable(table, columns, other, otherCol, identifiers)

Makes a table in the database. Table is a string that will become the table name, columns is an object with key value pairs where they key is the name of the column and the value is the SQL type for that column (e.g. VARCHAR(50) NOT NULL or INT NOT NULL AUTO_INCREMENT PRIMARY KEY). Other, otherCol, and identifiers are optional. Passing in these three arguments allows the user to build a table that is built from an already existing table **in the same database**. Other refers to the name of the existing table and will be a string, otherCol will be an array of strings that represents the columns you want to use from the other table, and identifiers refers to the specific parts you would want to bring into your new table (e.g. "unique_id BETWEEN 1 AND 100")

### .query(command, values)

Primarily an internal function that won't be used by the user. In some cases, if you need to make a query that is otherwise undefinied, you may use .query(). Command will be a string that contains the whole SQL command. Values is optional, and can contain an array of values to be used on SET or UPDATE with the ? in SQL Queries. Returns as a promise

### .connect()

Allows the user to connect to the database. When running .connect(), the app will connect to the mysql database with the name you passed into the constructor (myDb and myOtherDb in this case). If the database does not exist, it will create a new database with that name. .connect() runs async, so it should either be called inside an `async function init() {await db.connect()}` or with the `db.connect().then().catch(err => console.log(err))` syntax

### .endConnection()

Ends the connection with the database. Can be reinitialized later in the program or inside another function with .connect()

### .getDatabases()

Returns all of the mysql databases that exist on the client as a JSON object. **Note:** As this runs async, the data will be available in a .then() call or with the async/await syntax.

## Support

If you come across any bugs or have any suggestions to improve the code, please feel free to comment! I would love to improve the code and increase the usability, readibility, and utility of this to (hopefully) become an npm package.

## Project Status

This project came as a result of a coding bootcamp I am currently attending. I wanted to streamline using databases with their common operations (CRUD) and make it easier for my projects. I would love to expand this and continue to build out the functionality.
