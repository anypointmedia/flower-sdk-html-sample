import { useEffect, useRef, useState } from 'react';
import { videoList } from './video';
import './Playback.css';

function Playback({ video, onClose }) {
  // Your Bitmovin API key
  const BITMOVIN_API_KEY = '';
  const nextVideo = videoList.filter((v) => v !== video)[0];

  const [ urlInput, setUrlInput ] = useState('http://sample.vodobox.net/skate_phantom_flex_4k/skate_phantom_flex_4k.m3u8');
  const [ durationInput, setDurationInput ] = useState(141040);

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const adContainerRef = useRef(null);
  const flowerAdViewRef = useRef(null);
  const adsManagerListenerRef = useRef(null);
  const isContentLoadRef = useRef(false);
  const isContentEndRef = useRef(false);

  useEffect(() => {
    if (!adContainerRef.current) return;

    flowerAdViewRef.current = new window.FlowerAdView(adContainerRef.current);

    if (video) {
      playVod();
    }

    return () => {
      releasePlayer();
    };
  }, [ video, adContainerRef ]);

  const playVod = () => {
    const videoUrl = video?.url ?? urlInput;
    const videoDuration = video?.duration ?? durationInput;

    // Creating the Bitmovin player instance
    playerRef.current = new window.bitmovin.player.Player(
      playerContainerRef.current,
      {
        key: BITMOVIN_API_KEY,
      },
    );

    isContentLoadRef.current = false;
    playerRef.current.on(window.bitmovin.player.PlayerEvent.Ready, () => isContentLoadRef.current = true);
    playerRef.current.on(window.bitmovin.player.PlayerEvent.PlaybackFinished, () => {
      isContentEndRef.current = true;
      // TODO GUIDE: Notify the end of VOD content
      flowerAdViewRef.current.adsManager.notifyContentEnded();
    });

    // TODO GUIDE: Implement FlowerAdsManagerListener
    adsManagerListenerRef.current = {
      onPrepare(adDurationMs) {
        if (playerRef.current.isPlaying()) {
          // OPTIONAL GUIDE: Implement custom actions for when the ad playback is ready

          // TODO GUIDE: Play mid-roll ad
          flowerAdViewRef.current.adsManager.play();
        } else {
          // TODO GUIDE: Play pre-roll ad
          flowerAdViewRef.current.adsManager.play();
        }
      },
      onPlay() {
        // TODO GUIDE: Pause VOD content when the ad playback starts
        playerRef.current.pause();
      },
      onCompleted() {
        // TODO GUIDE: Resume VOD content when the ad playback ends
        if (isContentEndRef.current) {
          return;
        }

        if (isContentLoadRef.current) {
          playerRef.current.play();
        } else {
          playerRef.current.on(window.bitmovin.player.PlayerEvent.Ready, () => playerRef.current.play());
        }
      },
      onError(error) {
        console.error('Error from Flower SDK: ', error);
        // TODO GUIDE: Resume VOD content on ad error
        if (isContentEndRef.current) {
          return;
        }

        playerRef.current.play();
      },
      onAdSkipped(reason) {
        // OPTIONAL GUIDE: Need nothing to do for VOD
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

    // TODO GUIDE: Request VOD ad
    // arg0: adTagUrl, url from flower system.
    //       You must file a request to Anypoint Media to receive a adTagUrl.
    // arg1: contentId, unique content id in your service
    // arg2: durationMs, duration of VOD content in milliseconds
    // arg3: extraParams, values you can provide for targeting
    // arg4: mediaPlayerHook, interface that provides currently playing segment information for ad tracking
    // arg5: adTagHeaders, (Optional) values included in headers for ad request
    flowerAdViewRef.current.adsManager.requestVodAd(
      'https://ad_request',
      '-255',
      videoDuration,
      new Map(),
      mediaPlayerHook,
      new Map(),
    );

    // Loading the stream with the Bitmovin player
    playerRef.current.load({ hls: videoUrl });
  };

  const releasePlayer = () => {
    flowerAdViewRef.current.adsManager.removeListener(adsManagerListenerRef.current);
    flowerAdViewRef.current.adsManager.stop();
    return playerRef.current?.destroy();
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', flexDirection: 'column', alignItems: 'center' }}>
      <button onClick={() => onClose(null)}>Back</button>
      {!video && (
        <div>
          <input type="text" placeholder="Enter video URL" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
          <input type="number" placeholder="Enter video duration in milliseconds" value={durationInput} onChange={(e) => setDurationInput(e.target.value)} />
          <button onClick={playVod}>Play</button>
        </div>
      )}
      <div ref={playerContainerRef} className={'player-container'} style={{ position: 'relative', width: '1024px', height: '720px' }}>
        {/* TODO GUIDE: Add FlowerAdView over VOD content */}
        <div ref={adContainerRef} className={'ad-container'}></div>
      </div>
      <button onClick={() => onClose(nextVideo)}>Switch to {nextVideo.title}</button>
    </div>
  );
}

export default Playback;
