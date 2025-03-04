import Fastify from "fastify";
import Database from "better-sqlite3";
import fs from 'fs';
import path from 'path';

//@TODO reprendre l'encode et le decode des filtres
//@TODO DOCUMENTATION DES ENDPOINTS
/*
* GET     /databases/list	                                   liste des bases de données
* POST  	/databases/:database/resetmap	                     Réinitialiser le container map() de la base de données // body: {database: string}
* POST  	/databases/:database                               Créer une base de données // body: {database: string}
* POST    /databases/:database/table/:table/structure_table  Modifier la stucture base de données // body: {database: string, table: string, columns: Column[], foreignKeys?: ForeignKeys[]}
* POST    /databases/:database/table/:table/rows             insérer une ligne dans une table // body: {...}, query: {database: string, table: string}
* GET     /databases/:database/joinedtable                   Effectuer une jointure avec des paramètres de requête // query: {database: string, table1: string, table2: string, table1joinColumn: string,table2joinColumn: string, filters: [{column:string ,operator: string, value: string }] as string, limit: string, offset: string}
* GET     /databases/:database/table/:table                  Lire des données (avec query params) // query: {database: string, table: string, filters: JSON.string, limit: string, offset: string, }
* PUT     /databases/:database/table/:table/id/:id                  Mettre à jour un enregistrement // body: {database: string, table: string, id: string, data: any}
* DELETE  /databases/:database/table/:table/delete/:id       Supprimer un enregistrement 
* DELETE  /databases/:database/table/:table/deleterows       Supprimer plusieurs enregistrements // query: {filters: JSON.string, limit: string, offset: string}
* GET     /databases/:database/table/:table/structure_table  Vérifier la structure d'une table 
* DELETE  /databases/:database/table/:table/structure_table  Supprimer la structure d'une table //@TODO not implemented yet 
* 
* /databases/:database/table/:table/query
*/

//initialisation de la base de données en mémoire
//database en mémoire <=> databases[':memory:'] = new Database(':memory:');
const databases = new Map();

const listDatabases = (directory: string): string[] => {
  return fs.readdirSync(directory).filter(file => file.endsWith('.db')).map(file => path.basename(file, '.db'));
};
const initializeDatabases = (directory: string) => {
  const dbNames = listDatabases(directory);
  dbNames.forEach(dbName => {
    const db = new Database(path.join(directory, `${dbName}.db`));
    databases.set(dbName, db);
    console.log(`Database ${dbName} initialized`);
  });
};

const fastify = Fastify({ 
  logger: true,
  ignoreTrailingSlash: true, // Ignore les slashs en trop
  trustProxy: true, // Indique à Fastify qu'il est derrière un proxy 
  });

//generic error response
const errorResponse = (label:string,statusCode:number,reply:any,request:any, error:any) => {
	const errorMessage = {error: label, message: error.message, database: request.params.database, table: request.params.table};
  console.error(errorMessage);
  console.error(error);
	return reply.status(statusCode).send(errorMessage);
  }


/**
 * Start the server
 */
fastify.listen({ port: 3000, host: "0.0.0.0" }, () => {
  initializeDatabases("/data");
  console.log("SQLite Service running on http://localhost:8080");
});

// 📌 Route : Liste des bases de données existante
fastify.get("/databases/list", async (request, reply) => {
  const dbNames = Array.from(databases.keys());
  return { message: "List of databases", databases: dbNames };
});

// 📌 Fonction pour récupérer/créer une base de données
const getDB = (databaseName:string) => {
  console.log("databaseName",databaseName);
  if (!databases.has(databaseName)) {
    databases.set(databaseName, new Database(`/data/${databaseName}.db`));
    console.log(`Database ${databaseName} created`);
  }
  return databases.get(databaseName);
};

/**
 * 📌 Endpoint pour réinitialiser le container map() de la base de données
 * ne sera pas utilisé en production
 */
