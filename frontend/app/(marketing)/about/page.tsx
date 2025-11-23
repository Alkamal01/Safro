import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <>
            {/* Page Header Section */}
            <section className="page-header-section">
                <div className="container">
                    <div className="page-header-wrapper">
                        <h2 className="primary-heading">About Safro</h2>
                        <nav aria-label="Breadcrumb" className="breadcrumb">
                            <ul>
                                <li><Link href="/" className="page-link">Home</Link></li>
                                <li><span aria-current="page">About Us</span></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="about-1-section">
                <div className="container">
                    <div className="about-1-content-wrapper">
                        <div className="main-content">
                            <div className="about-img-container wow animate__animated custom-fadeInUp" style={{ backgroundImage: 'url(/template-assets/images/about-img.png)' }}>
                                <div className="overlay-text">
                                    <h3 className="title">
                                        Decentralized Escrow on Bitcoin
                                    </h3>
                                    <div className="logo-block">
                                        <Image
                                            src="/template-assets/images/logo.png"
                                            alt="Safro logo"
                                            width={150}
                                            height={40}
                                            className="lightmode-logo"
                                        />
                                        <Image
                                            src="/template-assets/images-dark/logo.png"
                                            alt="Safro logo"
                                            width={150}
                                            height={40}
                                            className="darkmode-logo"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="description-block wow animate__animated custom-fadeInUp">
                                <h3 className="title">Our Mission</h3>
                                <p>
                                    Safro is building the trust layer for the Bitcoin economy. We provide a decentralized, non-custodial escrow service that enables secure transactions without intermediaries. By leveraging the Internet Computer (ICP) and native Bitcoin integration (ckBTC), we offer a seamless, trustless experience for users worldwide.
                                </p>
                                <p>
                                    Our platform solves the critical problem of trust in peer-to-peer transactions. Whether you are buying digital assets, hiring freelancers, or conducting OTC trades, Safro ensures that funds are only released when both parties are satisfied.
                                </p>
                            </div>

                            <div className="history-block wow animate__animated custom-fadeInUp">
                                <h3 className="title">Why Choose Safro?</h3>
                                <ul className="history-list">
                                    <li>
                                        <div className="year">01</div>
                                        <div className="content">
                                            <h4>Non-Custodial Security</h4>
                                            <p>We never hold your funds. Smart contracts manage the escrow process, ensuring you remain in control.</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="year">02</div>
                                        <div className="content">
                                            <h4>Bitcoin Native</h4>
                                            <p>Built for the Bitcoin ecosystem using ckBTC for fast, low-cost transactions with Bitcoin security.</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="year">03</div>
                                        <div className="content">
                                            <h4>AI-Powered Dispute Resolution</h4>
                                            <p>Our advanced AI agents assist in resolving disputes quickly and fairly, reducing the need for human intervention.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="sidebar-content">
                            <div className="media-tabs">
                                <div className="tab wow animate__animated custom-fadeInUp" data-wow-delay="0.1s">
                                    <div className="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                            <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z" />
                                        </svg>
                                    </div>
                                    <h3 className="title">Whitepaper</h3>
                                    <a href="#" className="arrow-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                            <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            <div className="cta-block wow animate__animated custom-fadeInUp">
                                <h3 className="title">Start Trading Securely</h3>
                                <p>Join thousands of users who trust Safro for their Bitcoin transactions.</p>
                                <Link href="/contact" className="btn secondary">
                                    Get Started
                                </Link>
                            </div>

                            <div className="feedback-block wow animate__animated custom-fadeInUp">
                                <h3 className="feedback-text">
                                    “Safro has completely changed how I conduct OTC trades. The peace of mind is invaluable.”
                                </h3>
                                <div className="line"></div>
                                <div className="image">
                                    <Image src="/template-assets/images/customer-img.png" alt="Customer img" width={50} height={50} />
                                    <p className="name">
                                        <span>Alex M., </span>Trader
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trade Section CTA */}
            <section className="trade-section">
                <div className="container">
                    <div className="heading wow animate__animated custom-fadeInUp">
                        <h6 className="sub-heading">READY TO START?</h6>
                        <h2 className="primary-heading">Secure Your Next Deal<br /></h2>
                    </div>
                    <div className="btn-block wow animate__animated custom-fadeInUp">
                        <Link href="/contact" className="btn secondary"> Create Escrow</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
