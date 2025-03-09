/**
 * IRepository - Interface pour les méthodes CRUD
 * @export
 * @interface IRepository
 */
export interface IRepository<T> {
	//implement CRUD methods
	//create, read, update, delete
  
	//create
	create: (user: Partial<T>) => Promise<T>;
	//read
	getAll: () => Promise<T[]>;
	getById: (id: number) => Promise<T | null>;
	getByParams: (params: any) => Promise<T[]| null>;
	//update
	update: (user: Partial<T>) => Promise<T| null>;
	//delete
	delete: (id: number) => Promise<boolean>;
  }