fastify.post("/databases/:database/resetmap", async (request, reply) => {
  const { database } = request.params as { database: string };
	try {
    databases.delete(database);
    console.log("databases",databases);
    initializeDatabases("/data");
		return { message: `Database are reload` };
	  }catch (error) {
		errorResponse("Database creation error",500,reply,request,error);
	  }
});
/**
 *  📌 Endpoint pour créer une base de données vide
 * @param request.params.database - Nom de la base de données
 * 
 * Exemple de structure de requete depuis un projet nodejs:
 * const result = await fetch('http://sqlite-service:3000/databases/mydb',{
      method: 'POST',
    });
    body: JSON.stringify({database: 'mydb'}),
    const data = await result.json()
 */
fastify.post("/databases/:database", async (request, reply) => {
	try {
		const requestBody = request.body as { database: string}; 
		const db = getDB(requestBody.database);
		console.log("db",db);
   // db.close();
		return { message: `Database ${requestBody.database} created or alredy exist` };
	  }catch (error) {
		errorResponse("Database creation error",500,reply,request,error);
	  }
});
type Column = {
	name: string;
	type: string;
  };
type ForeignKeys = {
	column: string;
	references: string;
	onDelete: string;
  };


 /**
 *  📌 Endpoint pour créer une table dynamique (structure reçue dans le body)
 * @param request.body.columns - Liste des colonnes de la table
 * 
 * Exemple de structure de requete:
 * const result = await fetch('http://sqlite-service:3000/databases/mydb/table/users/structure_table',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        database: 'mydb',
        table: 'users',
        columns: [
          {"name": "id", "type": "INTEGER PRIMARY KEY AUTOINCREMENT"},
          {"name": "name", "type": "TEXT"},
          {"name": "email", "type": "TEXT UNIQUE"},
          {"name": "created_at", "type": "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"},
          {"name": "updated_at", "type": "DATETIME NOT NULL"}
        ],
        foreignKeys: [
          {"column": "user_id", "references": "users(id)", "onDelete": "CASCADE"}
        ]
      }),
    });
 */
fastify.post("/databases/:database/table/:table/structure_table", async (request, reply) => {
  const { database, table } = request.params as { database: string, table: string };
  const { /* database, table,  */columns, foreignKeys } = request.body as { database: string, table: string, columns: Column[], foreignKeys: ForeignKeys[] };
  if (!columns || !Array.isArray(columns)) {
    return errorResponse("Columns must be an array",400,reply,request, new Error("Columns must be an array"));
	 //return reply.status(400).send({ error: "Columns must be an array" });
  }

  try {
    const db = getDB(database);
    let sql = `CREATE TABLE IF NOT EXISTS ${table} (${columns.map(col => `${col.name} ${col.type}`).join(", ")}`;
    
    if (foreignKeys) {
      foreignKeys.forEach(fk => {
        sql += `, FOREIGN KEY (${fk.column}) REFERENCES ${fk.references} ON DELETE ${fk.onDelete}`;
      });
    }
    
    sql += ')';
    db.prepare(sql).run();
    
    return { message: `Table '${table}' created.` };
  } catch (error) {
	return errorResponse("Table creation error",500,reply,request,error);
   // return reply.status(500).send({ error: "Error creating table", details: error.message });
  }
});



/**
 * 📌  Endpoint pour insérer une ligne dans une table
 * @param request.body - Données à insérer
 * @param request.query.database - Nom de la base de données
 * @param request.query.table - Nom de la table
 * Exemple de structure de requete depuis un projet nodejs:
 * const result = await fetch('http://sqlite-service:3000/databases/table?database=testgenerated01&table=users',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        name: "Alice",
        email: "aaa@aaa.com",
        updated_at: new Date().getTime()
        created_at: new Date().getTime()
      }),
    });
    const data = await result.json()
 */

