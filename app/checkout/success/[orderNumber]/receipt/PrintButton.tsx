"use client";

export function PrintButton() {
  return <button className="gold-button print-button" type="button" onClick={() => window.print()}>Print / Save receipt</button>;
}