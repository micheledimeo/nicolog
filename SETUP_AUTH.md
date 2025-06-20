# Configurazione Autenticazione AWS Amplify

Questa guida ti aiuterà a configurare l'autenticazione con AWS Cognito per la tua applicazione Next.js.

## Prerequisiti

1. Un account AWS attivo
2. AWS CLI configurato (opzionale ma consigliato)
3. L'applicazione già deployata su AWS Amplify

## Passaggi per la Configurazione

### 1. Creare un User Pool in AWS Cognito

1. Accedi alla Console AWS e vai su **Amazon Cognito**
2. Clicca su **Create user pool**
3. Configura le seguenti opzioni:

#### Step 1: Configure sign-in experience
- **Cognito user pool sign-in options**: Seleziona "Email"
- **User name requirements**: Lascia deselezionato

#### Step 2: Configure security requirements
- **Password policy**: 
  - Minimum length: 8
  - Require numbers, special character, uppercase and lowercase
- **Multi-factor authentication**: Optional (consigliato per produzione)

#### Step 3: Configure sign-up experience
- **Self-registration**: Enable
- **Attributes to verify**: Email
- **Required attributes**: 
  - email (required)
  - name
#### Step 4: Configure message delivery
- **Email provider**: Cognito default
- **FROM email address**: no-reply@verificationemail.com

#### Step 5: Integrate your app
- **User pool name**: nicolog-users (o il nome che preferisci)
- **App client name**: nicolog-web-client
- **App type**: Public client
- **Authentication flows**: 
  - ALLOW_USER_SRP_AUTH
  - ALLOW_REFRESH_TOKEN_AUTH

#### Step 6: Review and create
- Rivedi le impostazioni e clicca **Create user pool**

### 2. Configurare i Social Identity Providers

Nel tuo User Pool appena creato:

1. Vai su **Sign-in experience** → **Federated identity provider sign-in**
2. Clicca su **Add identity provider**

#### Google:
1. Seleziona **Google**
2. Avrai bisogno di:
   - **Google app ID** (Client ID)
   - **Google app secret** (Client Secret)
3. Per ottenerli:
   - Vai su [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un nuovo progetto o seleziona uno esistente
   - Abilita Google+ API
   - Crea credenziali OAuth 2.0
   - Aggiungi gli URI di reindirizzamento autorizzati:
     ```
     https://your-domain-prefix.auth.region.amazoncognito.com/oauth2/idpresponse
     ```
#### Facebook:
1. Seleziona **Facebook**
2. Avrai bisogno di:
   - **Facebook app ID**
   - **Facebook app secret**
3. Per ottenerli:
   - Vai su [Facebook Developers](https://developers.facebook.com/)
   - Crea una nuova app
   - Aggiungi Facebook Login
   - Configura gli URI di reindirizzamento OAuth validi:
     ```
     https://your-domain-prefix.auth.region.amazoncognito.com/oauth2/idpresponse
     ```

#### LinkedIn:
1. **Nota**: AWS Cognito non supporta nativamente LinkedIn
2. Puoi usare **Login with Amazon** come alternativa o implementare un custom identity provider
3. Per un'implementazione completa con LinkedIn, considera l'uso di AWS Lambda triggers

### 3. Configurare il Dominio Cognito

1. Nel tuo User Pool, vai su **App integration** → **Domain**
2. Clicca su **Create Cognito domain**
3. Inserisci un prefisso di dominio unico (es: `nicolog-auth`)
4. Clicca su **Create domain**

### 4. Configurare l'App Client

1. Vai su **App integration** → **App client list**
2. Seleziona il tuo app client
3. In **Hosted UI settings**, clicca su **Edit**
4. Configura:   - **Allowed callback URLs**:
     ```
     http://localhost:3000/
     https://your-amplify-app-domain.amplifyapp.com/
     ```
   - **Allowed sign-out URLs**:
     ```
     http://localhost:3000/
     https://your-amplify-app-domain.amplifyapp.com/
     ```
   - **Identity providers**: Seleziona Cognito User Pool e i provider social configurati
   - **OAuth 2.0 grant types**: Authorization code grant
   - **OpenID Connect scopes**: openid, email, profile

### 5. Configurare le Variabili d'Ambiente

1. Copia il file `.env.local.example` in `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Compila le variabili con i valori dal tuo User Pool:
   ```
   NEXT_PUBLIC_USER_POOL_ID=eu-west-1_xxxxxxxxx
   NEXT_PUBLIC_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_IDENTITY_POOL_ID=eu-west-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   NEXT_PUBLIC_COGNITO_DOMAIN=https://nicolog-auth.auth.eu-west-1.amazoncognito.com
   NEXT_PUBLIC_REDIRECT_SIGN_IN=http://localhost:3000/
   NEXT_PUBLIC_REDIRECT_SIGN_OUT=http://localhost:3000/
   ```

3. Dove trovare questi valori:
   - **User Pool ID**: User pools → Il tuo pool → General settings
   - **App client ID**: App integration → App client list → Il tuo client
   - **Identity Pool ID**: Federated Identities → Il tuo identity pool (se creato)
   - **Cognito Domain**: App integration → Domain
### 6. Configurare Amplify Hosting

Se la tua app è già deployata su Amplify:

1. Vai sulla Console AWS Amplify
2. Seleziona la tua app
3. Vai su **Environment variables**
4. Aggiungi le stesse variabili d'ambiente del file `.env.local`
5. Rideploya l'applicazione

### 7. Testing dell'Autenticazione

1. Avvia l'applicazione in locale:
   ```bash
   npm run dev
   ```

2. Vai su `http://localhost:3000/auth`

3. Testa le seguenti funzionalità:
   - **Registrazione con email/password**
   - **Conferma email** (controlla la tua casella email)
   - **Login con email/password**
   - **Login con Google** (se configurato)
   - **Login con Facebook** (se configurato)
   - **Logout**

### 8. Proteggere le Route

Per proteggere le route nella tua applicazione, puoi usare il componente `AuthGuard`:

```tsx
// components/auth/auth-guard.tsx
"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}
export function AuthGuard({ children, redirectTo = "/auth" }: AuthGuardProps) {
  const { user, checkingAuth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!checkingAuth && !user) {
      router.push(redirectTo)
    }
  }, [user, checkingAuth, router, redirectTo])

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return user ? <>{children}</> : null
}
```

Usa il componente per proteggere le pagine:

```tsx
// app/protected-page/page.tsx
import { AuthGuard } from "@/components/auth/auth-guard"

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <div>Contenuto protetto</div>
    </AuthGuard>
  )
}
```

## Troubleshooting

### Errori comuni:

1. **"UserNotFoundException"**: L'utente non esiste nel pool
2. **"UsernameExistsException"**: Email già registrata
3. **"InvalidParameterException"**: Controlla le variabili d'ambiente
4. **Redirect loop con social login**: Verifica gli URL di callback

### Debug:

- Controlla la Console del browser per errori JavaScript
- Verifica i log di CloudWatch per il tuo User Pool
- Assicurati che tutte le variabili d'ambiente siano configurate correttamente

## Note sulla Sicurezza

1. **Non committare il file `.env.local`** nel repository
2. Usa **MFA** in produzione per maggiore sicurezza
3. Configura policy di password robuste
4. Monitora i tentativi di accesso sospetti tramite CloudWatch

## Prossimi Passi

1. Implementa il recupero password
2. Aggiungi la gestione del profilo utente
3. Implementa refresh token automatico
4. Aggiungi analytics per tracciare login/registrazioni

Per maggiori informazioni, consulta la [documentazione ufficiale di AWS Amplify](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/).