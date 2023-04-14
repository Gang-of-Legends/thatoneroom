import React, { useEffect, useState } from "react";
import {Game as GameType } from "phaser";
import { init } from "next/dist/compiled/@vercel/og/satori";

import { useClientV1 } from "@/api/client";

export default function Game() {
    const [game, setGame] = useState<GameType>();
    const client = useClientV1();

    useEffect(() => {
        async function clientTest() {
            if (!client) {
                return;
            }
            try {
                const msg = await client.connect({});
                console.log(msg.id)
            } catch(e) {
                console.log(e)
            }
        }
        clientTest();
    }, [client]);

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