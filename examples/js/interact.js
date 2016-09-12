(function() {
  ////////*setting for 3js*/////////////
  var SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = window.innerHeight,

  mouseX = 0, mouseY = 0,

  windowHalfX = 992,
  windowHalfY = 523,

  SEPARATION = 200,
  AMOUNTX = 10,
  AMOUNTY = 10,

  camera, scene, renderer;

  ////////*setting for api audio*/////////////
  var AudioContext;
  var audio;
  var audioContext;
  var source;
  var analyser;

  var canvas = document.getElementById("theCanvas");
  var canvasContext = canvas.getContext("2d");    
  var dataArray;
  var analyserMethod = "getByteTimeDomainData";
  var slider = document.getElementById("slider");
  var streamUrl;
  var isIdle = true;

  var canvasWidth = canvas.width;
  var canvasHeight = canvas.height;

  function initAudio(streamUrl) {
    AudioContext = window.AudioContext || window.webkitAudioContext;
    audio = new Audio();
    audio.crossOrigin = "anonymous";
    audioContext = new AudioContext();
    source = audioContext.createMediaElementSource(audio);
    source.connect(audioContext.destination);
    analyser = audioContext.createAnalyser();            
    source.connect(analyser);
  };

  function get(url, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() { 
      if (request.readyState === 4 && request.status === 200) {
        callback(request.responseText);
      }
    }

    request.open("GET", url, true);            
    request.send(null);
  }

  var clientParameter = "client_id=3b2585ef4a5eff04935abe84aad5f3f3"

  // Basing everything on the track's permalink URL. That is what the user knows.
  // Makes it possible to use the text box for pasting any track URL.
  // The Outsider is a friend of mine. 
  // The majority of his tracks are on Mixcloud:
  // https://www.mixcloud.com/outsider_music/
  var trackPermalinkUrl = "https://soundcloud.com/the-outsider/the-outsider-death-by-melody";

  function findTrack() {
    get("http://api.soundcloud.com/resolve.json?url=" +  trackPermalinkUrl + "&" + clientParameter,
        function (response) {
      var trackInfo = JSON.parse(response);
      slider.max = trackInfo.duration / 1000;
      document.getElementById("totalTime").innerHTML = millisecondsToHuman(trackInfo.duration);
      document.getElementById("artistUrl").href = trackInfo.user.permalink_url;
      document.getElementById("artistAvatar").src = trackInfo.user.avatar_url;
      document.getElementById("artistName").innerHTML = trackInfo.user.username;
      document.getElementById("trackUrl").href = trackInfo.permalink_url;
      if(trackInfo.artwork_url) {
        document.getElementById("trackArt").src = trackInfo.artwork_url;
      } else {
        document.getElementById("trackArt").src = "";
      }
      document.getElementById("trackName").innerHTML = trackInfo.title;
      streamUrl = trackInfo.stream_url + "?" + clientParameter;
    }
       );
  };

  function startDrawing() {

    ////////3js setting///////
        var container, separation = 100, amountX = 50, amountY = 50,
        particles, particle;

        container = document.createElement('div');
        document.body.appendChild(container);
///problems here///////
        camera = new THREE.PerspectiveCamera( 75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
        camera.position.z = 1000;
        scene = new THREE.Scene();

        renderer = new THREE.CanvasRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
        container.appendChild( renderer.domElement );

        // particles

        var PI2 = Math.PI * 2;
        var material = new THREE.SpriteCanvasMaterial( {

          color: 0xffffff,
          program: function ( context ) {

            context.beginPath();
            context.arc( 0, 0, 0.5, 0, PI2, true );
            context.fill();
          }
        } );
        for ( var i = 0; i < 1000; i ++ ) {

          particle = new THREE.Sprite( material );
          particle.position.x = Math.random() * 2 - 1;
          particle.position.y = Math.random() * 2 - 1;
          particle.position.z = Math.random() * 2 - 1;
          particle.position.normalize();
          particle.position.multiplyScalar( Math.random() * 10 + 450 );
          particle.scale.multiplyScalar( 2 );
          scene.add( particle );

        }

        // lines

        for (var i = 0; i < 1000; i++) {

          var geometry = new THREE.Geometry();

          var vertex = new THREE.Vector3( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
          vertex.normalize();
          vertex.multiplyScalar( 450 );

          geometry.vertices.push( vertex );

          var vertex2 = vertex.clone();
          vertex2.multiplyScalar( Math.random() * 0.3 + 1 );

          geometry.vertices.push( vertex2 );

          var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0xffffff, opacity: Math.random() } ) );
          scene.add( line );
        }
        window.addEventListener( 'resize', onWindowResize, false );


  ////////fft setting///////////
    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    dataArray = new Uint8Array(bufferLength);
    canvasContext.lineWidth = 1;
    canvasContext.strokeStyle = 'rgba(0, 0, 0, 1)';

    function drawAgain() {
      canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
      requestAnimationFrame(drawAgain);

      analyser[analyserMethod](dataArray);

      for(var i = 0; i < bufferLength; i++){
        canvasContext.beginPath();
        canvasContext.moveTo(i, 255);
        canvasContext.lineTo(i, 255 - dataArray[i]);
        canvasContext.closePath();
        canvasContext.stroke();
      }
    }
    drawAgain();
  }

  // function onWindowResize() {

  //       windowHalfX = window.innerWidth / 2;
  //       windowHalfY = window.innerHeight / 2;

  //       camera.aspect = window.innerWidth / window.innerHeight;
  //       camera.updateProjectionMatrix();

  //       renderer.setSize( window.innerWidth, window.innerHeight );

  //     }
  // function animate() {

  //   requestAnimationFrame( animate );

  //   render();

  // }

  // function render() {

  //   camera.position.x += ( mouseX - camera.position.x ) * .05;
  //   camera.position.y += ( - mouseY + 200 - camera.position.y ) * .05;
  //   camera.lookAt( scene.position );

  //   renderer.render( scene, camera );

  // }
  ///////fft things///////////

  function startButton_Clicked() {
    audio.src = streamUrl;
    audio.play();
    slider.value = 0;
    // Using four seconds so the user can change the value of
    // the slider. Too short interval will cause the automatic
    // updating to steal the control from the user.
    setInterval(function () {
      slider.value = audio.currentTime; 
    }, 4000); 

    var currentTime = document.getElementById("currentTime");
    setInterval(function () {
      currentTime.innerHTML = millisecondsToHuman(audio.currentTime * 1000); 
    }, 1000);
  }

  function jumpTo(here) {
    if (!audio.readyState) return false;
    audio.currentTime = here;
    //}
    //audio.fastSeek(here);
  };

  slider.addEventListener("change", function () {
    jumpTo(this.value);
  });

  function millisecondsToHuman(milliseconds) {
    var date = new Date(null);
    date.setMilliseconds(milliseconds);
    return date.toISOString().substr(11, 8);
  };
  document.getElementById("playButton").addEventListener("click", startButton_Clicked);

  document.getElementById("oscilloscopeButton").addEventListener("click", function(){
    analyserMethod = "getByteTimeDomainData";
    startDrawing();
  });

  document.getElementById("frequencyBarsButton").addEventListener("click", function(){
    analyserMethod = "getByteFrequencyData";
    startDrawing();
  });

  document.getElementById("findButton").addEventListener("click", function(){
    trackPermalinkUrl = document.getElementById("trackUrlSearch").value;
    findTrack();
  });

  findTrack();
  initAudio();
  startDrawing();
  // init();
  // animate();

})();