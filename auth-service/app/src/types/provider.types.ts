export type GithubProfile = {
	id: string;
	nodeId: string;
	displayName: string;
	username: string;
	profileUrl: string;
	photos: { value: string }[];
	provider: string;
	_raw: string;
	_json: any;
};

export type OauthProviderResponse = {
	user: {
	  id: number;
	  role: string;
	};
	token: string;
  };