
function textLine(opt) {

	var textLength = opt.text.length,
		size = 5;

	for (var i = 0; i < textLength; i++) {

		//bitmap data is retrieved here. currently stored as a 2D array per character.
		//var letter = assets.letters[( opt.text.charAt(i) )] || assets.letters['unknown'];
		var letter = [];
		letter = getCharacter( opt.text.charAt(i) );
		//console.log(letter);
		//console.log(assets.letters[ opt.text.charAt(i)]);

		for (var y = 0; y < size; y++) {
			for (var x = 0; x < size; x++) {
				//console.log(letter[y][x]);
				if (letter[y][x] == 1) {
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
						//console.log(opt.color);
				}
			}
		}
	}
}

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
				ctx: opt.ctx,
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
	bin = assets.font.bin;
	index = assets.font.string.indexOf(char);
	for(var i = 0; i < 5; i++){
		charArray.push( bin[i][0].substring(index * 5, index*5+5).split('') );
	}
	return charArray;
}
