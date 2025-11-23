import Link from 'next/link';
import Image from 'next/image';

export default function ContactPage() {
    return (
        <>
            {/* Page Header Section */}
            <section className="page-header-section">
                <div className="container">
                    <div className="page-header-wrapper">
                        <h2 className="primary-heading">Contact Us</h2>
                        <nav aria-label="Breadcrumb" className="breadcrumb">
                            <ul>
                                <li><Link href="/" className="page-link">Home</Link></li>
                                <li><span aria-current="page">Contact Us</span></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </section>

            {/* Contact Image Section */}
            <section className="contact-img-section">
                <div className="container">
                    <div className="contact-img-block wow animate__animated custom-fadeInUp">
                        <Image
                            src="/template-assets/images/contact-img.png"
                            alt="Contact Safro"
                            width={1200}
                            height={400}
                            className="contact-img"
                        />
                        <div className="overlay-text">
                            <h3 className="title">
                                A secure way to trade Bitcoin online.
                            </h3>
                            <div className="logo-block">
                                <Image
                                    src="/template-assets/images/logo.png"
                                    alt="Safro logo"
                                    width={150}
                                    height={40}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Features Section */}
            <section className="contact-features-section">
                <div className="container">
                    <div className="contact-features-card-wrapper">
                        <div className="features-card wow animate__animated custom-fadeInUp" data-wow-delay="0.1s">
                            <div className="features-card-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                    <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
                                </svg>
                            </div>
                            <h3 className="title">General Inquiries</h3>
                            <a href="mailto:info@safro.com">info@safro.com</a>
                        </div>
                        <div className="features-card wow animate__animated custom-fadeInUp" data-wow-delay="0.2s">
                            <div className="features-card-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
                                </svg>
                            </div>
                            <h3 className="title">Support</h3>
                            <a href="mailto:support@safro.com">support@safro.com</a>
                        </div>
                        <div className="features-card wow animate__animated custom-fadeInUp" data-wow-delay="0.3s">
                            <div className="features-card-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                    <path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z" />
                                </svg>
                            </div>
                            <h3 className="title">Phone</h3>
                            <a href="tel:+1234567890">+1 234 567 890</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="contact-form-section main-contact-form">
                <div className="container">
                    <div className="heading wow animate__animated custom-fadeInUp">
                        <h6 className="sub-heading">Need Help?</h6>
                        <h2 className="primary-heading">Contact Us Today!<br />
                            <span className="underline"></span>
                        </h2>
                    </div>
                    <div className="contact-form wow animate__animated custom-fadeInUp">
                        <form action="#" method="POST" id="contactForm">
                            <div className="form-wrapper">
                                <input type="text" name="name" id="name" placeholder="Name" required />
                                <input type="email" name="email" id="email" placeholder="Email Address" required />
                                <input type="text" name="phone" id="phone" placeholder="Phone" />
                                <input type="text" name="subject" id="subject" placeholder="Subject" required />
                                <textarea name="message" id="message" placeholder="Message" required></textarea>
                            </div>
                            <button type="submit" className="btn primary">Send Message</button>
                            <div id="formMessage" style={{ marginTop: '1rem' }}></div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Visit Us Section */}
            <section className="visit-us-section">
                <div className="container">
                    <div className="heading wow animate__animated custom-fadeInUp">
                        <h6 className="sub-heading">Global Presence</h6>
                        <h2 className="primary-heading">Our Locations<br />
                            <span className="underline"></span>
                        </h2>
                    </div>
                    <div className="location-cards-wrapper">
                        <div className="location-card wow animate__animated custom-fadeInUp" data-wow-delay="0.1s">
                            <div className="location-img">
                                <Image src="/template-assets/images/visit-img-1.png" alt="Location img" width={300} height={200} />
                            </div>
                            <div className="location-content">
                                <h3 className="title">Safro HQ</h3>
                                <p>123 Blockchain Blvd</p>
                                <p>Crypto Valley</p>
                                <p>Switzerland</p>
                            </div>
                        </div>
                        <div className="location-card wow animate__animated custom-fadeInUp" data-wow-delay="0.2s">
                            <div className="location-img">
                                <Image src="/template-assets/images/visit-img-2.png" alt="Location img" width={300} height={200} />
                            </div>
                            <div className="location-content">
                                <h3 className="title">Safro Labs</h3>
                                <p>456 Innovation Dr</p>
                                <p>Silicon Valley</p>
                                <p>USA</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
