import Link from 'next/link';
import Image from 'next/image';

export default function FeaturesPage() {
    return (
        <>
            {/* Page Header Section */}
            <section className="page-header-section">
                <div className="container">
                    <div className="page-header-wrapper">
                        <h2 className="primary-heading">Our Features</h2>
                        <nav aria-label="Breadcrumb" className="breadcrumb">
                            <ul>
                                <li><Link href="/" className="page-link">Home</Link></li>
                                <li><span aria-current="page">Features</span></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="about-1-section">
                <div className="container">
                    <div className="about-1-content-wrapper">
                        <div className="main-content">
                            <p className="description wow animate__animated custom-fadeInUp">
                                Safro provides a comprehensive suite of tools for secure, decentralized commerce on Bitcoin.
                                From simple escrow to complex multi-party agreements, our platform is designed to protect your assets
                                and ensure fair outcomes.
                            </p>
                            <div className="services-card-wrapper">
                                {/* Feature 1: Decentralized Escrow */}
                                <Link href="/escrow" className="main-services-card wow animate__animated custom-fadeInUp" data-wow-delay="0.1s">
                                    <div className="head">
                                        <h3 className="title">Decentralized Escrow</h3>
                                        <div className="icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                <path d="M320 96H192L144.6 24.9C137.5 14.2 145.1 0 157.9 0H354.1c12.8 0 20.4 14.2 13.3 24.9L320 96zM192 128H320c3.8 2.5 8.1 5.3 13 8.4C389.7 172.7 448 223.8 448 288c0 79.5-64.5 144-144 144c-28.8 0-55.6-8.5-78.6-23.3c-13.8-8.9-31.1-8.9-44.9 0C158.6 423.5 131.8 432 103 432c-79.5 0-144-64.5-144-144c0-64.2 58.3-115.3 115-151.6c4.8-3.1 9.2-5.9 13-8.4z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p>Secure your transactions with smart contracts that hold funds until obligations are met. No middleman, just code.</p>
                                    <div className="line"></div>
                                    <div className="bottom-text-block">
                                        <p>Security</p>
                                        <h6>Trustless</h6>
                                    </div>
                                </Link>

                                {/* Feature 2: Bitcoin Native */}
                                <Link href="/wallet" className="main-services-card wow animate__animated custom-fadeInUp" data-wow-delay="0.2s">
                                    <div className="head">
                                        <h3 className="title">Bitcoin Native (ckBTC)</h3>
                                        <div className="icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                <path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zm-141.651-35.33c4.937-32.999-20.191-50.74-54.55-62.482l11.15-44.728-27.215-6.782-10.869 43.596c-7.135-1.8-14.583-3.544-22.154-5.235l10.909-43.76-27.216-6.781-11.121 44.612c-6.006-1.377-12.138-2.773-18.102-4.254l.024-.097-37.569-9.366-7.255 29.112s20.227 4.634 19.808 4.912c11.048 2.755 13.046 10.056 12.713 15.847l-12.757 51.177c.765.195 1.754.476 2.843.907-.906-.227-1.876-.469-2.873-.718l-17.894 71.791c-1.358 3.365-4.815 8.409-12.569 6.477.417.279-19.808-4.912-19.808-4.912l-13.57 31.294 35.444 8.835c6.747 1.684 13.353 3.382 19.974 4.952l-11.254 45.129 27.215 6.781 11.225-45.032c7.548 2.056 14.992 3.961 22.317 5.754l-11.18 44.844 27.215 6.781 11.261-45.168c46.463 8.797 81.399 5.25 96.057-36.76 11.84-33.794-5.847-53.249-27.44-65.926 19.534-4.509 34.233-17.315 38.154-43.851zm-68.176 95.563c-9.227 37.006-71.558 17.013-91.792 11.97l16.388-65.737c20.234 5.046 85.512 14.494 75.404 53.767zm8.576-85.996c-8.444 33.863-60.64 16.649-77.413 12.468l14.854-59.587c16.773 4.181 70.605 11.969 62.559 47.119z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p>Transact with native Bitcoin speed and low fees using ckBTC, fully backed 1:1 by BTC on the mainnet.</p>
                                    <div className="line"></div>
                                    <div className="bottom-text-block">
                                        <p>Integration</p>
                                        <h6>Fast & Low Cost</h6>
                                    </div>
                                </Link>

                                {/* Feature 3: AI Risk Assessment */}
                                <Link href="/features" className="main-services-card wow animate__animated custom-fadeInUp" data-wow-delay="0.3s">
                                    <div className="head">
                                        <h3 className="title">AI Risk Assessment</h3>
                                        <div className="icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                                                <path d="M112 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm40 304V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V256c0-35.3 28.7-64 64-64H320c35.3 0 64 28.7 64 64V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V352H152zM56 112c-13.3 0-24 10.7-24 24v80c0 13.3 10.7 24 24 24h8c13.3 0 24-10.7 24-24V136c0-13.3-10.7-24-24-24H56zM528 112c-13.3 0-24 10.7-24 24v80c0 13.3 10.7 24 24 24h8c13.3 0 24-10.7 24-24V136c0-13.3-10.7-24-24-24h-8z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p>Our AI agents analyze transaction patterns and counterparty history to provide real-time risk scores.</p>
                                    <div className="line"></div>
                                    <div className="bottom-text-block">
                                        <p>Intelligence</p>
                                        <h6>Proactive Protection</h6>
                                    </div>
                                </Link>

                                {/* Feature 4: Dispute Resolution */}
                                <Link href="/contact" className="main-services-card wow animate__animated custom-fadeInUp" data-wow-delay="0.4s">
                                    <div className="head">
                                        <h3 className="title">Dispute Resolution</h3>
                                        <div className="icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                <path d="M320 96H192L144.6 24.9C137.5 14.2 145.1 0 157.9 0H354.1c12.8 0 20.4 14.2 13.3 24.9L320 96zM192 128H320c3.8 2.5 8.1 5.3 13 8.4C389.7 172.7 448 223.8 448 288c0 79.5-64.5 144-144 144c-28.8 0-55.6-8.5-78.6-23.3c-13.8-8.9-31.1-8.9-44.9 0C158.6 423.5 131.8 432 103 432c-79.5 0-144-64.5-144-144c0-64.2 58.3-115.3 115-151.6c4.8-3.1 9.2-5.9 13-8.4z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p>Fair and transparent dispute resolution powered by AI and community governance.</p>
                                    <div className="line"></div>
                                    <div className="bottom-text-block">
                                        <p>Governance</p>
                                        <h6>Fair Outcomes</h6>
                                    </div>
                                </Link>
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
                                    “The AI risk assessment saved me from a potentially fraudulent trade. Highly recommended.”
                                </h3>
                                <div className="line"></div>
                                <div className="image">
                                    <Image src="/template-assets/images/customer-img-2.png" alt="Customer img" width={50} height={50} />
                                    <p className="name">
                                        <span>Sarah J., </span>Investor
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
