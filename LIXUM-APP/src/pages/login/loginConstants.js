import { Dimensions } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config/supabase';

var W = Dimensions.get('window').width;
var H = Dimensions.get('window').height;

var C = {
  bgDeep: '#1E2530',
  bgCard: 'rgba(21, 27, 35, 0.85)',
  bgInput: '#0A0E14',
  metalBorder: '#3E4855',
  emerald: '#00D984',
  emeraldDark: '#00A866',
  turquoise: '#00BFA6',
  gold: '#D4AF37',
  textPrimary: '#EAEEF3',
  textSecondary: '#8892A0',
  textMuted: '#555E6C',
  error: '#FF4D4D',
};

var texts = {
  fr: {
    title: 'Connexion',
    subtitle: 'Acc\u00e9dez \u00e0 votre tableau de bord',
    email: 'EMAIL',
    emailPlaceholder: 'votre@email.com',
    password: 'MOT DE PASSE',
    login: 'Se connecter',
    or: 'OU',
    google: 'Continuer avec Google',
    forgot: 'Mot de passe oubli\u00e9 ?',
    back: 'Retour',
    errorTitle: 'Erreur',
    errorEmpty: 'Veuillez remplir email et mot de passe (8 caract\u00e8res min)',
    successTitle: 'Connexion simul\u00e9e',
    successMsg: 'Bienvenue sur LIXUM !',
    googleRedirect: 'Tu vas \u00eatre redirig\u00e9 vers Google pour te connecter.',
    loginSuccess: 'Connexion r\u00e9ussie. Redirection...',
    welcome: 'Bienvenue !',
    connectionError: 'Probl\u00e8me de connexion. V\u00e9rifie ton internet.',
    continueBtn: 'Continuer',
    googleError: 'Erreur Google',
    invalidLogin: 'Email ou mot de passe incorrect.',
    emailNotConfirmed: 'V\u00e9rifie ton email pour confirmer ton compte.',
    tooManyRequests: 'Trop de tentatives. R\u00e9essaie dans quelques minutes.',
  },
  en: {
    title: 'Sign In',
    subtitle: 'Access your dashboard',
    email: 'EMAIL',
    emailPlaceholder: 'your@email.com',
    password: 'PASSWORD',
    login: 'Sign In',
    or: 'OR',
    google: 'Continue with Google',
    forgot: 'Forgot password?',
    back: 'Back',
    errorTitle: 'Error',
    errorEmpty: 'Please fill email and password (8 chars min)',
    successTitle: 'Login simulated',
    successMsg: 'Welcome to LIXUM!',
    googleRedirect: 'You will be redirected to Google to sign in.',
    loginSuccess: 'Login successful. Redirecting...',
    welcome: 'Welcome!',
    connectionError: 'Connection problem. Check your internet.',
    continueBtn: 'Continue',
    googleError: 'Google Error',
    invalidLogin: 'Invalid email or password.',
    emailNotConfirmed: 'Check your email to confirm your account.',
    tooManyRequests: 'Too many attempts. Please retry in a few minutes.',
  },
};

export { W, H, C, SUPABASE_URL, SUPABASE_ANON_KEY, texts };
