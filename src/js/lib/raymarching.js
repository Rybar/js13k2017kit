
// Source - Raymarching.com
// Author - Gary "Shane" Warne
// eMail - mail@Extern.com, mail@Labyrinth.com
// Last update: 16th Jun, 2015

// Unoptimized Javascript source to produce a raymarched scene, which, in this particular instance, is a lattice
// structure. To say Javascript is not the best way to do this is an understatement, but it was fun trying. :)
//
// This demonstration is kind of targeted toward those with a vague familiarity with shaders, WebGL, etc.
// If you're not familiar with shaders, it's definitely worth learning. "GLSLSandbox.com" and "ShaderToy.com"
// are good places to start... and "Raymarching.com." I almost forgot to give myself a free plug. :)
//
// The idea to use artsy-looking, antialised squares as a means to produce a larger looking scene, whilst cutting
// down on a "lot" of distance calculations, came from Mathieu 'P01' Henri, who has a site at "p01.org." In fact,
// the idea to bother with realtime Javascript raymarching at all came from there. Fantastic site. Definitely worth
// a look.

var cnvsID;
var ctx;

var toggle = true;
var gTime = 0.0;
var timer = 0.0;
var fps = 0.0;
var start = 0;
var usePerfCount = false;

var PI = Math.PI;
var TAU = 2.*PI;

// Generalized light vector components.
var gLx = 0.;
var gLy = 0.;
var gLz = 0.;

// Global normal vector components. I can't remember why I globalized these,
// but I'm sure my reasons made sense at the time. :)
var nx = 0.;
var ny = 0.;
var nz = 0.;

var bgCol = null; // Background color.
var objCol = null; // Object color. In this case, the lattice structure.

var output = 0.; // Used to output numbers to the screen.


// Seeded random function. Credit - IQ - Shadertoy.com
// Math.random() would work, in this case, but it's not seeded, so you'd run into problems
// if you wanted to reproduce things, do animation... and a bunch of other things.
function hash(n) {
    return Math.abs(Math.sin(n)*43758.5453) % 1;
    //n = Math.abs(Math.sin(n)*43758.5453) % 1;
    //return 0.5+0.5*Math.sin(Math.PI*2.*n + gTime);
}

// Effect specific initialization.
function Init(){

    gLx = 1.25, gLy = 0.5, gLz = 1.;
    var ll = -Math.sqrt(gLx*gLx + gLy*gLy + gLz*gLz);
    gLx /= ll; gLy /= ll; gLz /= ll;

    bgCol = "rgba(0, 0, 0, 1)"; // Black.
    objCol = "rgb(240, 250, 255)"; // Nearly white, but with a tinge of blue.

}

function clamp(x, low, hi){
    return x = x < low ? low : x > hi ? hi: x;
}

function max(x, m){
    return x = x < m ? m : x;
}

function min(x, m){
    return x = x > m ? m : x;
}

function fract(x){ return Math.abs(x) % 1; }

// Distance function for a rounded cube. Set the "0.05" component
// to zero, and you'll have yourself a cube.
function roundedCube(x, y, z, bx, by, bz){

    x = max(Math.abs(x) - bx, 0.);
    y = max(Math.abs(y) - by, 0.);
    z = max(Math.abs(z) - bz, 0.);
    return  Math.sqrt(x*x + y*y + z*z) - 0.05;
}

// Distance function for a rounded column.
function roundedColumn(x, y, bx, by){

    x = max(Math.abs(x) - bx, 0.);
    y = max(Math.abs(y) - by, 0.);
    return  Math.sqrt(x*x + y*y) - 0.05;
}

// Distance function for a sphere. Very boring, yet cool at the same time.
function sphere( x, y, z, r){
    return Math.sqrt(x*x+y*y+z*z) - r;
}


// The distance function. This function tends to be called the most often,
// so is usually the one that will benifit most from optimization.
function map(x, y, z){

    x = fract(x)-0.5;
    y = fract(y)-0.5;
    z = fract(z)-0.5;

    // Repeat spheres.
    //return sphere(x, y, z, 0.25);

    // Repeat rounded boxes.
    //return roundedCube(x, y, z, 0.18, 0.18, 0.18);

    /*
    // The lattice structure.
    // Produce some repeat colums in the X, Y and Z directions,
    // then take the minimum of all three.
    // The result is a lattice. Simple.
    var d0 = roundedColumn(x, y, 0.08, 0.08);
    var d1 = roundedColumn(y, z, 0.08, 0.08);
    var d2 = roundedColumn(x, z, 0.08, 0.08);

    return min(min(d0, d1), d2);
    */

    // Convoluted, but faster, way to make a rounded square lattice.
    // If you only wanted round columns, you could even get rid
    // of the following three lines.
    x = max(Math.abs(x) - 0.08, 0.);
    y = max(Math.abs(y) - 0.08, 0.);
    z = max(Math.abs(z) - 0.08, 0.);

    x*=x; y*=y; z*=z;

    return Math.sqrt(min(min(x+y, x+z), y+z))-0.05;

}

