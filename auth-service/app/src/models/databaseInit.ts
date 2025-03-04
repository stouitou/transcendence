
//import { User, AuthProvider } from './types';

/* const tables = [
  {
    name: 'users',
    columns: [
      { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
      { name: 'email', type: 'TEXT UNIQUE' },
      { name: 'name', type: 'TEXT' },
      { name: 'avatar', type: 'TEXT' },
      { name: 'password', type: 'TEXT' },
      { name: 'created_at', type: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'DATETIME NOT NULL' },
	  { name: 'role', type: 'TEXT' },
	  { name: 'providers', type: 'ARRAY' },//sera liee a la table auth_providers

    ],
  },
  {
    name: 'auth_providers',
    columns: [
      { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
      { name: 'provider', type: 'TEXT' },
      { name: 'provider_id', type: 'TEXT UNIQUE' },
      { name: 'user_id', type: 'INTEGER' },	  
    ],
    foreignKeys: [
      { column: 'user_id', references: 'users(id)', onDelete: 'CASCADE' },
    ],
  },
];

type Column = {
  name: string;
  type: string;
};
async function createTable(databasename:string,table: { name: string; columns: Column[], foreignKeys?: { column: string; references: string; onDelete: string } }) {
  await fetch(`http://sqlite-service:3000/databases/${databasename}/tables/${table.name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ columns:table.columns,foreignkeys:table.foreignKeys }),
  });
}

async function addForeignKey(databasename: string, table: string, foreignKey: { column: string; references: string; onDelete: string }) {
	const query = `ALTER TABLE ${table} ADD CONSTRAINT fk_${table}_${foreignKey.column} FOREIGN KEY (${foreignKey.column}) REFERENCES ${foreignKey.references} ON DELETE ${foreignKey.onDelete}`;
	await fetch(`http://sqlite-service:3000/databases/${databasename}/tables/${table}/alter`, {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
	  },
	  body: JSON.stringify({ query }),
	});
  }
export async function initDatabase(databasename:string) {
	console.log('Initializing database');
	try {

		for (const table of tables) {
			await createTable(databasename,table);
		}
	}
	catch (error) {
		console.error('Error initializing database:', error);
	}
  console.log('Database initialized');
}
   */
 import { getEnvVariable } from "../utils/getEnvVariable"; 
 const SQLITE_DATABASE_NAME = getEnvVariable("SQLITE_DATABASE_NAME");
const tables = [
	{
	  database: SQLITE_DATABASE_NAME,
	  table: "users",
	  columns: [
		{ name: "id", type: "INTEGER PRIMARY KEY AUTOINCREMENT" },
		//{ name: "email", type: "TEXT UNIQUE" },
		{ name: "name", type: "TEXT" },
		{ name: "avatar", type: "TEXT" },
		{ name: "created_at", type: "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP" },
		{ name: "updated_at", type: "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP" },
		//set default value to "user role"
		{ name: "role", type: "TEXT DEFAULT 'user'" }
	  ]
	},
	{
	  database: SQLITE_DATABASE_NAME,
	  table: "auth_providers",
	  columns: [
		{ name: "id", type: "INTEGER PRIMARY KEY AUTOINCREMENT" },
		{ name: "provider", type: "TEXT" },// google, facebook, local, etc
		{ name: "provider_id", type: "TEXT UNIQUE" },//  email
		{ name: "user_id", type: "INTEGER" }, //foreign key to users table
		{ name: "created_at", type: "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP" },
		{ name: "updated_at", type: "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP" },
		{ name: "password", type: "TEXT" }

	  ],
	  foreignKeys: [
		{ column: "user_id", references: "users(id)", onDelete: "CASCADE" }
	  ]
	}
  ];
  
  //test1
 export async function initEmptyTable(database:string) {
	const data = await fetch(`http://sqlite-service:3000/databases`, {
	  method: "POST",
	  headers: { "Content-Type": "application/json" },
	  body: JSON.stringify({ database: database })
	});
	return await data.json();
  }

    //test2
	export async function initTableSrucutre(database:string) {
		const objyStruct = {
			database: database,
			table: "users",
			columns: [
				{ name: "id", type: "INTEGER PRIMARY KEY AUTOINCREMENT" },
				{ name: "email", type: "TEXT UNIQUE" },
				{ name: "name", type: "TEXT" },
				{ name: "avatar", type: "TEXT" },
				{ name: "password", type: "TEXT" },
				{ name: "created_at", type: "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP" },
				{ name: "updated_at", type: "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP" },
				{ name: "role", type: "TEXT" }
			],
			}
		const data = await fetch(`http://sqlite-service:3000/databases`, {
		  method: "PUT",
		  headers: { "Content-Type": "application/json" },
		  body: JSON.stringify({ ...objyStruct })
		});
		return await data.json();
	  }



  async function createTable(body:any) {
	const { database, table } = body;
	const data = await fetch(`http://sqlite-service:3000/databases/${database}/table/${table}/structure_table`, {
	//await fetch(`http://sqlite-service:3000/databases/${database}/tables/${table.name}`, {
	  method: "POST",
	  headers: { "Content-Type": "application/json" },
	  body: JSON.stringify({ ...body/* columns: table.columns, foreignKeys: table.foreignKeys */ })
	});
	
	return  await data.json();
  }
  
  export async function initDatabase() {
	console.log("Initializing database...");
	const responseMap : any[] = [];
	try {
	  for (const table of tables) {
		const data = await createTable( table);
		responseMap.push({table:table.table,data:data});
	  }
	} catch (error) {
	  console.error("Error initializing database:", error);
	}
	console.log("Database initialized.");
	return responseMap;
  }
  
/* initDatabase().catch(console.error); */