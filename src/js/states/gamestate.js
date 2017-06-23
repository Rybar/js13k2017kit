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

      });
      // --------end hacky sound stuff

        bulletPool = new Pool(100, Particle);

        bulletPool.init();

        E.songTrigger = false;

        E.player.init();

    },

    onexit: function(event, from, to){


    },

    step: function(dt) {

        E.cos = Math.cos(dt);
        E.sin = Math.sin(dt);

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

        E.renderTarget = 0x00000;

        E.gfx.clear(1);

        E.gfx.checker(256, 256, 16,16,2);

        for(var i = 0; i < 32; i++){
          Txt.text({
            x: 3 + 16*i,
            y: 45 + 16*(i%4),
            text: i.toString(),
            scale: 1,
            snap: 1,
            hspacing: 2,
            vspacing: 2,
            halign: 'left',
            valign: 'bottom',
            render: 1,
            color: i,
          })
        }

        E.player.draw();

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

    },



};
