import { GameHistory } from "./GameHistory";
import { User } from "./User";
export interface Players {
  id?: number;
  is_IA: boolean;
  gameHistory?: GameHistory;
  type: "remote" | "local";
  avatar?: string;
  display_name?: string;
  score: number;
  user?: User | null | number;
}