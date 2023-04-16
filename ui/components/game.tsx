import React, { useEffect, useState } from "react";
import { GameLogic } from "@/gamelogic/instance";
import { MainMenuScene, PreloadScene, WelcomeScene } from "@/gamelogic/scenes";
import { Plugins } from "@/gamelogic/enums";
import { GameLogicPlugin } from "@/gamelogic/plugins";

export default function Game() {
  const [logic, setLogic] = useState<GameLogic>();

  useEffect(() => {
    async function initGame() {
      const Phaser = await import("phaser");

      const phaserGame = new Phaser.Game({
        type: Phaser.AUTO,
        parent: "game",
        width: 1280,
        height: 720,
        pixelArt: true,
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 200 }
          },
        },
        scene: [PreloadScene, MainMenuScene, WelcomeScene ],
        backgroundColor: "#000033",
        plugins: {
          global: [
            { key: Plugins.GameLogic, plugin: GameLogicPlugin, start: true }
          ]
        }
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

  return (
    <>
      <div id="game" key="game"></div>
    </>
  );
}
