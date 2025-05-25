import { DTOPlayer } from "@src/DTO/DTOPlayer";

export function splitIntoPairs(players: DTOPlayer[]): DTOPlayer[][] {
  const pairs: DTOPlayer[][] = [];
  for (let i = 0; i < players.length; i += 2) {
    pairs.push(players.slice(i, i + 2));
  }
  return pairs;
}

export function mergePlayersWithIA(players: DTOPlayer[], playersIa: DTOPlayer[]): DTOPlayer[][] {
    const merged: DTOPlayer[] = [];
    const maxLength = Math.max(players.length, playersIa.length);
  
    for (let i = 0; i < maxLength; i++) {
      if (i < players.length) {
        merged.push(players[i]); // Ajouter un joueur
      }
      if (i < playersIa.length) {
        merged.push(playersIa[i]); // Ajouter une IA
      }
    }
  
    return splitIntoPairs(merged);
  }