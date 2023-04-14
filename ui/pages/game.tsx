import React, { useEffect, useState } from "react";
import {Game as GameType } from "phaser";
import { init } from "next/dist/compiled/@vercel/og/satori";

export default function Game() {
    const [game, setGame] = useState<GameType>();

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
                scene: [],
                backgroundColor: "#000033",
            });

            setGame(phaserGame);
        }
        
        initGame();
    }, []);

    return (
        <>
            <div id="game" key="game"></div>
        </>
    )
}