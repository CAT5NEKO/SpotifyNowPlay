window.onSpotifyWebPlaybackSDKReady = () => {
    const clientId = 'hoge';
    const clientSecret = 'fuga';
    const authHeader = 'Basic ' + btoa(clientId + ':' + clientSecret);
    const redirectUri = 'http://localhost:8000/callback.html';
    const scopes = ['user-read-currently-playing', 'streaming'];
    
    const player = new Spotify.Player({
      name: 'Web Playback SDK Quick Start Player',
      getOAuthToken: cb => {
        fetch('https://accounts.spotify.com/api/token', {
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': authHeader
          },
          body: 'grant_type=client_credentials'
        })
          .then(response => response.json())
          .then(data => {
            cb(data.access_token);
          })
          .catch(error => {
            console.error(error);
          });
      }
    });
  
    // Spotifyプレーヤーに接続し、再生状態の更新を監視する
    player.connect().then(success => {
      if (success) {
        console.log('The Web Playback SDK successfully connected to Spotify!');
        // 現在再生中の曲を取得する関数
        const getCurrentTrack = () => {
            return player.getCurrentState().then(state => {
              if (!state || !state.track_window || !state.track_window.current_track) {
                console.error('Unable to retrieve the current track');
                return;
              }
              const trackName = state.track_window.current_track.name;
              const artistName = state.track_window.current_track.artists[0].name;
              document.getElementById('track-name').textContent = trackName;
              document.getElementById('artist-name').textContent = artistName;
            });
          };          
        // 再生状態が変更されたら現在再生中の曲を更新する
        player.addListener('player_state_changed', async () => {
            await getCurrentTrack();
          });
        // 初回の現在再生中の曲の更新
        getCurrentTrack();
      }
    }).catch(error => {
      console.error(error);
    });
  };
  