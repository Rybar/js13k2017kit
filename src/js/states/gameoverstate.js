states.gameover = {

    onenter: function(event, from, to){

    },

    onexit: function(event, from, to){


    },

    step: function(dt) {

        if(Key.isDown(Key.r)){
          fsm.reset();
        }

    },

    render: function(dt) {

      E.gfx.fillRect(0,0,256,256, 0);

      E.gfx.fillRect(0,0,64,64,2);

      Txt.text({
              x: 128,
            y: 40 + Math.sin(E.t*2.5)*15,
              text: 'GAME\nOVER',
              hspacing: 8 + Math.cos(E.t*2.9)*4,
              vspacing: 15 + Math.sin(E.t*3.5)*5,
              halign: 'center',
              valign: 'top',
              scale: 10,
              snap: 1,
              render: 1,
              color: E.White,
          });


    },



};
