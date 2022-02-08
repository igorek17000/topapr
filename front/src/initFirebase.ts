import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

initializeApp({
  apiKey: 'AIzaSyAR_9GZHrIlJmGz2wLoSbP3FbmnIgz_9os',
  authDomain: 'top-apr.firebaseapp.com',
  databaseURL:
    'https://top-apr-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'top-apr',
  storageBucket: 'top-apr.appspot.com',
  messagingSenderId: '180041309911',
  appId: '1:180041309911:web:4367c9fbb137c1ebd39a92',
});

export const auth = getAuth();
