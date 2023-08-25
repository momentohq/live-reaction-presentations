import short from 'short-uuid';

export const generateUserId = () => {
  let user = getUserDetail();
  if(!user){
    user = {}
  }

  if(!user.id){
    user.id = short.generate();
  }

  localStorage.setItem('user', JSON.stringify(user));

  return user.id;
};

export const getUserDetail = () => {
  const user = localStorage.getItem('user');
  if(user){
    return JSON.parse(user);
  }
};
