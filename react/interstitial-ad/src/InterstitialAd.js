import { useEffect, useRef } from 'react';

function InterstitialAd({ onClose }) {
  const adContainerRef = useRef(null);
  const flowerAdViewRef = useRef(null);
  const adsManagerListenerRef = useRef(null);

  useEffect(() => {
    if (!adContainerRef.current) return;

    flowerAdViewRef.current = new window.FlowerAdView(adContainerRef.current);

    requestAd();

    return () => {
      flowerAdViewRef.current.adsManager.removeListener(adsManagerListenerRef.current);
      flowerAdViewRef.current.adsManager.stop();
    };
  }, [ adContainerRef ]);

  const requestAd = () => {
    // TODO GUIDE: Implement FlowerAdsManagerListener
    adsManagerListenerRef.current = {
      onPrepare(adDurationMs) {
        // TODO GUIDE: Play interstitial ad
        flowerAdViewRef.current.adsManager.play();
      },
      onPlay() {
        // OPTIONAL GUIDE: Need nothing to do for interstitial ad
      },
      onCompleted() {
        // TODO GUIDE: Stop FlowerAdsManager after the interstitial ad ends
        flowerAdViewRef.current.adsManager.removeListener(adsManagerListenerRef.current);
        flowerAdViewRef.current.adsManager.stop();
      },
      onError(error) {
        console.error('Error from Flower SDK: ', error);

        // TODO GUIDE: Stop FlowerAdsManager on error
        flowerAdViewRef.current.adsManager.removeListener(adsManagerListenerRef.current);
        flowerAdViewRef.current.adsManager.stop();
      },
      onAdSkipped(reason) {
        // OPTIONAL GUIDE: Need nothing to do for interstitial ad
        console.log('Ad skipped - reason: ', reason);
      },
    };

    flowerAdViewRef.current.adsManager.addListener(adsManagerListenerRef.current);

    // TODO GUIDE: Request interstitial ad
    // arg0: adTagUrl, url from flower system
    //       You must file a request to Anypoint Media to receive a adTagUrl.
    // arg1: extraParams, values you can provide for targeting
    // arg2: adTagHeaders, (Optional) values included in headers for ad request
    flowerAdViewRef.current.adsManager.requestAd(
      'https://ad_request',
      new Map(),
      new Map(),
    );
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', flexDirection: 'column', alignItems: 'center' }}>
      <button onClick={onClose}>Back</button>
      <div style={{ position: 'relative', display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <div>Original Content</div>
        {/* TODO GUIDE: Add FlowerAdView over content */}
        <div ref={adContainerRef} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, display: 'none', zIndex: 9999 }}></div>
      </div>
    </div>
  );
}

export default InterstitialAd;
