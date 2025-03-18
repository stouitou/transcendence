import { FastifyRequest, FastifyReply } from 'fastify';
import  TournamentsRepository  from '@src/repository/Tournament.repository';
import { TournamentsBody } from '@src/models/Tournaments';
import { User } from '@src/models/User';
import { Game } from '@src/models/Game';
import RoundRepository from '@src/repository/Round.repository';

export class TournamentsController {
 private tournamentsRepository = new TournamentsRepository();
  constructor() {
    this.tournamentsRepository = new TournamentsRepository()
    this.createTournament = this.createTournament.bind(this);
    this.getTournaments = this.getTournaments.bind(this);
    this.getTournamentById = this.getTournamentById.bind(this);
    this.updateTournament = this.updateTournament.bind(this);
    this.deleteTournament = this.deleteTournament.bind(this);
    this.addPlayerToTournament = this.addPlayerToTournament.bind(this);
    this.closeRegistrationsAndGenerateFirstRound = this.closeRegistrationsAndGenerateFirstRound.bind(this);
    this.generateNextRound = this.generateNextRound.bind(this);
    this.updateMatchResult = this.updateMatchResult.bind(this);
  }
  //1- ON CREE UN TOURNOI

  //2 - ON AJOUTE UN JOUEUR AU TOURNOI
  //add player to tournament
  async addPlayerToTournament(request: FastifyRequest<{ Params: { id: string }, Body: {playerId:number} }>, reply: FastifyReply) {
    //@TODO definir une limite au nombre de joueurs
    const gameId = Number(request.params.id);
    const { playerId } = request.body;
    console.log("🔐TournamentsController addPlayerToTournament()  --gameId--",gameId
    , " --playerId--",playerId);
    const tournament = await this.tournamentsRepository.addPlayer(gameId, Number(playerId));
    if (!tournament) {
      return reply.status(404).send({ error: 'game not found' });
    }
    return reply.send(tournament);
  }


  //3 - ON FERME LES INSCRIPTIONS ET ON GENERE LE PREMIER ROUND
  //close registrations and generate first round
  async closeRegistrationsAndGenerateFirstRound(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameId = Number(request.params.id);
    const tournament = await this.tournamentsRepository.getById(gameId);
    if (!tournament) {
        return reply.status(404).send({ error: 'Tournament not found' });
    }
    const {players} = tournament;
    if (!players) {
        return reply.status(400).send({ error: 'No players in the tournament' });
    }
    if (players.length < 2) {
        return reply.status(400).send({ error: 'Not enough players to generate a tournament' });
    }

    const matches = this.generateMatches(players);
    const roundRepository = new RoundRepository();
    const rounds = await roundRepository.create({games:matches,state:'in_progress',current:0});
    //update the tournament 

    const updatedTournament = await this.tournamentsRepository.update({id:gameId,rounds:[{id:rounds.id}],state:'in_progress',currentRound:0});
   

    
    return reply.send(updatedTournament);
}
//** - utils: ON GENERE LES MATCHS
//generate matches
generateMatches(players: User[]): {players: Partial<User>[]}[] {
  const matches = [];
  for (let i = 0; i < players.length; i += 2) {
      if (i + 1 < players.length) {
          matches.push({players:[{id:players[i].id}, {id:players[i + 1].id}]});
      } else {
          matches.push({players:[{id:players[i].id}, { id: 0, name: 'IA' }]});
         // matches.push([players[i],  new User({ id: 0, name: 'IA' })]);
      }
  }
  return matches;
}

//4 - ON GENERE LE ROUND SUIVANT
//generate next round
async generateNextRound(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const gameId = Number(request.params.id);
  const tournament = await this.tournamentsRepository.getById(gameId);
  if (!tournament) {
      return reply.status(404).send({ error: 'Tournament not found' });
  }
  // Check if the tournament is in progress
  if (tournament.state !== 'in_progress') {
      return reply.status(400).send({ error: 'Tournament is not in progress' });
  }
  // Check if the current round exist and is finished
  const currentRoundIndex = tournament.currentRound;
  if (currentRoundIndex === tournament.rounds.length - 1) {
     //check if the current round is finished
      const currentRound = tournament.rounds[currentRoundIndex];
      const isRoundFinished = currentRound.every(match => match[0].id !== 0 && match[1].id !== 0);
      if (!isRoundFinished) {
          return reply.status(400).send({ error: 'Current round is not finished' });
      }
  }
  //check if the current round is the final round
  if (tournament.rounds[currentRoundIndex].length === 1) {
      //c'est la finale
      //on verifie le resultat
      const finalMatch:Game = tournament.rounds[currentRoundIndex][0];
      if (finalMatch.gameHistory) {//si le match a un historique
        //on verifie le resultat
        const winner = finalMatch.gameHistory.score1 > finalMatch.gameHistory.score2 ? finalMatch.players[0] : finalMatch.players[1];
      //  tournament.winner = winner;
        return reply.status(200).send({ winner });
    }
  }

  const lastRound = tournament.rounds[currentRoundIndex];
  const winners = lastRound.map(match => match[0]); // Assuming the first player in each match is the winner

  if (winners.length < 2) {
      return reply.status(400).send({ error: 'Not enough players to generate the next round' });
  }

  const nextRound = this.generateMatches(winners);
  tournament.rounds.push(nextRound);
  tournament.currentRound += 1;
  await this.tournamentsRepository.update(tournament);
  return reply.send(tournament);
}

//5 - ON MET A JOUR LE RESULTAT D'UN MATCH
//update match result
async updateMatchResult(request: FastifyRequest<{ Params: { id: string }, Body: { roundIndex: number, matchIndex: number, winnerId: number } }>, reply: FastifyReply) {
  const gameId = Number(request.params.id);
  const { roundIndex, matchIndex, winnerId } = request.body;
  const tournament = await this.tournamentsRepository.getById(gameId);
  if (!tournament) {
      return reply.status(404).send({ error: 'Tournament not found' });
  }

  tournament.rounds[roundIndex][matchIndex][0] = winnerId; // Update the winner
  await this.tournamentsRepository.update(tournament);
  return reply.send(tournament);
}


