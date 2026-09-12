"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Offer = { id: string; title: string; subtitle: string | null; description: string | null; image: string; buttonLabel: string | null; buttonHref: string | null };

export default function OfferSlider() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch("/api/offers").then((r) => r.ok ? r.json() : []).then(setOffers).catch(() => setOffers([]));
  }, []);

  useEffect(() => {
    if (offers.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % offers.length), 5000);
    return () => window.clearInterval(timer);
  }, [offers.length]);

  if (!offers.length) return null;
  const offer = offers[index];
  const href = offer.buttonHref || "/products";
  const isExternal = href.startsWith("http");
  return <section className="offer-slider" aria-label="Current offers"><div className="offer-slider-track" style={{ transform: `translateX(-${index * 100}%)` }}>{offers.map((item) => <div className="offer-slide" key={item.id}><div className="offer-slide-image" style={{ backgroundImage: `url("${item.image}")` }} /><div className="offer-slide-content"><p className="eyebrow">Lucky Club Special Offer</p><h2>{item.title}</h2>{item.subtitle && <p className="offer-subtitle">{item.subtitle}</p>}{item.description && <p className="offer-description">{item.description}</p>}{item.buttonLabel && (isExternal ? <a className="gold-button" href={href} target="_blank" rel="noreferrer">{item.buttonLabel} <span aria-hidden="true">↗</span></a> : <Link className="gold-button" href={href}>{item.buttonLabel} <span aria-hidden="true">↗</span></Link>)}</div></div>)}</div>{offers.length > 1 && <div className="offer-dots" aria-label="Offer slides">{offers.map((item, dotIndex) => <button key={item.id} type="button" aria-label={`Show offer ${dotIndex + 1}`} aria-current={dotIndex === index} onClick={() => setIndex(dotIndex)} />)}</div>}</section>;
}
