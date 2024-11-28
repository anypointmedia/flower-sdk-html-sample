import { useEffect, useRef, useState } from 'react';
import { videoList } from './video';

function Playback({ video, onClose }) {
  // Your Bitmovin API key
  const BITMOVIN_API_KEY = '';
  const nextVideo = videoList.filter((v) => v !== video)[0];

  const [ urlInput, setUrlInput ] = useState('https://xxx');

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const adContainerRef = useRef(null);
  const flowerAdViewRef = useRef(null);
  const adsManagerListenerRef = useRef(null);

  useEffect(() => {
    if (!adContainerRef.current) return;

    flowerAdViewRef.current = new window.FlowerAdView(adContainerRef.current);

    if (video) {
      playLinearTv();
    }

    return () => {
      // TODO GUIDE: Stop Flower SDK and release player resources on view destroy
      flowerAdViewRef.current.adsManager.removeListener(adsManagerListenerRef.current);
      flowerAdViewRef.current.adsManager.stop();
      return playerRef.current.destroy();
    };
  }, [ adContainerRef ]);

  const playLinearTv = () => {
    const videoUrl = video?.url ?? urlInput;

    // Creating the Bitmovin player instance
    playerRef.current = new window.bitmovin.player.Player(
      playerContainerRef.current,
      {
        key: BITMOVIN_API_KEY,
      },
    );

    // TODO GUIDE: Implement FlowerAdsManagerListener
    adsManagerListenerRef.current = {
      onPrepare(adDurationMs) {
        // OPTIONAL GUIDE: Need nothing to do for linear TV
      },
      onPlay() {
        // OPTIONAL GUIDE: Implement custom actions for when the ad playback starts
      },
      onCompleted() {
        // OPTIONAL GUIDE: Implement custom actions for when the ad playback ends
      },
      onError(error) {
        console.error('Error from Flower SDK: ', error);
        // TODO GUIDE: Stop Flower SDK and release linear TV player resources on ad error
        flowerAdViewRef.current.adsManager.removeListener(adsManagerListenerRef.current);
        flowerAdViewRef.current.adsManager.stop();
        playerRef.current.destroy()
          .then(() => {
            // TODO GUIDE: Restart linear TV playback on ad error
            playLinearTv();
          });
      },
      onAdSkipped(reason) {
        // OPTIONAL GUIDE: Need nothing to do for linear TV
        console.log('Ad skipped - reason: ', reason);
      },
    };

    flowerAdViewRef.current.adsManager.addListener(adsManagerListenerRef.current);

    // TODO GUIDE: Implement MediaPlayerHook to return the player instance if the player is supported by Flower SDK
    const mediaPlayerHook = {
      getPlayer() {
        return playerRef.current;
      },
    };

    // TODO GUIDE: Change original linear TV stream url
    // arg0: videoUrl, original linear TV stream url
    // arg1: adTagUrl, url from flower system
    //       You must file a request to Anypoint Media to receive a adTagUrl.
    // arg2: channelId, unique channel id in your service
    // arg3: extraParams, values you can provide for targeting
    // arg4: mediaPlayerHook, interface that provides currently playing segment information for ad tracking
    // arg5: adTagHeaders, (Optional) values included in headers for ad request
    // arg6: channelStreamHeaders, (Optional) values included in headers for channel stream request
    const changedChannelUrl = flowerAdViewRef.current.adsManager.changeChannelUrl(
      videoUrl,
      'https://ad_request',
      '1',
      new Map(),
      mediaPlayerHook,
      new Map(),
      new Map(),
    );

    // Loading the stream with the Bitmovin player
    playerRef.current.on(window.bitmovin.player.PlayerEvent.SourceLoaded, () => playerRef.current.play());
    playerRef.current.load({ hls: changedChannelUrl });
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', flexDirection: 'column', alignItems: 'center' }}>
      <button onClick={() => onClose(null)}>Back</button>
      {!video && (
        <div>
          <input type="text" placeholder="Enter video URL" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
          <button onClick={playLinearTv}>Play</button>
        </div>
      )}
      <div ref={playerContainerRef} style={{ position: 'relative' }}>
        <video></video>
        {/* TODO GUIDE: Add FlowerAdView over linear TV content */}
        <div ref={adContainerRef} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, display: 'none', zIndex: 9999 }}></div>
      </div>
      <button onClick={() => onClose(nextVideo)}>Switch to {nextVideo.title}</button>
    </div>
  );
}

export default Playback;
