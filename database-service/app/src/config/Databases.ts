import { AuthProvider } from "@src/models/AuthProvider.entity";
import { User } from "@src/models/User.entity";
import { DataSource, EntityNotFoundError, EntityTarget, ObjectLiteral } from "typeorm";

type DatabaseParams = {
	type: "sqlite" | "mysql";
	database: string;// Chemin du fichier SQLite
	entities: Function[];// Entités TypeORM
	synchronize: boolean,         // Auto-sync des modèles (⚠ à désactiver en prod)
	logging: boolean,            // Désactiver les logs SQL
  };

type DatabasesConfigs = Record<string, DatabaseParams>;

class BaseDBConfigs {
static databasesConfigs: DatabasesConfigs = {
	myDb: {
	  type: "sqlite",
	  database: "./data/myDb.sqlite",
	  entities: [User, AuthProvider],
	  synchronize: true,
	  logging: false,
	//  migrations: ["src/migrations/*.ts"], // npx typeorm migration:generate -n MigrationName && (npx typeorm migration:run || npx typeorm migration:revert)
    //  cli: {
    //    migrationsDir: "src/migrations"
    //  }
	},
	anotherDb: {
	  type: "sqlite",
	  database: "./data/another_db",
	  entities: [User],//reutilisation d'un model existant possible
	  synchronize: true, // depuis l'environnement: process.env.NODE_ENV === "dev"? true : false,
	  logging: false,
	},
  };
  static getDatabaseParams(dbName: string) {
	return this.databasesConfigs[dbName] || null;
  }
}


//usage
// fastify.databases = new Databases(["myDb", "anotherDb"]);
//  fastify.databases.dbNames renverra ["myDb", "anotherDb"]

//ex : fastify.databases.getDataBase("myDb").getEntityByName("user")
// renverra l'entité User

//ex fastify.database.getDataBase("myDb").getEntityByName("user")
// renverra l'entité User
export class Databases {
	private dataBases: Record<string, DatabaseService> = {};
	constructor(public dbNames: string[]) {
		// 1- Initialisation des bases de données au démarrage
		this.dbNames = dbNames;
		this.initializes();
	}
	private async initializes() {
		for (const dbName of this.dbNames) {
			//1- Initialisation de la base de données si le nom est valide
			try {
				await this.initialize(dbName);
				console.log(`✅ Base '${dbName}' initialisée.`);
			}
			catch (error) {
				 console.error(`❌ Erreur d'initialisation de '${dbName}':`, error);
			}
		}
	}
	private async initialize(dbName: string) {
		const databaseParams = BaseDBConfigs.getDatabaseParams(dbName);
		if (!databaseParams) {
			throw new Error(`Database ${dbName} not found`);
		}
		const database = new DatabaseService(databaseParams);
		if (!database) {
			throw new Error(`Database ${dbName} not found`);
		}
		try {
			await database.start();
		}
		catch (error) {
			throw new Error(`Database ${dbName} initialization failed`);
		}
		this.dataBases[dbName] = database;
		console.log(`✅ class Database:  '${dbName}' initialisée.`);
	}
	
	// renvoie une base de données par son nom
	async getDataBase(databaseName: string) {
		const database = this.dataBases[databaseName];
		if (!database) {
			throw new DatabaseNotFoundError(`Database ${databaseName} not found`);
		}
		return database;
	}
	getDataBaseNames() {
		return this.dbNames;
	}

}

export class DatabaseNotFoundError extends Error {
	public code: string;
	constructor(message: string) {
		super(message);
		this.name = "DatabaseNotFoundError";
		this.message = message;
		this.code = "DATABASE_NOT_FOUND";
	}
}
export class CustomEntityNotFoundError extends Error {
	public code: string;
	constructor(message: string) {
		super(message);
		this.name = "EntityNotFoundError";
		this.message = message;
		this.code = "ENTITY_NOT_FOUND";
	}
}

export class CustomIdNotFoundError extends Error {
	public code: string;
	constructor(message: string) {
		super(message);
		this.name = "NotFoundError";
		this.message = message;
		this.code = "ID_NOT_FOUND";
	}
}
/**
 * creation d'une class de configuration de base de données
 * qui permettra de gérer plusieurs bases de données
 * et de les initialiser
 */
export class DatabaseService {
	private dataSource: DataSource;
	private entityMap: Record<string, EntityTarget<ObjectLiteral>> = {};
	private databaseParams: DatabaseParams;
	constructor(databaseParams: DatabaseParams) {
		this.databaseParams = databaseParams;
		this.build();	
	}
	private build() {
		this.dataSource = new DataSource({
		type: this.databaseParams.type, // Type de base de données //config.DB_TYPE
		database: this.databaseParams.database, // Chemin du fichier SQLite //config.DB_PATH
		synchronize: true,// Auto-sync des modèles (⚠ à désactiver en prod) //this.databaseParams.synchronize
		entities: this.databaseParams.entities,// Entités TypeORM //[User,AuthProvider],
		logging: false,            // Désactiver les logs SQL // this.databaseParams.logging
		});
	}
	// I- Initialisation de la base de données ; a utiliser en premier
	async start() { // a renommer en init ou initialize
		// Initialisation de la base de données
		const init = await this.dataSource.initialize();
		if (!init) {
			throw new Error("Database initialization failed");
		}
		// Création de la map des entités
		this.dataSource.entityMetadatas.forEach((meta) => {
			console.log(`📦 Entité '${meta.name}' trouvée.`);
			this.entityMap[meta.name.toLowerCase()] = meta.target;
		});
	}
	//Récupère une entité par son nom.
	// WARNING: renvoie null si l'entité n'existe pas
	// WARNING: Case insensitive (User === user)	
	getEntityByName(entityName: string): EntityTarget<ObjectLiteral> | null {
		const entity = this.entityMap[entityName.toLowerCase()] || null;
        if (!entity) {
            console.warn(`⚠️ Entité '${entityName}' non trouvée.`);
			throw new CustomEntityNotFoundError(`Entity ${entityName} not found`);
        }
		return entity;
	}
	getEntitys() {
		return this.entityMap || null;
	}
	getDataSource() {
		return this.dataSource;
	}
}