fastify.post("/databases/:database/table/:table/rows", async (request, reply) => {

  let debugstring = "";
  console.log("request.body",request.body);
  const dataBody:any = request.body;//@todo: type
  //data de type /types/, verifions sil est valide
  console.log("receive data",dataBody);
  if (typeof dataBody !== "object" || !Object.keys(dataBody).length) {
    console.log("Invalid data");
    return reply.status(400).send({ error: "Invalid data" });
  }

  try {
    const params= request.params as { database: string, table: string };
    if (!params.database || !params.table) {
      return reply.status(400).send({ error: "Database and table are required" });
    }
    const { table , data} = dataBody;
    const db = getDB(`${params.database}`);
    console.log("197 db: \n",db);
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => "?").join(", ");
    console.log("placeholders",placeholders);
    const query = `INSERT INTO ${params.table} (${keys.join(", ")}) VALUES (${placeholders})`;
   
   debugstring = query;
    console.error("query",query);
    const result = db.prepare(query).run(...values);
console.log("result",result);
if (result.changes === 0) {
  return reply.status(400).send({ error: "Insertion failed" });
}
//add the id of the inserted row to the data object
const insertedRow = db.prepare(`SELECT * FROM ${params.table} WHERE id = ?`).get(result.lastInsertRowid);
console.log("insertedRow",insertedRow);
data.id = insertedRow.id ;

    return { message: "Row inserted", data:insertedRow , result};
  } catch (error) {
    console.error("error",error);
    errorResponse("Insertion error",500,reply,request,error);
  }
});

/*

//exemple de requete sql pour une jointure
SELECT users.*, auth_providers.provider, auth_providers.provider_id
FROM users
JOIN auth_providers ON users.id = auth_providers.user_id
WHERE users.name = 'Alice';
*/

/**
 * 📌Endpoint pour effectuer une jointure avec des paramètres de requête
 * @param request.params.table - Nom de la table
 * @param request.query - Filtres de recherche //not implemented yet
 * 
 * Exemple de structure de requete depuis un projet nodejs:
   const result = await fetch('http://sqlite-service:3000/databases/joinedtable?database=testgenerated01&table1=users&table2=auth_providers&table1joinColumn=id&table2joinColumn=user_id`);
   const data = await result.json()

   //@TODO reprendre l'encode et le decode des filtres etendre a plusieurs jointures
 */
fastify.get("/databases/:database/joinedtable", async (request, reply) => {
  const { database, table1, table2, table1joinColumn,table2joinColumn, filters, limit, offset } = request.query as {
    database: string;
    table1: string;
    table2: string;
    table1joinColumn: string;
    table2joinColumn: string;
    filters?: string;
    limit?: string;
    offset?: string;
  };

  if (!database || !table1 || !table2 || !table1joinColumn || !table2joinColumn) {
    return reply.status(400).send({ error: "Database, table1, table2, and joinColumn are required" });
  }

  try {
    const db = getDB(database);
    let sql = `SELECT ${table1}.*, ${table2}.id AS  alias_table_${table2}_id , ${table2}.* FROM ${table1} JOIN ${table2} ON ${table1}.${table1joinColumn} = ${table2}.${table2joinColumn}`;
    let params: any[] = [];

    if (filters) {
      //@TODO reprendre l'encode et le decode des filtres
      // Décodage des filtres s'ils existent
       //const parsedFilters = filters ? JSON.parse(decodeURIComponent(filters)) : [];

      const filterClauses = JSON.parse(filters).map((f: { column: string, operator: string }) => `${f.column} ${f.operator} ?`).join(" AND ");
      params = JSON.parse(filters).map((f: { value: string }) => f.value);
      sql += ` WHERE ${filterClauses}`;
    }

    if (limit) sql += ` LIMIT ${limit}`;
    if (offset) sql += ` OFFSET ${offset}`;

    const stmt = db.prepare(sql);
    const data = stmt.all(params);
    return { message: "Joined data retrieved successfully", data };
  } catch (error) {
    return reply.status(500).send({ error: "Query error", message: error.message });
  }
});

 /**
 * 📌 Endpoint pour  Lire des données (avec query params)
 * @param request.params.table - Nom de la table
 * @param request.query - Filtres de recherche //not implemented yet
 * 
 * Exemple de structure de requete depuis un projet nodejs:
   const filerexample = JSON.stringify([{column:"name",operator:"=",value:"Nizar"}])
   const encodedFilters = encodeURIComponent(filterExample);
   const result = await fetch('http://sqlite-service:3000/databases/table?database=testgenerated01&table=users&limit=200&filters=${encodedFilters}`);
   const data = await result.json()

 */
