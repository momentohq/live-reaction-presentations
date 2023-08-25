import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Flex, Card, Heading, Button, Image, TextField } from '@aws-amplify/ui-react';
import Head from 'next/head';
import { TopicClient, CredentialProvider, Configurations } from '@gomomento/sdk-web';
import { getAuthToken } from '../../utils/Auth';
import { getUserDetail } from '../../utils/Device';
import { toast } from 'react-toastify';
import { badWordList } from '../../lib/bad-words';
import Filter from 'bad-words';
const filter = new Filter();
filter.addWords(...badWordList);

const RacerPage = () => {
  const router = useRouter();
  const { name } = router.query;
  const [topicClient, setTopicClient] = useState(null);
  const [reacter, setReacter] = useState(null);
  const [comment, setComment] = useState('');
  const [canComment, setCanComment] = useState(true);

  useEffect(() => {
    const setupTopicClient = async () => {
      const authToken = await getAuthToken();
      topicClient = new TopicClient({
        configuration: Configurations.Browser.latest(),
        credentialProvider: CredentialProvider.fromString({ authToken })
      });

      setTopicClient(topicClient);
    };

    const user = getUserDetail();
    if (!user?.username) {
      router.push(`/profile?redirect=${router.asPath}`);
    } else {
      setReacter(user);
      setupTopicClient();
    }
  }, [name]);

  const sendReaction = async (reaction) => {
    const data = {
      type: 'reaction',
      username: reacter.username,
      reaction
    }
    await topicClient.publish(process.env.NEXT_PUBLIC_CACHE_NAME, name, JSON.stringify(data));
  };

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter' && comment != '') {
      const data = {
        type: 'comment',
        username: reacter.username,
        message: comment
      }

      if(filter.isProfane(comment)){
        toast.error('Your comment cannot contain profanity.', { position: 'top-right', autoClose: 5000, draggable: false, hideProgressBar: true, theme: 'colored' });
        setComment('');
        return;
      }

      await topicClient.publish(process.env.NEXT_PUBLIC_CACHE_NAME, name, JSON.stringify(data));
      setComment('');

      setCanComment(false);
      setTimeout(() => setCanComment(true), 10000); //throttle commenting for 10 seconds
    }
  };

  return (
    <>
      <Head>
        <title>Live Reactions | Momento</title>
      </Head>
      <Flex direction="column" width="100%" alignItems="center" marginTop="1em">
        <Card variation="elevated" borderRadius="large" padding="1.5em 3em" width="90%">
          <Flex direction="column" gap="1em" alignItems="center">
            <Heading level={4} textAlign="center">Press on a reaction below to send it to the presenter!</Heading>
            <Flex direction="row" gap="1em" wrap="wrap" alignItems="center" justifyContent="center">
              <Button variation="link" name="mo-profile" onClick={(e) => sendReaction(e.target.name)} >
                <Flex name="mo-profile" direction="column" alignItems="center" justifyContent="center" gap=".3em">
                  <Image name="mo-profile" src="/mo-profile.png" width="45%" borderRadius="50%" boxShadow="large" />
                </Flex>
              </Button>
              <Button variation="link" name="faux-mo-profile" onClick={(e) => sendReaction(e.target.name)} >
                <Flex name="faux-mo-profile" direction="column" alignItems="center" justifyContent="center" gap=".3em">
                  <Image name="faux-mo-profile" src="/faux-mo-profile.png" width="45%" borderRadius="50%" boxShadow="large" />
                </Flex>
              </Button>
              <Button variation="link" name="ko-profile" onClick={(e) => sendReaction(e.target.name)} >
                <Flex name="ko-profile" direction="column" alignItems="center" justifyContent="center" gap=".3em">
                  <Image name="ko-profile" src="/ko-profile.png" width="45%" borderRadius="50%" boxShadow="large" />
                </Flex>
              </Button>
            </Flex>
            <TextField
              isDisabled={!canComment}
              descriptiveText="Have a question or comment? Type it in and hit Enter."
              placeholder={canComment ? 'This is a great presentation!': 'Please wait 10 seconds...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </Flex>
        </Card>
      </Flex>
    </>
  );
};

export default RacerPage;

