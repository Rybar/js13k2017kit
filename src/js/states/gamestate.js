states.game = {


  step(dt) {

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

    renderTarget = 0;

    fr(0,0,16,16,17);
    rect(400,16,16,16);
    fillCircle(32,32,8,21);
    circle(64,32,8,21);
    line(128,32,192,64,21);
    triangle(0,0,16,16,32,32);
    fillTriangle(32,0,64,64,128,128,21);
    spr(0,0,16,16);
    sspr(0,0,16,16,0,0,16,16);
    text({
            x: 256,
            y: 20,
            text: "512X256 DISPLAY  DB32 PALETTE",
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
