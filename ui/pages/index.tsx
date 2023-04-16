import dynamic from 'next/dynamic'
import { CSSProperties } from 'react';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsA30UYR22NCmjQdX7a97DixD5_QlMwpc",
  authDomain: "thatoneroom.firebaseapp.com",
  projectId: "thatoneroom",
  storageBucket: "thatoneroom.appspot.com",
  messagingSenderId: "360693127113",
  appId: "1:360693127113:web:7295e452bfc8308340ba18",
  measurementId: "G-QJNPDZTKRS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const Game = dynamic(
  () => import('../components/game'),
  { ssr: false }
)

const styles: CSSProperties = {
  display: 'flex',
  justifyContent: 'center'
}

export default function Home() {
    return (
    <main>
      <div style={styles}>
        <Game></Game>
      </div>
    </main>
  );
}
