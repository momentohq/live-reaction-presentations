import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { TopicClient, CacheClient, CredentialProvider, Configurations } from '@gomomento/sdk-web';
import { Flex, Card, Text, Loader, Image, Heading, Link, View, Button } from '@aws-amplify/ui-react';
import { getAuthToken } from '../../utils/Auth';
import { FiArrowRight } from 'react-icons/fi';
import Comment from '../../components/Comment';
import QRCode from 'react-qr-code';
import styles from '../../styles/animations.module.css';
import commentStyles from '../../styles/comment.module.css';

const PresentPage = () => {
  const router = useRouter();
  const { name } = router.query;
  const [images, setImages] = useState([]);
  const [comments, setComments] = useState([]);
  const [title, setTitle] = useState("");
  const [slidesId, setSlidesId] = useState(null);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cacheClient, setCacheClient] = useState(null);
  const [topicClient, setTopicClient] = useState(null);
  const [reactionSubscription, setReactionSubscription] = useState(null);
  const [iframeHeight, setIframeHeight] = useState('75vh');
  const [shouldResize, setShouldResize] = useState(true);
  const [isListening, setIsListening] = useState(true);
  const iframeContainerRef = useRef(null);
  const cacheClientRef = useRef(cacheClient);
  const topicClientRef = useRef(topicClient);

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
          setSlidesId(data.id);
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
    if (router.query.height) {
      setShouldResize(false);
      setIframeHeight(`${router.query.height}px`);
    }
  }, [router.query.height]);

  useEffect(() => {
    async function subscribeForReactions() {
      const authToken = await getAuthToken();
      const client = new CacheClient({
        configuration: Configurations.Laptop.latest(),
        credentialProvider: CredentialProvider.fromString({ authToken }),
        defaultTtlSeconds: 7200 // 2 hours
      });

      updateCacheClient(client);

      const topics = new TopicClient({
        configuration: Configurations.Browser.latest(),
        credentialProvider: CredentialProvider.fromString({ authToken })
      });

      updateTopicClient(topics);

      if (!reactionSubscription) {
        const subscription = await topics.subscribe(process.env.NEXT_PUBLIC_CACHE_NAME, name, {
          onItem: (message) => { sendReaction(message.valueString()) },
          onError: (err) => { console.error(err) }
        });

        setReactionSubscription(subscription);
      }
    }

    function handleResize() {
      if (iframeContainerRef.current) {
        const width = iframeContainerRef.current.clientWidth;
        const aspectRatio = (839 / 1440); // This is height / width
        setIframeHeight(`${width * aspectRatio}px`);
      }
    }

    if (slidesId) {
      subscribeForReactions();
      handleResize();

      if (shouldResize) {
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }
    }

    return () => {
      reactionSubscription?.unsubscribe();
    }
  }, [slidesId]);

  useEffect(() => {
    async function handleListeningChange() {
      if (reactionSubscription && !isListening) {
        reactionSubscription.unsubscribe();
        setReactionSubscription(null);
      } else if (!reactionSubscription && isListening) {
        const subscription = await topicClient.subscribe(process.env.NEXT_PUBLIC_CACHE_NAME, name, {
          onItem: (message) => { sendReaction(message.valueString()) },
          onError: (err) => { console.error(err) }
        });

        setReactionSubscription(subscription);
      }
    }
    if (isLoaded) {
      handleListeningChange();
    }
  }, [isListening]);

  const updateCacheClient = (client) => {
    cacheClientRef.current = client;
    setCacheClient(client);
  };

  const updateTopicClient = (client) => {
    topicClientRef.current = client;
    setTopicClient(client);
  };

  const sendReaction = async (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type == 'reaction') {
        triggerReactionAnimation(data.reaction);
        await cacheClientRef.current.sortedSetIncrementScore(process.env.NEXT_PUBLIC_CACHE_NAME, `${name}-reacters`, data.username);
        await cacheClientRef.current.sortedSetIncrementScore(process.env.NEXT_PUBLIC_CACHE_NAME, name, data.reaction);
      } else if (data.type == 'comment') {
        triggerCommentAnimation(data.message, data.username);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const triggerReactionAnimation = (reaction) => {
    const newImage = {
      id: Date.now(),
      reaction,
      xPos: Math.random() * (window.innerWidth - 100)  // 100px for the image width
    };
    setImages(prevImages => [...prevImages, newImage]);

    setTimeout(() => {
      setImages(prevImages => prevImages.filter(image => image.id !== newImage.id));
    }, 3500);  // 3000 to make the animation last 3 seconds
  }

  const triggerCommentAnimation = (message, username) => {
    const newComment = {
      id: Date.now(),
      message,
      username,
      xPos: Math.random() * (window.innerWidth - 200)
    };
    setComments(prevComments => [...prevComments, newComment]);

    setTimeout(() => {
      setComments(prevComments => prevComments.filter(comment => comment.id !== newComment.id));
    }, 6000);
  }

  if (!isLoaded) {
    return <Loader size="4em" />;
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Flex direction="column" width="100%" alignItems="center">
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
        ) :
          (
            <Flex direction="column" gap="1em" width="100%" alignItems="center">
              <View width="99%" margin="auto" height={iframeHeight}>
                <View ref={iframeContainerRef} position="relative" overflow="hidden" width="100%" paddingTop="58.333%">
                  <iframe
                    src={`https://docs.google.com/presentation/d/e/${slidesId}/embed?start=false&loop=false&delayms=60000`}
                    allowFullScreen={true}
                    mozallowfullscreen="true"
                    webkitallowfullscreen="true"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: iframeHeight, border: "none", borderRadius: "10px" }}></iframe>
                </View>
              </View>
              <Card variation="elevated" borderRadius="medium" width="99%" padding="relative.small">
                <Flex direction="row" justifyContent="space-between">
                  <Flex direction="row" alignItems="center">
                    <Link href={`${router.asPath}/react`}>
                      <QRCode value={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}${router.asPath}/react`} size={384} style={{ height: "auto", maxWidth: "5em" }} />
                    </Link>
                    <Flex direction="column" gap="0em" alignItems="start">
                      <Heading level={4}>Scan the QR code to react live!</Heading>
                      <View onClick={() => setIsListening(!isListening)} style={{ cursor: "pointer", fontWeight: 500 }} paddingTop=".2em" paddingLeft="0em">
                        {isListening ? (
                          <Flex direction="row" gap=".25em">
                            <Text color="lightgreen">•</Text>
                            <Text color="black">Reactions are live!</Text>
                          </Flex>)
                          : (
                            <Flex direction="row" gap=".25em">
                              <Text color="red">•</Text>
                              <Text color="black">Reactions are paused</Text>
                            </Flex>
                          )}
                      </View>
                    </Flex>

                  </Flex>
                  <Button variation="link" onClick={() => router.push(`${router.asPath}/results`)}>
                    <Flex direction="row" gap=".5em" alignItems="center">
                      <Heading level={4}>Results</Heading>
                      <FiArrowRight size="1.5em" color="black" />
                    </Flex>
                  </Button>
                </Flex>
              </Card>
              {images.map(image => (
                <Image
                  key={image.id}
                  className={styles.animatedReaction}
                  src={`/${image.reaction}.png`}
                  style={{ left: `${image.xPos}px` }}
                  width={"4em"}
                />
              ))}
              {comments.map(comment => (
                <Comment
                  key={comment.id}
                  className={commentStyles.commentBox}
                  message={comment.message}
                  username={comment.username}
                  style={{ left: `${comment.xPos}px` }}
                />
              ))}
            </Flex>
          )}
      </Flex>
    </>
  );
};

export default PresentPage;
