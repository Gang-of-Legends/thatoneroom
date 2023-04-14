import dynamic from 'next/dynamic'
import { CSSProperties } from 'react';

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
