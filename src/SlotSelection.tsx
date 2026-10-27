import { useState } from 'react';
import './slots.css';

function Glyph({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    back: <path d="m14 6-6 6 6 6"/>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/></>,
    car: <><path d="m5 8 2-5h10l2 5 2 3v7H3v-7l2-3Zm-1 3h16M6 18v3m12-3v3M6 14h2m8 0h2"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.arrow}</svg>;
}

type SlotSelectionProps = {
  onBack: () => void;
  location: string;
  zone: string;
  floor: number;
  slot: number;
  hours: number;
  onFloorChange: (floor: number) => void;
  onSlotChange: (slot: number) => void;
  onDurationChange: (hours: number) => void;
  onContinue: () => void;
  checkout: boolean;
  children: React.ReactNode;
};

export default function SlotSelection({ onBack, location, zone, floor, slot, hours, onFloorChange, onSlotChange, onDurationChange, onContinue, checkout, children }: SlotSelectionProps) {
  const [search, setSearch] = useState('');
  const taken = floor === 1 ? [2, 5, 6, 9, 11] : floor === 2 ? [1, 3, 7, 10] : [2, 6, 8];
  const code = (n: number) => `A-${String(n).padStart(2, '0')}`;
  const changeFloor = (n: number) => { onFloorChange(n); onSlotChange(4); };
  return <div className="slot-page">
    <div className="slot-desktop-brand"><span className="slot-logo">P<span>↗</span></span>SpotEase<span className="slot-brand-caption">A little less searching. A lot more living.</span></div>
    <div className="slot-phone">
      <div className="slot-status"><b>9:41</b><span>▮▮▮ <svg width="16" height="13" viewBox="0 0 20 16" fill="currentColor"><path d="M1 5a14 14 0 0 1 18 0l-2 2A11 11 0 0 0 3 7Zm4 4a8 8 0 0 1 10 0l-2 2a5 5 0 0 0-6 0Zm3 4a3 3 0 0 1 4 0l-2 2Z"/></svg><i/></span></div>
      <header className="slot-header"><button className="slot-back" onClick={onBack} aria-label={checkout ? 'Back to slot selection' : 'Back to destinations'}><Glyph name="back"/></button><span>{checkout ? 'REVIEW & PAY' : 'SELECT YOUR SPACE'}</span><span className="slot-step">{checkout ? '02' : '01'} <i>/ 03</i></span></header>
      <div className="slot-intro"><div className="slot-location-kicker"><Glyph name="pin" size={13}/> YOUR DESTINATION <span>VIP ACCESS</span></div><h1>{location}<br/><span>{zone}</span><span className="slot-heading-dot">.</span></h1><p>{checkout ? 'One last stop. Then you’re set.' : 'A space with your name on it.'}</p></div>
      {!checkout && <>
      <div className="slot-search"><Glyph name="search" size={18}/><input aria-label="Search parking slots" placeholder="Find a slot, e.g. A-04" value={search} onChange={e => setSearch(e.target.value)}/><span>⌘ K</span></div>
      <div className="slot-wallet"><div className="slot-wallet-icon"><img src="/gopay-wallet.svg" alt="GoPay"/></div><div><span>GOPAY WALLET</span><b>Easy, secure checkout</b></div><span className="slot-wallet-ready"><i/> Demo payment</span></div>
      <section className="slot-floor-section"><div className="slot-section-heading"><h2>Choose your floor</h2><span><i/> Live availability</span></div><div className="slot-floors" role="tablist" aria-label="Parking level">{[1, 2, 3].map(n => <button role="tab" aria-selected={floor === n} className={floor === n ? 'active' : ''} key={n} onClick={() => changeFloor(n)}>Level B{n}<span>{n === 1 ? 7 : n === 2 ? 8 : 9} free</span></button>)}</div></section>
      <div className="slot-map-heading"><span><Glyph name="car" size={15}/> LEVEL B{floor} <i>·</i> ZONE A</span><span>Tap a space to select</span></div>
      <section className="slot-map" aria-label={`Level B${floor} parking layout`}>
        <div className="slot-map-top"><span>PEDESTRIAN WALKWAY</span><div className="slot-lift">▥ <span>LIFT LOBBY</span></div></div>
        <div className="slot-parking-grid">{Array.from({ length: 12 }, (_, i) => i + 1).map(n => {
          const occupied = taken.includes(n);
          const matches = !search || code(n).toLowerCase().includes(search.toLowerCase());
          return <button key={n} disabled={occupied} aria-label={`${code(n)}, ${occupied ? 'taken' : slot === n ? 'selected' : 'available'}`} aria-pressed={slot === n} onClick={() => onSlotChange(n)} className={`slot-space ${occupied ? 'taken' : 'available'} ${slot === n ? 'selected' : ''} ${matches ? '' : 'dimmed'}`}><span>{code(n)}</span>{occupied ? <div className="slot-car"><i/><b/><i/></div> : slot === n ? <span className="slot-selected-check"><Glyph name="check" size={18}/></span> : <span className="slot-empty-line"/>}{slot === n && <small>SELECTED</small>}</button>;
        })}<div className="slot-driving-lane"><span>↓</span><i/><span>ONE WAY</span><i/><span>↓</span></div></div>
        <div className="slot-map-bottom"><span>↑ &nbsp; ENTRY</span><span>EXIT &nbsp; →</span></div>
      </section>
      <div className="slot-legend"><span><i className="available"/>Available</span><span><i className="taken"/>Taken</span><span><i className="selected"/>Selected</span><span className="slot-map-scale">12 spaces</span></div>
      </>}
      <div className="slot-reservation">
        <div className="slot-card-top"><div className="slot-selected-icon"><Glyph name="pin" size={23}/></div><div><span>YOUR SELECTED SLOT</span><h2>{code(slot)} <i>Level B{floor}</i></h2></div><span className="slot-card-badge">Great choice</span></div>
        {!checkout && <div className="slot-duration-row"><span>Parking duration</span><div aria-label="Parking duration">{[1, 2, 3, 4].map(h => <button key={h} aria-pressed={hours === h} className={hours === h ? 'active' : ''} onClick={() => onDurationChange(h)}>{h}h</button>)}</div></div>}
        <div className="slot-booking-fields">{children}</div>
        {!checkout && <><div className="slot-total"><div><span>Total reservation</span><p>Flat VIP fee · {hours} {hours === 1 ? 'hour' : 'hours'}</p></div><b>Rp 15,000</b></div>
        <button className="slot-confirm" onClick={onContinue}>Continue to payment<Glyph name="arrow"/></button>
        <p className="slot-secure"><Glyph name="shield" size={12}/>Secure checkout. No real payment in this preview.</p></>}
      </div>
      <div className="slot-home-indicator"/>
    </div>
    <div className="slot-desktop-footer"><span>LESS CIRCLING. MORE LIVING.</span><span>Smart parking, thoughtfully simple.</span></div>
  </div>;
}
