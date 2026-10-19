import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import AccountPanel, { accountInitials, accountName } from './AccountPanel';

function Icon({ name, size = 20, ...props }: { name: string; size?: number; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    person: <><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></>,
    pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    back: <path d="m14 6-6 6 6 6"/>,
    car: <><path d="m5 7 2-4h10l2 4 2 3v8H3v-8l2-3Zm-1 3h16M6 18v3m12-3v3M6 14h2m8 0h2"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    ticket: <><path d="M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4V6Z"/><path d="M15 6v3m0 3v2m0 3v1"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    chevron: <path d="m8 10 4 4 4-4"/>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3h.01"/></>,
    bell: <><path d="M5 16h14l-2-4V8a5 5 0 0 0-10 0v4l-2 4Zm5 4h4"/></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/></>,
    heart: <path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-4 4 1 9 8 15 7-6 12-11 8-15Z"/>,
    bolt: <path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>{paths[name] || paths.pin}</svg>;
}

const locations = [
  { name: 'Grand Indonesia', zone: 'VIP Valet B1 North', area: 'Thamrin, Central Jakarta', spots: 12, distance: '1.2', rate: 5000, image: '1591448654263-a243151f612f', tag: 'VIP GUARANTEED', tone: 'green' },
  { name: 'Central Park Mall', zone: 'VIP P2 Green', area: 'Grogol, West Jakarta', spots: 4, distance: '3.8', rate: 5000, image: '1692448500924-7e8ea759b1be', tag: 'VIP ACCESS', tone: 'amber' },
  { name: 'Plaza Indonesia', zone: 'VIP Basement B2', area: 'Menteng, Central Jakarta', spots: 6, distance: '1.5', rate: 5000, image: '1582207823758-0750807e3c8c', tag: 'VIP GUARANTEED', tone: 'green' },
];
const money = (n: number) => `Rp ${n.toLocaleString('en-US')}`;
const steps = ['VIP zones', 'VIP booking', 'Checkout', 'Active VIP ticket', 'Exit settlement'];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const previousUserId = useRef<string | null>(null);
  const [screen, setScreen] = useState(0);
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState('');
  const [duration, setDuration] = useState(2);
  const [arrival, setArrival] = useState('09:00');
  const [day, setDay] = useState('Today');
  const [vehicle, setVehicle] = useState('B 1234 XYZ (Honda Civic)');
  const [vehicles, setVehicles] = useState(['B 1234 XYZ (Honda Civic)']);
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState('');
  const [editingVehicle, setEditingVehicle] = useState<number | null>(null);
  const [plateDraft, setPlateDraft] = useState('');
  const [modelDraft, setModelDraft] = useState('');
  const [vehicleError, setVehicleError] = useState('');
  const [payment, setPayment] = useState('GoPay');
  const [booked, setBooked] = useState(false);
  const [exited, setExited] = useState(false);
  const [overstay, setOverstay] = useState(false);
  const [remaining, setRemaining] = useState(7200);
  const [saved, setSaved] = useState<number[]>([]);
  const [filter, setFilter] = useState('All VIP Zones');
  const [notice, setNotice] = useState('');
  const place = locations[selected];
  const total = 15000;
  const clearAccountState = () => {
    setSaved([]); setVehicles([]); setVehicle(''); setBooked(false);
    setExited(false); setOverstay(false); setRemaining(7200); setSelected(0);
    setDuration(2); setArrival('09:00'); setDay('Today'); setPayment('GoPay');
    setAddingVehicle(false); setNewVehicle(''); setEditingVehicle(null);
    setPlateDraft(''); setModelDraft(''); setVehicleError(''); setNotice('');
  };
  useEffect(() => {
    let alive = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      const nextId = session?.user.id ?? null;
      if (previousUserId.current && previousUserId.current !== nextId) {
        clearAccountState(); setCheckoutPending(false); setFilter('All VIP Zones'); setQuery(''); setScreen(0);
      }
      previousUserId.current = nextId;
      setUser(session?.user ?? null); setAuthLoading(false);
    });
    supabase.auth.getSession().then(({ error }) => {
      if (alive && error) { setNotice('Unable to restore your session. Please log in again.'); setAuthLoading(false); }
    }).catch(() => {
      if (alive) { setNotice('Unable to check your session. Please try signing in.'); setAuthLoading(false); }
    });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    if (!booked || exited) return;
    const timer = window.setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [booked, exited]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const go = (n: number) => {
    if (n === 2 && (!user || authLoading)) { setCheckoutPending(true); setScreen(7); }
    else setScreen(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const openAccount = () => { setCheckoutPending(false); go(7); };
  const explore = () => { setFilter('All VIP Zones'); setQuery(''); go(0); };
  const showSaved = () => { setFilter('Favorites'); setQuery(''); go(0); };
  const showVehicles = () => { setEditingVehicle(null); setPlateDraft(''); setModelDraft(''); setVehicleError(''); go(5); };
  const activeTab = screen === 5 ? 'vehicles' : [3, 4, 6].includes(screen) ? 'tickets' : screen === 0 ? (filter === 'Favorites' ? 'saved' : 'explore') : '';
  const summary = <div className="summary-rows"><div><span>Parking zone</span><b>{place.zone}</b></div><div><span>Arrival time</span><b>{day}, {arrival}</b></div><div><span>Reserved duration</span><b>{duration < 1 ? '30 minutes' : `${duration} hours`}</b></div><div><span>Vehicle plate</span><b>{vehicle.split(' (')[0]}</b></div></div>;

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#" onClick={e => { e.preventDefault(); explore(); }}><span className="brand-mark">P<span/></span>SpotEase<span className="brand-dot">.</span></a>
      <div className="workspace-label">YOUR EVERYDAY, EASIER.</div>
      <nav>
        <button className={activeTab === 'explore' ? 'nav-item active' : 'nav-item'} onClick={explore}><Icon name="grid"/>Find parking<Icon name="arrow" size={16}/></button>
        <button className={activeTab === 'tickets' ? 'nav-item active' : 'nav-item'} onClick={() => go(booked ? 3 : 6)}><Icon name="ticket"/>My bookings{booked && <span className="nav-count">1</span>}</button>
        <button className={activeTab === 'saved' ? 'nav-item active' : 'nav-item'} onClick={showSaved}><Icon name="heart"/>Favorites</button>
        <button className={activeTab === 'vehicles' ? 'nav-item active' : 'nav-item'} onClick={showVehicles}><Icon name="car"/>My vehicles</button>
      </nav>
      <div className="sidebar-bottom"><div className="little-promo"><span className="promo-icon"><Icon name="bolt"/></span><h3>Less circling.<br/>More living.</h3><p>Your next great day starts<br/>with a reserved spot.</p><span className="mini-road"><i/><i/><i/><i/></span></div><button className="nav-item" onClick={() => setNotice('Need a hand? Contact hello@spotease.app for support.')}><Icon name="help"/>Help & support<Icon name="arrow" size={16}/></button><button className="profile account-trigger" onClick={openAccount} aria-label={user ? "Open your account" : "Log in or sign up"}><span className="avatar">{user ? accountInitials(user) : <Icon name="person" size={19}/>}</span><span className="profile-copy"><b>{authLoading ? "Checking session…" : accountName(user)}</b><span>{user ? "Personal account" : "Log in / Sign up"}</span></span><Icon name="chevron" size={16}/></button></div>
    </aside>

    <div className="workspace">
      <header className="topbar"><div className="mobile-brand"><span className="brand-mark">P<span/></span><b>SpotEase.</b></div><div className="breadcrumb">Your city. Your spot.<span>/</span><b>{screen === 7 ? 'Your account' : screen === 5 ? 'Saved vehicles' : screen === 6 ? 'My tickets' : activeTab === 'saved' ? 'Saved places' : steps[screen]}</b></div><div className="topbar-right"><span className="city"><span className="green-dot"/>Jakarta, Indonesia</span><button className="icon-button" aria-label="Notifications" onClick={() => setNotice(booked ? 'Your parking reservation is confirmed. You’re all set!' : 'You’re all caught up. No new notifications.')}><Icon name="bell"/><i/></button><button className="avatar small account-avatar" aria-label={user ? "Open your account" : "Log in or sign up"} onClick={openAccount}>{user ? accountInitials(user) : <Icon name="person" size={18}/>}</button></div></header>
      <main>
        {screen === 7 ? <AccountPanel user={user} loading={authLoading} checkoutPending={checkoutPending} onBack={() => { setCheckoutPending(false); explore(); }} onAuthenticated={() => { if (checkoutPending) setScreen(2); else setScreen(7); setCheckoutPending(false); }} onLoggedOut={() => { clearAccountState(); setUser(null); setCheckoutPending(false); explore(); }} /> : screen === 5 ? <section className="vehicle-manager">
          <div className="eyebrow">YOUR EVERYDAY RIDES</div><h1>Saved vehicles</h1><p className="vehicle-intro">Keep your plates up to date for a seamless VIP arrival.</p>
          <div className="saved-vehicle-list">{vehicles.map((v, i) => <article className="saved-vehicle-row" key={i}><div className="car-tile"><Icon name="car" size={26}/></div><div><h3>{v.split(' (')[0]}</h3><p>{v.includes('(') ? v.split('(')[1].replace(')', '') : 'Saved vehicle'}</p>{vehicle === v && <span className="status-tag">Selected vehicle</span>}</div><button className="text-button" onClick={() => { setEditingVehicle(i); setPlateDraft(v.split(' (')[0]); setModelDraft(v.includes('(') ? v.split('(')[1].replace(')', '') : ''); setVehicleError(''); }}>Edit plate</button></article>)}</div>
          <form className="vehicle-editor" onSubmit={e => {
            e.preventDefault();
            const plate = plateDraft.trim().toUpperCase().replace(/\s+/g, ' ');
            if (!plate || !modelDraft.trim()) { setVehicleError('Enter a license plate and vehicle model.'); return; }
            if (vehicles.some((v, i) => i !== editingVehicle && v.split(' (')[0].toUpperCase() === plate)) { setVehicleError('This license plate is already saved.'); return; }
            const value = `${plate} (${modelDraft.trim()})`;
            if (editingVehicle === null) { setVehicles(v => [...v, value]); setVehicle(value); }
            else { const previous = vehicles[editingVehicle]; setVehicles(v => v.map((item, i) => i === editingVehicle ? value : item)); if (vehicle === previous) setVehicle(value); }
            setEditingVehicle(null); setPlateDraft(''); setModelDraft(''); setVehicleError(''); setNotice('Vehicle saved successfully.');
          }}>
            <h2>{editingVehicle === null ? 'Add new vehicle' : 'Edit saved vehicle'}</h2>
            <label htmlFor="saved-plate">License plate</label><input id="saved-plate" required placeholder="B 1234 XYZ" value={plateDraft} onChange={e => setPlateDraft(e.target.value)}/>
            <label htmlFor="saved-model">Vehicle model</label><input id="saved-model" required placeholder="Honda Civic" value={modelDraft} onChange={e => setModelDraft(e.target.value)}/>
            {vehicleError && <p className="vehicle-error" role="alert">{vehicleError}</p>}
            <button className="dark-button full" type="submit">{editingVehicle === null ? '+ Add new vehicle' : 'Save changes'}<Icon name="check" size={17}/></button>
            {editingVehicle !== null && <button type="button" className="home-link" onClick={() => { setEditingVehicle(null); setPlateDraft(''); setModelDraft(''); setVehicleError(''); }}>Cancel editing</button>}
          </form>
        </section> : screen === 6 ? <section className="empty-state tickets-empty"><Icon name="ticket" size={34}/><h3>Your VIP journeys start here.</h3><p>Your reserved tickets will appear here after booking.</p><button className="dark-button full" onClick={explore}>Explore VIP zones<Icon name="arrow" size={18}/></button></section> : screen === 0 ? <>
          <section className="welcome"><div><div className="eyebrow">A LITTLE PLANNING. A LOT LESS PARKING.</div><h1>Good days start with<br/>a <span>great spot.<svg viewBox="0 0 250 12"><path d="M3 8Q120 0 247 7" /></svg></span></h1><p>Guaranteed VIP parking. Ready before you arrive.</p></div><div className="welcome-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="parking-sign">P<small>YOU’RE IN THE RIGHT PLACE</small></div><span className="art-spark">+</span><span className="art-dot"/></div></section>
          <div className="home-layout"><section className="destinations">
            <div className="search-box"><Icon name="search" size={22}/><input aria-label="Search destinations" placeholder="Search VIP Mall or Building Zone..." value={query} onChange={e => setQuery(e.target.value)}/><span className="search-shortcut">⌘ K</span></div>
            <div className="list-heading"><div><h2>{filter === 'Favorites' ? 'Your saved VIP places' : 'Find your VIP spot'}<span className="result-count">{locations.filter((p, i) => `${p.name} ${p.zone}`.toLowerCase().includes(query.toLowerCase()) && (filter !== 'Favorites' || saved.includes(i))).length}</span></h2><p>A space for you, wherever you’re headed.</p></div></div>
            <div className="filters">{['All VIP Zones', 'Near Me', 'Favorites'].map(f => <button key={f} className={filter === f ? 'filter active-filter' : 'filter'} onClick={() => setFilter(f)}>{f === 'Near Me' && <Icon name="pin" size={14}/>} {f}</button>)}<span className="live"><span className="green-dot"/>Live availability</span></div>
            <div className="destination-list">{locations.map((p, i) => ({ p, i })).filter(({p, i}) => `${p.name} ${p.zone}`.toLowerCase().includes(query.toLowerCase()) && (filter !== 'Favorites' || saved.includes(i))).sort((a,b) => filter === 'Near Me' ? +a.p.distance - +b.p.distance : a.i - b.i).map(({p, i}) => <article className="destination-card" key={p.name}>
              <div className="destination-image"><img src={`https://images.unsplash.com/photo-${p.image}?auto=format&fit=crop&w=650&q=85`} alt={`${p.name} architecture`}/><span className="image-tag">{p.tag}</span><button aria-label={saved.includes(i) ? 'Unsave location' : 'Save location'} className={`save-button ${saved.includes(i) ? 'is-saved' : ''}`} onClick={() => setSaved(s => s.includes(i) ? s.filter(n => n !== i) : [...s, i])}><Icon name="heart" size={16}/></button></div>
              <div className="destination-info"><div className="destination-title"><div><h3>{p.name}</h3><span className="zone">{p.zone}</span></div><span className="distance"><Icon name="pin" size={13}/>{p.distance} km</span></div><p className="address">{p.area}</p><div className="card-bottom"><span className={`availability ${p.tone}`}><span/>{p.spots} VIP spots available</span><span className="rate"><b>Rp 15,000</b><span> / 2 hrs reserved</span></span></div><button className="reserve-button" onClick={() => { setSelected(i); go(1); }}>Reserve VIP Spot<Icon name="arrow" size={17}/></button></div>
            </article>)}</div>
            {filter === 'Favorites' && saved.length === 0 && <div className="empty-state"><Icon name="heart" size={30}/><h3>Your favorites, a little closer.</h3><p>Tap the heart on any destination to save it here.</p></div>}
            <div className="end-note"><Icon name="shield" size={15}/>Real-time spots. Secure payments. One less thing to think about.</div>
          </section>
          <aside className="home-aside"><div className="how-card"><span className="eyebrow">PARKING, WITHOUT THE GUESSWORK</span><h2>A spot. A plan.<br/>Peace of mind.</h2><div className="how-steps">{[['search','Find your place','Pick a destination and see live spots.'],['ticket','Make it yours','Choose your time. Reserve in seconds.'],['car','Just drive in','Your spot is ready when you are.']].map(([icon,title,text],i) => <div className="how-step" key={title}><div className="how-icon"><Icon name={icon}/><span>{i+1}</span></div><div><h4>{title}</h4><p>{text}</p></div></div>)}</div><div className="how-footer"><Icon name="shield" size={17}/>A little certainty for your journey.</div></div><div className="vehicle-card"><div className="section-top"><h3>Your everyday ride</h3><span className="tiny-label">DEFAULT</span></div><div className="vehicle-detail"><div className="car-tile"><Icon name="car" size={27}/></div><div><b>{vehicle ? vehicle.split(' (')[0] : 'Add your vehicle'}</b><p>{vehicle.includes('(') ? vehicle.split('(')[1].replace(')', '') : 'Saved vehicle'}<span> • </span>Personal</p></div></div><button onClick={showVehicles}>Manage vehicles<Icon name="arrow" size={15}/></button></div><div className="help-note"><Icon name="help" size={18}/><p>New around here? <button onClick={() => setNotice('Choose a destination, select your time, then pay to receive your entry ticket.')}>We’ll show you the way.</button></p></div></aside></div>
        </> : <>
          <button className="back-link" onClick={() => go(screen === 4 ? 0 : screen - 1)}><Icon name="back" size={17}/>{screen === 4 ? 'Back to home' : 'Back'}</button>
          <div className="flow-heading"><div className="eyebrow">YOUR SPOT IS A FEW STEPS AWAY</div><h1>{screen === 1 ? 'Make room for your plans.' : screen === 2 ? 'One last stop. Then you’re set.' : screen === 3 ? 'Your VIP pass. Ready to go.' : 'Exit summary & settlement.'}</h1><p>{screen === 1 ? 'A few details now. A smoother arrival later.' : screen === 2 ? 'Check the details and make it official.' : screen === 3 ? 'Less to worry about. More to look forward to.' : 'Everything you need for a seamless arrival and exit.'}</p></div>
          <div className="progress-steps">{steps.slice(1,4).map((s,i) => <div key={s} className={screen >= i+1 ? 'complete' : ''}><span>{screen > i+1 ? <Icon name="check" size={14}/> : i+1}</span>{s}{i < 2 && <i/>}</div>)}</div>
          <div className="booking-layout"><section className="form-card">
            {screen === 1 && <><div className="location-header"><div className="location-icon"><Icon name="pin" size={23}/></div><div><span>YOUR DESTINATION</span><h2>{place.name} – {place.zone}</h2><p>{place.area}</p></div></div><div className="form-section"><h3><span>01</span>Select saved vehicle</h3><label htmlFor="vehicle">Your saved vehicle</label><div className="select-wrap"><Icon name="car"/><select id="vehicle" value={vehicle} onChange={e => setVehicle(e.target.value)}>{!vehicle && <option value="">Select or add a vehicle</option>}{vehicles.map(v => <option key={v}>{v}</option>)}</select></div><button className="text-button" onClick={() => setAddingVehicle(!addingVehicle)}>+ Add new vehicle</button>{addingVehicle && <form className="add-vehicle" onSubmit={e => { e.preventDefault(); if (newVehicle.trim()) { setVehicles(v => [...v, newVehicle.trim()]); setVehicle(newVehicle.trim()); setAddingVehicle(false); setNewVehicle(''); } }}><input required placeholder="Plate number (Vehicle model)" aria-label="New vehicle" value={newVehicle} onChange={e => setNewVehicle(e.target.value)}/><button className="dark-button">Save</button></form>}</div><div className="form-section"><h3><span>02</span>Estimated arrival time</h3><div className="two-fields"><label>Arrival date<select value={day} onChange={e => setDay(e.target.value)}><option>Today</option><option>Tomorrow</option></select></label><label>Arrival time<input type="time" value={arrival} onChange={e => setArrival(e.target.value)} required/></label></div></div><div className="form-section"><h3><span>03</span>Reserved duration</h3><p>How long are you planning to stay?</p><div className="duration-pills">{[1,2,3,4].map(d => <button key={d} className={duration === d ? 'chosen' : ''} onClick={() => setDuration(d)}>{d === .5 ? '30m' : `${d}h`}{duration === d && <Icon name="check" size={14}/>}</button>)}</div></div><div className="info-callout"><Icon name="info" size={20}/><p>VIP Guarantee: If you leave within your {duration}-hour window, you only pay the Rp 15,000 upfront fee. Overstaying will incur Rp 5,000/hr starting at minute {duration * 60 + 1}.</p></div><button className="dark-button full" onClick={() => { if (!vehicle) { setNotice("Add a vehicle before continuing to checkout."); showVehicles(); return; } go(2); }}>Proceed to checkout <span>({money(total)})</span><Icon name="arrow" size={18}/></button></>}
            {screen === 2 && <><h2 className="card-heading">Your reservation</h2><div className="checkout-location"><Icon name="pin"/><div><h3>{place.name}</h3><p>{place.zone}</p></div><span className="status-tag">Reserved for you</span></div>{summary}<div className="fee-section"><div><span>VIP Slot Guarantee Fee</span><b>Rp 15,000</b></div><div className="total"><b>Total payment</b><strong>{money(total)}</strong></div></div><h3 className="payment-heading">Choose payment method</h3><div className="payment-methods">{['GoPay','OVO','ShopeePay','Credit / Debit Card'].map((p,i) => <button onClick={() => setPayment(p)} className={payment === p ? 'payment selected-payment' : 'payment'} key={p}><span className={`payment-logo payment-${i}`}>{i === 0 ? <img src="/gopay-wallet.svg" alt="Official GoPay cyan wallet logo"/> : i === 3 ? <Icon name="ticket"/> : ['','OVO','S'][i]}</span><b>{p}</b><span className="radio">{payment === p && <span/>}</span></button>)}</div><div className="secure-note"><Icon name="shield" size={15}/>Safe, encrypted payments. Always.</div><button className="dark-button full" onClick={() => { if (!user || authLoading) { setCheckoutPending(true); go(7); return; } setBooked(true); setExited(false); setRemaining(duration * 3600 - 120); go(3); }}>Pay Rp 15,000 & confirm booking<Icon name="arrow" size={18}/></button><p className="demo-note">Interactive preview · No real payment will be charged.</p></>}
            {screen === 3 && <><div className="confirmation-heading"><div className="success-icon"><Icon name="check" size={36}/></div><span className="eyebrow">YOU’RE ALL SET</span><h2>VIP booking confirmed!</h2><p>Your spot is waiting. Enjoy the journey.</p></div><div className="ticket-summary"><h3>{place.name}</h3><p>{place.zone}</p>{summary}</div><div className="entry-code"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent('SPOTEASE:VIP-8842')}`} alt="QR code for SpotEase booking VIP-8842"/><div><span>BACKUP GATE PASSCODE</span><strong>VIP-8842</strong><p>Camera didn’t catch your plate?<br/>Scan this at the entry gate.</p></div></div><div className="timer-panel"><Icon name="clock" size={23}/><p>Time remaining in booked window</p><strong className="vip-countdown">{Math.floor(remaining / 3600)}h {Math.floor(remaining % 3600 / 60)}m</strong><span>remaining in booked window</span></div><div className="gate-instructions"><p><span>1</span>Scan your QR code at the VIP entry gate, or enter VIP-8842.</p><p><span>2</span>Your VIP slot is guaranteed for your reserved duration.</p></div><button className="dark-button full" onClick={() => { setOverstay(false); setExited(true); setBooked(false); go(4); }}>Simulate exit gate scan (on time)<Icon name="arrow" size={18}/></button><button className="secondary-button" onClick={() => { setOverstay(true); setExited(true); setBooked(false); go(4); }}>Simulate overstay exit (exceed +1 hour)</button><p className="demo-note">Preview simulation · No charges are made.</p><button className="home-link" onClick={() => go(0)}>Back to home</button></>}
            {screen === 4 && <><div className="section-top"><h2 className="card-heading">Exit summary & settlement</h2><span className="status-tag"><Icon name="check" size={12}/>Completed</span></div><div className="scenario-toggle"><button className={!overstay ? 'chosen' : ''} onClick={() => setOverstay(false)}>On-time exit</button><button className={overstay ? 'chosen' : ''} onClick={() => setOverstay(true)}>Overstay exit</button></div><div className={`settlement-hero ${overstay ? 'overstay-hero' : ''}`}><div className="success-icon"><Icon name="check" size={32}/></div><span className="eyebrow">{overstay ? 'AUTOMATICALLY SETTLED' : 'RIGHT ON TIME'}</span><h2>{overstay ? 'A little extra time. All settled.' : 'A seamless exit. Zero extras.'}</h2><p>Total stay: {overstay ? `${duration + 1}h 15m` : `${duration - 1}h 45m`}{overstay && ' (1h 15m overstay)'}</p></div><div className="ticket-summary"><h3>{place.name}</h3><p>{place.zone} · {vehicle.split(' (')[0]}</p><div className="fee-section"><div><span>Base VIP rate</span><b>Rp 15,000 <span className="paid-badge">Paid</span></b></div><div><span>Overstay fee {overstay && '(1 hr @ Rp 5,000/hr)'}</span><b>{overstay ? 'Rp 5,000' : 'Rp 0'}</b></div>{overstay && <div><span>Auto-deducted from {payment}</span><b>Rp 5,000</b></div>}<div className="total"><b>Remaining balance</b><strong>Rp 0</strong></div></div></div><div className="info-callout"><Icon name="shield" size={20}/><p>{overstay ? `The simulated Rp 5,000 overstay fee was automatically settled via ${payment}. No outstanding balance.` : 'You exited within your reserved window. The Rp 15,000 upfront VIP fee covers your stay.'}</p></div><p className="settlement-thanks">Thank you for using VIP SpotEase!</p><button className="dark-button full" onClick={() => go(0)}>Reserve another VIP spot<Icon name="arrow" size={18}/></button><button className="home-link" onClick={() => go(6)}>View my tickets</button><p className="demo-note">Simulation only · No actual wallet deduction.</p></>}
          </section><aside className="booking-aside"><img src={`https://images.unsplash.com/photo-${place.image}?auto=format&fit=crop&w=650&q=85`} alt={place.name}/><div className="booking-aside-content"><span className="eyebrow">A GOOD PLACE TO START</span><h2>{place.name}</h2><p><Icon name="pin" size={15}/>{place.zone} · {place.area}</p><div className="aside-features"><span><Icon name="shield" size={17}/>Secure, monitored parking</span><span><Icon name="car" size={17}/>Automatic plate recognition</span><span><Icon name="bolt" size={17}/>Seamless entry & exit</span></div><div className="aside-quote">“The best part of your trip?<br/>Not thinking about parking.”</div></div></aside></div>
        </>}
        <footer><span>© 2026 SpotEase. More life, less parking.</span><div><span className="green-dot"/>Made for smoother journeys.</div></footer>
      </main>
    </div>
    <nav className="mobile-nav" aria-label="Main navigation">{[
      { id: 'explore', icon: 'search', label: 'Explore', action: explore },
      { id: 'tickets', icon: 'ticket', label: 'My tickets', action: () => go(booked ? 3 : 6) },
      { id: 'saved', icon: 'heart', label: 'Saved', action: showSaved },
      { id: 'vehicles', icon: 'car', label: 'Vehicles', action: showVehicles },
    ].map(tab => <button key={tab.id} className={activeTab === tab.id ? 'current' : ''} aria-current={activeTab === tab.id ? 'page' : undefined} onClick={tab.action}><span className="tab-icon"><Icon name={tab.icon}/></span>{tab.label}</button>)}</nav>
    {notice && <div className="toast" role="status"><Icon name="info" size={20}/>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification">×</button></div>}
  </div>;
}
