import Head from 'next/head';
import Script from 'next/script';
import Image from 'next/image';

const cssLoader = `
    let head = document.getElementsByTagName('HEAD')[0];
    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://prod-waitlist-widget.s3.us-east-2.amazonaws.com/getwaitlist.min.css';
    head.appendChild(link);
`;

export default function Waitlist() {
    return (
        <>
            <Script id="loader" type="" dangerouslySetInnerHTML={{ __html: cssLoader }}></Script>
            <Script id="mainScript" src="https://prod-waitlist-widget.s3.us-east-2.amazonaws.com/getwaitlist.min.js"></Script>
            <header className="bg-white text-[#004aad] py-6 relative">
                <div className="container mx-auto px-4 flex items-center space-x-2">
                    <Image src="/logo.png" width={40} height={40} alt="logo" />
                    <h1 className="text-3xl md:text-4xl font-bold">DumbTransfers</h1>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
            </header>

            <div className="min-h-screen flex flex-col items-center justify-center text-center">
                <div
                    id="getWaitlistContainer"
                    data-waitlist_id="20153"
                    data-widget_type="WIDGET_1"
                    className="w-full max-w-md"
                ></div>
            </div>
        </>
    );
}
