import { Amplify } from 'aws-amplify';

// Configurazione Amplify
const amplifyConfig = {
  Auth: {
    Cognito: {
      // Questi valori verranno forniti dopo la configurazione di Cognito
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || '',
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '',
      identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID || '',
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || '',
          scopes: ['email', 'profile', 'openid'],
          redirectSignIn: process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN || 'http://localhost:3000/',
          redirectSignOut: process.env.NEXT_PUBLIC_REDIRECT_SIGN_OUT || 'http://localhost:3000/',
          responseType: 'code' as const,
          providers: ['Google', 'Facebook', 'LoginWithAmazon']
        }
      }
    }
  }
};

// Inizializza Amplify
export function configureAmplify() {
  Amplify.configure(amplifyConfig);
}
