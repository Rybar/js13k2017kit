states.game = {


  step(dt) {

    player.update(dt);

    //----hacky sound test
    if(Key.justReleased(Key.SPACE)){
      songTrigger = true
    }
    if(songTrigger){
      playSound(sounds.laser, 1, 1, 0);
      songTrigger = false;
    }
    //---end hacky sound test

    bulletPool.use();

    Key.update();
  },

  render(dt) {

    renderTarget = 0x00000;
    clear(1);

    player.draw();

  },

};
