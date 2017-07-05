
function textLine(opt) {

	var textLength = opt.text.length,
		size = 5;

	for (var i = 0; i < textLength; i++) {

		var letter = [];
		letter = getCharacter( opt.text.charAt(i) );
		//console.log(letter);
		//console.log(assets.letters[ opt.text.charAt(i)]);

		for (var y = 0; y < size; y++) {
			for (var x = 0; x < size; x++) {
				//if (letter[y][x] == 1) {
				if (letter[y*size+x] == 1){
					if(opt.scale == 1){
						pset(
							opt.x + ( x * opt.scale ) + ( ( size * opt.scale ) + opt.hspacing ) * i,
							opt.y + (y * opt.scale),
							opt.color
						);
					}

					else {
						fr(
						opt.x + ( x * opt.scale ) + ( ( size * opt.scale ) + opt.hspacing ) * i,
						opt.y + (y * opt.scale),
						opt.scale,
						opt.scale,
						opt.color);
					}

				} //end draw routine
			}  //end x loop
		}  //end y loop
	}  //end text loop
}  //end textLine()

function text(opt) {
	var size = 5,
	letterSize = size * opt.scale,
	lines = opt.text.split('\n'),
	linesCopy = lines.slice(0),
	lineCount = lines.length,
	longestLine = linesCopy.sort(function (a, b) {
		return b.length - a.length;
	})[0],
	textWidth = ( longestLine.length * letterSize ) + ( ( longestLine.length - 1 ) * opt.hspacing ),
	textHeight = ( lineCount * letterSize ) + ( ( lineCount - 1 ) * opt.vspacing );

	if(!opt.halign)opt.halign = 'left';
	if(!opt.valign)opt.valign = 'bottom';

	var sx = opt.x,
		sy = opt.y,
		ex = opt.x + textWidth,
		ey = opt.y + textHeight;

	if (opt.halign == 'center') {
		sx = opt.x - textWidth / 2;
		ex = opt.x + textWidth / 2;
	} else if (opt.halign == 'right') {
		sx = opt.x - textWidth;
		ex = opt.x;
	}

	if (opt.valign == 'center') {
		sy = opt.y - textHeight / 2;
		ey = opt.y + textHeight / 2;
	} else if (opt.valign == 'bottom') {
		sy = opt.y - textHeight;
		ey = opt.y;
	}

	var cx = sx + textWidth / 2,
		cy = sy + textHeight / 2;

	if (opt.render) {
		for (var i = 0; i < lineCount; i++) {
			var line = lines[i],
				lineWidth = ( line.length * letterSize ) + ( ( line.length - 1 ) * opt.hspacing ),
				x = opt.x,
				y = opt.y + ( letterSize + opt.vspacing ) * i;

			if (opt.halign == 'center') {
				x = opt.x - lineWidth / 2;
			} else if (opt.halign == 'right') {
				x = opt.x - lineWidth;
			}

			if (opt.valign == 'center') {
				y = y - textHeight / 2;
			} else if (opt.valign == 'bottom') {
				y = y - textHeight;
			}

			if (opt.snap) {
				x = Math.floor(x);
				y = Math.floor(y);
			}

			textLine({
				x: x,
				y: y,
				text: line,
				hspacing: opt.hspacing || 0,
				scale: opt.scale || 1,
				color: opt.color
				
			});
		}
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
	var charArray = [];
	var bin = assets.font.bigString;
	index = assets.font.string.indexOf(char);
	return bin.substring(index * 25, index*25+25).split('') ;
	//return charArray;
}

// function flattenArray(){
// 	var bigString = "";
// 	bin = assets.font.bin;
// 	for(var i = 0; i < assets.font.string.length; i++){
// 		for(var j = 0; j < 5; j++){
// 			bigString += bin[j][0].substring(i * 5, i*5+5);
// 		}
// 	}
// 	console.log(bigString);
// 	return bigString;
// }

function binToAscii(string){
	var bin = assets.font.bigString;
	var ascii = "";
	
	for (var i = 0; i < bin.length; i += 7) {
		
		ascii += String.fromCharCode( parseInt( bin.substring(i*7, i*7+7), 2 ) );
		
	}
	return ascii;
}

function asciiToBin(string){
	var ascii = assets.asciiEncoded;
	var binString = "";
	
	for (var i = 0; i < ascii.length; i++){
		
		binString += ( ascii.charCodeAt(i) >>> 0).toString(2).slice(-7);
		
	}
	return binString;
}


