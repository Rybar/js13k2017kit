states.boot = {


    onenter: function(event, from, to){
      E.sounds = {};
      if(audioCtx){audioCtx.close()};
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      if(!audioCtx) audioCtx = new AudioContext;

      let soundGen = new sonantx.MusicGenerator(E.assets.song);
        soundGen.createAudioBuffer(function(buffer) {
        //E.sounds.loaded++;
        E.sounds.song = buffer;

      });


      // --------end hacky sound stuff

        E.stars = [];
        for(var i = 0; i < 300; i++){
          E.stars.push({
            x: Math.random()*256,
            y: Math.random()*256,
            speed: Math.random() * 6
          })
        };

        E.t = 0;
        E.moveX = 0;
        E.speedFactor = .6;

        E.songTrigger = false;

    },

    onexit: function(event, from, to){


    },

    step: function(dt) {

        if(Key.isDown(Key.p)){
          if(fsm.current == 'boot'){
            fsm.ready();
          }
        }

    },

    render: function(dt) {

        E.gfx.fillRect(0,0,256,256, 0);

        E.gfx.fillRect(0,0,64,64,2);

        Txt.text({
                x: 128,
              y: 40 + Math.sin(E.t*2.5)*15,
                text: 'BOOT',
                hspacing: 8 + Math.cos(E.t*2.9)*4,
                vspacing: 15 + Math.sin(E.t*3.5)*5,
                halign: 'center',
                valign: 'top',
                scale: 10,
                snap: 1,
                render: 1,
                color: E.White,
            });

        //draw stuff here.

        //can't forget this call!
        //draws indexed color array to actual display canvas


    },



};
