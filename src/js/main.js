
init = function(){

  last = 0;
  dt = 0;
  now = 0;
  t = 0;
  moveX = 0;
  speedFactor = .6;
  songTrigger = false;
  state = 'menu';
  demostate = 0;
  audioCtx = new AudioContext;

  console.log( getCharacter('A') );

  //console.log( assets.font.string.length );
  //console.log( flattenArray() );




  bulletPool = new Pool(100, Particle);

  sounds = {};

  stats = new Stats();
  document.body.appendChild( stats.dom );

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
  stats.begin();

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

  stats.end();
  requestAnimationFrame(loop);
}

soundInit = () => {

  sounds = {};
  //if(audioCtx){audioCtx.close()};
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  if(!audioCtx) audioCtx = new AudioContext;


  let soundGen = new sonantx.SoundGenerator(assets.laser);
  soundGen.createAudioBuffer(147, function(buffer) {
    sounds.laser = buffer;
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
}
