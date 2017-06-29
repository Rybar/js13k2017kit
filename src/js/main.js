
init = function(){

  last = 0;
  dt = 0;
  now = 0;
  t = 0;
  moveX = 0;
  speedFactor = .6;
  songTrigger = false;
  state = 'menu';


  bulletPool = new Pool(100, Particle);

  sounds = {};

  //stats = new Stats();
  //document.body.appendChild( stats.dom );

  //canvasInit();

  starColors=[15,16,17,18,19,20,21];

  bulletPool.init();

  player.init();

  soundInit();

  eventInit();

  //init vid capture
  //capturer = new CCapture( {format: 'gif', workersPath: ''});
  //capturer.start();

  //start the game loop
  loop();

},

stopCapture = (e) => {
  //capturer.stop();
  //capturer.save();
}

loop = () => {
//  stats.begin();

  //game timer
  let now = new Date().getTime();
  dt = Math.min(1, (now - last) / 1000);
  t += dt;

  //draw current state to buffer
  states[state].render();

  //update
  states[state].step(dt);
  last = now;

  //draw buffer to screen
  render();

  //GIF capture
  //capturer.capture(C);

  //stats.end();
  requestAnimationFrame(loop);
}

soundInit = () => {

  sounds = {};
  if(audioCtx){audioCtx.close()};
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  if(!audioCtx) audioCtx = new AudioContext;

  let soundGen = new sonantx.MusicGenerator(assets.song);
  soundGen.createAudioBuffer(function(buffer) {
    sounds.song = buffer;
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
    C.width = window.innerWidth;
    C.height = window.innerHeight;
  } );
}
