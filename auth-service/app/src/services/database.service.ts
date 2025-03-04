import { getEnvVariable } from "../utils/getEnvVariable";
type DBForeignKeys = {
  column: string;
  references: string;
  onDelete: string;
};
type DBColumn = {
  name: string;
  type: string;
};

type DatabaseStucture = {
  database: string;
  table: string;
  columns: DBColumn[];
  foreignKeys?: DBForeignKeys[];
};


export const SQLITE_DATABASE_NAME = getEnvVariable("SQLITE_DATABASE_NAME");

export const createTable = async (databaseStructure:DatabaseStucture) => {
 // const { database, table } = databaseStructure;
  //const response = await fetch(`http://sqlite-service:3000/databases/${database}/tables/${table}`, {
  const response = await fetch(`http://sqlite-service:3000/databases`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({...databaseStructure }),
  });
  return await response.json();
};

export const insertRow = async (database: string, table: string, data: any) => {
 // const response = await fetch(`http://sqlite-service:3000/databases/${database}/tables/${table}/rows`, {
  const response = await fetch(`http://sqlite-service:3000/databases/table/?database=${database}&table=${table}`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return await response.json();
};

export const getTableData = async (database: string, table: string, filters?: string, limit?: number, offset?: number) => {
  //let url = `http://sqlite-service:3000/databases/${database}/tables/${table}`;
  let url = `http://sqlite-service:3000/databases/table`;
  if (filters || limit || offset) {
    const params = new URLSearchParams();
	params.append('database', database);
	params.append('table', table);
    if (filters) params.append('filters',  JSON.stringify(filters));
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    url += `?${params.toString()}`;
  }
  const response = await fetch(url);
  return await response.json();
};

// Ajoutez d'autres fonctions de service selon vos besoins