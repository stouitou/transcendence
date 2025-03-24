
export const getEnvVariable = (key: string): string =>{
	const value = process.env[key];
  
	if (!value || value.length === 0) {
	  console.error(`The environment variable ${key} is not set.`);
	  throw new Error(`The environment variable ${key} is not set.`);
	}
  
	return value;
  }

export const getServerAddress = ()=> {
	const host = getEnvVariable('BACKEND_SERVER_NAME_API');
	const port = getEnvVariable('BACKEND_SERVER_SSH_PORT');
	return {host: host, port: port};
}