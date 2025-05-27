import { DTOPlayer } from "../DTO/DTOPlayer";

export type ReceivedData = {
    state:string,
    type:'remote' | 'local';
    format:"tournament" | "classic";
    max_players:number;
    players: number[] | null;
    configPlayers: {
      players: DTOPlayer[];
    }
}