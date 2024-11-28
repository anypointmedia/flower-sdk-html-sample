import { useEffect, useState } from 'react';
import Playback from './Playback';
import { videoList } from './video';

function App() {
  const [ showLinearTv, setShowLinearTv ] = useState(false);
  const [ selectedVideo, setSelectedVideo ] = useState(null);

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
      {showLinearTv && (
        <Playback
          video={selectedVideo}
          onClose={(video) => {
            setShowLinearTv(false);

            if (video) {
              setTimeout(() => {
                setSelectedVideo(video);
                setShowLinearTv(true);
              });
            }
          }}
        />
      )}
      {!showLinearTv &&
        videoList.concat(null).map((video, index) => {
          return (
            <button
              key={index}
              onClick={() => {
                setSelectedVideo(video);
                setShowLinearTv(true);
              }}
            >Play {video?.title ?? 'Custom Channel'}</button>
          );
        })
      }
    </div>
  );
}

export default App;
