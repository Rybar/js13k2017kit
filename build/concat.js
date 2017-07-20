(function(){

//--------------Engine.js-------------------

const WIDTH =     512;
const HEIGHT =    256;
const PAGES =     8;  //page = 1 screen HEIGHTxWIDTH worth of screenbuffer.
var
C =               document.getElementById('canvas');
ctx =             C.getContext('2d'),

renderTarget =    0x00000,
renderSource =    0x20000,

//Richard Fhager's DB32 Palette http://http://pixeljoint.com/forum/forum_posts.asp?TID=16247
//ofcourse you can change this to whatever you like, up to 256 colors.
//one GOTCHA: colors are stored 0xAABBGGRR, so you'll have to flop the values from your typical hex colors.

colors =          [0xff000000, 0xff342022, 0xff3c2845, 0xff313966, 0xff3b568f, 0xff2671df, 0xff66a0d9, 0xff9ac3ee,
                   0xff36f2fb, 0xff50e599, 0xff30be6a, 0xff6e9437, 0xff2f694b, 0xff244b52, 0xff393c32, 0xff743f3f,
                   0xff826030, 0xffe16e5b, 0xffff9b63, 0xffe4cd5f, 0xfffcdbcb, 0xffffffff, 0xffb7ad9b, 0xff877e84,
                   0xff6a6a69, 0xff525659, 0xff8a4276, 0xff3232ac, 0xff6357d9, 0xffba7bd7, 0xff4a978f, 0xff306f8a],

//default palette index
palDefault =      [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],

//active palette index. maps to indices in colors[]. can alter this whenever for palette effects.
pal =             [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];

ctx.imageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;

C.width = WIDTH;
C.height = HEIGHT;
var imageData =       ctx.getImageData(0, 0, WIDTH, HEIGHT),
buf =             new ArrayBuffer(imageData.data.length),
buf8 =            new Uint8Array(buf),
data =            new Uint32Array(buf),
ram =             new Uint8ClampedArray(WIDTH * HEIGHT * PAGES);

//--------------graphics functions----------------

  function clear(color){
    ram.fill(color, renderTarget, renderTarget + 0x20000);
  }

  function pset(x, y, color) { //an index from colors[], 0-31
    x = x|0; y = y|0; color = color|0;

    if (x > 0 && x < WIDTH && y > 0 && y < HEIGHT) {
      ram[renderTarget + (y * WIDTH + x)] = color;
    }
  }

  function line(x1, y1, x2, y2, color) {

    x1 = x1|0;
    x2 = x2|0;
    y1 = y1|0;
    y2 = y2|0;

    var dy = (y2 - y1);
    var dx = (x2 - x1);
    var stepx, stepy;

    if (dy < 0) {
      dy = -dy;
      stepy = -1;
    } else {
      stepy = 1;
    }
    if (dx < 0) {
      dx = -dx;
      stepx = -1;
    } else {
      stepx = 1;
    }
    dy <<= 1;        // dy is now 2*dy
    dx <<= 1;        // dx is now 2*dx

    pset(x1, y1, color);
    if (dx > dy) {
      var fraction = dy - (dx >> 1);  // same as 2*dy - dx
      while (x1 != x2) {
        if (fraction >= 0) {
          y1 += stepy;
          fraction -= dx;          // same as fraction -= 2*dx
        }
        x1 += stepx;
        fraction += dy;              // same as fraction -= 2*dy
        pset(x1, y1, color);
      }
      ;
    } else {
      fraction = dx - (dy >> 1);
      while (y1 != y2) {
        if (fraction >= 0) {
          x1 += stepx;
          fraction -= dy;
        }
        y1 += stepy;
        fraction += dx;
        pset(x1, y1, color);
      }
    }

  }

  function circle(xm, ym, r, color) {
    var x = -r, y = 0, err = 2 - 2 * r;
    /* II. Quadrant */
    do {
      pset(xm - x, ym + y, color);
      /*   I. Quadrant */
      pset(xm - y, ym - x, color);
      /*  II. Quadrant */
      pset(xm + x, ym - y, color);
      /* III. Quadrant */
      pset(xm + y, ym + x, color);
      /*  IV. Quadrant */
      r = err;
      if (r <= y) err += ++y * 2 + 1;
      /* e_xy+e_y < 0 */
      if (r > x || err > y) err += ++x * 2 + 1;
      /* e_xy+e_x > 0 or no 2nd y-step */

    } while (x < 0);
  }

  function fillCircle(xm, ym, r, color) {
    if(r < 0) return;
    xm = xm|0; ym = ym|0, r = r|0; color = color|0;
    var x = -r, y = 0, err = 2 - 2 * r;
    /* II. Quadrant */
    do {
      line(xm-x, ym-y, xm+x, ym-y, color);
      line(xm-x, ym+y, xm+x, ym+y, color);
      r = err;
      if (r <= y) err += ++y * 2 + 1;
      if (r > x || err > y) err += ++x * 2 + 1;
    } while (x < 0);
  }

  function rect(x, y, w, h, color) {
    x1 = x|0;
    y1 = y|0;
    x2 = (x+w)|0;
    y2 = (y+h)|0;


    line(x1,y1, x2, y1, color);
    line(x2, y1, x2, y2, color);
    line(x1, y2, x2, y2, color);
    line(x1, y1, x1, y2, color);
  }

  function fillRect(x, y, w, h, color) {
    x1 = x|0;
    y1 = y|0;
    x2 = (x+w)|0;
    y2 = (y+h)|0;

    var i = Math.abs(y2 - y1);
    line(x1, y1, x2, y1, color);

    if(i > 0){
      while (--i) {
        line(x1, y1+i, x2, y1+i, color);
      }
    }

    line(x1,y2, x2, y2, color);
  }

  function triangle(x1, y1, x2, y2, x3, y3, color) {
    line(x1,y1, x2,y2, color);
    line(x2,y2, x3,y3, color);
    line(x3,y3, x1,y1, color);
  }

  function fillTriangle( x1, y1, x2, y2, x3, y3, color ) {

    var canvasWidth = WIDTH;
    // http://devmaster.net/forums/topic/1145-advanced-rasterization/
    // 28.4 fixed-point coordinates
    var x1 = Math.round( 16 * x1 );
    var x2 = Math.round( 16 * x2 );
    var x3 = Math.round( 16 * x3 );
    var y1 = Math.round( 16 * y1 );
    var y2 = Math.round( 16 * y2 );
    var y3 = Math.round( 16 * y3 );
    // Deltas
    var dx12 = x1 - x2, dy12 = y2 - y1;
    var dx23 = x2 - x3, dy23 = y3 - y2;
    var dx31 = x3 - x1, dy31 = y1 - y3;
    // Bounding rectangle
    var minx = Math.max( ( Math.min( x1, x2, x3 ) + 0xf ) >> 4, 0 );
    var maxx = Math.min( ( Math.max( x1, x2, x3 ) + 0xf ) >> 4, WIDTH );
    var miny = Math.max( ( Math.min( y1, y2, y3 ) + 0xf ) >> 4, 0 );
    var maxy = Math.min( ( Math.max( y1, y2, y3 ) + 0xf ) >> 4, HEIGHT );
    // Block size, standard 8x8 (must be power of two)
    var q = 8;
    // Start in corner of 8x8 block
    minx &= ~(q - 1);
    miny &= ~(q - 1);
    // Constant part of half-edge functions
    var c1 = -dy12 * x1 - dx12 * y1;
    var c2 = -dy23 * x2 - dx23 * y2;
    var c3 = -dy31 * x3 - dx31 * y3;
    // Correct for fill convention
    if ( dy12 > 0 || ( dy12 == 0 && dx12 > 0 ) ) c1 ++;
    if ( dy23 > 0 || ( dy23 == 0 && dx23 > 0 ) ) c2 ++;
    if ( dy31 > 0 || ( dy31 == 0 && dx31 > 0 ) ) c3 ++;
    // Note this doesn't kill subpixel precision, but only because we test for >=0 (not >0).
    // It's a bit subtle. :)
    c1 = (c1 - 1) >> 4;
    c2 = (c2 - 1) >> 4;
    c3 = (c3 - 1) >> 4;
    // Set up min/max corners
    var qm1 = q - 1; // for convenience
    var nmin1 = 0, nmax1 = 0;
    var nmin2 = 0, nmax2 = 0;
    var nmin3 = 0, nmax3 = 0;
    if (dx12 >= 0) nmax1 -= qm1*dx12; else nmin1 -= qm1*dx12;
    if (dy12 >= 0) nmax1 -= qm1*dy12; else nmin1 -= qm1*dy12;
    if (dx23 >= 0) nmax2 -= qm1*dx23; else nmin2 -= qm1*dx23;
    if (dy23 >= 0) nmax2 -= qm1*dy23; else nmin2 -= qm1*dy23;
    if (dx31 >= 0) nmax3 -= qm1*dx31; else nmin3 -= qm1*dx31;
    if (dy31 >= 0) nmax3 -= qm1*dy31; else nmin3 -= qm1*dy31;
    // Loop through blocks
    var linestep = (canvasWidth-q);
    for ( var y0 = miny; y0 < maxy; y0 += q ) {
      for ( var x0 = minx; x0 < maxx; x0 += q ) {
        // Edge functions at top-left corner
        var cy1 = c1 + dx12 * y0 + dy12 * x0;
        var cy2 = c2 + dx23 * y0 + dy23 * x0;
        var cy3 = c3 + dx31 * y0 + dy31 * x0;
        // Skip block when at least one edge completely out
        if (cy1 < nmax1 || cy2 < nmax2 || cy3 < nmax3) continue;
        // Offset at top-left corner
        var offset = (x0 + y0 * canvasWidth);
        // Accept whole block when fully covered
        if (cy1 >= nmin1 && cy2 >= nmin2 && cy3 >= nmin3) {
          for ( var iy = 0; iy < q; iy ++ ) {
            for ( var ix = 0; ix < q; ix ++, offset ++ ) {
              ram[renderTarget + offset] = color;
            }
            offset += linestep;
          }
        } else { // Partially covered block
          for ( var iy = 0; iy < q; iy ++ ) {
            var cx1 = cy1;
            var cx2 = cy2;
            var cx3 = cy3;
            for ( var ix = 0; ix < q; ix ++ ) {
              if ( (cx1 | cx2 | cx3) >= 0 ) {
                ram[renderTarget + offset] = color;
              }
              cx1 += dy12;
              cx2 += dy23;
              cx3 += dy31;
              offset ++;
            }
            cy1 += dx12;
            cy2 += dx23;
            cy3 += dx31;
            offset += linestep;
          }
        }
      }
    }
  }

  function spr(sx = 0, sy = 0, sw = 16, sh = 16, x=0, y=0, flipx = false, flipy = false){


    for(var i = 0; i < sh; i++){

      for(var j = 0; j < sw; j++){

        if(y+i < HEIGHT && x+j < WIDTH && y+i > -1 && x+j > -1){
          if(flipx & flipy){

            if(ram[(renderSource + ( ( sy + (sh-i) )*WIDTH+sx+(sw-j)))] > 0) {

              ram[ (renderTarget + ((y+i)*WIDTH+x+j)) ] = pal[ ram[(renderSource + ((sy+(sh-i))*WIDTH+sx+(sw-j)))] ];

            }

          }
          else if(flipy && !flipx){

            if(ram[(renderSource + ( ( sy + (sh-i) )*WIDTH+sx+j))] > 0) {

              ram[ (renderTarget + ((y+i)*WIDTH+x+j)) ] = ram[(renderSource + ((sy+(sh-i))*WIDTH+sx+j))];

            }

          }
          else if(flipx && !flipy){

            if(ram[(renderSource + ((sy+i)*WIDTH+sx+(sw-j)))] > 0) {

              ram[ (renderTarget + ((y+i)*WIDTH+x+j)) ] = ram[(renderSource + ((sy+i)*WIDTH+sx+(sw-j)))];

            }

          }
          else if(!flipx && !flipy){

            if(ram[(renderSource + ((sy+i)*WIDTH+sx+j))] > 0) {

              ram[ (renderTarget + ((y+i)*WIDTH+x+j)) ] = pal[ ram[(renderSource + ((sy+i)*WIDTH+sx+j))] ];

            }

          }
        }
      }
    }
  }

  function sspr(sx = 0, sy = 0, sw = 16, sh = 16, x=0, y=0, dw=16, dh=16, flipx = false, flipy = false){

    var xratio = sw / dw;
    var yratio = sh / dh;

    for(var i = 0; i < dh; i++){
      for(var j = 0; j < dw; j++){

        px = (j*xratio)|0;
        py = (i*yratio)|0;

        if(y+i < HEIGHT && x+j < WIDTH && y+i > -1 && x+j > -1) {
          if (ram[(renderSource + ((sy + py) * WIDTH + sx + px))] > 0) {
            ram[(renderTarget + ((y + i) * WIDTH + x + j))] = ram[(renderSource + ((sy + py) * WIDTH + sx + px))]
          }
        }

      }
    }


  }

  function rspr( sx, sy, sw, sh, destCenterX, destCenterY, scale, angle ){

    angle = angle * 0.0174533 //convert to radians in place
    var sourceCenterX = sx + sw / 2;
    var sourceCenterY = sy + sh / 2;

   var destWidth = sw * scale;
    var destHeight = sh * scale;

   var halfWidth = (destWidth / 2 * 1.41421356237)|0 + 5;  //area will always be square, hypotenuse trick
    var halfHeight = (destHeight / 2 * 1.41421356237)|0 + 5;

   var startX = -halfWidth;
    var endX = halfWidth;

   var startY = -halfHeight;
    var endY = halfHeight;

   var scaleFactor = 1.0 / scale;

   var cos = Math.cos(-angle) * scaleFactor;
   var sin = Math.sin(-angle) * scaleFactor;

   for(let y = startY; y < endY; y++){
      for(let x = startX; x < endX; x++){

       let u = sourceCenterX + Math.round(cos * x + sin * y);
        let v = sourceCenterY + Math.round(-sin * x  + cos * y);

       let drawX = (x + destCenterX)|0;
        let drawY = (y + destCenterY)|0;

       if(u >= 0 && v >= 0 && u < sw && v < sh){
          if( ram[ (renderSource + (v * WIDTH + u)) ] > 0) {
            ram[(renderTarget + (drawY * WIDTH + drawX)) ] = ram[(renderSource + ( v * WIDTH + u )) ]
          }
        }

     } //end x loop

   } //end outer y loop
  }

  // function checker(x, y, w, h, nRow, nCol, color) {
  //   //var w = 256;
  //   //var h = 256;
  //
  //   nRow = nRow || 8;    // default number of rows
  //   nCol = nCol || 8;    // default number of columns
  //
  //   w /= nCol;            // width of a block
  //   h /= nRow;            // height of a block
  //
  //   for (var i = 0; i < nRow; ++i) {
  //     for (var j = 0, col = nCol / 2; j < col; ++j) {
  //       let bx = x + (2 * j * w + (i % 2 ? 0 : w) );
  //       let by = i * h;
  //       fillRect(bx, by, w-1, h-1, color);
  //     }
  //   }
  // }

function render() {

  var i = 0x20000;  // display is first 0x20000 bytes of ram

  while (i--) {
    /*
    data is 32bit view of final screen buffer
    for each pixel on screen, we look up it's color and assign it
    */
    data[i] = colors[pal[ram[i]]];

  }

  imageData.data.set(buf8);

  ctx.putImageData(imageData, 0, 0);

}

//--------END Engine.js-------------------

//TODO: decouple game timer and sound timer
time = 0;

function renderAudio(e) {
  audioData = e.outputBuffer.getChannelData(0);

  inc = 1 / AC.sampleRate

  samplesPerFrame = AC.sampleRate / 60;
  //time = t;
  for(i = 0; i < audioData.length; i++){
    //time = t;
    time += inc;
    signal = 0;

    beat = time * 1.3;
    bar = beat / 4;
    half = beat / 2;
    pattern = bar / 2;
    note = beat * 4;

    //bassdrum
    env = Math.pow(1 - beat % 1, 8);
    signal += ( oscSinus(50) + oscNoise() * .1 ) * env * .3;

    //hat
    env = Math.pow(1 - beat % .5, 16);
    signal += oscNoise() * env * .1;

    //hat
    env = Math.pow(1 - beat % .25, 16);
    signal += oscNoise() * env * .05;

    //snare
    env = Math.pow(1 - half % 1, 10);
    signal += oscNoise() * env * .15;

    //bass
    env = Math.pow(1- note % 1, 3);
    f = getnotefreq( bass[note % bass.length|0]  );
    signal += oscSquare(f) * env * .15;

    //bass2
    env = Math.pow(1 - note % .5, 3);
    f = getnotefreq( bass[note % bass.length|0] );
    signal += oscSquare(f) * env * .15;

//    //lead

      env = Math.pow(1- note % 1, .5);
      f = getnotefreq( notes[note % notes.length|0] + 0 );
      signal += ( oscSawtooth(f) + oscSawtooth(f*1.01) + oscSawtooth(f*1.02) ) * env * .05;


    //lead2

      env = Math.pow(1- note % 1, 1);
      f = getnotefreq( notesb[note % notesb.length|0] );
      signal += ( oscSawtooth(f) + oscSawtooth(f*1.005) + oscSawtooth(f*1.0006) ) * env * .05;




  audioData[i] = signal;


  }

}
kick = "1000100010001000";
bass =   [-35,0,-23,0,0,-35,0,0,-23,0]
notes =  [4,0,4,1,0,4,0,4,3,0,4,0,4,8,0,4,0,4,3,0,5,0,5,5,0,5,0,5,5,0,5,5,5,8,0,5,5,0,5,0]
notesb = [13,1,8,6,11];


oscSinus =
  f => Math.sin(f * time * Math.PI * 2);

oscSawtooth =
  f => (f * time * 2 + 1) % 2 - 1;

oscSquare =
  f => 1 - (f * time * 2 & 1) * 2;

oscNoise =
  f => Math.random() * 2 - 1;

function getnotefreq(n){
    if(n == 0)return 0;
    return 0.00390625 * Math.pow(1.059463094, n + 200); //200 magic number gets note 1 in audible range around middle C
}

//-----main.js---------------

states = {};

init = () => {

  last = 0;
  dt = 0;
  now = 0;
  t = 0;
  moveX = 0;
  speedFactor = .6;
  songTrigger = false;
  state = 'menu';
  demostate = 0;
  //audioCtx = new AudioContext;

  AC = new AudioContext();
  //stat = document.getElementById('status');
  //stat.innerHTML = "blargh"


  fontString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_!@.'\"?/<()";

  fontBitmap = "11111100011111110001100011111010001111101000111110111111000010000100000111111100100101000110001111101111110000111001000011111111111000"+
  "0111001000010000111111000010111100011111110001100011111110001100011111100100001000010011111111110001000010100101111010001100101110010010100011000"+
  "0100001000010000111111000111011101011000110001100011100110101100111000101110100011000110001011101111010001100101110010000011101000110001100100111"+
  "1111101000111110100011000101111100000111000001111101111100100001000010000100100011000110001100010111010001100011000101010001001000110001101011010"+
  "1011101000101010001000101010001100010101000100001000010011111000100010001000111110010001100001000010001110011101000100010001001111111110000010011"+
  "0000011111010010100101111100010000101111110000111100000111110011111000011110100010111011111000010001000100001000111010001011101000101110011101000"+
  "1011110000101110011101000110001100010111000000000000000000000111110010000100001000000000100111111000110111101011011101010111110101011111010100000"+
  "000000000000000000100001100001000100000000000011011010011001000000000000111010001001100000000100000010001000100010001000000010001000100000100000100001000100001000010000010"

  //stats = new Stats();
  //document.body.appendChild( stats.dom );

  //init vid capture
  //capturer = new CCapture( {format: 'gif', workersPath: ''});
  //capturer.start();

  //start the game loop
  SP = AC.createScriptProcessor(1024, 0, 1);
  SP.connect(AC.destination);
  SP.onaudioprocess = renderAudio;
  loop();

}



stopCapture = (e) => {
  //capturer.stop();
  //capturer.save();
}

//initialize  event listeners--------------------------
window.addEventListener('keyup', function (event) {
  Key.onKeyup(event);
}, false);
window.addEventListener('mousedown', function (event){
  stopCapture(event);
}, false);
window.addEventListener('keydown', function (event) {
  Key.onKeydown(event);
}, false);
window.addEventListener('blur', function (event) {
  paused = true;
}, false);
window.addEventListener('focus', function (event) {
  paused = false;
}, false);

loop = e => {
    //stats.begin();

    //game timer
    let now = new Date().getTime();
    dt = Math.min(1, (now - last) / 1000);
    t += dt;

    //draw current state to buffer
    states[state].render();


    //update
    states[state].step(dt);

    last = now;

    //draw buffer to screen
    render(e);

    //render audio

    //GIF capture
    //capturer.capture(C);

    //stats.end();
    requestAnimationFrame(loop);
}

//----- END main.js---------------

//--------gameoverstate.js-----------

states.gameover = {

    step: function(dt) {

        if(Key.isDown(Key.r)){
          state = 'menu';
        }

    },

    render: function(dt) {

      renderTarget = 0x0;
      clear(0);

      text([
        'GAME OVER',
        256,
        80 + Math.sin(t*2.5)*15,
        8 + Math.cos(t*2.9)*4,
        15 + Math.sin(t*3.5)*5,
        'center',
        'top',
        9,
        27,
      ]);

    },

};

//---------END gameoverstate.js----------

//--------------menustate.js---------------

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

    text([
            'PROTOGAME',
            256,
            40 + Math.sin(t*2.5)*15,
            8 + Math.cos(t*2.9)*4,
            15 + Math.sin(t*3.5)*5,
            'center',
            'top',
            9,
            21,
        ]);

    text([
            "PRESS P TO CONTINUE",
            256,
            230,
            2,
            2,
            'center',
            'top',
            1,
            21,
        ]);
  },

};

