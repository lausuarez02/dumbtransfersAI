"use client";
import dynamic from "next/dynamic";
// import { Navigation } from "@/components/Navigation";

const ChatScreen = dynamic(() => import("@/components/ChatScreen"), {
  ssr: false,
});

export default function Login() {
  const random = Math.random();
  const isImageRanking = random > 0.5;

  return (
    <div>
      {/* <Navigation /> */}


    </div>
  );
}
