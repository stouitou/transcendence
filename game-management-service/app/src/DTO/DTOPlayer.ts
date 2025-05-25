export interface DTOPlayer {
  type: 'remote' | 'local';
  is_IA: boolean;
  avatar: string;
  display_name: string;
  score: number;
  user: number | null;
}

export class DTOPlayer{
  constructor(data:DTOPlayer) {
    const {type,is_IA,avatar,display_name,score,user} = data;
    this.type = type;
    this.is_IA = is_IA;
    this.avatar = avatar;
    this.display_name = display_name;
    this.score = score;
    this.user = user;
  }
}