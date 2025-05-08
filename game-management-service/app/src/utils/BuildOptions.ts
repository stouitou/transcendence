export interface UrlSearchParams {
	filters: string;
	limit: string;
	offset: string;
	order: string;
	relations: string[];
  }
export class BuildOptions {
  private limits: number | undefined;
  private offsets: number | undefined;
  private orders: "ASC" | "DESC" | undefined;
  private relations: string[] | undefined;
  private total: number | undefined
  constructor(private options: UrlSearchParams) {
	//set default values
	this.limits = undefined;
	this.offsets = undefined;
	this.orders = undefined;
	this.relations = undefined;
	this.total = undefined;
	this.setLimits(options.limit);
	this.setOffsets(options.offset);
	this.setOrders(options.order as "ASC" | "DESC");
	this.setRelations(options.relations);
  }
  setLimits(limit: number | undefined | string) {
	if (limit) {
	  this.limits = Number(limit);
	}
  }
  setOffsets(offset: number | undefined | string) {
	if (offset) {
	  this.offsets = Number(offset);
	}
  }
  setOrders(order: "ASC" | "DESC") {
	this.orders = order;
  }
  setRelations(relations: string | string[]) {
	if (typeof relations === "string") {
	  relations = relations.split(",");
	}    
	this.relations = relations;
  }
  getOptions() : {limit?: number; offset?: number; order?: "ASC" | "DESC"; relations?: string[], total?: number} {
	return {limit: this.limits, offset: this.offsets, order: this.orders, relations: this.relations};
  }
}