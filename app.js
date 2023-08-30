var client_id = '7f0a41bf59d44821b96ce7ec0d62eb8d'; // Your client id
var client_secret = '17308da0d4e147afb57e6c03db53cb60'; // Your secret
var redirect_uri = 'http://localhost:5500/index.html'; // Your redirect uri

var scope = "user-modify-playback-state user-read-playback-state";

var access_token;


var likedSongs = [];
likedSongs.push("0d28khcov6AiegSCpG5TuT");

var currentSong = "0d28khcov6AiegSCpG5TuT";

var danceability = 0.5;
var energy = 0.5;
var acousticness = 0.5;
var instrumentalness = 0.5;
var liveness = 0.5;
var loudness = 0.5;
var speechiness = 0.5;
var valence = 0.5;

var genres = [];


// Extract and handle the authorization code from the callback URL
function handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams.get('code');
    if (authorizationCode) {
        exchangeAuthorizationCodeForToken(authorizationCode);
    }
}

// Call the handleCallback function when the page loads
handleCallback();

function exchangeAuthorizationCodeForToken(authorizationCode) {
    const authOptions = {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(client_id + ':' + client_secret),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: redirect_uri,
      }),
    };
  
    fetch('https://accounts.spotify.com/api/token', authOptions)
      .then((response) => response.json())
      .then((json) => {
        const _access_token = json.access_token;
        access_token = _access_token;
      })
      .catch((error) => console.error('Error exchanging code for token:', error));
  }


function Login() {
    const auth = new URLSearchParams({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: "http://localhost:5500/index.html",
     
    });

    window.location.href = 'https://accounts.spotify.com/authorize?' + auth.toString();
}

async function NextSong() {

  await GetCoolSong();

    const requestOptions = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      };
    
      fetch('https://api.spotify.com/v1/me/player/next', requestOptions);

    
}

async function GetCoolSong(){

  var range = document.getElementById('range').value * 0.01;
  var selection = document.getElementById('selection').value;

  //var initSongs = likedSongs.join(',');
  var initSongs = currentSong;

  var foundId = null;


  console.log(document.getElementById('genre').value);

  const requestOptions = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  };

   // Customize the query parameters according to your preferences
   const queryParams = new URLSearchParams({
    limit: selection,
    seed_genres: document.getElementById('genre').value,
    seed_tracks: initSongs,

    min_danceability: danceability - range,
    max_danceability: danceability + range,

    min_energy: energy - range,
    max_energy: energy + range,

    target_acousticness: acousticness,

    target_instrumentalness: instrumentalness,

    target_liveness: liveness,

    target_loudness: loudness,

    target_speechiness: speechiness,

    target_valence: valence,

    target_popularity: document.getElementById('popularity').value,

    /*
        min_acousticness: acousticness - range,
    max_acousticness: acousticness + range,

    min_instrumentalness: instrumentalness - range,
    max_instrumentalness: instrumentalness + range,

    min_liveness: liveness - range,
    max_liveness: liveness + range,

    min_loudness: loudness - range,
    max_loudness: loudness + range,

    min_speechiness: speechiness - range,
    max_speechiness: speechiness + range,

    min_valence: valence - range,
    max_valence: valence + range,
     */

  });

  const url = `https://api.spotify.com/v1/recommendations?${queryParams.toString()}`;


  await fetch(url, requestOptions)
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((data) => {
    if(data.tracks < 1) {
      console.error('no song found in range');
    }



    foundId = data.tracks[Math.floor(Math.random() * selection)].id;
     
  })
  .catch((error) => {
    console.error('Error getting recommendations:', error);
  });


  Play(foundId);
  currentSong = foundId;
  console.log(await GetInfoFromSong(foundId));
}







async function Play(spotifyId){

  if(await isPlayerActive(access_token)){
    // Que
    const requestOptions = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };
  
    const url = `https://api.spotify.com/v1/me/player/queue?uri=spotify:track:${spotifyId.toString()}`;
  
    fetch(url, requestOptions);
  } else {
  // Play

    const requestOptions = {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: 
        ["spotify:track:" + spotifyId.toString()]
      }),
    };
  
    fetch('https://api.spotify.com/v1/me/player/play', requestOptions);
  }
 
/*
  const requestOptions = {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uris: 
      ["spotify:track:" + spotifyId.toString()]
    }),
  };

  fetch('https://api.spotify.com/v1/me/player/play', requestOptions);
*/

}







async function Like(){
  
  var data = await GetInfoFromSong(currentSong);
  console.log(data);

  danceability = UpdateParameter(danceability, data.danceability);
  energy = UpdateParameter(energy, data.energy);
  acousticness  = UpdateParameter(acousticness, data.acousticness);
  instrumentalness  = UpdateParameter(instrumentalness, data.instrumentalness);
  liveness  = UpdateParameter(liveness, data.liveness);
  loudness  = UpdateParameter(loudness, data.loudness);
  speechiness  = UpdateParameter(speechiness, data.speechiness);
  valence  = UpdateParameter(valence , data.valence);

  document.getElementById('range').value = (document.getElementById('range').value * 0.9).toString();
  
  console.log(danceability + " " + energy);

  //var yes = await GetAlbum(currentSong);

  //var _genres = await album.album.genres;

  //console.log(yes.album);

}



async function GetAlbum(songId){

  var _json;
  const requestOptions = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`,
    }
  };

  await fetch(`https://api.spotify.com/v1/tracks/${songId}`, requestOptions)
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((data) => {
    _json = data;


  })
  .catch((error) => {
    console.error('Error getting recommendations:', error);
  });

  return _json;

}

async function GetInfoFromSong(spotifyId){

  var _data;
  
    const requestOptions = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };
  
    const url = `https://api.spotify.com/v1/audio-features/${spotifyId}`;
  
  
    await fetch(url, requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      _data = data;
    })
    .catch((error) => {
      console.error('Error getting recommendations:', error);
    });
  
    return _data;
  
}

/*
function GetAccessToken() {

    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');
    formData.append('client_id', client_id);
    formData.append('client_secret', client_secret);

    fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: formData
    })
        .then((response) => response.json())
        .then((json) => {
            console.log(json);
            access_token = json.access_token;
        })
        .catch((error) => console.error('Error:', error));

}
GetAccessToken();*/

async function isPlayerActive(access_token) {
  const requestOptions = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  };

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player', requestOptions);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    if (data.is_playing) {
      console.log('Player is active.');
      return true;
    } else {
      console.log('Player is not active.');
      return false;
    }
  } catch (error) {
    console.error('Error checking player status:', error);
    return false;
  }
}
function UpdateParameter(currentParams, newParams){
  return (currentParams + newParams) / 2;
}