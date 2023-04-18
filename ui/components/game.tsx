import React, { useEffect, useState } from "react";
import { ThatOneRoom } from "@/gamelogic";

export default function Game() {
  const [logic, setLogic] = useState<ThatOneRoom>();

  useEffect(() => {
    function initGame() {
      console.log('initialising game logic');
      const logic = new ThatOneRoom();
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
