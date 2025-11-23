'use client';

import Link from 'next/link';
import Image from 'next/image';
import Ticker from '@/components/ui/Ticker';
import Accordion from '@/components/ui/Accordion';

export default function Home() {
    const faqs = [
        {
            question: "What is Safro escrow?",
            answer: "Safro is a decentralized escrow platform built on the Internet Computer that enables secure Bitcoin transactions between parties who don't trust each other. Our smart contracts hold funds until both parties confirm successful delivery, or until arbitrators resolve any disputes."
        },
        {
            question: "How does the escrow process work?",
            answer: "1) Buyer and seller create an escrow agreement. 2) Buyer deposits Bitcoin/ckBTC into the escrow smart contract. 3) Seller delivers goods/services. 4) Both parties confirm delivery. 5) Funds automatically release to seller. If there's a dispute, arbitrators review evidence and vote on the outcome."
        },
        {
            question: "What currencies are supported?",
            answer: "We support both native Bitcoin (BTC) and ckBTC (Chain-Key Bitcoin) on the Internet Computer. ckBTC provides faster transactions and lower fees while maintaining 1:1 peg with Bitcoin. You can easily convert between BTC and ckBTC within the platform."
        },
        {
            question: "How secure are my funds?",
            answer: "Extremely secure. Funds are held by Internet Computer smart contracts using threshold signatures - no single party can access them. The Internet Computer's chain-key cryptography ensures your Bitcoin is protected by the same security guarantees as on the Bitcoin network itself."
        },
        {
            question: "What if there's a dispute?",
            answer: "If buyer and seller can't agree, the escrow enters arbitration. Multiple independent arbitrators review the evidence submitted by both parties and vote on the outcome. Arbitrators stake tokens as collateral and are incentivized to make fair decisions through reputation scoring."
        },
        {
            question: "How do I get started?",
            answer: "Simply click 'Create free account' to sign in with Internet Identity. No email or password needed - Internet Identity provides secure, privacy-preserving authentication. Once authenticated, you can create your first escrow, connect your Bitcoin wallet, or browse existing escrow opportunities."
        }
    ];

    return (
        <div>
            {/* Hero Section */}
            <section className="hero-2-section">
                <div className="container">
                    <Ticker />
                    <div className="hero-content-wrapper">
                        <div className="content-block wow animate__animated custom-fadeInUp" data-wow-delay="0.3s">
                            <h2 className="primary-heading">
                                Secure Bitcoin Escrow Platform<br />
                                Powered by Internet Computer
                            </h2>
                            <p className="description">
                                Trade with confidence using decentralized escrow, Bitcoin/ckBTC support,
                                multi-party arbitration, and the security of the Internet Computer Protocol.
                            </p>
                            <Link href="/dashboard" className="btn primary">
                                Create free account
                            </Link>
                            <div className="download-btns">
                                {/* Placeholder for app download buttons */}
                            </div>
                            <p>Available on Web and Mobile (Coming Soon)</p>
                        </div>
                        <div className="hero-2-img-block wow animate__animated animate__flipInY" data-wow-delay="0.3s">
                            <Image
                                src="/template-assets/images/safro-hero-illustration.png"
                                alt="Safro Escrow Platform"
                                className="hero-img"
                                width={600}
                                height={400}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Product/Features Section */}
            <section className="product-section">
                <div className="container">
                    <div className="heading wow animate__animated custom-fadeInUp">
                        <h6 className="sub-heading">Introducing our Platform</h6>
                        <h2 className="primary-heading">
                            Safro Escrow Features<br />
                            <span className="underline"></span>
                        </h2>
                    </div>
                    <div className="product-block-wrapper">
                        <ProductCard
                            title="Decentralized & Trustless Escrow"
                            description="Your funds are secured on-chain with threshold signatures. No single point of failure. Smart contracts ensure automatic release on delivery confirmation verified by both parties or arbitrators."
                            imageSrc="/template-assets/images/card-graphic-1.png"
                            imageSrcDark="/template-assets/images-dark/card-graphic-1.png"
                            imageFirst={false}
                        />
                        <ProductCard
                            title="Bitcoin & ckBTC Support"
                            description="Native Bitcoin and ckBTC integration allows seamless escrow transactions. Convert between BTC and ckBTC, manage your wallet, and track all transactions on-chain with full transparency."
                            imageSrc="/template-assets/images/card-graphic-2.png"
                            imageSrcDark="/template-assets/images-dark/card-graphic-2.png"
                            imageFirst={true}
                        />
                        <ProductCard
                            title="Multi-Party Arbitration System"
                            description="Fair dispute resolution through decentralized arbitrators. Stake tokens to become an arbitrator, earn fees for resolving disputes, and build reputation in the ecosystem for trustworthy decisions."
                            imageSrc="/template-assets/images/card-graphic-3.png"
                            imageSrcDark="/template-assets/images-dark/card-graphic-3.png"
                            imageFirst={false}
                        />
                        <ProductCard
                            title="Reputation & Trust Network"
                            description="Build on-chain reputation through successful transactions. User ratings, transaction history, and arbitrator performance are permanently recorded. Higher reputation unlocks better terms and lower fees."
                            imageSrc="/template-assets/images/card-graphic-4.png"
                            imageSrcDark="/template-assets/images-dark/card-graphic-4.png"
                            imageFirst={true}
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <div className="faqs-section">
                <div className="container">
                    <div className="heading wow animate__animated custom-fadeInUp">
                        <h6 className="sub-heading">Got questions</h6>
                        <h2 className="primary-heading">
                            Frequently asked questions<br />
                            <span className="underline"></span>
                        </h2>
                    </div>
                    <Accordion items={faqs} />
                </div>
            </div>

            {/* CTA Section */}
            <section className="cta-support-section">
                <div className="container">
                    <div className="heading wow animate__animated custom-fadeInUp">
                        <h6 className="sub-heading">Ready to get started?</h6>
                        <h2 className="primary-heading">
                            Start trading today with Safro escrow<br />
                        </h2>
                    </div>
                    <div className="btn-block wow animate__animated custom-fadeInUp">
                        <Link href="/dashboard" className="btn primary">
                            Create free account
                        </Link>
                    </div>
                    <div className="block-wrapper">
                        <CTACard
                            icon="email"
                            title="Support"
                            description="We are here to help you at all times:"
                            linkText="support@safro.io"
                            linkHref="mailto:support@safro.io"
                            delay="0.1s"
                        />
                        <CTACard
                            icon="newsletter"
                            title="Documentation"
                            description="Learn how to use Safro platform"
                            linkText="Read Documentation"
                            linkHref="/docs"
                            delay="0.2s"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function ProductCard({
    title,
    description,
    imageSrc,
    imageSrcDark,
    imageFirst
}: {
    title: string;
    description: string;
    imageSrc: string;
    imageSrcDark: string;
    imageFirst: boolean;
}) {
    return (
        <div className="product-card wow animate__animated custom-fadeInUp">
            {imageFirst && (
                <div className="image-block">
                    <Image
                        src={imageSrc}
                        alt={title}
                        className="lightmode-image"
                        width={400}
                        height={300}
                    />
                    <Image
                        src={imageSrcDark}
                        alt={title}
                        className="darkmode-image"
                        width={400}
                        height={300}
                    />
                </div>
            )}
            <div className="content-block">
                <h3 className="title">{title}</h3>
                <p>{description}</p>
            </div>
            {!imageFirst && (
                <div className="image-block">
                    <Image
                        src={imageSrc}
                        alt={title}
                        className="lightmode-image"
                        width={400}
                        height={300}
                    />
                    <Image
                        src={imageSrcDark}
                        alt={title}
                        className="darkmode-image"
                        width={400}
                        height={300}
                    />
                </div>
            )}
        </div>
    );
}

function CTACard({
    icon,
    title,
    description,
    linkText,
    linkHref,
    delay
}: {
    icon: string;
    title: string;
    description: string;
    linkText: string;
    linkHref: string;
    delay: string;
}) {
    return (
        <div className={`cta-card wow animate__animated custom-fadeInUp`} data-wow-delay={delay}>
            <div className="cta-icon">
                {icon === 'email' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="37.5px" height="25.438px" viewBox="-111.75 802.531 37.5 25.438">
                        <path d="M-76.5,802.531h-33c-1.241,0-2.25,1.009-2.25,2.25v20.938c0,1.24,1.009,2.25,2.25,2.25h33c1.241,0,2.25-1.01,2.25-2.25  v-20.938C-74.25,803.54-75.259,802.531-76.5,802.531z M-109.5,804.031h33c0.142,0,0.272,0.042,0.385,0.109l-15.673,9.742  c-0.701,0.436-1.847,0.434-2.546-0.004l-15.562-9.732C-109.78,804.074-109.646,804.031-109.5,804.031z M-110.25,805.426  l15.817,9.892l-15.817,9.881V805.426z M-76.5,826.469h-33c-0.102,0-0.199-0.021-0.288-0.058l16.731-10.447l16.831,10.451  C-76.311,826.449-76.403,826.469-76.5,826.469z M-75.75,825.204l-15.867-9.928l15.867-9.855V825.204z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="37.5px" height="36.945px" viewBox="-112.119 796.778 37.5 36.945">
                        <g>
                            <path d="M-76.099,809.338l-15.624-12.043c-0.893-0.689-2.399-0.689-3.292-0.001l-15.624,12.044c-0.844,0.65-1.48,1.944-1.48,3.01   v19.125c0,1.24,1.009,2.25,2.25,2.25h33c1.241,0,2.25-1.01,2.25-2.25v-19.125C-74.619,811.282-75.255,809.988-76.099,809.338z    M-109.723,810.526l15.625-12.044c0.183-0.141,0.449-0.222,0.73-0.222s0.547,0.081,0.73,0.222l15.624,12.044   c0.104,0.079,0.204,0.187,0.298,0.307l-14.936,8.613l-0.07-0.054c-0.893-0.689-2.399-0.689-3.292-0.001l-0.166,0.128l-14.901-8.608   C-109.97,810.757-109.848,810.623-109.723,810.526z M-110.606,831.41c-0.005,0.004-0.008,0.008-0.013,0.012v-19.074   c0-0.005,0.001-0.01,0.001-0.014l14.118,8.203L-110.606,831.41z M-109.135,832.17l15.036-11.59c0.366-0.282,1.094-0.282,1.46,0   l15.036,11.59H-109.135z M-76.119,831.422c-0.005-0.004-0.008-0.008-0.013-0.012l-14.205-10.948l14.207-8.235   c0.004,0.04,0.01,0.082,0.01,0.121V831.422z" />
                        </g>
                    </svg>
                )}
            </div>
            <h3 className="title">{title}</h3>
            <p>{description}</p>
            <Link href={linkHref} className="email-link">
                {linkText}
            </Link>
        </div>
    );
}
