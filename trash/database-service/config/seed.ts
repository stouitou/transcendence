import { FastifyInstance } from 'fastify';
import { User } from '../models/User.entity';
import { EntityRepository } from '@src/repositories/Entity.repository';
import { faker } from '@faker-js/faker';
import { Tournaments } from '@src/models/Tournament.entity';
import { Round } from '@src/models/Round.entity';
import { Game } from '@src/models/Game.entity';

class Seed {

    private database: string;
constructor(private app:FastifyInstance) {
    console.log('🔐 seed.ts  --constructor--')

    this.app = app;
    this.database = 'myDb';
    this.seedUsers = this.seedUsers.bind(this);

    }
    async seedUsers() {
        const entity = 'User';
        //0- Récupérer la base de données par son nom
        const entityDataSource = (await this.app.DB.getDataBase(this.database));
        //1- Trouver l'entité par son nom
        const entityClass = entityDataSource.getEntityByName(entity);
        //2- Créer une instance de EntityRepository
        const repository =  new EntityRepository(entityDataSource.getDataSource() ,entityClass!);

        // Générer des utilisateurs factices
        for (let i = 0; i < 10; i++) {
            const user = new User();
            user.name = faker.internet.username(),
            user.role = 'user';
            user.level = 1;
            user.avatar = faker.image.avatar();
            user.created_at = new Date();
            user.updated_at = new Date();
            await repository.create(user);
        }
        return repository.findAll();
    }
    async seedRoundTournaments() {
        //0- Récupérer la base de données par son nom
        const entityDataSource = (await this.app.DB.getDataBase(this.database));
        /**get Users */
        const UserClass = entityDataSource.getEntityByName('User');
        const userRepository =  new EntityRepository(entityDataSource.getDataSource() ,UserClass!);
        const users = await userRepository.findAll() as User[];

        //1- Trouver l'entité par son nom
        const entity = 'Round';
        const entityClass = entityDataSource.getEntityByName(entity);
        //2- Créer une instance de EntityRepository
        const repository =  new EntityRepository(entityDataSource.getDataSource() ,entityClass!);

        // Générer des rounds factices
        for (let i = 0; i < 1; i++) {
            const round = new Round();
            round.players = [users[0], users[1], users[2], users[3]];
            //games
            const game1 = new Game();
            game1.players = [users[0], users[1]];
            game1.state = 'in_progress';
            const game2 = new Game();
            game2.players = [users[2], users[3]];
            game2.state = 'in_progress';

           // round.games = [{players:[{id:1}, {id:2}]},{players:[{id:3}, {id:4}]}];
            round.games = [game1, game2];
            round.state = 'in_progress';
            round.current = 0;

            await repository.create(round);
        }
        return repository.findAll();
    }
    async seedTournaments() {

        //0- Récupérer la base de données par son nom
        const entityDataSource = (await this.app.DB.getDataBase(this.database));

        /**get Users */
        const UserClass = entityDataSource.getEntityByName('User');
        const userRepository =  new EntityRepository(entityDataSource.getDataSource() ,UserClass!);
        const users = await userRepository.findAll();
        /**get Round */
        const RoundClass = entityDataSource.getEntityByName('Round');
        const roundRepository =  new EntityRepository(entityDataSource.getDataSource() ,RoundClass!);
        const rounds = await roundRepository.findAll();



        const entity = 'Tournaments';
        //1- Trouver l'entité par son nom
        const entityClass = entityDataSource.getEntityByName(entity);
        //2- Créer une instance de EntityRepository
        const repository =  new EntityRepository(entityDataSource.getDataSource() ,entityClass!);

        // Générer des tournois factices
        for (let i = 0; i < 1; i++) {
            const tournament = new Tournaments();
            tournament.players = [users[0].id, users[1].id, users[2].id, users[3].id];
            tournament.rounds = [rounds[0].id];
            tournament.state = 'in_progress';
            tournament.currentRound = 0;

            await repository.create(tournament);
        }
        return repository.findAll();
    }
    //tournois resultats


}
export default Seed;