//fastify.get("/databases/table", async (request, reply) => {
fastify.get("/databases/:database/table/:table", async (request, reply) => {
  console.log("request.query");
	const { /* database, table, */  filters,  limit, offset } = request.query as { database: string, table: string, filters: string, limit: string, offset: string };
	const { database, table/* , filters, limit, offset */ } = request.params as { database: string, table: string, filters: string, limit: string, offset: string };
	if (!database || !table) {
	  return reply.status(400).send({ error: "Database and table are required" });
	}
  //let debugstring;
  console.log("request.query",request.query);
  //const filters = "";
	try {
	  const db = getDB(database);
	  let sql = `SELECT * FROM ${table}`;
	  let params = [];
  
	  if (filters) {
        const parsedFilters = filters ? JSON.parse(decodeURIComponent(filters)) : [];
        console .log("****   parsedFilters",parsedFilters);
		const filterClauses = parsedFilters.map((f : {column:string,operator:string})=> `${f.column} ${f.operator} ?`).join(" AND ");
		params = parsedFilters.map((f:{value:string}) => f.value);
		sql += ` WHERE ${filterClauses}`;
  //  debugstring = sql
    console.log("sql",sql);
	  }
  
	  if (limit) sql += ` LIMIT ${limit}`;
	  if (offset) sql += ` OFFSET ${offset}`;
  
	  const stmt = db.prepare(sql);
    console.log("stmt",stmt);
    console.log("params",params);
    const data = stmt.all(params);
    console.log("data",data);
	  return data;
	} catch (error) {
		return errorResponse("Query error",500,reply,request,error);
	}
  });
  

/**
 * 📌Endpoint pour mettre à jour un enregistrement
 * @param request.body - Données à mettre à jour
 * 
 * Exemple de structure de requete depuis un projet nodejs:
   const result = await fetch('http://sqlite-service:3000/databases/table',{
      method: 'PUT',
      headers: {
      'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       database: 'mydb',
       table: 'users',
       id: 1,
       data: {
         name: "Alice",
         email: "
      }
     }),
    });
    const data = await result.json()
 * 
    //@TODO reprendre le fonctionement lors d'une mise a jour de plusieurs colonnes
 */
fastify.put("/databases/:database/table/:table/id/:id", async (request, reply) => {  
  const { database, table ,id} = request.params as { database: string, table: string ,id: string};
  console.log(`received from url :PUT /databases/${database}/table/${table}`);

  console.log("request.body",request.body);
  const { /* database, table, */ /* id, */ ...data } = request.body as { database: string, table: string, id: string, data: any };
  if (!database || !table || !id || !data) {
    return reply.status(400).send({ error: "Database, table, id, and data are required" });
  }
  const db = getDB(database);
  const updates = Object.keys(data).map(col => `${col} = ?`).join(", ");
  const values = [...Object.values(data), id];

  try {
    const stmt = db.prepare(`UPDATE ${table} SET ${updates} WHERE id = ?`);
    console.log("stmt",stmt);
    console.log("values",values);
    const result = stmt.run(values);
    console.log("result",result);
    if (result.changes === 0) {
      return reply.status(400).send({ error: "Update failed" });
    }
    //get row after update
    const updatedRow = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
    return { success: true ,message: "Row updated", data: updatedRow };
 

    return result.changes ? { success: true ,result} : { error: "Update failed" };
  } catch (error) {
    console.error("error",error);
    return reply.status(500).send({ error: "Update error", details: error.message });
  }
});

/**
 * 📌Endpoint pour supprimer un enregistrement
 * @param request.body - Données à mettre à jour
 * 
 * Exemple de structure de requete depuis un projet nodejs:
 * const result = await fetch('http://sqlite-service:3000/databases/table',{
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        database: 'mydb',
        table: 'users',
        id: 1
      }),
    });
    const data = await result.json()
 */
