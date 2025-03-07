import { User } from "@src/models/User.entity";


export interface UserParams extends Partial<User> {}

export interface UrlSearchParams {
  filters: string;
  limit: string;
  offset: string;
  order: string;
  relations: string[];
}

type Filter = {
	  column: string;
	  operator: string;
	  value: string;
	};
//const filerexample = JSON.stringify([{column:"role",operator:"=",value:"troll"}])

export type ParsedFilters = Filter[]