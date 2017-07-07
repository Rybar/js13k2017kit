states.gameover = {

    step: function(dt) {

        if(Key.isDown(Key.r)){
          state = 'menu';
        }

    },

    render: function(dt) {
      renderTarget = 0x0;
      clear(0);

      //fr(0,0,64,64,2);

      text({
              x: 256,
              y: 80 + Math.sin(t*2.5)*15,
              text: 'GAME OVER',
              hspacing: 8 + Math.cos(t*2.9)*4,
              vspacing: 15 + Math.sin(t*3.5)*5,
              halign: 'center',
              valign: 'top',
              scale: 9,
              snap: 1,
              render: 1,
              color: 27,
          });


    },



};
