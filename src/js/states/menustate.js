states.menu = {

    step: function(dt) {

        //game update
        if(Key.isDown(Key.p)){
          state = 'game';
        }

    },

    render: function(dt) {

      renderTarget = 0x0;

      clear(0);

      let s = 256;
      let i = t/3;
      for(let y = -128; y < 128; y += 1 ){
        for(let x = -256; x < 256; x += 2 ){
          pset(s+x+256*Math.cos( (y/128+i)*4 )+y, s+y+128*Math.sin( (x/256+i)*4 )+x, x/8%32)
        }
      }

      text({
              x: 256,
            y: 40 + Math.sin(t*2.5)*15,
              text: 'PROTOGAME',
              hspacing: 8 + Math.cos(t*2.9)*4,
              vspacing: 15 + Math.sin(t*3.5)*5,
              halign: 'center',
              valign: 'top',
              scale: 9,
              snap: 1,
              render: 1,
              color: 21,
          });

      text({
              x: 256,
              y: 230,
              text: "PRESS P TO CONTINUE",
              hspacing: 2,
              vspacing: 2,
              halign: 'center',
              valign: 'top',
              scale: 1,
              snap: 1,
              render: 1,
              color: 21,
          });
        //draw stuff here.

    },



};
