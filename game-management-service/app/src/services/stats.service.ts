import { Players } from "../models/Players";
import { User, UserStats } from "../models/User";
import UserRepository from "../repository/User.repository";

export class StatsService {
  private userRepo = new UserRepository();

  async updateUserStats(users: User[], winner: Players, type: 'local' | 'remote') {
    await Promise.all(users.map(async user => {
      if (!user || typeof user === 'number') return null;
      const result = user.name === winner.display_name ? 'won' : 'lost';
      const updatedStats = buildUserStatsResult(user, 'tournament', type, result as 'won' | 'lost');
      return await this.userRepo.update(updatedStats);
    }));
  }
}


//for tournament only
  export const buildUserStatsResult = (user: User, format:"classic"|"tournament",type:'local'|'remote', fieldName: `won`| `lost` | `draw`) => {
	const userStats:UserStats = { 
	  ...user.userStats,
	  [`${format}_${type}_game_${fieldName}`]: user.userStats[`${format}_${type}_game_${fieldName}`] + 1,
	  // [`<classic|tournament>_<local|remote>_game_<won|lost|draw>`]: user.userStats[`<classic|tournament>_<local|remote>_game_<won|lost|draw>`] + 1,
  
	};
	//si le format est "classic" , on incrémente le total_game_<won|lost|draw>
	 if (format === "tournament") {
	  userStats[`${format}_total_game_${fieldName}`] = user.userStats[`${format}_total_game_${fieldName}`] + 1;
	}
	//update level for user local
	if (fieldName === "won") {
	  if (type==='local' && format === "classic") {
		user.level = user.level?user.level + 1:1; //increment level for classic local won
	  }
	  if (type==='remote' && format === "classic") {
		user.level = user.level?user.level + 2:2; //increment level for classic remote won
	  }
	  if (type==='local' && format === "tournament") {
		user.level = user.level?user.level + 1:1; //increment level for tournament local won
	  }
	  if (type==='remote' && format === "tournament") {
		user.level = user.level?user.level + 2:2; //increment level for tournament remote won
	  }
	}
	return {id:user.id,userStats,level:user.level};
  }