"use client";

import Image from "next/image";
import { useState } from "react";

const whatsapp = "https://wa.me/917032785547";
const instagram = "https://www.instagram.com/luckyclubgiftarticles";

const categories = ["Love & Couples", "Birthday", "Anniversary", "Family", "Baby & Kids", "Personalized Gifts", "Special Occasions"];
const products = [
  ["Personalized Photo Frame", "Starting from ₹250", "frame"],
  ["LED Photo Lamp", "Starting from ₹299", "lamp"],
  ["Photo Cushion", "Starting from ₹349", "cushion"],
  ["Personalized Keychain", "Starting from ₹99", "keychain"],
  ["Acrylic Photo Stand", "Starting from ₹250", "acrylic"],
  ["Scrapbook", "Starting from ₹350", "scrapbook"],
];
const steps = [
  ["01", "Choose Your Gift", "Browse our collection and select something special."],
  ["02", "Customize on WhatsApp", "Tell us what you want: photos, names, messages, designs and more."],
  ["03", "Get Your Customization Confirmed", "Lucky Club reviews and confirms your requirements."],
  ["04", "Confirm & Pay", "Return to the website, enter details and make payment."],
  ["05", "We Create & Deliver", "Share your payment confirmation and we will process and ship your order."],
];
const benefits = [
  ["✦", "Personalized", "Made around your memories."],
  ["◇", "Made With Care", "Every gift receives personal attention."],
  ["₹", "Affordable", "Special gifts without an unreasonable price."],
  ["↗", "Easy Ordering", "Customize directly through WhatsApp."],
];
const testimonials = [
  ["A", "Customer name", "The placeholder layout is ready for a real customer story."],
  ["R", "Happy customer", "Replace this sample review with a verified Lucky Club experience."],
  ["S", "Customer name", "A thoughtful gift idea can become a memory worth keeping."],
  ["M", "Happy customer", "Real testimonials will be added here as the store grows."],
];

