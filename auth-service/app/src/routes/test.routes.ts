import { FastifyInstance } from "fastify";
import { initDatabase, initEmptyTable, initTableSrucutre } from "../models/databaseInit";
import { UserModel } from "../models/User.Model";
async function testRoutes(app: FastifyInstance) {

	const userModel = new UserModel();

   //initialisation de la base de données
  //const Initialisation = await initDatabase();
  //console.log(Initialisation)


//******************** test
app.get("/api/auth/databases/user1", async (request, reply) => {
	const result = await app.userModels.getUsers();
	  return { message: "Auth service is listing databases", result };
   });
   app.get("/api/auth/databases/user2", async (request, reply) => {
	const result = await app.userModels.createUser("Alice","test22@mail.com");
	console.log("---- result--- ",result)
	return { result };
   });
  
	app.get("/api/auth/databases/user3", async (request, reply) => {
	//  const result = await userModel.getUserById(1);
	  const result = await  app.userModels.getUserById(1);
	  return { result };
	});
  //nouveaux tests
  //1 - cree une base de données vide
  app.get("/api/auth/databases/list", async (request, reply) => {
	const result = await fetch('http://sqlite-service:3000/databases/list');
	const data = await result.json()
	 return { message: "Auth service is listing databases", data };
   });
  //1 - cree une base de données vide
  app.get("/api/auth/databases/init1", async (request, reply) => {
	const Initialisation = await initEmptyTable("testgenerated01");
	  return { message: "Auth service is running",Initialisation:Initialisation };
	});
  
	app.get("/api/auth/databases/init2a", async (request, reply) => {
	  const Initialisation = await initDatabase();
		return { message: "Auth service is running",Initialisation:Initialisation };
	  });
	//2 - cree une base de données avec une structure de table
	app.get("/api/auth/databases/init2", async (request, reply) => {
	  const Initialisation = await initTableSrucutre("testgenerated01");
		return { message: "Auth service is running",Initialisation:Initialisation };
	  });
	  //3 - Ajouter des informations dans la table
	  app.get("/api/auth/databases/init3", async (request, reply) => {
		const randomNumber = Math.floor(Math.random() * 1000);
		const randomEmail = `${Math.random().toString(36).substring(2, 15) +Math.random().toString(36).substring(2, 15)
					}@example.com`;
		const result = await fetch('http://sqlite-service:3000/databases/table?database=testgenerated01&table=users',{
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json',
		  },
		  body: JSON.stringify({ 
			name: "Alice",
			email: randomEmail,
		  }),
		});
		const data = await result.json()
		 return { message: "Auth service is adding a new row in database", data };
	   });
  
	   //test3-a Ajouter des informations dans la table auth_providers
	  app.get("/api/auth/databases/init3a", async (request, reply) => {
		const randomNumber = Math.floor(Math.random() * 1000);
		const randomEmail = `${Math.random().toString(36).substring(2, 15) +Math.random().toString(36).substring(2, 15)
					}@example.com`;
		const result = await fetch('http://sqlite-service:3000/databases/table?database=testgenerated01&table=auth_providers',{
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json',
		  },
		  body: JSON.stringify({ 
			provider: "42api",
			provider_id: randomNumber,
			user_id: 1,
  }),
		});
		const data = await result.json()
		 return { message: "Auth service is adding a new row in database", data };
	   });
  
  
  
  const filerexample = JSON.stringify([{column:"name",operator:"=",value:"Alice"}])
  //test-4 lister les informations de la table
  app.get("/api/auth/databases/init4", async (request, reply) => {
	const result = await fetch(`http://sqlite-service:3000/databases/table?database=testgenerated01&table=users&limit=200&filters=${filerexample}`);
	const resutltable2 = await fetch(`http://sqlite-service:3000/databases/table?database=testgenerated01&table=auth_providers&limit=200`);
	const data = await result.json()
	const data2 = await resutltable2.json()
	 return { message: "Auth service is get data from database", data,data2 };
   });
  
   //const filerexample2 = JSON.stringify([{column:"auth_providers.user_id",operator:"=",value:"1"}])
   const filerexample2 = JSON.stringify([{column:"users.id",operator:"=",value:"1"}])
   //?database=testgenerated01&table1=users&table2=auth_providers&joinColumn=id&filters=[{\"column\":\"users.name\",\"operator\":\"=\",\"value\":\"Alice\"}]&limit=10&offset=0"
   //test-5 jointure les informations de la table
   app.get("/api/auth/databases/init5", async (request, reply) => {
	const result = await fetch(`http://sqlite-service:3000/databases/joinedtable?database=testgenerated01&table1=users&table2=auth_providers&table1joinColumn=id&table2joinColumn=user_id`);
	 // const result = await fetch(`http://sqlite-service:3000/databases/joinedtable?database=testgenerated01&table1=users&table2=auth_providers&table1joinColumn=id&table2joinColumn=user_id&filters=${filerexample2}`);
	 const data = await result.json()
	  return { message: "Auth service is get data from database", data };
	});
  
  
  //checkdatabase foreign key
  app.get("/api/auth/databases/check", async (request, reply) => {
	const result = await fetch('http://sqlite-service:3000/databases/tables/structure_table?database=testgenerated01&table=auth_providers');
	const data = await result.json()
	 return { message: "Auth service is running", data };
   });
  
  app.get("/api/auth/databases/init", async (request, reply) => {
	const Initialisation = await initDatabase();
	  return { message: "Auth service is running",Initialisation:Initialisation };
	});
  
	app.get("/api/auth/databases/getinit", async (request, reply) => {
	  const result = await fetch('http://sqlite-service:3000/databases/testgenerated01/tables/users');
	  const data = await result.json()
	   return { message: "Auth service is get data from database", data };
	 });
	 app.get("/api/auth/databases/adduserinit", async (request, reply) => {
	  const result = await fetch('http://sqlite-service:3000/databases/testgenerated01/tables/users/rows',{
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({ 
		  name: "Alice",
		  email: "aaa@aaa.com",
		  updated_at: new Date().getTime(),
		//  providers: [{ name: 'google', provider_id: '22558',user_id:1010 },{ name: 'facebook', provider_id: '123456',user_id:1011 }]
  
		}),
	  });
	  const data = await result.json()
	   return { message: "Auth service is adding a new row in database", data };
	 });
  
  
	app.get("/api/auth/databases/adduser", async (request, reply) => {
	  const result = await fetch('http://sqlite-service:3000/databases/tables/rows?database=testgenerated01&table=users',{
	  // const result = await fetch('http://sqlite-service:3000/databases/test222/tables/test/rows',{
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({ 
		  name: "Alice",
		  email: "aaa@aaa.com",
		  updated_at: new Date().getTime()
		}),
	  });
	  const data = await result.json()
	   return { message: "Auth service is adding a new row in database", data };
	 });
  
	 app.get("/api/auth/databases/getadduser", async (request, reply) => {
	  const result = await fetch('http://sqlite-service:3000/databases/users33/tables/users');
	  const data = await result.json()
	   return { message: "Auth service is get data from database", data };
	 });
  
  
  /*   app.get("/api/auth/databases", async (request, reply) => {
	 const result = fetch('http://sqlite-service:3000/databases')
	 await result
  
	  return { message: "Auth service is running", data: result };
	}); */
	app.get("/api/auth/databases/creates", async (request, reply) => {
	  //post request to sqlite-service
	  const result = await fetch('http://sqlite-service:3000/databases/mydb/tables/users2/rows', {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({ 
		  columns: [
			{"name": "id", "type": "INTEGER PRIMARY KEY AUTOINCREMENT"},
			{"name": "name", "type": "TEXT"},
			{"name": "email", "type": "TEXT UNIQUE"}
		  ]
		}),
	  });
	const data =  await result.json()
   
	   return { message: "Auth service is running", data };
	 });
  
	 app.get("/api/auth/databases/random", async (request, reply) => {
	  //post request to sqlite-service
	  const result = await fetch('http://sqlite-service:3000/databases/user3/tables/User/random');
	  const data = await result.json()
	   return { message: "Auth service is creating a new random user", data };
	 });
  
	 app.get("/api/auth/databases/new", async (request, reply) => {
	  //post request to sqlite-service
	  const result = await fetch('http://sqlite-service:3000/databases/test222/tables/test',{
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({ 
		  columns: [
			{"name": "id", "type": "INTEGER PRIMARY KEY AUTOINCREMENT"},
			{"name": "name", "type": "TEXT"},
			{"name": "email", "type": "TEXT UNIQUE"},
			{"name": "created_at", "type": "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"},
			{"name": "updated_at", "type": "DATETIME NOT NULL"}
		  ]
		}),
	  });
	  const data = await result.json()
	   return { message: "Auth service is creating a new random user", data };
	 });
  
	app.get("/api/auth/databases", async (request, reply) => {
	  //post request to sqlite-service
	  const result = fetch('http://sqlite-service:3000/databases/users3/tables/User/rows', {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({ password: "Alice", email: "alice@example.com"}),
	  });
	  await result
   
	   return { message: "Auth service is running", data: result };
	 });
	 app.get("/api/auth/databases/users", async (request, reply) => {
	  //post request to sqlite-service
	  const result = await fetch('http://sqlite-service:3000/databases/users3/tables/User')
	  const data = await result.json()
	  console.log("data",data)
   
	   return { message: "Auth service is running", data };
	 });
  
  
  
  
  
  
	 /*** fin des test */
	}
	  
  export default testRoutes;