const { AuthClient, CacheClient, Configurations, CacheGet, CredentialProvider, ExpiresIn, GenerateAuthToken, TopicRole, AllTopics, CacheRole } = require('@gomomento/sdk');
let authClient;
let cacheClient;

export default async function handler(req, res) {
  try {
    await initializeMomento();

    const userId = req.query.user;    
    const cacheResponse = await cacheClient.get(process.env.NEXT_PUBLIC_CACHE_NAME, `${userId}-token`);
    if (cacheResponse instanceof CacheGet.Hit) {
      res.status(200).json(JSON.parse(cacheResponse.valueString()));
    } else {
      const tokenScope = {
        permissions: [
          {
            role: TopicRole.PublishSubscribe,
            cache: 'conference',
            topic: AllTopics
          },
          {
            role: CacheRole.ReadWrite,
            cache: 'conference'
          }
        ]
      };

      const token = await authClient.generateAuthToken(tokenScope, ExpiresIn.hours(1));
      if (token instanceof GenerateAuthToken.Success) {
        const vendedToken = {
          token: token.authToken,
          exp: token.expiresAt.epoch()
        };

        await cacheClient.set('conference', `${userId}-token`, JSON.stringify(vendedToken));
        res.status(200).json(vendedToken);
      } else {
        throw new Error('Unable to create auth token');
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({message: 'Something went wrong'});
  }
};

const initializeMomento = async () => {
  if (cacheClient && authClient) {
    return;
  }

  cacheClient = new CacheClient({
    configuration: Configurations.Laptop.latest(),
    credentialProvider: CredentialProvider.fromEnvironmentVariable({ environmentVariableName: 'MOMENTO_AUTH' }),
    defaultTtlSeconds: 3300
  });

  authClient = new AuthClient({
    credentialProvider: CredentialProvider.fromEnvironmentVariable({ environmentVariableName: 'MOMENTO_AUTH' }),
  });
};
