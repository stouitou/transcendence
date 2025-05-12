import { Player } from "../entities/Player.ts";

export interface HistoriqueGame {
    maxBounceCount: number; // Plus grand nombre de rebonds                             OK
    mostGoalsConcededPlayer: number; // Le joueur qui s'est pris le plus de buts        OK
    playerWithMostPointsLost: number; // Le joueur ayant perdu le plus de points        OK
    totalBouncesPerPlayer: number; // Le nombre de rebonds total pour chaque joueur     OK
    firstPointScorer?: Player; // Le premier joueur à avoir marqué un point             OK
}