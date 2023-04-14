import dynamic from 'next/dynamic'

const Game = dynamic(
  () => import('../components/game'),
  { ssr: false }
)

export default function Home() {
    return (
    <main className="flex items-center justify-center h-screen space-x-1">
      <Game></Game>
    </main>
  );
}
