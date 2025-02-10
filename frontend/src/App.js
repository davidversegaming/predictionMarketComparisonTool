import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [viewType, setViewType] = useState('markets');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [cursor, setCursor] = useState(null);

  const fetchData = async (reset = false) => {
    if (reset) {
      setCursor(null);
      setData([]);
    }

    try {
      let url = `/api/${viewType}?limit=50`;
      if (status) url += `&status=${status}`;
      if (category) url += `&category=${category}`;
      if (cursor && !reset) url += `&cursor=${cursor}`;

      const response = await fetch(url);
      const responseData = await response.json();
      
      setData(prev => reset ? responseData[viewType] : [...prev, ...responseData[viewType]]);
      setCursor(responseData.cursor);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const fetchDataWrapper = () => {
      fetchData(true);
    };
    fetchDataWrapper();
  }, [viewType, status, category]); // eslint-disable-line react-hooks/exhaustive-deps

  const MarketCard = ({ market }) => (
    <div className="market-card">
      <div className="market-title">{market.title}</div>
      <div className="market-details">
        <p>Ticker: {market.ticker}</p>
        <p>Category: {market.category}</p>
        <p>Close Date: {new Date(market.close_time).toLocaleString()}</p>
        <p>Status: {market.status}</p>
        <p>Volume: {market.volume || 0} contracts</p>
        {market.yes_bid && (
          <div className="market-price">
            Current Prices:<br />
            Yes: ${market.yes_bid} - ${market.yes_ask}<br />
            No: ${market.no_bid} - ${market.no_ask}
          </div>
        )}
      </div>
    </div>
  );

  const EventCard = ({ event }) => (
    <div className="market-card">
      <div className="market-title">{event.title}</div>
      <div className="market-details">
        <p>Event Ticker: {event.event_ticker}</p>
        <p>Category: {event.category}</p>
        <p>Number of Markets: {event.market_count}</p>
        <p>Status: {event.status}</p>
      </div>
    </div>
  );

  return (
    <div className="App">
      <h1>Kalshi Prediction Markets</h1>
      
      <div className="controls">
        <select 
          value={viewType} 
          onChange={(e) => setViewType(e.target.value)}
        >
          <option value="markets">Markets</option>
          <option value="events">Events</option>
        </select>
        
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="settled">Settled</option>
        </select>
        
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
        </select>
      </div>

      <div className="content-container">
        {data.map((item, index) => (
          viewType === 'markets' ? 
            <MarketCard key={index} market={item} /> :
            <EventCard key={index} event={item} />
        ))}
      </div>

      {cursor && (
        <button className="load-more" onClick={() => fetchData(false)}>
          Load More
        </button>
      )}
    </div>
  );
}

export default App;