function Arrow() { return <span aria-hidden="true">&#8599;</span>; }
function WhatsAppIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.08 0C5.55 0 .23 5.32.23 11.86c0 2.09.55 4.13 1.59 5.93L.13 24l6.36-1.67a11.84 11.84 0 0 0 5.59 1.42h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.23-6.14-3.45-8.39ZM12.09 21.7h-.01a9.83 9.83 0 0 1-5.01-1.37l-.36-.21-3.77.99 1-3.68-.23-.38a9.85 9.85 0 1 1 8.38 4.65Zm5.4-7.38c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.39-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.64-.93-2.24-.25-.59-.5-.51-.68-.52h-.58c-.2 0-.53.07-.8.38-.28.3-1.05 1.03-1.05 2.52s1.08 2.93 1.23 3.13c.15.2 2.12 3.24 5.14 4.55.72.31 1.28.5 1.72.64.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z" /></svg>; }

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return <main>
    <header className="store-header" id="top">
      <nav className="store-nav" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Lucky Club home" onClick={closeMenu}><span className="brand-crop"><Image src="/lcc.jpg.jpeg" alt="Lucky Club Gift Articles" width={180} height={240} priority /></span><small>GIFT ARTICLES</small></a>
        <div className="store-links"><a href="#top">Home</a><a href="#products">Gifts</a><a href="#how-it-works">How It Works</a><a href="#about">About Us</a><a href="#contact">Contact</a></div>
        <a className="header-whatsapp" href={whatsapp} target="_blank" rel="noreferrer"><WhatsAppIcon /> Chat on WhatsApp</a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /><b>{menuOpen ? "Close" : "Menu"}</b></button>
        {menuOpen && <div className="mobile-menu" id="mobile-menu"><a href="#top" onClick={closeMenu}>Home <Arrow /></a><a href="#products" onClick={closeMenu}>Gifts <Arrow /></a><a href="#how-it-works" onClick={closeMenu}>How It Works <Arrow /></a><a href="#about" onClick={closeMenu}>About Us <Arrow /></a><a href="#contact" onClick={closeMenu}>Contact <Arrow /></a><a className="mobile-menu-cta" href={whatsapp} target="_blank" rel="noreferrer"><WhatsAppIcon /> Chat on WhatsApp</a></div>}
      </nav>
      <div className="announcement">Thoughtful gifts, made personal <span>•</span> Direct WhatsApp support <span>•</span> Made with care</div>
    </header>

    <section className="store-hero"><div className="hero-copy"><p className="script-line">Make Every Memory</p><h1>A Special <em>Gift.</em></h1><p>Personalized gifts made with love for the people and moments that matter most.</p><div className="hero-actions"><a className="gold-button" href="#products">Explore Gifts <Arrow /></a><a className="outline-button" href={whatsapp} target="_blank" rel="noreferrer"><WhatsAppIcon /> Chat on WhatsApp</a></div><div className="hero-trust"><span>★★★★★</span> Thoughtful gifts for every occasion</div></div><div className="hero-products" aria-label="A premium composition of personalized gift products"><span className="hero-badge">Gifts made<br /><strong>with love</strong></span><div className="hero-card hero-card-main"><span className="card-ribbon">FOR YOU</span><span className="card-photo">Your<br />memory</span></div><div className="hero-card hero-card-small"><span className="card-photo">With<br />love</span></div><div className="hero-ring" /></div></section>
    <section className="categories" id="gifts"><div className="heading-center"><span className="gold-rule" /><p className="eyebrow">A little something for everyone</p><h2>Find the Perfect Gift</h2><span className="gold-rule" /></div><div className="category-viewport"><div className="category-scroll"><div className="category-track">{categories.map((category, index) => <a className={`category-card category-${index + 1}`} href="#products" key={category}><div className="category-art"><span>{String(index + 1).padStart(2, "0")}</span></div><strong>{category}</strong><Arrow /></a>)}</div></div></div></section>

    <section className="products-section" id="products"><div className="section-heading"><div><p className="eyebrow">Made to be remembered</p><h2>Gifts Everyone <em>Loves</em></h2><p>Handpicked favourites just for you.</p></div><a className="view-all" href={whatsapp} target="_blank" rel="noreferrer">Need help choosing? <Arrow /></a></div><div className="product-grid">{products.map(([name, price, type], index) => <article className="product-card" key={name}><div className={`product-art product-${type}`}><span className="product-number">0{index + 1}</span><span className="product-placeholder">{type === "frame" ? "Your story" : type === "lamp" ? "Glow for you" : type === "cushion" ? "Made for two" : type === "keychain" ? "A little" : type === "acrylic" ? "Always" : "Our moments"}</span></div><div className="product-info"><h3>{name}</h3><p>{price}</p><a href={whatsapp} target="_blank" rel="noreferrer">Customize on WhatsApp <Arrow /></a></div></article>)}</div></section>

    <section className="process-section" id="how-it-works"><div className="heading-center light-heading"><p className="eyebrow">A simple, personal process</p><h2>Your Gift. Your Memory. <em>Your Way.</em></h2></div><div className="process-grid">{steps.map(([number, title, text]) => <div className="process-step" key={number}><span className="step-icon">{number}</span><h3>{title}</h3><p>{text}</p></div>)}</div></section>

    <section className="benefits"><div className="benefits-inner">{benefits.map(([icon, title, text]) => <div className="benefit" key={title}><span className="benefit-icon">{icon}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></section>

    <section className="reviews" id="about"><div className="heading-center"><p className="eyebrow">A little love from our community</p><h2>What Our Customers Say</h2><p>Real moments. Real smiles.</p></div><div className="review-grid">{testimonials.map(([initial, name, text]) => <article className="review-card" key={name + initial}><div className="review-top"><span className="avatar">{initial}</span><div><strong>{name}</strong><span className="stars">★★★★★</span></div></div><p>&ldquo;{text}&rdquo;</p><small>Placeholder testimonial</small></article>)}</div></section>

    <section className="instagram-section"><div className="section-heading"><div><p className="eyebrow">Follow along</p><h2>See More From <em>Lucky Club</em></h2><p>Follow us for new designs, gift ideas and special moments.</p></div><a className="outline-button dark-outline" href={instagram} target="_blank" rel="noreferrer">@luckyclubgiftarticles <Arrow /></a></div><div className="instagram-grid"><div className="insta-art insta-one" /><div className="insta-art insta-two" /><div className="insta-art insta-three" /><div className="insta-art insta-four" /><div className="insta-art insta-five" /></div></section>

    <section className="final-section" id="contact"><div><p className="eyebrow">Start with a thought</p><h2>Ready to Create a Gift<br />They&apos;ll <em>Remember?</em></h2><p>Let&apos;s turn your memories into something special.</p><div className="hero-actions"><a className="gold-button" href="#products">Explore Gifts <Arrow /></a><a className="outline-button" href={whatsapp} target="_blank" rel="noreferrer"><WhatsAppIcon /> Chat on WhatsApp</a></div></div><div className="final-gift"><div className="gift-lid" /><div className="gift-body">Lucky<br /><em>Club</em></div><div className="gift-ribbon" /></div></section>

    <footer><div className="footer-main"><div className="footer-intro"><a className="footer-logo" href="#top"><span className="brand-crop"><Image src="/lcc.jpg.jpeg" alt="Lucky Club Gift Articles" width={180} height={240} /></span></a><p>Personalized gifts for your special moments.</p><a href={whatsapp} target="_blank" rel="noreferrer"><WhatsAppIcon /> +91 7032785547</a></div><div><h3>Quick Links</h3><a href="#top">Home</a><a href="#products">Gifts</a><a href="#how-it-works">How It Works</a><a href="#about">About Us</a><a href="#contact">Contact</a></div><div><h3>Shop</h3><a href="#gifts">Love & Couples</a><a href="#gifts">Birthday</a><a href="#gifts">Anniversary</a><a href="#gifts">Family</a><a href="#gifts">Personalized Gifts</a></div><div><h3>Contact</h3><a href={whatsapp} target="_blank" rel="noreferrer">Chat on WhatsApp</a><a href={instagram} target="_blank" rel="noreferrer">Instagram</a><span>hello@luckyclub.in</span><h3 className="payment-title">Secure Payments</h3><div className="payment-placeholders"><span>UPI</span><span>Card</span><span>COD</span></div></div></div><div className="footer-bottom"><span>© 2026 Lucky Club Gift Articles. All rights reserved.</span><span>Made for meaningful moments.</span></div></footer>
    <a className="floating-whatsapp" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Need help choosing a special gift? Chat on WhatsApp" title="Need help choosing a special gift?"><WhatsAppIcon /></a>
  </main>;
}