fastify.delete("/databases/:database/table/:table/deleterow/:id", async (request, reply) => {
  const { database, table, id } = request.params as { database: string, table: string, id: string};
  console.log(`received from url :DELETE /databases/${database}/table/${table}/deleterow/${id}`);
  if (!database || !table || !id ) {
    return reply.status(400).send({ error: "Database, table, id, and data are required" });
  }
  const db = getDB(database);
  try {
    const stmt = db.prepare(`DELETE FROM ${table} WHERE id = ?`);
    const result = stmt.run(id);
    console.log("result",result);
    //view the result

    if (result.changes === 0) {
      return reply.status(400).send({ error: "Deletion failed" });
    }/* 
    const updatedRow = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
    console.log("updatedRow",updatedRow); */
    return { success: true ,message: "Row deleted", data: {} };


    return result.changes ? { success: true } : { error: "Deletion failed" };
  } catch (error) {
    console.error("error",error);
    return reply.status(500).send({ error: "Deletion error", details: error.message });
  }
});

/**
 * 📌Endpoint pour supprimer plusieurs enregistrements
 * @param request.body - Données à mettre à jour
 * 
 * Exemple de structure de requete depuis un projet nodejs:
 * const filerexample = JSON.stringify([{column:"role",operator:"=",value:"troll"}])
   const encodedFilters = encodeURIComponent(filterExample);
   const result = await fetch('http://sqlite-service:3000/databases/mydb/table/users/deleterows?filters=${encodedFilters}',{
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await result.json()
 */
fastify.delete("/databases/:database/table/:table/deleterows", async (request, reply) => {
  const { database, table } = request.params as { database: string, table: string, id: string};
  const { /* database, table, */  filters,  limit, offset } = request.query as { database: string, table: string, filters: string, limit: string, offset: string };
  if (!database || !table || !filters) {
    return reply.status(400).send({ error: "Database, table, id, and data are required" });
  }
 try {
	  const db = getDB(database);
	  let sql = `DELETE * FROM ${table}`;
	  let params = [];
  if (filters) {
        const parsedFilters = filters ? JSON.parse(decodeURIComponent(filters)) : [];
		const filterClauses = parsedFilters.map((f : {column:string,operator:string})=> `${f.column} ${f.operator} ?`).join(" AND ");
		params = parsedFilters.map((f:{value:string}) => f.value);
		sql += ` WHERE ${filterClauses}`;
    console.log("sql",sql);
	  }
  
	  if (limit) sql += ` LIMIT ${limit}`;
	  if (offset) sql += ` OFFSET ${offset}`;
  
	  const stmt = db.prepare(sql);
    const result = stmt.run(params);
    return result.changes ? { success: true } : { error: "Deletion failed" };
	} catch (error) {
		return reply.status(500).send({ error: "Deletion error", details: error.message });
	}
});

// Endpoint pour verifier la structure d'une table
fastify.get("/databases/:database/table/:table/structure_table", async (request, reply) => {
  const { database, table} = request.params as { database: string, table: string, filters: string, limit: string, offset: string };
	if (!database || !table) {
	  return reply.status(400).send({ error: "Database and table are required" });
	}

  try {
    const db = getDB(database);
    const tableinfo = db.prepare(`PRAGMA table_info(${table})`).all();
    return { tableinfo };
  } catch (error) {
    errorResponse("Table structure error",500,reply,request,error);
  }
});


/**
 * 📌Endpoint pour exécuter une requête SQL personnalisée
 * @param request.body - Requête SQL à exécuter
 * 
 * TRES IMPORTANT: SECURITE: EXECUTER DES REQUETES SQL PERSONNALISEES PEUT ETRE DANGEREUX,
 *  
 */
