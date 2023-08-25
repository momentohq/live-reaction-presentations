import React, { useEffect, useState } from 'react';
import { Flex, Image } from '@aws-amplify/ui-react';
import { useRouter } from 'next/router';
import { getUserDetail } from '../utils/Device';

const Header = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  useEffect(() => {
    const user = getUserDetail();
    if (user) {
      setUsername(user.username);
    }
  }, []);

  return (
    <>
      <Flex direction="row" justifyContent="space-between" alignContent="center" padding="10px" backgroundColor="#25392B" boxShadow="medium">
        <Image src="/logo.png" maxHeight="3em" style={{cursor: "pointer"}} onClick={() => router.push('/')}/>
        <Flex
          alignItems="center"
          justifyContent="center"
          borderRadius="xxl"
          backgroundColor="#C4F135"
          width="2.5em"
          height="2.5em"
          style={{cursor: "pointer"}}
          onClick={() => router.push(`/profile${router.pathname == "/" ? '' : "?redirect=" + router.asPath}`)}>
          {username?.charAt(0).toUpperCase()}
        </Flex>
      </Flex>
    </>
  );
};

export default Header;