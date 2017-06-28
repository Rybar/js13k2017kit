states.boot = {

    onenter (event, from, to){
      E.sounds = {};
      if(audioCtx){audioCtx.close()};
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      if(!audioCtx) audioCtx = new AudioContext;

      let soundGen = new sonantx.MusicGenerator(E.assets.song);
        soundGen.createAudioBuffer(function(buffer) {
        E.sounds.song = buffer;

      });


      // --------end hacky sound stuff

        E.t = 0;
        E.moveX = 0;
        E.speedFactor = .6;
        E.songTrigger = false;

    },

    onexit (event, from, to){


    },

    step (dt) {

        if(Key.isDown(Key.p)){
          if(E.state == 'boot'){
            E.state = 'game';
          }
        }

    },

    render (dt) {

        E.gfx.fr(0,0,256,256, 0);

        E.gfx.fr(0,0,64,64,2);

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
                color: 21,
            });

            Txt.text({
                    x: 8,
                    y: 240,
                    text: "PRESS P TO CONTINUE",
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
