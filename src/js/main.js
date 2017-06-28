
var E = ENGINE;

init = function(){

  E.last = 0;
  E.dt = 0;
  E.now = 0;
  E.t = 0;
  E.moveX = 0;
  E.speedFactor = .6;
  E.songTrigger = false;
  E.state = 'menu';


  bulletPool = new Pool(100, Particle);

  E.sounds = {};

  //stats = new Stats();
  //document.body.appendChild( stats.dom );

  E.canvasInit();

  E.starColors=[15,16,17,18,19,20,21];

  bulletPool.init();

  E.player.init();

  soundInit();

  eventInit();

  //init vid capture
  //E.capturer = new CCapture( {format: 'gif', workersPath: ''});
  //E.capturer.start();

  //start the game loop
  loop();

},

stopCapture = (e) => {
  //E.capturer.stop();
  //E.capturer.save();
}

loop = () => {
//  stats.begin();

  //game timer
  let now = new Date().getTime();
  E.dt = Math.min(1, (now - E.last) / 1000);
  E.t += E.dt;

  //draw current state to buffer
  states[E.state].render();

  //update
  states[E.state].step(E.dt);
  E.last = now;

  //draw buffer to screen
  E.render();

  //GIF capture
  //E.capturer.capture(E.C);

  //stats.end();
  requestAnimationFrame(loop);
}

soundInit = () => {

  E.sounds = {};
  if(audioCtx){audioCtx.close()};
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  if(!audioCtx) audioCtx = new AudioContext;

  let soundGen = new sonantx.MusicGenerator(E.assets.song);
  soundGen.createAudioBuffer(function(buffer) {
    E.sounds.song = buffer;
  });

}

eventInit = () => {
  //initialize keypress event listeners
  window.addEventListener('keyup', function (event) {
    Key.onKeyup(event);
  }, false);
  window.addEventListener('mousedown', function (event){
    stopCapture(event);
  }, false);
  window.addEventListener('keydown', function (event) {
    Key.onKeydown(event);
  }, false);
  window.addEventListener('blur', function (event) {
    paused = true;
  }, false);
  window.addEventListener('focus', function (event) {
    paused = false;
  }, false);
  window.addEventListener('resize', function(event){
    E.C.width = window.innerWidth;
    E.C.height = window.innerHeight;
  } );
}
