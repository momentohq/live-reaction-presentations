import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Flex, Card, TextField, Heading, Button } from '@aws-amplify/ui-react';
import Head from 'next/head';
import { getUserDetail } from '../utils/Device';

const ProfilePage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const user = getUserDetail();
    if (user) {
      setUsername(user.username);
    }
  }, []);

  const saveUser = async () => {
    const user = { username };
    localStorage.setItem('user', JSON.stringify(user));   

    if (router.query.redirect) {
      router.push(router.query.redirect);
    } else {
      router.push('/');
    }
  };

  return (
    <>
      <Head>
        <title>Profile | Momento</title>
      </Head>
      <Flex direction="column" width="100%" alignItems="center" marginTop="1em">
        <Card variation="elevated" borderRadius="large" padding="1.5em 3em" width="90%">
          <Flex direction="column" gap="1em">
            <Heading level={4}>Enter Your Info</Heading>
            <TextField label="Display Name" name="userName" placeholder='First name' required value={username} onChange={(e) => setUsername(e.target.value)} />
            <Button variation="primary" onClick={saveUser} width="25%">Save</Button>
          </Flex>
        </Card>
      </Flex>      
    </>
  );
};

export default ProfilePage;