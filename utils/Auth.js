import { getUserDetail, generateUserId } from "./Device";

export const getAuthToken = async () => {
  const storedCredentials = sessionStorage.getItem('credentials');
  if (storedCredentials) {
    const creds = JSON.parse(storedCredentials);
    if (!creds.exp || creds.exp < Date.now()) {
      sessionStorage.removeItem('credentials');
    } else {
      return creds.token;
    }
  }

  const user = getUserDetail();
  if(!user.id){
    const id = generateUserId();
    user.id = id;
  }
  const response = await fetch(`/api/tokens?user=${user.id}`);
  const data = await response.json();
  sessionStorage.setItem('credentials', JSON.stringify(data));
  return data.token;
};