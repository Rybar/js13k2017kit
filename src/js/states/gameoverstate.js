states.gameover = {

    step: function(dt) {

        if(Key.isDown(Key.r)){
          state = 'menu';
        }

    },

    render: function(dt) {

      fr(0,0,256,256, 0);

      fr(0,0,64,64,2);

      text({
              x: 128,
            y: 40 + Math.sin(t*2.5)*15,
              text: 'GAME\nOVER',
              hspacing: 8 + Math.cos(t*2.9)*4,
              vspacing: 15 + Math.sin(t*3.5)*5,
              halign: 'center',
              valign: 'top',
              scale: 10,
              snap: 1,
              render: 1,
              color: 21,
          });


    },



};