  async generateTournament(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameId = Number(request.params.id);
    const tournament = await this.tournamentsRepository.getById(gameId);
    if (!tournament) {
        return reply.status(404).send({ error: 'game not found' });
    }

    const { players } = tournament;
    if (!players) {
        return reply.status(400).send({ error: 'No players in the tournament' });
    }

    if (players.length < 2) {
        return reply.status(400).send({ error: 'Not enough players to generate a tournament' });
    }

    const matches = this.generateMatches(players);
    tournament.rounds = [matches];
    await this.tournamentsRepository.update(tournament);
    return reply.send(tournament);

/*     const rounds = [];//@TODO : à revoir const rounds = [[user1, user2], [user3, user4], [user5, user6], [user7, user8]];
    let currentRound:User[] = players; // [user1, user2, user3, user4, user5, user6, user7, user8];

    while (currentRound.length > 1) {
        const nextRound:User[][] = [];
        for (let i = 0; i < currentRound.length; i += 2) {
            if (i + 1 < currentRound.length) {
                nextRound.push([currentRound[i], currentRound[i + 1]]);
            } else {
                nextRound.push([currentRound[i], new User({ id: 0, name: 'IA' })]);
            }
        }
        rounds.push(nextRound);
        currentRound = nextRound.map(match => match[0]);
    }

    tournament.rounds = rounds;
    await this.tournamentsRepository.update(tournament);
    return reply.send(tournament); */
}






  //generer un tournoi avec les players
  async generateTournament2(request: FastifyRequest<{ Body: TournamentsBody }>, reply: FastifyReply) {
    //0- le nombre de joueurs inscrit sert de reference
    // a chaque round, on divise par 2 le nombre de joueurs
    //le tournois se termine quand il ne reste plus qu'un joueur
    // exemple : 1,2,3,4,5,6,7,8
    // round 1 : 1-8, 2-7, 3-6, 4-5
    // round 2 : 1-4, 2-3
    // round 3 : 1-2
    // round 4 : 1 (gagnant)

    //1- recuperer les joueurs
    //1-1 si le nombre de joueurs est egal à 2, generer un match
    //1-2 si le nombre de joueurs est egal à 1, generer un match IA
    //1-3 si le nombre de joueurs est superieur à 2, generer un tournoi

    //2- generer les matchs


    //1-1- verifier si le nombre de joueurs est pair (sinon ajouter un joueur IA)
    //1-2- verifier si le nombre de joueurs est superieur à 2
    //2- generer les matchs (1/4, 1/2, 1/1)
    //2-1- verifier si le nombre de matchs est pair (sinon ajouter un match IA)

    //3- generer les scores
    //4- generer les classements
    //5- generer les gagnants

  }

    async createTournament(request: FastifyRequest<{ Body: TournamentsBody }>, reply: FastifyReply) {  
      const { ...requestBody } = request.body;
      //const users = await UserRepository.create(requestBody);
      const users = await this.tournamentsRepository.create(requestBody);
      if (!users) {
        return reply.status(404).send({ error: 'User not found' });
      }
      return reply.status(201).send(users);
    }

  async getTournaments(request: FastifyRequest, reply: FastifyReply) {  
    console.log("--UserController getTournaments ");
       // const users = await UserRepository.getAll();
    const users = await  this.tournamentsRepository.getAll();
        console.log("UserController getTournaments ",users);
    return reply.send(users);
  }


  async getTournamentById(request:  FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameId = Number(request.params.id);    
  //  const user = await this.userService.getTournament(gameId);
    //const user = await UserRepository.getById(gameId);
    const game = await this.tournamentsRepository.getById(gameId);
        if (!game) {
      return reply.status(404).send({ error: 'game not found' });
    }
    return reply.send(game);
  }

  async updateTournament(request: FastifyRequest<{ Params: { id: string }, Body: {state:string} }>, reply: FastifyReply) {
    const gameId = Number(request.params.id);
    if (!gameId) {
      return reply.status(400).send({ error: 'Invalid user id' });
    }
    if (!request.body) {
      return reply.status(400).send({ error: 'Invalid request body' });
    }
    const { ...requestBody } = request.body;
    const { state } = requestBody;

    //check if user exists
   // const user = await UserRepository.update(gameId,requestBody);
    const user = await this.tournamentsRepository.update({id:gameId,state});//@TODO providers??
    console.log("UserController updateTournament ",user);

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    return reply.send(user);
  }
  
  async deleteTournament(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const gameId = parseInt(request.params.id);
    //const user = await this.userService.deleteTournament(gameId);
   // const user = await UserRepository.delete(gameId);
    const user = await this.tournamentsRepository.delete(gameId);
    return reply.send(user);
  }
}


