import React from 'react';
import FuturisticButton  from './FuturisticButton';
import { ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import Link from 'next/link';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex flex-col">
      <header className="p-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          DumbTransfersAI
        </h1>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-5xl font-extrabold mb-6 leading-tight">
          Transfer Crypto<br />with Natural Language
        </h2>
        <p className="text-xl mb-8 max-w-2xl">
          Send cryptocurrency effortlessly using simple commands.
          Let AI handle the complexities while you focus on what matters.
        </p>
        <Link href="/chat">
        <FuturisticButton className="text-lg px-8 py-3">
          Get Started <ArrowRight className="ml-2" size={20} />
        </FuturisticButton>
        </Link>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
          {[
            { icon: Zap, title: "Lightning Fast", desc: "Instant transfers powered by AI" },
            { icon: Shield, title: "Secure", desc: "Advanced encryption for your peace of mind" },
            { icon: Globe, title: "Global", desc: "Send crypto anywhere, anytime" }
          ].map((feature, index) => (
            <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 flex flex-col items-center">
              <feature.icon size={40} className="mb-4 text-blue-400" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="p-6 text-center text-gray-400">
        © 2024 DumbTransfersAI. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;