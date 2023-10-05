import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CacheClient, CredentialProvider, Configurations, CacheSortedSetFetch } from '@gomomento/sdk-web';
import { Flex, Card, Text, Loader, Image, Heading, ThemeProvider, Divider, Table, TableCell, TableHead, TableRow, TableBody, Button } from '@aws-amplify/ui-react';
import { getAuthToken } from '../../utils/Auth';
import { FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ResultsPage = () => {
  const router = useRouter();
  const { name } = router.query;
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [reacters, setReacters] = useState([]);

  useEffect(() => {
    async function loadSlides() {
      try {
        const response = await fetch(`/api/slides/${name}`);
        const data = await response.json();
        if (response.status > 299) {
          setIsSuccess(false);
          setMessage(data.message)
        } else {
          setIsSuccess(true);
          setTitle(data.title);
        }
      } catch (err) {
        console.error(err);
        setIsSuccess(false);
      } finally {
        setIsLoaded(true);
      }
    }

    if (name) {
      loadSlides();
    }
  }, [name]);

  useEffect(() => {
    async function loadReactions() {
      const authToken = await getAuthToken();
      const client = new CacheClient({
        configuration: Configurations.Laptop.latest(),
        credentialProvider: CredentialProvider.fromString({ authToken }),
        defaultTtlSeconds: 7200 // 2 hours
      });

      const reactionLeaderboard = await getLeaderboard(client, name);
      const reacterLeaderboard = await getLeaderboard(client, `${name}-reacters`);
      setReactions(reactionLeaderboard);
      setReacters(reacterLeaderboard);
    }

    if (isSuccess) {
      loadReactions();
    }
  }, [isSuccess]);

  const getLeaderboard = async (cacheClient, leaderboardName) => {
    let board;
    const leaderboardResponse = await cacheClient.sortedSetFetchByRank(process.env.NEXT_PUBLIC_CACHE_NAME, leaderboardName, { startRank: 0, order: 'DESC' });
    if (leaderboardResponse instanceof CacheSortedSetFetch.Hit) {
      const results = leaderboardResponse.valueArrayStringElements();
      if (results.length) {
        board = results.map((result, index) => {
          return {
            rank: index + 1,
            username: result.value,
            score: result.score
          };
        });
      }
    } else if (leaderboardResponse instanceof CacheSortedSetFetch.Error) {
      console.error(leaderboardResponse.errorCode(), leaderboardResponse.message());
      toast.error('Could not load leaderboard', { position: 'top-right', autoClose: 10000, draggable: false, hideProgressBar: true, theme: 'colored' });
    }

    return board;
  };

  if (!isLoaded) {
    return <Loader size="4em" />;
  }

  return (
    <>
      <ThemeProvider theme={theme}>
        <Head>
          <title>{`${title} Emoji Results`}</title>
        </Head>
        <Flex direction="column" width="100%" alignItems="center" justifyContent="center">
          {!isSuccess ? (
            <Card variation="elevated" borderRadius="large" padding="1.5em 3em" width="90%">
              <Flex direction="column" alignItems="center" gap="1em">
                {isLoaded && (
                  <>
                    <Heading level={4}>{title}</Heading>
                    <Text textAlign="center">{message}</Text>
                    <Image src="/mo-sad.png" width="10em" />
                  </>
                )}
              </Flex>
            </Card>
          ) : (
            <>
              <Card variation="elevated" width="95%" borderRadius="medium">
                <Flex direction="row" justifyContent="space-between" alignItems="center">
                  <Button variation="link" onClick={() => router.back()}>
                    <Flex direction="row" alignItems="center">
                      <FiArrowLeft size="1.5em" color="black" />
                      <Heading level={5}>Back</Heading>
                    </Flex>
                  </Button>
                  <Heading level={4}>{`${title} - Reaction Results`}</Heading>
                  <Flex />
                </Flex>
              </Card>
              <Flex direction="row" alignContent="space-between" justifyContent="center" width="100%" padding="0em 2em" height="92vh">
                <Flex direction="column" gap="1em" basis="48%" height="min-content">
                  <Card variation="elevated" backgroundColor="#C4F135">
                    <Heading level={4} textAlign="center">Most Used Reactions</Heading>
                  </Card>
                  <Table title="Most Used Reactions" variation="striped" highlightOnHover boxShadow="medium" backgroundColor="#AEE2B3" >
                    <TableHead>
                      <TableRow backgroundColor="white">
                        <TableCell as="th" colSpan={3}>Reaction</TableCell>
                        <TableCell as="th">Times Used</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reactions?.map(entry => (
                        <TableRow key={entry.username}>
                          <TableCell colSpan={3}>{entry.username}</TableCell>
                          <TableCell>{entry.score}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Flex>
                <Divider orientation="vertical" size="large" />
                <Flex direction="column" basis="48%" position="relative">
                  <Card variation="elevated" backgroundColor="#C4F135">
                    <Heading level={4} textAlign="center">Who Sent the Most?</Heading>
                  </Card>
                  <Table title="Biggest Reacters" variation="striped" highlightOnHover boxShadow="medium" backgroundColor="#AEE2B3" >
                    <TableHead>
                      <TableRow backgroundColor="white">
                        <TableCell as="th">Rank</TableCell>
                        <TableCell as="th" colSpan={3}>Username</TableCell>
                        <TableCell as="th">Reactions Used</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reacters?.map(entry => (
                        <TableRow key={entry.username}>
                          <TableCell>{entry.rank}</TableCell>
                          <TableCell colSpan={3}>{entry.username}</TableCell>
                          <TableCell>{entry.score}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Flex>
              </Flex>
            </>
          )}
        </Flex>
      </ThemeProvider>
    </>
  );
};

const theme = {
  name: 'table-theme',
  tokens: {
    components: {
      table: {
        row: {
          hover: {
            backgroundColor: { value: '{colors.blue.20}' },
          },

          striped: {
            backgroundColor: { value: '{colors.green.10}' },
          },
        },

        header: {
          color: { value: '{colors.green.80}' },
          fontSize: { value: '{fontSizes.large}' },
        },

        data: {
          fontWeight: { value: '{fontWeights.semibold}' },
        },
      },
    },
  },
};

export default ResultsPage;
