let mysql = require("mysql");
require("dotenv").config();

class Database {
  /**
   * @class
   * @summary You can run multiple instances at the same time handling multiple SQL servers. You must use .connect() before querying. ES7 async/await syntax preferred:
   * @description async function initDbs() {
   * let db = new Database(my_db);
   * await db.connect()
   * })
   *
   * @param {string} db_name - Name of the database
   */
  constructor(db_name) {
    this.connection = "";
    this.databases = "";
    this.db = db_name;
  }

  /**
   *
   * @param {string} table - Name of the table to insert into
   * @param {[string]} columns - Array containing the names of the columns to insert into
   * @param {[[*]]} values - Array of arrays containing the values to insert
   * @description - Asynchronous function. Call with await db.create(table, columns, values)
   */
  async create(table, columns, values) {
    let dbs = await this.getDatabases();
    let dbTables = Object.keys(dbs[this.db]);

    if (!dbTables.includes(table)) {
      console.log(`${table} does not exist. Please run makeTable`);
      return;
    }

    let sql = `INSERT INTO  ${this.db}.${table} (${columns.join(
      ", "
    )}) VALUES ?`;
    await this.query(sql, [values]).catch(err => console.log(err));
  }

  /**
   *
   * @param {string} table - Name of the table to create
   * @param {{string: string}} columns - Array containing key value pairs of column names and SQL types (e.g. VARCHAR(50) NOT NULL or INT NOT NULL AUTO_INCREMENT PRIMARY KEY). (Use an empty string if you are building from a different table)
   * @param {string} other - OPTIONAL: Existing table to build new table from
   * @param {[string]} otherCol - OPTIONAL: Array of strings that refer to the column names from the existing table. (Will accept *)
   * @param {string} identifiers - OPTIONAL: Logic to go inside a WHERE statement. Should be in form similar to: column_name = value AND column_name = value
   * @description - Asynchronous function. Call with await db.makeTable(table, columns, other, otherCol, specifier). Will only create a table if one with that name does not exist
   */
  async makeTable(table, columns, other, otherCol, identifiers) {
    let tableName = `${this.db}.${table}`;
    if (!other) {
      let rawCol = [];
      for (let key in columns) {
        rawCol.push(`${key} ${columns[key]}`);
      }
      let cols = `(${rawCol.join(", ")})`;
      await this.query(`CREATE TABLE IF NOT EXISTS ${tableName} ${cols}`);
    } else {
      let otherTable = `${this.db}.${other}`;
      let otherCols = "";
      let spec = "";
      if (otherCol) {
        otherCols = `${otherCol.join(", ")}`;
      }
      if (identifiers) {
        spec = ` WHERE ${identifiers}`;
      }
      await this.query(
        `CREATE TABLE IF NOT EXISTS ${tableName} AS SELECT ${otherCols} FROM ${otherTable}${spec}`
      );
    }
  }

  /**
   *
   * @param {string} table - Name of the table you are reading from
   * @param {[string]} properties - Array of strings of the column names you would like to select (will accept * in array)
   * @param {string} identifiers - OPTIONAL: String that defines the where statement. Should be in form similar to: column_name = value AND column_name = value
   * @description - Asynchronous function. Call with await db.read(table, properties, identifiers)
   */
  async read(table, properties, identifiers) {
    let where = "";
    if (identifiers) {
      where = ` WHERE ${identifiers}`;
    }
    let props = properties.join(", ");

    return await this.query(`SELECT ${props} FROM ${this.db}.${table}${where}`);
  }

