import { useEffect, useState } from 'react';
import InterstitialAd from './InterstitialAd';

function App() {
  const [ showInterstitialAd, setShowInterstitialAd ] = useState(false);

  useEffect(() => {
    // TODO GUIDE: Initialize SDK
    // env must be one of local, dev, prod
    window.FlowerSdk.setEnv('local');
    window.FlowerSdk.init();
    // Log level must be one of Verbose, Debug, Info, Warn, Error, Off
    window.FlowerSdk.setLogLevel('Debug');
  }, []);

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      {showInterstitialAd && <InterstitialAd onClose={() => setShowInterstitialAd(false)} />}
      {!showInterstitialAd && <button onClick={() => setShowInterstitialAd(true)}>Show Interstitial Ad</button>}
    </div>
  );
}

export default App;
