states.menu = {

    step: function(dt) {

        //game update
        if(Key.isDown(Key.p)){
          state = 'game';
        }

    },

    render: function(dt) {

      fr(0,0,256,256, 0);

      fr(0,0,64,64,2);

      Txt.text({
              x: 128,
            y: 40 + Math.sin(t*2.5)*15,
              text: 'MENU',
              hspacing: 8 + Math.cos(t*2.9)*4,
              vspacing: 15 + Math.sin(t*3.5)*5,
              halign: 'center',
              valign: 'top',
              scale: 10,
              snap: 1,
              render: 1,
              color: 21,
          });

        //draw stuff here.

    },



};
