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

    renderTarget = 0x0;
    //background dot waves
    clear(1);
    let s = 256;
    let i = t/3;
    for(let y = -128; y < 128; y += 1 ){
      for(let x = -256; x < 256; x += 2 ){
        pset(s+x+256*Math.cos( (y/128+i)*4 )+y, s+y+128*Math.sin( (x/256+i)*4 )+x, x/8%32)
      }
    }

    //foreground octopus thing
    renderTarget = 0x40000; //rendering to different area, for collision checks and composite effects.
    clear(0);
    for(var a = 0; a < 2 * Math.PI; a+= 0.7){
      for(var r = 20; r < 200; r += 9){
        let v = a + .4 * Math.sin(a*8-r/20+t*1.7);
        fillCircle((256+r*Math.cos(v)), 80+r*Math.sin(v), (10-r/12)|0, 10+(r/9%32)|0 );

      }
    }
    renderTarget = 0x0;
    renderSource = 0x40000;
    spr(0,0,512,256);
    player.draw();

    renderTarget = 0;
    text({
            x: 256,
            y: 20,
            text: "YOU CANT DEFEAT HIM, THIS IS JUST A PIXEL-PERFECT COLLISION\nAND MULTI-LAYER DRAWING DEMO\nARROW KEYS OR WASD AND SPACE TO SHOOT",
            hspacing: 2,
            vspacing: 2,
            halign: 'center',
            valign: 'top',
            scale: 1,
            snap: 1,
            render: 1,
            color: 21,
        });


  },

};

function drawExplode(x,y){
  fillCircle(x,y, 20, 21);
}