  /**
   *
   * @param {string} table - Name of the table where the update will be performed
   * @param {{string: *}} update - Array of key value pairs that are the column name and the value to be updated
   * @param {string} key - Value that represents the unique key of the entry that you are updating and its reference column. Should be in the form "column_name = unique_key"
   * @description - Asynchronous function. Call with await db.update(table, update, key)
   */
  async update(table, update, key) {
    // Update is being seen as an object, but when stringified it makes the key/value pair both strings
    let vals = [];
    for (let key in update) {
      let str = `${key} = "${update[key]}"`;
      vals.push(str);
    }

    await this.query(
      `UPDATE ${this.db}.${table} SET ${vals.join(", ")} WHERE ${key}`
    );
  }
  /**
   *
   * @param {string} table - Name of the table where the delete will be preformed
   * @param {string} key - OPTIONAL: Value that represents the unique key of the entry that you are updating and its reference column. Should be in the form "column_name = unique_key".
   * @description - Asynchronous function. Call with await db.update(table, update, key).
   */
  async delete(table, key) {
    if (key) {
      await this.query(`DELETE FROM ${this.db}.${table} WHERE ${key}`);
    } else {
      await this.query(`DELETE FROM ${this.db}.${table}`);
    }
  }

  /**
   *
   * @param {string} command - SQL command if needed for a custom query
   * @param {[[*]]} values - OPTIONAL: Array of arrays for values on an insert or update query
   * @description - Asynchronous function. Call with await db.query(command, values)
   */
  query(command, values) {
    return new Promise((resolve, reject) => {
      if (!values) {
        this.connection.query(command, async (err, results) => {
          if (results) resolve(results);
          reject(err);
        });
      } else {
        this.connection.query(command, values, async (err, results) => {
          if (results) resolve(results);
          reject(err);
        });
      }
    });
  }

  /**
   * @description - Connects to the database defined during the class declaration. If the database  does not exist it  will create a new database with the name you passed in.
   * @note  - This requires a .env file with the mysql username and password stored as DB_USER='your_user' DB_PASS='your_pass' separated only by a newline
   */
  connect() {
    return new Promise((resolve, reject) => {
      this.connection = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASS
      });

      this.connection.connect(async err => {
        if (err) reject(err);
        await this.getDatabases();
        await this.query(`CREATE DATABASE IF NOT EXISTS ${this.db}`).catch(
          err => reject(err)
        );
        resolve();
      });
    });
  }

  /**
   * @description - Ends the connection to the database without removing the object. Could run await Database.connect() later to start a new connection
   */
  endConnection() {
    this.connection.end();
  }

  /**
   * @description - Asynchronous function. Call with await db.getDatabases(). Returns an object with all databases, their tables and columns present on the client
   *
   */
  async getDatabases() {
    let raw = await this.query(
      `SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM information_schema.columns WHERE TABLE_SCHEMA <> 'information_schema' AND TABLE_SCHEMA <> 'sys' AND TABLE_SCHEMA <> 'performance_schema' AND TABLE_SCHEMA <> 'mysql'`
    );
    // console.log(raw);
    let databases = {};
    raw.forEach(async packet => {
      let dbs = Object.keys(databases);
      if (dbs.includes(packet.TABLE_SCHEMA)) {
        if (
          Object.keys(databases[packet.TABLE_SCHEMA]).includes(
            packet.TABLE_NAME
          )
        ) {
          // This needs to be fixed to iterating through the array rather than looking at a single instance
          databases[packet.TABLE_SCHEMA][packet.TABLE_NAME].push({
            [packet.COLUMN_NAME]: `${packet.DATA_TYPE}(${
              packet.CHARACTER_MAXIMUM_LENGTH
            })`
          });
        } else {
          // this should be the same as above, but needs to add it if it didn't previously exist.
          databases[packet.TABLE_SCHEMA][packet.TABLE_NAME] = [
            {
              [packet.COLUMN_NAME]: `${packet.DATA_TYPE}(${
                packet.CHARACTER_MAXIMUM_LENGTH
              })`
            }
          ];
        }
      } else {
        databases[packet.TABLE_SCHEMA] = {
          [packet.TABLE_NAME]: [
            {
              [packet.COLUMN_NAME]: `${packet.DATA_TYPE}(${
                packet.CHARACTER_MAXIMUM_LENGTH
              })`
            }
          ]
        };
      }
    });
    this.databases = databases;
    return databases;
  }
}

module.exports = Database;
