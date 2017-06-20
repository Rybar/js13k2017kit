states.game = {

    onenter: function() {
      // sound hacky stuff-----------
      E.sounds = {};

      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext;

      let soundGen = new sonantx.MusicGenerator(E.assets.song);
        soundGen.createAudioBuffer(function(buffer) {
        //E.sounds.loaded++;
        E.sounds.song = buffer;

        //test graphic for rotation
        E.renderTarget = E.page5;
        E.gfx.checker(64,64,18);
        E.gfx.fillRect(0,0,3,3,E.White);
        E.gfx.fillRect(12,0,15,3,E.ElfGreen);
        E.gfx.fillRect(12,12,15,15,E.Red);
        E.gfx.fillRect(0,12,3,15,E.TahitiGold);
        E.gfx.fillRect(0,12+8,3,15+8,E.TahitiGold);

      });
      // --------end hacky sound stuff


        bulletPool = new Pool(100, Particle);

        bulletPool.init();



        // E.stars = [];
        // for(var i = 0; i < 300; i++){
        //   E.stars.push({
        //     x: Math.random()*256,
        //     y: Math.random()*256,
        //     speed: Math.random() * 6
        //   })
        // };
        //
        //
        // E.moveX = 0;
        // E.speedFactor = .6;

        // E.renderTarget = E.page2;
        // E.gfx.fillRect(0,0,256,256,1);
        // E.gfx.checker(16,16,2);

        E.songTrigger = false;

        E.player.init();

    },

    onexit: function(event, from, to){


    },

    step: function(dt) {
        //------rotate the spinny background orbs

        //still using these for player doodad rotation
        E.cos = Math.cos(dt);
        E.sin = Math.sin(dt);

        for(var i = 0; i < E.stars.length; i++){
          let star = E.stars[i];
          star.y += star.speed * E.speedFactor * (1 + (2 * E.util.norm(star.y, 0, 365) ) );
          if(star.y > 365){ //magic number; reaches corner of screen
            star.y = 0;
            star.x = Math.random()*256;
          }
        }

        E.player.update(dt);

        //----hacky sound test
        if(Key.isDown(Key.z)){
          E.songTrigger = true
        }
        if(E.songTrigger){
          E.songTrigger = false;
          E.playSound(E.sounds.song, 1, 1, 0);
        }
        //---end hacky sound test

        bulletPool.use();



    },

    render: function(dt) {

        E.renderTarget = 0x10000;

        E.gfx.fillRect(0,0,256,256,0);

        for(let i = 0; i < E.stars.length; i++){
          let degrees = (360/256) * E.stars[i].x * 0.0174533;
          let radius = (E.stars[i].y / 2);
          let starDrawPoint = E.util.polarToPoint(degrees, radius);
          E.gfx.pset(starDrawPoint.x+128, starDrawPoint.y+128, 16);
        }
        E.gfx.fillCircle(128,128,10,0);

        E.player.draw();

        var bp = bulletPool.getPool();
        for(let i = 0; i < bp.length; i++){
          if(!bp[i].dead){

            bulletScreenPoint = E.util.toPolarScreen({
              x: bp[i].x,
              y: bp[i].y
            });
            let distFromCenter = E.util.dist(bulletScreenPoint.x+128, bulletScreenPoint.y+128, 128, 128)
            let sizeFactor = E.util.norm(distFromCenter, 0, 128);
            E.gfx.fillCircle(bulletScreenPoint.x+128, bulletScreenPoint.y+128, 4 * sizeFactor, 21);

          }
        }

        //E.gfx.circle(128,128, 127,E.WHITE)4

        //dither-trails effect
        E.renderTarget = E.page3;
        var i = 3000;
        while(i--){
            var x = (Math.random()*256)|0;
            var y = (Math.random()*256)|0;
            var color = E.ram[E.page1 + (y*256+x)];  //get the color at a random location on screen
            E.gfx.pset(x, y, color-1); //draw a 1px diameter circle, less 1 from its color index (towards black);
        }
        //end dither-trails effect

        E.renderTarget = E.page2;
        //page screen clear
        //E.gfx.fillRect(0,0,256,256,0);
        E.gfx.clear(0);
        Txt.text({
                x: 8,
                y: 240,
                text: "X: "+E.player.x.toString().substring(0,7) +
                      "\nY: "+E.player.y.toString().substring(0,7),
                hspacing: 2,
                vspacing: 2,
                halign: 'left',
                valign: 'top',
                scale: 1,
                snap: 1,
                render: 1,
                color: 21,
            });

            E.renderSource = E.page3;
            E.renderTarget = E.screen;
            //E.gfx.fillRect(0,0,256,256,1);
            E.gfx.clear(1);
            E.gfx.spr(0,0,256,256);

            E.renderSource = E.page1;
            E.renderTarget = E.screen;
            //E.gfx.fillRect(0,0,256,256,1);
            E.gfx.spr(0,0,256,256);

            E.renderSource = E.page2;
            E.renderTarget = E.screen;
            E.gfx.spr(0,0,256,256);




            //render test graphic to screen without rotation
            //E.renderSource = E.page5;
            //E.renderTarget = E.screen;
            //E.gfx.spr(0,0,16,16, 200,200);

            //render rotated
            E.renderSource = E.page5;
            E.renderTarget = E.screen;
            //E.gfx.rspr(0,0,16,16, 128,128, 6+ (Math.cos(E.t)*5), E.t*80);

    },



};