fastify.post("/databases/:database/table/:table/query", async (request, reply) => {
  const { database, table } = request.params as { database: string, table: string };
  const forbiddenTables = [/* "users", */ "admin", "config"];
  if (forbiddenTables.includes(table.toLowerCase())) {
    return reply.status(403).send({ error: "Access to this table is forbidden" });
  }
/* //ajouter un jwt pour la securité avec un role admin
  if (request.user.role !== "admin") {
    return reply.status(403).send({ error: "Unauthorized" });
  } */
  const { sql, values } = request.body as { sql: string, values: any[] };
  console.log(`Received: POST /databases/${database}/table/${table}/query`);
  
  if (!Array.isArray(values)) {
    return reply.status(400).send({ error: "Values must be an array" });
  }
  if (!database || !table || !sql) {
    return reply.status(400).send({ error: "Database, table, and SQL query are required" });
  }
  if (sql.includes(";") || sql.toLowerCase().includes("drop") || sql.toLowerCase().includes("delete")) {
    return reply.status(403).send({ error: "Dangerous query detected" });
  }
const allowedQueries = ["INSERT", "UPDATE", "SELECT"];
const sqlType = sql.trim().split(" ")[0].toUpperCase();

if (!allowedQueries.includes(sqlType)) {
  return reply.status(403).send({ error: "Query type not allowed" });
}

  const db = getDB(database);

  try {
    const stmt = db.prepare(sql);

    // 🔥 Vérifier si c'est un INSERT, UPDATE ou DELETE
    let result;
    if (sql.trim().toUpperCase().startsWith("INSERT")) {
      result = stmt.run(values);
      console.log("Inserted ID:", result.lastInsertRowid);

      if (!result.lastInsertRowid) {
        return reply.status(400).send({ error: "Insertion failed" });
      }

      const insertedRow = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(result.lastInsertRowid);
      return reply.send({ success: true, message: "Insert OK", data: insertedRow });

    } else {
      result = stmt.run(values);

      if (result.changes === 0) {
        return reply.status(400).send({ error: "No changes made" });
      }

      return reply.send({ success: true, message: "Query executed successfully" });
    }

  } catch (error) {
    console.error("Query error:", error);
    return reply.status(500).send({ error: "Query error", details: error.message });
  }
});

/**
 * 
 *  amelioration a apporter
 * 
 *  Supprimer les tables de la base de données lors de la suppression de la base de données
 *  SECURITE: SANITIZE SQL QUERIES &&  VALIDER LES DONNEES RECUES
 *  SECURITE: PROTECTION MOT DE PASSE ou UTILISER UN SYSTEME D'AUTHENTIFICATION JWT
 * 
 *  renomer PUT /databases en PUT /databases/table-structure car modifier la structure d'une table
 *  renomer POST /databases/table en POST /databases/tables/(rows || insert)  pour inserer une ligne dans une table
 *  etendre le comportement des jointures GET /databases/joinedtable en remplaçant les paramètres (table1joinColumn && table2joinColumn) par un tableau de jointure JSON.Stringify ex "joins": [ { "table": "table1", "joinColumn": "id" },  { "table": "table2", "joinColumn": "user_id" },  { "table": "table3", "joinColumn": "order_id" }]
       le renommer en GET /databases/tables/join 

 *  PUT /databases/table est il enviseageble et pour quel rainson aurait on besoin de mettre plusieur table a jour en meme temps???
       si oui , revoir la structure de la requete pour permettre de mettre a jour plusieurs tables en meme temps
       par exemple en utilisant un systeme de filtre pour identifier les tables a mettre a jour 
       ex: l'utilisateur admin veux metre a jour le status de tous les utilisateurs ayant le role user en inactive
        {
            "database": "mydb",
            "table": "users",
            "filters": [{ "column": "role", "operator": "=", "value": "user" }],
            "data": { "status": "inactive" }
          }
       *  securite: UTILISER DES TRANSACTIONS POUR LES OPERATIONS CRITIQUES, cest a dire les operations qui peuvent etre annulees si une erreur survient, ex : insertion de plusieurs lignes dans une table ou suppression de plusieurs lignes

 * 
 */