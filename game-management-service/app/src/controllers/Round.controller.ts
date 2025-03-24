import { FastifyRequest, FastifyReply } from 'fastify';
import  RoundRepository  from '@src/repository/Round.repository';
import { RoundBody } from '@src/models/Round';

export class RoundController {
  private roundRepository = new RoundRepository();
  constructor() {
    this.roundRepository = new RoundRepository()
    this.createRound = this.createRound.bind(this);
    this.getRounds = this.getRounds.bind(this);
    this.getRoundById = this.getRoundById.bind(this);
    this.updateRound = this.updateRound.bind(this);
    this.deleteRound = this.deleteRound.bind(this);
  }

    async createRound(request: FastifyRequest<{ Body: RoundBody }>, reply: FastifyReply) {  
      const { ...requestBody } = request.body;
      const round = await this.roundRepository.create(requestBody);
      if (!round) {
        return reply.status(404).send({ error: 'round not created' });
      }
      return reply.status(201).send(round);
    }

  async getRounds(request: FastifyRequest, reply: FastifyReply) {  
    console.log("--RoundController getRounds ");
    const rounds = await  this.roundRepository.getAll();
        console.log("RoundController getRounds ",rounds);
    return reply.send(rounds);
  }

  async getRoundById(request:  FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const roundId = Number(request.params.id);
    const round = await this.roundRepository.getById(roundId);
        if (!round) {
      return reply.status(404).send({ error: 'Round not found' });
    }
    return reply.send(round);
  }

  async updateRound(request: FastifyRequest<{ Params: { id: string }, Body: {state:string} }>, reply: FastifyReply) {
    const roundId = Number(request.params.id);
    if (!roundId) {
      return reply.status(400).send({ error: 'Invalid round id' });
    }
    if (!request.body) {
      return reply.status(400).send({ error: 'Invalid request body' });
    }
    const { ...requestBody } = request.body;
    const { state } = requestBody;

    const round = await this.roundRepository.update({id:roundId,state});
    console.log("RoundController updateRound ",round);

    if (!round) {
      return reply.status(404).send({ error: 'Round not found' });
    }
    return reply.send(round);
  }
  
  async deleteRound(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const roundId = parseInt(request.params.id);
    const round = await this.roundRepository.delete(roundId);
    return reply.send(round);
  }
}


