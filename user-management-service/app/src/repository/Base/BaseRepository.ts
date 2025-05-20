import { DATABASE_CONFIG } from "../../config/DatabaseConfig";
import { IParams } from "../helpers";

/**
 * BaseRepository - Abstract class
 * role : Centralise les URLs de la DB
 */
export abstract class BaseRepository<T> {
  protected SQLITE_DATABASE_URL = DATABASE_CONFIG.SQLITE_DATABASE_URL;
  protected DATABASE_NAME: string;
  protected TABLE: string;
  protected RELATION_TABLE: string[];

  constructor(databaseName: string, tableName: string, relationTable?: string[]) {
    this.DATABASE_NAME = databaseName;
    this.TABLE = tableName;
    this.RELATION_TABLE = relationTable??[];
  }

  get URL(): string {
    return `${this.SQLITE_DATABASE_URL}/${this.DATABASE_NAME}/table/${this.TABLE}`;
  }

  get RELATIONS(): string[] {
    return this.RELATION_TABLE;
  }

  abstract create(entity: Partial<T>): Promise<T>;
  abstract getAll(): Promise<T[]>;
  abstract getById(id: number): Promise<T | null>;
  abstract getByParams(params: any): Promise<T[] | null>;//@TODO any or Partial<T>
  abstract getOneByParams (params: any) : Promise<T | null>;
  abstract update(entity: Partial<T>): Promise<T | null>;
  abstract delete(id: number): Promise<boolean>;
  protected newfilters = (params:any): string => {
    //const params = { id: 1, name: "test" };
    //const queryString = '?filters={"id":1,"name":"test"}';
    //const queryString = %7B%22id%22%3A1%2C%22name%22%3A%22test%22%7D encoded
      if (!params) {
        return "";
      }    
      const encodeFilter = (filter: any) => `filters=${encodeURIComponent(JSON.stringify(filter))}`;
      if (Array.isArray(params)) {
        return params.map(encodeFilter).join("&");
      }
    
      return `?${encodeFilter(params)}`;
    };

     buildQueryString(params: IParams): string {
    const searchParams = new URLSearchParams();
    
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
      if (key === "filters" && Array.isArray(params[key])) {
        // Encoder les filtres complexes en JSON
        searchParams.append(key, encodeURIComponent(JSON.stringify(params[key])));
      } else {
        searchParams.append(key, String(params[key]));
      }
      }
    }
      return searchParams.toString();
    }
}