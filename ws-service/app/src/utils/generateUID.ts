export const generateUID = () => {
	const randomNumber = Math.random().toString(36).substring(2, 15);
	const timestamp = Date.now().toString(36);
	return randomNumber + timestamp;
  };