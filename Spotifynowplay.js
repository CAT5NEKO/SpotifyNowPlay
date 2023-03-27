window.onSpotifyWebPlaybackSDKReady = () => {
    const clientId = 'hoge';
    const redirectUri = 'http://localhost:8000/callback.html';
    const clientSecret = 'fuga'; 
    const scopes = ['user-read-private', 'user-read-email', 'user-library-read', 'user-top-read', 'user-read-recently-played', 'user-read-playback-state', 'user-modify-playback-state'];
    let accessToken;

    // 認証用URLを作成
    const createAuthorizeURL = () => {
        const authEndpoint = 'https://accounts.spotify.com/authorize';
        const params = new URLSearchParams({
            client_id: clientId,
            response_type: 'code',
            redirect_uri: redirectUri,
            scope: scopes.join(' '),
        });
        return `${authEndpoint}?${params}`;
    };

    // 認証コードを取得
    const getAuthorizationCode = () => {
        return new Promise((resolve, reject) => {
            const popupWidth = 400;
            const popupHeight = 600;
            const left = screen.width / 2 - popupWidth / 2;
            const top = screen.height / 2 - popupHeight / 2;
            const authorizeURL = createAuthorizeURL();
            const windowFeatures = `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`;
            const popupWindow = window.open(authorizeURL, 'Spotify Auth', windowFeatures);
            window.spotifyCallback = (payload) => {
                if (payload.error) {
                    reject(payload.error);
                } else {
                    resolve(payload.code);
                }
                popupWindow.close();
            };
        });
    };

    // アクセストークンを取得
    const getAccessToken = (code) => {
        const tokenEndpoint = 'https://accounts.spotify.com/api/token';
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret,
        });
        return fetch(tokenEndpoint, {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
            .then((response) => response.json())
            .then((data) => {
                accessToken = data.access_token;
                return data.access_token;
            });
    };

    //プレーヤーに接続、再生状態の更新を監視
    const player = new Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: (cb) => {
            if (!accessToken) {
                getAuthorizationCode()
                    .then(getAccessToken)
                    .then(cb)
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                cb(accessToken);
            }
        },
    });

    // 再生状態が変更された場合に現在再生中の曲を更新する
    const updateCurrentTrack = async () => {
        const state = await player.getCurrentState();
        if (!state || !state.track_window || !state.track_window.current_track) {
            console.error('Unable to retrieve the current track');
        }
    };

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
    
    // 初回に1回だけSpotify Web Playback SDKを読み込む
    if (!window.Spotify || !window.Spotify.Player) {
    const scriptTag = document.createElement('script');
    scriptTag.src = 'https://sdk.scdn.co/spotify-player.js';
    document.body.appendChild(scriptTag);
    } else {
    window.onSpotifyWebPlaybackSDKReady();
    }
