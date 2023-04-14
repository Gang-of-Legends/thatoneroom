import Image from "next/image";
import { Inter } from "next/font/google";
import Link from "next/link";

export default function Home() {
    return (
    <main className="flex items-center justify-center h-screen space-x-1">
      <div>Please go to</div> <Link style={{"color": "red"}} href="/game">/game (click)</Link>
    </main>
  );
}