//-------END menustate.js-------------

//---gamestate.js------------------------------

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

    fillRect(0,0,16,16,17);
    rect(400,16,16,16);
    fillCircle(32,32,8,21);
    circle(64,32,8,21);
    line(128,32,192,64,21);
    triangle(0,0,16,16,32,32);
    fillTriangle(32,0,64,64,128,128,21);
    spr(0,0,16,16);
    sspr(0,0,16,16,0,0,16,16);
    renderSource = 0x0;
    fillRect(256,0,256,256,1);
    //checker(256, 0, 256,256, 8,8, 2);
    rspr(0,128,128,256, 400,128, 1.5, 45)
    text([
            "JS13K BOILERPLATE",
            256,
            20,
            2,
            2,
            'center',
            'top',
            1,
            21,
        ]);


  },

};

//---END gamestate.js------------------------------

    Key = {

        _pressed: {},
        _released: {},

        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        SPACE: 32,
        a: 65,
        w: 87,
        s: 83,
        d: 68,
        z: 90,
        x: 88,
        f: 70,
        p: 80,
        r: 82,

        isDown(keyCode) {
            return this._pressed[keyCode];
        },

        justReleased(keyCode) {
            return this._released[keyCode];
        },

        onKeydown(event) {
            this._pressed[event.keyCode] = true;
        },

        onKeyup(event) {
            this._released[event.keyCode] = true;
            delete this._pressed[event.keyCode];

        },

        update() {
            this._released = {};
        }
    };

