import React, { useEffect, useState } from "react";
import { GameLogic } from "@/gamelogic/instance";
import { PreloadScene, WelcomeScene } from "@/gamelogic/scenes";

export default function Game() {
  const [logic, setLogic] = useState<GameLogic>();

  useEffect(() => {
    async function initGame() {
      const Phaser = await import("phaser");

      const phaserGame = new Phaser.Game({
        type: Phaser.AUTO,
        parent: "game",
        width: 800,
        height: 600,
        pixelArt: true,
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 200 },
          },
        },
        scene: [PreloadScene, WelcomeScene],
        backgroundColor: "#000033",
      });

      console.log('initialising game logic');
      const logic = new GameLogic(phaserGame);
      setLogic(logic);
    }

    initGame();
  }, []);

  if (!logic) {
    return <div className="flex items-center justify-center h-screen space-x-1">loading...</div>;
  }

  logic.connect();

  return (
    <>
      <div id="game" key="game"></div>
    </>
  );
}