// Standard numerical method to retrieve the normal on an arbitrary surface. This one uses
// 4 taps to save on calculations. Feel free to change it to the 6-tap version.
function getNormal(x, y, z){

    var ref = map(x, y, z);

    nx = map(x+0.001, y, z)-ref;
    ny = map(x, y+0.001, z)-ref;
    nz = map(x, y, z+0.001)-ref;

    var l = Math.sqrt(nx*nx+ny*ny+nz*nz);

    nx/=l; ny/=l; nz/=l;
}


function raymarchMain(){

    // Sadly, if we want to use Javascript to raymarch in realtime, we have to make a lot of sacrifices.
    // Resolution is one of them, and so is color. For the scene, we're using just two colors. We'll fill
    // the canvas in with black, then paint the scene with colored squares (blueish white) of varying
    // size to emulate different shades. Technically speaking, the rectangles are antialiased, so a few
    // more colors are introduced, but for the most part, the scene is monochrome.
    ctx.fillStyle = bgCol;
    ctx.fr(0, 0, cnvsID.width, cnvsID.height);
    ctx.fillStyle = objCol;

    // Keeps count of the distance-calculations-per-pixel value that we're presenting to the screen.
    // Set it to zero each time we enter the "Main" loop.
    output = 0.;

    // Trying to produce 100%-resolution, realtime raymarched scenes in Javascript isn't feasable at this
    // point, so the best we can do is break our scene into largish blocks. Obviously, this reduces the
    // resolution considerably, but it does allow reasonable framerates. Plus, it gives the scene a bit
    // of an artsy look that I kind of like. :)
    //
    // Instead of converting every single pixel in the canvas to a colored pixel (very expensive), we
    // perform just one scene calculation per "6x6" block, then convert the resultant value to a rectangle
    // that takes up a fractional portion of the "6x6" block. The size variance does an amazing job at
    // creating the illusion of shade.
    //
    // For instance, a shade value of "1.0" will result in a "6 x 6" (36 pixels) square, whereas a value of
    // "0.5" will result in a "4.24 x 4.24" (about 18 pixels) square, etc.
    //
    // Obviously, a smaller number will result in better resolution, but slower framerates, and vice versa.
    // I chose "6," because it was the smallest resolution that would enable 60fps (or thereabout) on my
    // machine. I also liked the resultant aesthetics. However, choose whatever number you wish.
    var sqDim = 4;

    // Global time.
    var tm = gTime*0.75;

    // Screen coordinates. Start off in one corner, then advance the components by the appropriate
    // amounts during the loop in order to cover the entire scene.
    var freq = 1./cnvsID.height;
    var ux = -cnvsID.width*freq*0.5;
    var uy = -cnvsID.height*freq*0.5;
    // We'll need a Z-component when constructing the direction ray. This is, kind of, our makeshift field-of-view.
    var uz = 1.;


    // Camera position, viewing position, ray origin, or whatever you wish to call it. Here, we're
    // moving the camera up and forward linearly over time.
    var cpx = 0., cpy = 0.5+tm, cpz = tm;

    // The directional light.
    var lx = gLx, ly = gLy, lz = gLz;


    // Rotation setup. We'll use these figures to rotate the camera. The directional light will be rotated
    // the same way, so that the light always points toward the surface we're looking at.
    var th = tm*0.5;
    var cs = Math.cos(th);
    var sn = Math.sin(th);
    var temp = 0.;


    // Rotating the light about XY... to match the camera rotation.
    temp = cs*lx + sn*ly;
    ly = -sn*lx + cs*ly;
    lx = temp;

    // Rotating the light about YZ... to match the camera rotation.
    temp = cs*ly + sn*lz;
    lz = -sn*ly + cs*lz;
    ly = temp;


    for (var y=0; y<cnvsID.height; y+=sqDim){
        for (var x=0; x<cnvsID.width; x+=sqDim){

            // Unit direction vector components.
            //
            // If you're familiar with WebGL shaders, the loop setup, and the following,
            // is similar to the lines:
            // vec2 uv = (gl_FragCoord.xy - resolution.xy*0.5) / resolution.y;
            // vec3 rd = nomalize(uv, 1.);
            var dl = ux*ux + uy*uy + uz*uz;
            var rdx = ux/dl, rdy = uy/dl, rdz = uz/dl;

            // We're keeping things simple by not using a camera, so to look around we'll merely rotate the
            // directional ray. Below looks a little messy, but it's roughly equivalent to:
            // rd.xy *= rotate(time);
            // ... or something to that effect.

            // Rotating the unit direction vector about XY.
            temp = cs*rdx + sn*rdy;
            rdy = -sn*rdx + cs*rdy;
            rdx = temp;

            // Rotating the unit direction vector about YZ.
            temp = cs*rdy + sn*rdz;
            rdz = -sn*rdy + cs*rdz;
            rdy = temp;


            // The standard raymarching function. Most of the components should look pretty familiar.
            // Obviously, this is the section that would benefit from optimization... and if
            // I wasn't so damn lazy, it'd be more optimized. :)
	        var t = 0.0;
	        var d = 1.;

	        for(var ii = 0; ii < 64; ii++)
	        {
		        d = map(cpx+rdx*t, cpy+rdy*t, cpz+rdz*t);
		        if((d < 0.01)||(t>20.)){ t += d; break;}
		        t += d * 0.75; // I could take out the "0.75" for fewer distance calculations, but I want, at least, some accuracy.
		        output+=1.0; // This produces the number of raymarch iterations required per pixel.
	        }

	        // Scene color, or shade in this case. Set the background to black.
	        var sCol = 0.;

	        // If we've hit the surface of the object, light it.
	        if(d<0.01){

	            // Retrieving the normal at the intersected surface point.
                getNormal(cpx+rdx*t, cpy+rdy*t, cpz+rdz*t);

	            // The distance from the viewing position, camera, or whatever you wish to call it,
	            // to the intersected surface point. Normally, I'd use a point light, give it
	            // a physical position, then determine the falloff based on that, but I'm trying
	            // to keep things simple with boring directional lighting.
	            var dist = max(t, 0.001);

	            // Using the distance to attenuate the light. Basically, the further away the surface
	            // is, the darker we make it.
	            var atten = min(1./(dist + dist*dist*0.1), 1.);

                // Diffuse value, which is basically dotting the light with the normal.
                var diff = max(lx*nx + ly*ny + lz*nz, 0.);

                // Ambient light level.
                var ambience = 0.1;

                // Combining all the elements to produce the light color, or shade, in this case.
                sCol = min(diff + ambience, 1.)*atten;

            }

            // I was reminded of this neat little trick when reading an exert over at Mathieu 'P01' Henri's
            // site, "P01.org."
            //
            // Instead of converting every single pixel in the canvas to a colored pixel (very expensive), we
            // perform just one scene calculation per "6x6" block, then convert the resultant value to a square
            // that takes up a fractional portion of the "6x6" block. The size variance does an amazing job at
            // creating the illusion of shade.
            //
            // For instance, a shade value of "1.0" will result in a "6 x 6" (36 pixels) square, whereas a value
            // of "0.5" will result in a "4.24 x 4.24" (about 18 pixels) square, etc.
            //
            // The offset value is used to center the square.
            sCol = Math.sqrt(sCol)*1.;
            var dim = sqDim*sCol;
            var dimOff = (sqDim-dim)*0.5;
            ctx.fr(x + dimOff, y + dimOff, dim, dim); // I might look into replacing this with a custom function.


            // If you have a super fast computer, and would like to see what the actual scene looks like, set
            // "sqDim" to "1", comment out the block above, then uncomment this block.

            /*var ic = parseInt(sCol*255);
            ctx.fillStyle = "rgb("+ic+", "+ic+", "+ic+")";
            ctx.fr(x, y, 1, 1);*/



            /*
            // I tried the circular approach. Interesting, but not really feasible... for now, anyway.
            sCol = sCol/Math.sqrt(Math.PI)*1.4142;//2.
            var dim = sqDim*c;//parseInt(sqDim*sCol);
            var dimOff = (sqDim-dim)*0.5;//parseInt((sqDim-dim)*0.5);

            ctx.beginPath();
            ctx.arc(x + dimOff, y + dimOff, dim*0.5, 0, Math.PI*2, true);
            ctx.closePath();
            ctx.fill();*/


            // Advancing the "ux" component of the screen coordinates.
            ux += freq*sqDim;

        }

        // Advancing the "ux" and "uy" components of the screen coordinates by the required amounts.
        ux -= cnvsID.width*freq;
        uy += freq*sqDim;
    }

    // Calulating the average number of distance calculations per pixel. When optimizing
    // a raymarching routine, it's a very handy number to have.
    output /= cnvsID.width*cnvsID.height/(sqDim*sqDim);

}