//-----------txt.js----------------

//o is an array of options with the following structure:
/*
0: text
1: x
2: y
3: hspacing
4: vspacing
5: halign
6: valign
7: scale
8: color
*/
function textLine(o) {

	var textLength = o[0].length,
		size = 5;

	for (var i = 0; i < textLength; i++) {

		var letter = [];
		letter = getCharacter( o[0].charAt(i) );

		for (var y = 0; y < size; y++) {
			for (var x = 0; x < size; x++) {
				//if (letter[y][x] == 1) {
				if (letter[y*size+x] == 1){
					if(o[4] == 1){
						pset(
							o[1] + ( x * o[4] ) + ( ( size * o[4] ) + o[3] ) * i,
							o[2] + (y * o[4]),
							o[5]
						);
					}

					else {
						fillRect(
						o[1] + ( x * o[4] ) + ( ( size * o[4] ) + o[3] ) * i,
						o[2] + (y * o[4]),
						o[4],
						o[4],
						o[5]);
					}

				} //end draw routine
			}  //end x loop
		}  //end y loop
	}  //end text loop
}  //end textLine()

function text(o) {
	var size = 5,
	letterSize = size * o[7],
	lines = o[0].split('\n'),
	linesCopy = lines.slice(0),
	lineCount = lines.length,
	longestLine = linesCopy.sort(function (a, b) {
		return b.length - a.length;
	})[0],
	textWidth = ( longestLine.length * letterSize ) + ( ( longestLine.length - 1 ) * o[3] ),
	textHeight = ( lineCount * letterSize ) + ( ( lineCount - 1 ) * o[4] );

	if(!o[5])o[5] = 'left';
	if(!o[6])o[6] = 'bottom';

	var sx = o[1],
		sy = o[2],
		ex = o[1] + textWidth,
		ey = o[2] + textHeight;

	if (o[5] == 'center') {
		sx = o[1] - textWidth / 2;
		ex = o[1] + textWidth / 2;
	} else if (o[5] == 'right') {
		sx = o[1] - textWidth;
		ex = o[1];
	}

	if (o[6] == 'center') {
		sy = o[2] - textHeight / 2;
		ey = o[2] + textHeight / 2;
	} else if (o[6] == 'bottom') {
		sy = o[2] - textHeight;
		ey = o[2];
	}

	var cx = sx + textWidth / 2,
		cy = sy + textHeight / 2;

		for (var i = 0; i < lineCount; i++) {
			var line = lines[i],
				lineWidth = ( line.length * letterSize ) + ( ( line.length - 1 ) * o[3] ),
				x = o[1],
				y = o[2] + ( letterSize + o[4] ) * i;

			if (o[5] == 'center') {
				x = o[1] - lineWidth / 2;
			} else if (o[5] == 'right') {
				x = o[1] - lineWidth;
			}

			if (o[6] == 'center') {
				y = y - textHeight / 2;
			} else if (o[6] == 'bottom') {
				y = y - textHeight;
			}

			textLine([
				line,
				x,
				y,
				o[3] || 0,
				o[7] || 1,
				o[8]
			]);
		}

	return {
		sx: sx,
		sy: sy,
		cx: cx,
		cy: cy,
		ex: ex,
		ey: ey,
		width: textWidth,
		height: textHeight
	}
}

function getCharacter(char){
	index = fontString.indexOf(char);
	return fontBitmap.substring(index * 25, index*25+25).split('') ;
}

//-----------END txt.js----------------

window.onload = init();
}
()
)
