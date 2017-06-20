
var E = ENGINE;

init = function(){

  E.last = 0;
  E.dt = 0;
  E.now = 0;
  E.t = 0;


  stats = new Stats();
  document.body.appendChild( stats.dom );

  E.canvasInit();
  //E.game.create();

  fsm = StateMachine.create({

    initial: "init",

    events: [
      {name: 'load', from: 'init', to: 'boot'},
      {name: 'ready', from: 'boot', to: 'game'},
      {name: 'play', from: ['menu', 'gameover'], to: 'game'},
      {name: 'lose', from: ['game', 'gameover'], to: 'gameover'},
      {name: 'reset', from: ['init', 'boot', 'menu', 'gameover', 'game'], to: 'boot'},
    ],

    callbacks: {
      onenterboot: function (event, from, to) {
        states.boot.onenter(event, from, to)
      },
      onentermenu: function (event, from, to) {
        states.menu.onenter(event, from, to)
      },
      onleavemenu: function (event, from, to) {
        states.menu.onexit(event, from, to)
      },
      onentergame: function (event, from, to) {
        states.game.onenter(event, from, to)
      },
      onleavegame: function (event, from, to) {
        states.game.onexit(event, from, to)
      },
      onentergameover: function (event, from, to) {
        states.gameover.onenter(event, from, to)
      }
    }
  });

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
  window.addEventListener('resize', function(){
    E.canvas.width = window.innerWidth;
    E.canvas.height = window.innerHeight;
  } );

  //init vid capture
  //E.capturer = new CCapture( {format: 'gif', workersPath: ''});
//  E.capturer.start();

  //state machine
  fsm.load();
  //console.log(fsm);

  //start the game loop
  loop();

},

stopCapture = function(e){
  E.capturer.stop();
  E.capturer.save();
}

loop = function(){
  stats.begin();

  //game timer
  let now = new Date().getTime();
  E.dt = Math.min(1, (now - E.last) / 1000);
  E.t += E.dt;

  states[fsm.current].render();

  //update
  states[fsm.current].step(E.dt);
  E.last = now;

  //draw to screen
  E.render();

  //GIF capture
  //E.capturer.capture(E.canvas);

  stats.end();
  requestAnimationFrame(loop);
}
