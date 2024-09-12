

import { useState, useRef } from 'react';
import { Space_Grotesk } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const waitlistRef = useRef(null);

  const handleSubmit = (e:any) => {
    e.preventDefault();
    console.log('Submitted email:', email);
    setEmail('');
  };

  const scrollToWaitlist = () => {
    (waitlistRef.current as any)?.scrollIntoView({ behavior: 'smooth' });
  };

  const examples = [
    {
      title: "Simple Transfers",
      description: "Just tell DumbTransfers what you want to do.",
      command: '"Send $96 to Lautaro for dinner"',
      image: "/example01.png"
    },
    {
      title: "Smart Swaps",
      description: "Effortlessly swap currencies with natural language.",
      command: '"Swap 10 USDC to ETH"',
      image: "/example02.png"
    }
  ];

  return (
<div className={`min-h-screen flex flex-col bg-[#004aad] text-white ${spaceGrotesk.className}`}>
  <header className="bg-white text-[#004aad] py-6 relative">
    <div className="container mx-auto px-4 flex items-center space-x-2">
      <Image src="/logo.png" width={40} height={40} alt="logo" />
      <h1 className="text-3xl md:text-4xl font-bold">DumbTransfers</h1>
    </div>
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
  </header>

  <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center">
    <h2 className="text-4xl md:text-6xl font-bold text-center mb-4">Revolutionize Your Transfers</h2>
    <p className="text-xl md:text-2xl text-center mb-8">Smart. Simple. Secure.</p>
    <Link href="/waitlist">
      <button
        onClick={scrollToWaitlist}
        className="bg-white text-[#004aad] py-3 px-8 rounded-full font-semibold hover:bg-opacity-90 transition duration-300 text-base md:text-lg"
      >
        Join the Waitlist
      </button>
    </Link>

    <section className="grid md:grid-cols-3 gap-8 my-20 w-full">
      {[
        { title: "AI-Powered Simplicity", desc: "Transfer money with natural language commands" },
        { title: "Quantum-Secure", desc: "Next-gen encryption for unbreakable security" },
        { title: "Hypersonic Transfers", desc: "Instant global transactions at the speed of thought" }
      ].map((feature, index) => (
        <div key={index} className="text-center backdrop-blur-sm bg-white/10 p-6 rounded-lg transform hover:scale-105 transition-all duration-300">
          <h3 className="text-xl md:text-2xl font-semibold mb-4">{feature.title}</h3>
          <p className="text-sm md:text-base">{feature.desc}</p>
        </div>
      ))}
    </section>

    <section className="w-full my-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
      {examples.map((example, index) => (
        <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center mb-20`}>
          <div className="md:w-1/2 p-6">
            <h3 className="text-2xl md:text-3xl font-semibold mb-4">{example.title}</h3>
            <p className="text-base md:text-lg mb-4">{example.description}</p>
            <div className="bg-white/10 p-4 rounded-lg">
              <code className="text-sm md:text-lg">{example.command}</code>
            </div>
          </div>
          <div className="md:w-1/2 p-6">
            <Image width={350} height={350} src={example.image} alt={example.title} className="rounded-lg shadow-lg" />
          </div>
        </div>
      ))}
    </section>
  </main>

  <footer className="bg-white/10 py-6 mt-12">
    <div className="container mx-auto px-4 flex justify-between items-center">
      <p>&copy; 2024 DumbTransfers. All rights reserved.</p>
      <div className="flex space-x-4">
        <a href="#" className="hover:text-blue-300">Terms</a>
        <a href="#" className="hover:text-blue-300">Privacy</a>
        <a href="#" className="hover:text-blue-300">Contact</a>
      </div>
    </div>
  </footer>
</div>

  );
}