// accepts a single hex string representing a name+build
// returns pako-compressed threejs "hexShapes" array
// does NOT care about the tileIndex
// does NOT care about the time/blockNumber
// does NOT make database changes

const pako = require('pako');
const center_out_mapping = require("./json/mapping_center-out.json");
const south_north_mapping = require("./json/mapping_south-north.json");

function isValidHexadecimal(str) {
	return str.match(/^[a-f0-9]{2,}$/i) !== null;
}

function hex2a(hexx) {
	var hex = hexx.toString(); //force conversion
	var str = '';
	for (var i = 0; i < hex.length; i += 2)
		str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	return str;
}

const fromHexString = hexString =>
	new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

function getIndexFromXYZH(x, y, z, h) {
	var a = 0;
	while (a < south_north_mapping.length) {
		if (x === south_north_mapping[a][0] && y === south_north_mapping[a][1])
			return h * a + z; // if we found the x,y that means we've drawn a times columns of height, say 128 and then the z is how far up we've gone on the final column
		a++;
	}
	return -1;
}

function convertUint8ArrayTo8BitByteArray(my8array, targetLength) {
	var x = 0;
	var eightbitbytearray = [];
	while (x < my8array.length) {
		eightbitbytearray.push(my8array[x]);
		x++;
	}
	while (eightbitbytearray.length < targetLength) {
		eightbitbytearray.push(0);
		x++;
	}
	return eightbitbytearray;
}

function convertUint8ArrayTo4BitByteArray(my16array, targetLength) {
	var x = 0;
	var fourbitbytearray = [];
	while (x < my16array.length) {
		fourbitbytearray.push(Math.floor(my16array[x] / 16));
		fourbitbytearray.push(my16array[x] % 16);
		x++;
	}
	while (fourbitbytearray.length < targetLength) {
		fourbitbytearray.push(0);
		x++;
	}
	return fourbitbytearray;
}

function convertUint8ArrayToHexString(my8array) {
	var x = 0;
	var resultingstring = "";
	while (x < my8array.length) {
		var first4 = Math.floor(my8array[x] / 16);
		switch (first4) {
			case 0:
				resultingstring = resultingstring + "0";
				break;
			case 1:
				resultingstring = resultingstring + "1";
				break;
			case 2:
				resultingstring = resultingstring + "2";
				break;
			case 3:
				resultingstring = resultingstring + "3";
				break;
			case 4:
				resultingstring = resultingstring + "4";
				break;
			case 5:
				resultingstring = resultingstring + "5";
				break;
			case 6:
				resultingstring = resultingstring + "6";
				break;
			case 7:
				resultingstring = resultingstring + "7";
				break;
			case 8:
				resultingstring = resultingstring + "8";
				break;
			case 9:
				resultingstring = resultingstring + "9";
				break;
			case 10:
				resultingstring = resultingstring + "a";
				break;
			case 11:
				resultingstring = resultingstring + "b";
				break;
			case 12:
				resultingstring = resultingstring + "c";
				break;
			case 13:
				resultingstring = resultingstring + "d";
				break;
			case 14:
				resultingstring = resultingstring + "e";
				break;
			case 15:
				resultingstring = resultingstring + "f";
				break;
		}
		var last4 = my8array[x] % 16;
		//		console.log("last4:" + last4);
		switch (last4) {
			case 0:
				resultingstring = resultingstring + "0";
				break;
			case 1:
				resultingstring = resultingstring + "1";
				break;
			case 2:
				resultingstring = resultingstring + "2";
				break;
			case 3:
				resultingstring = resultingstring + "3";
				break;
			case 4:
				resultingstring = resultingstring + "4";
				break;
			case 5:
				resultingstring = resultingstring + "5";
				break;
			case 6:
				resultingstring = resultingstring + "6";
				break;
			case 7:
				resultingstring = resultingstring + "7";
				break;
			case 8:
				resultingstring = resultingstring + "8";
				break;
			case 9:
				resultingstring = resultingstring + "9";
				break;
			case 10:
				resultingstring = resultingstring + "a";
				break;
			case 11:
				resultingstring = resultingstring + "b";
				break;
			case 12:
				resultingstring = resultingstring + "c";
				break;
			case 13:
				resultingstring = resultingstring + "d";
				break;
			case 14:
				resultingstring = resultingstring + "e";
				break;
			case 15:
				resultingstring = resultingstring + "f";
				break;
		}
		x++;
	}
	return resultingstring;
}

function convertTallSNColorArrayToFlatSpiralColorArray(tallSNColorArray, height) {
	var i = 0;
	var flatSpiralColorArray = new Array(9901 * height);
	var z, calculatedi, pI;
	while (i < tallSNColorArray.length) {
		z = Math.floor(i / 9901);
		pI = i % 9901;
		calculatedi = getIndexFromXYZH(center_out_mapping[pI][0], center_out_mapping[pI][1], z, height);
		flatSpiralColorArray[i] = tallSNColorArray[calculatedi];
		i++;
	}
	return flatSpiralColorArray;
}

function convertFlatSpiralColorArrayToTallSNColorArray(flatSpiralColorArray, height) {
	var i = 0;
	var tallSNColorArray = new Array(9901 * height);
	var z, calculatedi, pI;
	while (i < tallSNColorArray.length) {
		z = Math.floor(i / 9901);
		pI = i % 9901;
		calculatedi = getIndexFromXYZH(center_out_mapping[pI][0], center_out_mapping[pI][1], z, height);
		tallSNColorArray[calculatedi] = flatSpiralColorArray[i];
		i++;
	}
	return tallSNColorArray;
}

function convertTallSNColorArrayToTallNSColorArray(tallSNColorArray, height) { // note this actually rearranges high to low AND north to south
	var i = 0;
	var tallNSColorArray = new Array(9901 * height);
	while (i < tallSNColorArray.length) {
		tallNSColorArray[(9901 * height) - 1 - i] = tallSNColorArray[i];
		i++;
	}
	return tallNSColorArray;
}

function convertTallNSColorArrayToTallSNColorArray(tallNSColorArray, height) {
	var i = 0;
	var tallSNColorArray = new Array(9901 * height);
	while (i < tallSNColorArray.length) {
		tallSNColorArray[(9901 * height) - 1 - i] = tallNSColorArray[i];
		i++;
	}
	return tallSNColorArray;
}

function convertTallSNColorArrayToReverseFlatSpiralColorArray(tallSNColorArray, height) {
	var i = 0;
	var reverseFlatSpiralColorArray = new Array(9901 * height);
	var z, calculatedi, pI;
	while (i < tallSNColorArray.length) {
		z = Math.floor(i / 9901);
		pI = i % 9901;
		calculatedi = getIndexFromXYZH(center_out_mapping[pI][0], center_out_mapping[pI][1], z, height);
		reverseFlatSpiralColorArray[(9901 * height) - 1 - i] = tallSNColorArray[calculatedi];
		i++;
	}
	return reverseFlatSpiralColorArray;
}

function convertReverseFlatSpiralColorArrayToTallSNColorArray(flatSpiralColorArray, height) {
	var i = 0;
	var tallSNColorArray = new Array(9901 * height);
	var z, calculatedi, pI;
	while (i < tallSNColorArray.length) {
		z = Math.floor(i / 9901);
		pI = i % 9901;
		calculatedi = getIndexFromXYZH(center_out_mapping[pI][0], center_out_mapping[pI][1], z, height);
		tallSNColorArray[calculatedi] = flatSpiralColorArray[(9901 * height) - 1 - i];
		i++;
	}
	return tallSNColorArray;
}


//  ______ _____ _____ ________  _______________ _____ _____ _____ 
//  |  _  \  ___/  __ \  _  |  \/  || ___ \ ___ \  ___/  ___/  ___|
//  | | | | |__ | /  \/ | | | .  . || |_/ / |_/ / |__ \ `--.\ `--. 
//  | | | |  __|| |   | | | | |\/| ||  __/|    /|  __| `--. \`--. \
//  | |/ /| |___| \__/\ \_/ / |  | || |   | |\ \| |___/\__/ /\__/ /
//  |___/ \____/ \____/\___/\_|  |_/\_|   \_| \_\____/\____/\____/ 
//                                                                 
//       
function decompressHexStringToRawData(hexString) {
	// 1. read palette, height and compression algo from leading uint16 word (2-char hex)
	console.log("DECOMPRESSION");
	if (hexString.startsWith("0x"))
		hexString = hexString.substring(2);
	var leadingByte0 = hexString.substring(0, 2);
	var leadingByte1 = hexString.substring(2, 4);
	hexString = hexString.substring(4);
	//			console.log("leadingByte hex string=" + leadingByte);
	var leadingByte1Int = parseInt(leadingByte1, 16);
	//			console.log("leadingByte int=" + leadingByteInt);
	//			console.log("leadingByte bin string=" + dec2bin(leadingByteInt));
	//	var leadingByteNumber = parseInt(leadingByte,16);
	//			console.log(isBitSet(leadingByte, 7) + " " + isBitSet(leadingByte, 6) + " " + isBitSet(leadingByte, 5) + " " + isBitSet(leadingByte, 4) + " " + isBitSet(leadingByte, 3) + " " + isBitSet(leadingByte, 2) + " " + isBitSet(leadingByte, 1) + " " + isBitSet(leadingByte, 0));

	var detectedPaletteCode = parseInt(leadingByte0, 16);
	var detectedHeightCode = Math.floor(leadingByte1Int / 16);
	var detectedHeight = 0;
	if (detectedHeightCode * 1 === 0)
		detectedHeight = 2;
	else
		detectedHeight = detectedHeightCode * 16; // these actually line up now, 1=16,2=32, up to 128
	var detectedAlgoCode = leadingByte1Int % 16;

	console.log("detectedPaletteCode=" + detectedPaletteCode);
	console.log("detectedHeightCode=" + detectedHeightCode);
	console.log("detectedAlgoCode=" + detectedAlgoCode);

	var detectedByteSize = 0;
	if (detectedPaletteCode < 15) // first 7 are reserved as 4-bit palettes
		detectedByteSize = 4;
	else
		detectedByteSize = 8;

	var newColorArray;
	//	var uint16TallSNArray = new Uint16Array(9901 * detectedHeight / getBricksPerUint16Word(detectedByteSize));

	var arr, inflatedArray;
	if (detectedAlgoCode === 0) // DEFLATE TALL SN
	{
		//				console.log("Deflate detected, now inflating");
		arr = fromHexString(hexString);
		inflatedArray = pako.inflate(arr);
		//				console.log("deflate inflatedArray.length=" + inflatedArray.length);
		//		var uint16arr = new Uint16Array(inflatedArray.buffer, inflatedArray.byteOffset, inflatedArray.byteLength / 2);

		// now convert the inflated uint16 data to the original raw array of either 4-bit or 8-bit color elements
		if (detectedByteSize === 4) {
			//					console.log("DEFLATE setting colorArray to 4-bit array converted from uint16array detectedHeight=" + detectedHeight);
			newColorArray = convertUint8ArrayTo4BitByteArray(inflatedArray, inflatedArray.length * 2);
			//					console.log("DEFLATE wide dbs=8 colorArray.length=" + colorArray.length + " and newColorArray.length=" + newColorArray.length);
		}
		else if (detectedByteSize === 8) {
			//					console.log("DEFLATE setting colorArray to 8-bit array converted from uint16array detectedHeight=" + detectedHeight);
			newColorArray = convertUint8ArrayTo8BitByteArray(inflatedArray, inflatedArray.length);

			//convertUint16ArrayTo8BitByteArray(uint16arr, 9901 * detectedHeight);
			//					console.log("DEFLATE wide dbs=8 colorArray.length=" + colorArray.length + " and newColorArray.length=" + newColorArray.length);
		}
	}
	else if (detectedAlgoCode === 1) // DEFLATE FLAT SPIRAL
	{
		console.log("Deflate flat spiral detected, now inflating");
		arr = fromHexString(hexString);
		inflatedArray = pako.inflate(arr);
		console.log("deflate inflatedArray.length=" + inflatedArray.length);
		if (detectedByteSize === 4) {
			console.log("DEFLATE setting colorArray to 4-bit array converted from uint8array detectedHeight=" + detectedHeight);
			newColorArray = convertUint8ArrayTo4BitByteArray(inflatedArray, inflatedArray.length * 2);
			newColorArray = convertFlatSpiralColorArrayToTallSNColorArray(newColorArray, detectedHeight);
			console.log("DEFLATE  newColorArray.length=" + newColorArray.length);
		}
		else if (detectedByteSize === 8) {
			//					console.log("DEFLATE setting colorArray to 8-bit array converted from uint16array detectedHeight=" + detectedHeight);
			newColorArray = convertUint8ArrayTo8BitByteArray(inflatedArray, inflatedArray.length);
			newColorArray = convertFlatSpiralColorArrayToTallSNColorArray(newColorArray, detectedHeight);
			//convertUint16ArrayTo8BitByteArray(uint16arr, 9901 * detectedHeight);
			//					console.log("DEFLATE wide dbs=8 colorArray.length=" + colorArray.length + " and newColorArray.length=" + newColorArray.length);
		}
	}
	else if (detectedAlgoCode === 2) // DEFLATE TALL NS
	{
		console.log("Deflate tall NS detected, now inflating");
		arr = fromHexString(hexString);
		inflatedArray = pako.inflate(arr);
		console.log("deflate inflatedArray.length=" + inflatedArray.length);
		if (detectedByteSize === 4) {
			console.log("DEFLATE setting colorArray to 4-bit array converted from uint8array detectedHeight=" + detectedHeight);
			newColorArray = convertUint8ArrayTo4BitByteArray(inflatedArray, inflatedArray.length * 2);
			newColorArray = convertTallNSColorArrayToTallSNColorArray(newColorArray, detectedHeight);
			console.log("DEFLATE  newColorArray.length=" + newColorArray.length);
		}
		else if (detectedByteSize === 8) {
			//					console.log("DEFLATE setting colorArray to 8-bit array converted from uint16array detectedHeight=" + detectedHeight);
			newColorArray = convertUint8ArrayTo8BitByteArray(inflatedArray, inflatedArray.length);
			newColorArray = convertTallNSColorArrayToTallSNColorArray(newColorArray, detectedHeight);
			//convertUint16ArrayTo8BitByteArray(uint16arr, 9901 * detectedHeight);
			//					console.log("DEFLATE wide dbs=8 colorArray.length=" + colorArray.length + " and newColorArray.length=" + newColorArray.length);
		}
	}
	else if (detectedAlgoCode === 3) // DEFLATE REVERSE FLAT SPIRAL
	{
		console.log("Deflate reverse flat spiral detected, now inflating");
		arr = fromHexString(hexString);
		inflatedArray = pako.inflate(arr);
		console.log("deflate inflatedArray.length=" + inflatedArray.length);
		if (detectedByteSize === 4) {
			console.log("DEFLATE setting colorArray to 4-bit array converted from uint8array detectedHeight=" + detectedHeight);
			newColorArray = convertUint8ArrayTo4BitByteArray(inflatedArray, inflatedArray.length * 2);
			newColorArray = convertReverseFlatSpiralColorArrayToTallSNColorArray(newColorArray, detectedHeight);
			console.log("DEFLATE  newColorArray.length=" + newColorArray.length);
		}
		else if (detectedByteSize === 8) {
			//					console.log("DEFLATE setting colorArray to 8-bit array converted from uint16array detectedHeight=" + detectedHeight);
			newColorArray = convertUint8ArrayTo8BitByteArray(inflatedArray, inflatedArray.length);
			newColorArray = convertReverseFlatSpiralColorArrayToTallSNColorArray(newColorArray, detectedHeight);
			//convertUint16ArrayTo8BitByteArray(uint16arr, 9901 * detectedHeight);
			//					console.log("DEFLATE wide dbs=8 colorArray.length=" + colorArray.length + " and newColorArray.length=" + newColorArray.length);
		}
	}

	return newColorArray;
}


// utils_chunkingAndRendering

const THREE = require('three');

var mapsize = 33;
var size = 10; // length of one tile segment

var tileheight = size * 2;
var tilevert = tileheight * 3 / 4;
var tilewidth = Math.sqrt(3) / 2 * tileheight;
var blocksize = size / 100; // length of one block segment
var blockheight = blocksize * 2;
var blockvert = blockheight * 3 / 4;
var blockwidth = Math.sqrt(3) / 2 * blockheight;
var blockextrude = blocksize;

//const south_north_mapping = require("../json/mapping_south-north.json");

var planeIndicesLeft = [];				// misnomer, this holds 3D indices IN this plane. Not 2D plane indices
var planeIndicesOfThisColor = [];	// misnomer, this holds 3D indices IN this plane. Not 2D plane indices
var soFar = new Set();
var colorOfChunk;
var globalHeight;
var indexToCheck;
var globalZ;

function hex_corner(center, size, i) { // i=0 is... 
	var angle_deg = 60 * i + 30
	var angle_rad = Math.PI / 180 * angle_deg
	return new Point(center.x + size * Math.cos(angle_rad), center.y + size * Math.sin(angle_rad))
}

function getIndexFromXYZH(x, y, z, h) {
	var a = 0;
	while (a < south_north_mapping.length) {
		if (x === south_north_mapping[a][0] && y === south_north_mapping[a][1])
			return h * a + z; // if we found the x,y that means we've drawn a times columns of height, say 128 and then the z is how far up we've gone on the final column
		a++;
	}
	return -1;
}

const PALETTE_DATA =  // 0=transparent,1=black,2-7=rgboyc,8=gray,9-14=flex,15=white 
	[
		[	// PALETTE_DATA[0] = ORIGINAL ETHERIA
			{ "name": "transparent", "hexString": null, "paletteIndex": 0 }, 					// PALETTE_DATA[0][0]
			{ "name": "black", "hexString": "#101010", "paletteIndex": 1 },

			{ "name": "red", "hexString": "#ff0000", "paletteIndex": 2 },
			{ "name": "green", "hexString": "#168700", "paletteIndex": 3 },
			{ "name": "vibrant blue", "hexString": "#265cff", "paletteIndex": 4 },
			{ "name": "burnt orange", "hexString": "#bf4917", "paletteIndex": 5 },
			{ "name": "yellow", "hexString": "#ffee00", "paletteIndex": 6 },
			{ "name": "dark brown", "hexString": "#512800", "paletteIndex": 7 },

			{ "name": "light gray", "hexString": "#a1a6b6", "paletteIndex": 8 },

			{ "name": "sage", "hexString": "#8a8a5c", "paletteIndex": 9 },						// PALETTE_DATA[0][1] (etc)
			{ "name": "plum", "hexString": "#a60e91", "paletteIndex": 10 },
			{ "name": "deep purple", "hexString": "#471b6d", "paletteIndex": 11 },
			{ "name": "sky blue", "hexString": "#abd0fe", "paletteIndex": 12 },
			{ "name": "saddle brown", "hexString": "#a05a0b", "paletteIndex": 13 },
			{ "name": "reddish brown", "hexString": "#a53618", "paletteIndex": 14 },

			{ "name": "white", "hexString": "#ffffff", "paletteIndex": 15 },
		],
		[	// PALETTE_DATA[1] = 4-bit WAD // skipped tan
			{ "name": "transparent", "hexString": null, "paletteIndex": 0 }, 					// PALETTE_DATA[0][0]
			{ "name": "black", "hexString": "#101010", "paletteIndex": 1 },

			{ "name": "thick red", "hexString": "#a61d16", "paletteIndex": 2 },
			{ "name": "green", "hexString": "#168700", "paletteIndex": 3 },
			{ "name": "vibrant blue", "hexString": "#265cff", "paletteIndex": 4 },
			{ "name": "orange", "hexString": "#ff8f00", "paletteIndex": 5 },
			{ "name": "yellow", "hexString": "#ffee00", "paletteIndex": 6 },
			{ "name": "cyan", "hexString": "#5decf5", "paletteIndex": 7 },

			{ "name": "very light gray", "hexString": "#cccccc", "paletteIndex": 8 },

			{ "name": "pink", "hexString": "#fcccea", "paletteIndex": 9 },						// PALETTE_DATA[0][1] (etc)
			{ "name": "pale light green", "hexString": "#aadb74", "paletteIndex": 10 },
			{ "name": "sky blue", "hexString": "#abd0fe", "paletteIndex": 11 },
			{ "name": "purple", "hexString": "#6d2aa7", "paletteIndex": 12 },
			{ "name": "brown", "hexString": "#6a431f", "paletteIndex": 13 },
			{ "name": "wet concrete", "hexString": "#686868", "paletteIndex": 14 },

			{ "name": "white", "hexString": "#ffffff", "paletteIndex": 15 },
		],
		[	// PALETTE_DATA[2] = as vibrant as possible
			{ "name": "transparent", "hexString": null, "paletteIndex": 0 }, 					// PALETTE_DATA[0][0]
			{ "name": "black", "hexString": "#101010", "paletteIndex": 1 },

			{ "name": "red", "hexString": "#ff0000", "paletteIndex": 2 },
			{ "name": "green", "hexString": "#168700", "paletteIndex": 3 },
			{ "name": "vibrant blue", "hexString": "#265cff", "paletteIndex": 4 },
			{ "name": "orange", "hexString": "#ff8f00", "paletteIndex": 5 },
			{ "name": "yellow", "hexString": "#ffee00", "paletteIndex": 6 },
			{ "name": "cyan", "hexString": "#5decf5", "paletteIndex": 7 },

			{ "name": "gray", "hexString": "#8f8f8f", "paletteIndex": 8 },

			{ "name": "pink", "hexString": "#fcccea", "paletteIndex": 9 },						// PALETTE_DATA[0][1] (etc)
			{ "name": "lime", "hexString": "#b9fc09", "paletteIndex": 10 },
			{ "name": "verdant green", "hexString": "#6eb718", "paletteIndex": 11 },
			{ "name": "light purple", "hexString": "#c354cd", "paletteIndex": 12 },
			{ "name": "saddle brown", "hexString": "#a05a0b", "paletteIndex": 13 },
			{ "name": "brown", "hexString": "#6a431f", "paletteIndex": 14 },

			{ "name": "white", "hexString": "#ffffff", "paletteIndex": 15 },
		],
		[	// PALETTE_DATA[3] = magenta-sea green gradient, 
			{ "name": "transparent", "hexString": null, "paletteIndex": 0 }, 					// PALETTE_DATA[0][0]
			{ "name": "black", "hexString": "#101010", "paletteIndex": 1 },

			{ "name": "red", "hexString": "#ff0000", "paletteIndex": 2 },
			{ "name": "green", "hexString": "#168700", "paletteIndex": 3 },
			{ "name": "vibrant blue", "hexString": "#265cff", "paletteIndex": 4 },
			{ "name": "orange", "hexString": "#ff8f00", "paletteIndex": 5 },
			{ "name": "yellow", "hexString": "#ffee00", "paletteIndex": 6 },
			{ "name": "cyan", "hexString": "#5decf5", "paletteIndex": 7 },

			{ "name": "very light gray", "hexString": "#cccccc", "paletteIndex": 8 },

			{ "name": "magenta", "hexString": "#eb00eb", "paletteIndex": 9 },						// PALETTE_DATA[0][1] (etc)
			{ "name": "light purple", "hexString": "#c354cd", "paletteIndex": 10 },
			{ "name": "pastel purple", "hexString": "#c69ac4", "paletteIndex": 11 },
			{ "name": "pastel sea green", "hexString": "#c8fbfb", "paletteIndex": 12 },
			{ "name": "sea green", "hexString": "#6ce2bd", "paletteIndex": 13 },
			{ "name": "dark teal", "hexString": "#18a889", "paletteIndex": 14 },

			{ "name": "white", "hexString": "#ffffff", "paletteIndex": 15 },
		],
		[	// PALETTE_DATA[4] = shuttle (dark colors + full spectrum of grays)
			{ "name": "transparent", "hexString": null, "paletteIndex": 0 },
			{ "name": "black", "hexString": "#101010", "paletteIndex": 1 },

			{ "name": "dark red", "hexString": "#a61d16", "paletteIndex": 2 },
			{ "name": "darkest green", "hexString": "#255525", "paletteIndex": 3 },
			{ "name": "blue", "hexString": "#152cb5", "paletteIndex": 4 },
			{ "name": "dark orange", "hexString": "#d07c14", "paletteIndex": 5 },
			{ "name": "corn yellow", "hexString": "#e6ca31", "paletteIndex": 6 },
			{ "name": "aqua", "hexString": "#35abd6", "paletteIndex": 7 },

			{ "name": "very light gray", "hexString": "#cccccc", "paletteIndex": 8 },

			{ "name": "light gray", "hexString": "#a1a6b6", "paletteIndex": 9 },
			{ "name": "dry concrete", "hexString": "#8f8f8f", "paletteIndex": 10 },
			{ "name": "wet concrete", "hexString": "#686868", "paletteIndex": 11 },
			{ "name": "dark gray", "hexString": "#4b4b4b", "paletteIndex": 12 },
			{ "name": "very dark gray", "hexString": "#2f2f2f", "paletteIndex": 13 },
			{ "name": "almost black", "hexString": "#212121", "paletteIndex": 14 },

			{ "name": "white", "hexString": "#ffffff", "paletteIndex": 15 },
		],
		[ // PALETTE_DATA[5] = fidenza
			{ "name": "transparent", "hexString": null, "paletteIndex": 0 },

			{ "name": "very dark brown", "hexString": "#352410", "paletteIndex": 1 },
			{ "name": "burnt orange", "hexString": "#bf4917", "paletteIndex": 2 },
			{ "name": "dark teal", "hexString": "#18a889", "paletteIndex": 3 },
			{ "name": "sky blue", "hexString": "#abd0fe", "paletteIndex": 4 },
			{ "name": "light orange", "hexString": "#e3a64b", "paletteIndex": 5 },
			{ "name": "corn yellow", "hexString": "#e6ca31", "paletteIndex": 6 },
			{ "name": "pastel sea green", "hexString": "#c8fbfb", "paletteIndex": 7 },

			{ "name": "very light gray", "hexString": "#cccccc", "paletteIndex": 8 },

			{ "name": "rose pink", "hexString": "#ef7070", "paletteIndex": 9 },
			{ "name": "navy", "hexString": "#00226f", "paletteIndex": 10 },
			{ "name": "brown", "hexString": "#6a431f", "paletteIndex": 11 },
			{ "name": "dark sea green", "hexString": "#69997e", "paletteIndex": 12 },
			{ "name": "cadet blue", "hexString": "#498293", "paletteIndex": 13 },
			{ "name": "dark cadet blue", "hexString": "#2d5662", "paletteIndex": 14 },

			{ "name": "white", "hexString": "#ffffff", "paletteIndex": 15 },
		],
		[ // PALETTE_DATA[6] = GFC
			{ "name": "transparent", "hexString": null, "paletteIndex": 0 },

			{ "name": "black", "hexString": "#101010", "paletteIndex": 1 },
			{ "name": "dark red", "hexString": "#a61d16", "paletteIndex": 2 },
			{ "name": "darkest green", "hexString": "#255525", "paletteIndex": 3 },
			{ "name": "deep purple", "hexString": "#471b6d", "paletteIndex": 4 },
			{ "name": "light orange", "hexString": "#e3a64b", "paletteIndex": 5 },
			{ "name": "corn yellow", "hexString": "#e6ca31", "paletteIndex": 6 },
			{ "name": "pastel sea green", "hexString": "#c8fbfb", "paletteIndex": 7 },

			{ "name": "dry concrete", "hexString": "#8f8f8f", "paletteIndex": 8 },

			{ "name": "wet concrete", "hexString": "#686868", "paletteIndex": 9 },
			{ "name": "dark gray", "hexString": "#4b4b4b", "paletteIndex": 10 },
			{ "name": "darker red", "hexString": "#8f0303", "paletteIndex": 11 },
			{ "name": "dark orange", "hexString": "#d07c14", "paletteIndex": 12 },
			{ "name": "very dark gray", "hexString": "#2f2f2f", "paletteIndex": 13 },
			{ "name": "dark brown", "hexString": "#512800", "paletteIndex": 14 },

			{ "name": "white", "hexString": "#ffffff", "paletteIndex": 15 },
		],
		[	// PALETTE_DATA[7] = earth tones
			{ "name": "transparent", "hexString": null, "paletteIndex": 0 },

			{ "name": "pale light green", "hexString": "#aadb74", "paletteIndex": 1 },
			{ "name": "olive", "hexString": "#82a859", "paletteIndex": 2 },
			{ "name": "slightly pale green", "hexString": "#3d8a3d", "paletteIndex": 3 },
			{ "name": "darkest green", "hexString": "#255525", "paletteIndex": 4 },
			{ "name": "green", "hexString": "#168700", "paletteIndex": 5 },
			{ "name": "verdant green", "hexString": "#6eb718", "paletteIndex": 6 },
			{ "name": "lime", "hexString": "#b9fc09", "paletteIndex": 7 },

			{ "name": "very light gray", "hexString": "#cccccc", "paletteIndex": 8 }, 

			{ "name": "wet concrete", "hexString": "#686868", "paletteIndex": 9 }, 
			{ "name": "blue", "hexString": "#152cb5", "paletteIndex": 10 },
			{ "name": "sky blue", "hexString": "#abd0fe", "paletteIndex": 11 },
			{ "name": "corn yellow", "hexString": "#e6ca31", "paletteIndex": 12 },
			{ "name": "dark mustard", "hexString": "#a78a49", "paletteIndex": 13 },
			{ "name": "khaki", "hexString": "#cac48c", "paletteIndex": 14 },

			{ "name": "white", "hexString": "#ffffff", "paletteIndex": 15 },
		],
		[	// PALETTE_DATA[8] = punks

		],
		[	// PALETTE_DATA[9] = punks

		],
		[	// PALETTE_DATA[10] = punks

		],
		[	// PALETTE_DATA[11] = punks

		],
		[	// PALETTE_DATA[12] = punks

		],
		[	// PALETTE_DATA[13] = punks

		],
		[	// PALETTE_DATA[14] = punks

		],
		[	// PALETTE_DATA[15] = 6-bit, 64-color
			{ "name": "transparent", "hexString": null, "paletteIndex": 0 },
			{ "name": "reddish brown", "hexString": "#a53618", "paletteIndex": 1 },
			{ "name": "burnt orange", "hexString": "#bf4917", "paletteIndex": 2 },
			{ "name": "dark orange", "hexString": "#d07c14", "paletteIndex": 3 },
			{ "name": "fire orange", "hexString": "#ff6000", "paletteIndex": 4 },
			{ "name": "light orange", "hexString": "#e3a64b", "paletteIndex": 5 },
			{ "name": "dark teal", "hexString": "#18a889", "paletteIndex": 6 },
			{ "name": "lemon", "hexString": "#ffff97", "paletteIndex": 7 },
			{ "name": "pale light green", "hexString": "#aadb74", "paletteIndex": 8 },
			{ "name": "olive", "hexString": "#82a859", "paletteIndex": 9 },
			{ "name": "slightly pale green", "hexString": "#3d8a3d", "paletteIndex": 10 },
			{ "name": "dark brown", "hexString": "#512800", "paletteIndex": 11 },
			{ "name": "darkest green", "hexString": "#255525", "paletteIndex": 12 },
			{ "name": "pastel purple", "hexString": "#c69ac4", "paletteIndex": 13 },
			{ "name": "green", "hexString": "#168700", "paletteIndex": 14 },
			{ "name": "verdant green", "hexString": "#6eb718", "paletteIndex": 15 },
			{ "name": "lemon-lime", "hexString": "#ccd302", "paletteIndex": 16 },
			{ "name": "yellow", "hexString": "#ffee00", "paletteIndex": 17 },
			{ "name": "orange", "hexString": "#ff8f00", "paletteIndex": 18 },
			{ "name": "plum", "hexString": "#a60e91", "paletteIndex": 19 },
			{ "name": "red", "hexString": "#ff0000", "paletteIndex": 20 },
			{ "name": "dark red", "hexString": "#a61d16", "paletteIndex": 21 },
			{ "name": "darker red", "hexString": "#8f0303", "paletteIndex": 22 },
			{ "name": "pastel sea green", "hexString": "#c8fbfb", "paletteIndex": 23 },
			{ "name": "darkest purple", "hexString": "#30244a", "paletteIndex": 24 },
			{ "name": "magenta", "hexString": "#eb00eb", "paletteIndex": 25 },
			{ "name": "navy", "hexString": "#00226f", "paletteIndex": 26 },
			{ "name": "blue", "hexString": "#152cb5", "paletteIndex": 27 },
			{ "name": "pale skin", "hexString": "#ead9d9", "paletteIndex": 28 },
			{ "name": "sea green", "hexString": "#6ce2bd", "paletteIndex": 29 },
			{ "name": "aqua", "hexString": "#35abd6", "paletteIndex": 30 },
			{ "name": "cyan", "hexString": "#5decf5", "paletteIndex": 31 },
			{ "name": "deep purple", "hexString": "#471b6d", "paletteIndex": 32 },
			{ "name": "white", "hexString": "#ffffff", "paletteIndex": 33 },
			{ "name": "light gray", "hexString": "#a1a6b6", "paletteIndex": 34 },
			{ "name": "dry concrete", "hexString": "#8f8f8f", "paletteIndex": 35 },
			{ "name": "wet concrete", "hexString": "#686868", "paletteIndex": 36 },
			{ "name": "dark gray", "hexString": "#4b4b4b", "paletteIndex": 37 },
			{ "name": "very dark gray", "hexString": "#2f2f2f", "paletteIndex": 38 },
			{ "name": "almost black", "hexString": "#212121", "paletteIndex": 39 },
			{ "name": "black", "hexString": "#101010", "paletteIndex": 40 },
			{ "name": "corn yellow", "hexString": "#e6ca31", "paletteIndex": 41 },
			{ "name": "vibrant blue", "hexString": "#265cff", "paletteIndex": 42 },
			{ "name": "peach", "hexString": "#f66943", "paletteIndex": 43 },
			{ "name": "lime", "hexString": "#b9fc09", "paletteIndex": 44 },
			{ "name": "creamed coffee", "hexString": "#b4905a", "paletteIndex": 45 },
			{ "name": "dark mustard", "hexString": "#a78a49", "paletteIndex": 46 },
			{ "name": "ape face", "hexString": "#856f56", "paletteIndex": 47 },
			{ "name": "saddle brown", "hexString": "#a05a0b", "paletteIndex": 48 },
			{ "name": "brown", "hexString": "#6a431f", "paletteIndex": 49 },
			{ "name": "very dark brown", "hexString": "#352410", "paletteIndex": 50 },
			{ "name": "very light gray", "hexString": "#cccccc", "paletteIndex": 51 },
			{ "name": "sage", "hexString": "#8a8a5c", "paletteIndex": 52 },
			{ "name": "flesh", "hexString": "#dbb180", "paletteIndex": 53 },
			{ "name": "khaki", "hexString": "#cac48c", "paletteIndex": 54 },
			{ "name": "dark sea green", "hexString": "#69997e", "paletteIndex": 55 },
			{ "name": "cadet blue", "hexString": "#498293", "paletteIndex": 56 },
			{ "name": "dark cadet blue", "hexString": "#2d5662", "paletteIndex": 57 },
			{ "name": "very dark cadet blue", "hexString": "#19363f", "paletteIndex": 58 },
			{ "name": "sky blue", "hexString": "#abd0fe", "paletteIndex": 59 },
			{ "name": "rose pink", "hexString": "#ef7070", "paletteIndex": 60 },
			{ "name": "pink", "hexString": "#fcccea", "paletteIndex": 61 },
			{ "name": "light purple", "hexString": "#c354cd", "paletteIndex": 62 },
			{ "name": "purple", "hexString": "#6d2aa7", "paletteIndex": 63 },
		],
	];

function blockHexCoordsValid(x, y) {
	var absx = Math.abs(x);
	var absy = Math.abs(y);

	if (absy <= 33) // middle rectangle
	{
		//		console.log("middle rect");
		if (y % 2 != 0) // odd
		{
			//			console.log("odd row");
			if (-50 <= x && x <= 49) {
				//				console.log("-50 <= x <= 49, returning true");
				return true;
			}
			else {
				//				console.log("too far left or right, returning false");
				return false;
			}
		} else // even
		{
			//			console.log("even row");
			if (absx <= 49) {
				//				console.log("abs(x) <= 49, returning true");
				return true;
			}
			else {
				//				console.log("too far left or right, returning false");
				return false;
			}
		}
	} else {
		if ((y >= 0 && x >= 0) || (y < 0 && x > 0)) // first or 4th quadrants
		{

			if (y % 2 != 0) // odd
			{
				if (((absx * 2) + (absy * 3)) <= 198) {
					//					console.log('1st or 4th, y odd, <= 198');
					return true;
				} else {
					//					console.log('1st or 4th, y odd, > 198, returning false');
					return false;
				}
			} else // even
			{
				if ((((absx + 1) * 2) + ((absy - 1) * 3)) <= 198) {
					//					console.log('1st or 4th, y even, <= 198');
					return true;
				} else {
					//					console.log('1st or 4th, y even, > 198');
					return false;
				}
			}
		} else {
			if (y % 2 == 0) // even
			{
				if (((absx * 2) + (absy * 3)) <= 198) {
					//					console.log('2nd or 43rd, y even, <= 198');
					return true;
				} else {
					//					console.log('2nd or 43rd, y even, > 198');
					return false;
				}
			} else // odd
			{
				if ((((absx + 1) * 2) + ((absy - 1) * 3)) <= 198) {
					//					console.log('2nd or 43rd, y odd, <= 198');
					return true;
				} else {
					//					console.log('2nd or 43rd, y odd, > 198');
					return false;
				}
			}
		}
	}
}

function isInside(point, vs) {
	var x = point["x"], y = point["y"];

	var inside = false;
	for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
		var xi = vs[i]["x"], yi = vs[i]["y"];
		var xj = vs[j]["x"], yj = vs[j]["y"];

		var intersect = ((yi > y) != (yj > y))
			&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		if (intersect) inside = !inside;
	}

	return inside;
};

// col, row are going to be 0,0 here. We can translate the build in the UI later. We shouldn't care here.
function getPointFromColRowXY(col, row, x, y) {
	var xpoint = (col - (mapsize - 1) / 2) * tilewidth;
	if (row % 2 !== 0)
		xpoint = xpoint + tilewidth / 2;
	var ypoint = (row - (mapsize - 1) / 2) * tilevert;

	xpoint = xpoint + x * blockwidth;
	if (y % 2 !== 0)
		xpoint = xpoint + blockwidth / 2;
	ypoint = ypoint + y * blockvert;

	return new Point(xpoint, ypoint);
}

class Point {
	constructor(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}
	add(v) {
		return new Point(this.x + v.x, this.y + v.y);
	}
	clone() {
		return new Point(this.x, this.y);
	}
	degreesTo(v) {
		var dx = this.x - v.x;
		var dy = this.y - v.y;
		var angle = Math.atan2(dy, dx); // radians
		return angle * (180 / Math.PI); // degrees
	}
	distance(v) {
		var x = this.x - v.x;
		var y = this.y - v.y;
		return Math.sqrt(x * x + y * y);
	}
	equals(toCompare) {
		return this.x == toCompare.x && this.y == toCompare.y;
	}
	interpolate(v, f) {
		return new Point(v.x + (this.x - v.x) * f, v.y + (this.y - v.y) * f);
	}
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	normalize(thickness) {
		var l = this.length();
		this.x = this.x / l * thickness;
		this.y = this.y / l * thickness;
	}
	orbit(origin, arcWidth, arcHeight, degrees) {
		var radians = degrees * (Math.PI / 180);
		this.x = origin.x + arcWidth * Math.cos(radians);
		this.y = origin.y + arcHeight * Math.sin(radians);
	}
	offset(dx, dy) {
		this.x += dx;
		this.y += dy;
	}
	subtract(v) {
		return new Point(this.x - v.x, this.y - v.y);
	}
	toString() {
		return "(x=" + this.x + ", y=" + this.y + ")";
	}
	static interpolate(pt1, pt2, f) {
		return pt1.interpolate(pt2, f);
	}
	static polar(len, angle) {
		return new Point(len * Math.cos(angle), len * Math.sin(angle));
	}
	static distance(pt1, pt2) {
		var x = pt1.x - pt2.x;
		var y = pt1.y - pt2.y;
		return Math.sqrt(x * x + y * y);
	}
};
Point.prototype.x = null;
Point.prototype.y = null;


function getChunkOnThisPlane(startingIndex) {
	soFar.add(startingIndex);
	planeIndicesLeft.splice(planeIndicesLeft.indexOf(startingIndex), 1);

	indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0] + 1, south_north_mapping[Math.floor(startingIndex / globalHeight)][1], globalZ, globalHeight);
	if (planeIndicesOfThisColor.includes(indexToCheck) && planeIndicesLeft.includes(indexToCheck))			// if east is valid
		getChunkOnThisPlane(indexToCheck);

	indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0] - 1, south_north_mapping[Math.floor(startingIndex / globalHeight)][1], globalZ, globalHeight);
	if (planeIndicesOfThisColor.includes(indexToCheck) && planeIndicesLeft.includes(indexToCheck))			// if west is valid
		getChunkOnThisPlane(indexToCheck);

	// surprisingly, by jumping 1 away, the odd/even thing doens't matter anymore
	if (south_north_mapping[Math.floor(startingIndex / globalHeight)][1] % 2 === 0) {		// in order to know the x, y, z of ne/nw/sw/se,
		indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0], south_north_mapping[Math.floor(startingIndex / globalHeight)][1] + 1, globalZ, globalHeight);
		if (planeIndicesOfThisColor.includes(indexToCheck) && planeIndicesLeft.includes(indexToCheck))			// if northeast is valid
			getChunkOnThisPlane(indexToCheck);

		indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0], south_north_mapping[Math.floor(startingIndex / globalHeight)][1] - 1, globalZ, globalHeight);
		if (planeIndicesOfThisColor.includes(indexToCheck) && planeIndicesLeft.includes(indexToCheck))			// if southeast is valid
			getChunkOnThisPlane(indexToCheck);

		indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0] - 1, south_north_mapping[Math.floor(startingIndex / globalHeight)][1] + 1, globalZ, globalHeight);
		if (planeIndicesOfThisColor.includes(indexToCheck) && planeIndicesLeft.includes(indexToCheck))			// if northwest is valid
			getChunkOnThisPlane(indexToCheck);

		indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0] - 1, south_north_mapping[Math.floor(startingIndex / globalHeight)][1] - 1, globalZ, globalHeight);
		if (planeIndicesOfThisColor.includes(indexToCheck) && planeIndicesLeft.includes(indexToCheck))			// if southwest is valid
			getChunkOnThisPlane(indexToCheck);
	}
	else {
		indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0] + 1, south_north_mapping[Math.floor(startingIndex / globalHeight)][1] + 1, globalZ, globalHeight);
		if (planeIndicesOfThisColor.includes(indexToCheck) && planeIndicesLeft.includes(indexToCheck))			// if northeast is valid
			getChunkOnThisPlane(indexToCheck);

		indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0] + 1, south_north_mapping[Math.floor(startingIndex / globalHeight)][1] - 1, globalZ, globalHeight);
		if (planeIndicesOfThisColor.includes(indexToCheck) && planeIndicesLeft.includes(indexToCheck))			// if southeast is valid
			getChunkOnThisPlane(indexToCheck);

		indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0], south_north_mapping[Math.floor(startingIndex / globalHeight)][1] + 1, globalZ, globalHeight);
		if (planeIndicesOfThisColor.includes(indexToCheck) && planeIndicesLeft.includes(indexToCheck))			// if northwest is valid
			getChunkOnThisPlane(indexToCheck);

		indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0], south_north_mapping[Math.floor(startingIndex / globalHeight)][1] - 1, globalZ, globalHeight);
		if (planeIndicesOfThisColor.includes(indexToCheck) && planeIndicesLeft.includes(indexToCheck))			// if southwest is valid
			getChunkOnThisPlane(indexToCheck);
	}
	//				console.log("getChunksOnThisPlane returning with soFar= " + [...soFar] + " and planeIndicesLeft=" + planeIndicesLeft);
}

var indicesInsideShapeButNotPartOfChunk = [];
var unrelatedChunks = [];
var unrelatedsSoFar = new Set();
function getUnrelatedChunkOnThisPlane(startingIndex) {
	unrelatedsSoFar.add(startingIndex);
	//console.log("getUnrelatedChunkOnThisPlane: splicing index " + startingIndex);
	indicesInsideShapeButNotPartOfChunk.splice(indicesInsideShapeButNotPartOfChunk.indexOf(startingIndex), 1);

	indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0] + 1, south_north_mapping[Math.floor(startingIndex / globalHeight)][1], globalZ, globalHeight);
	if (indicesInsideShapeButNotPartOfChunk.includes(indexToCheck))			// if east is valid
		getUnrelatedChunkOnThisPlane(indexToCheck);

	indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0] - 1, south_north_mapping[Math.floor(startingIndex / globalHeight)][1], globalZ, globalHeight);
	if (indicesInsideShapeButNotPartOfChunk.includes(indexToCheck))			// if west is valid
		getUnrelatedChunkOnThisPlane(indexToCheck);

	if (south_north_mapping[Math.floor(startingIndex / globalHeight)][1] % 2 === 0) {		// in order to know the x, y, z of ne/nw/sw/se,
		indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0], south_north_mapping[Math.floor(startingIndex / globalHeight)][1] + 1, globalZ, globalHeight);
		if (indicesInsideShapeButNotPartOfChunk.includes(indexToCheck))			// if northeast is valid
			getUnrelatedChunkOnThisPlane(indexToCheck);

		indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0], south_north_mapping[Math.floor(startingIndex / globalHeight)][1] - 1, globalZ, globalHeight);
		if (indicesInsideShapeButNotPartOfChunk.includes(indexToCheck))			// if southeast is valid
			getUnrelatedChunkOnThisPlane(indexToCheck);

		indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0] - 1, south_north_mapping[Math.floor(startingIndex / globalHeight)][1] + 1, globalZ, globalHeight);
		if (indicesInsideShapeButNotPartOfChunk.includes(indexToCheck))			// if northwest is valid
			getUnrelatedChunkOnThisPlane(indexToCheck);

		indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0] - 1, south_north_mapping[Math.floor(startingIndex / globalHeight)][1] - 1, globalZ, globalHeight);
		if (indicesInsideShapeButNotPartOfChunk.includes(indexToCheck))			// if southwest is valid
			getUnrelatedChunkOnThisPlane(indexToCheck);
	}
	else {
		indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0] + 1, south_north_mapping[Math.floor(startingIndex / globalHeight)][1] + 1, globalZ, globalHeight);
		if (indicesInsideShapeButNotPartOfChunk.includes(indexToCheck))			// if northeast is valid
			getUnrelatedChunkOnThisPlane(indexToCheck);

		indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0] + 1, south_north_mapping[Math.floor(startingIndex / globalHeight)][1] - 1, globalZ, globalHeight);
		if (indicesInsideShapeButNotPartOfChunk.includes(indexToCheck))			// if southeast is valid
			getUnrelatedChunkOnThisPlane(indexToCheck);

		indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0], south_north_mapping[Math.floor(startingIndex / globalHeight)][1] + 1, globalZ, globalHeight);
		if (indicesInsideShapeButNotPartOfChunk.includes(indexToCheck))			// if northwest is valid
			getUnrelatedChunkOnThisPlane(indexToCheck);

		indexToCheck = getIndexFromXYZH(south_north_mapping[Math.floor(startingIndex / globalHeight)][0], south_north_mapping[Math.floor(startingIndex / globalHeight)][1] - 1, globalZ, globalHeight);
		if (indicesInsideShapeButNotPartOfChunk.includes(indexToCheck))			// if southwest is valid
			getUnrelatedChunkOnThisPlane(indexToCheck);
	}
	//				console.log("getUnrelatedChunkOnThisPlane returning with unrelatedChunks= " + JSON.stringify(unrelatedChunks) + " unrelatedsSoFar=" + JSON.stringify([...unrelatedsSoFar]) + " and indicesInsideShapeButNotPartOfChunk=" + JSON.stringify(indicesInsideShapeButNotPartOfChunk));
}

function extrudeThisChunk(planeChunkIndices, newColorArray, detectedHeight, indicesLeft) // add all the indexes that satisfy extrusion to thisChunk and remove them from indiciesLeft
{
	//				console.log("extrudeThisChunk detectedHeight=" + detectedHeight);
	// we loop through the indices of this chunk on this plane, get the x,y,z of each, and check the plane above for them, one by one.
	// if any of them fail, then the extrusion stops here and we return the planeChunk sent to this function
	// otherwise, we save the indices of the matches in the plane above and recurse this function on those

	var foundTop = false;
	var p = 0;
	var ourColor = newColorArray[planeChunkIndices[0]];
	var startingz = planeChunkIndices[0] % detectedHeight;
	var zToExamine = startingz + 1;
	if (zToExamine >= detectedHeight)
		return planeChunkIndices; 	// this is a flat chunk on this plane only bc we've already hit the ceiling

	// otherwise, start looking above
	var arrayToReturn = planeChunkIndices;
	var tentative = [];
	var indexToExamine = 0;
	var x, y;
	while (foundTop === false) {
		//					console.log("extruding chunk looking at zToExamine=" + zToExamine);
		p = 0;
		while (p < planeChunkIndices.length) // for every index in this planeChunk look at currentz + 1
		{
			x = south_north_mapping[Math.floor(planeChunkIndices[p] / detectedHeight)][0];
			y = south_north_mapping[Math.floor(planeChunkIndices[p] / detectedHeight)][1];
			//						console.log("\t x,y=", x, y);
			indexToExamine = getIndexFromXYZH(x, y, zToExamine, detectedHeight); 	// get index of block above
			if (newColorArray[indexToExamine] === ourColor)							// is it our color?
			{
				tentative.push(indexToExamine);										// then tentatively add it. Still gotta check all.
				//							console.log("\t\tsame color pushing " + indexToExamine + " arrayToReturn.length=" + arrayToReturn.length);
			}
			else																	// if it wasn't, then we stop 
			{
				return arrayToReturn;												// and return what we had not including tentative
			}
			p++;
		}
		arrayToReturn = arrayToReturn.concat(tentative);	// we reached the end of this chunk again finding all the same color on this z, add the tentatives

		var myI = 0;
		var index = 0;
		while (myI < tentative.length) {
			index = indicesLeft.indexOf(tentative[myI]);
			//						if (index > -1) {
			indicesLeft.splice(index, 1);
			//						}
			myI++;
		}

		zToExamine++;						// increment the z
		if (zToExamine >= detectedHeight)	// next layer would be above ceiling
			return arrayToReturn;			// so return what we've got
		tentative = [];						// didn't find a wrong color, didn't find ceiling, keep going
	}
}

// working from the ground up, start assembling chunks, starting with plane z=0
console.log("assembling chunks");
function generateMasterChunkArray(newColorArray, detectedHeight) {

	// step one, get all indices in the entire 3d structure that are not blank
	var indicesLeft = [];
	var ip = 0;
	while (ip < (detectedHeight * 9901)) {
		if (newColorArray[ip] !== 0) {
			indicesLeft.push(ip);
		}
		ip++;
	}
	console.log("non-zero indices length= " + indicesLeft.length);

	// step two, move up the z dimension, layer by layer
	// get the different chunks in the horizontal slice, then try to extrude them as far as they will go
	var currentz = 0;
	var p = 0;
	var thisz = 0;
	var chunksOfThisPlane = [];
	var masterChunkArray = []; // fully extruded chunks
	var thisChunk = [];
	var indexToWorkOn = 0;
	var c = 0;
	while (currentz < detectedHeight) {
		//		console.log("assembling chunks on currentz=" + currentz + " getting all planeIndicies");
		// for this plane, get all the occupied slots first
		planeIndicesLeft = []; // misnomer, this holds 3D indices IN this plane. Not 2D plane indices
		p = 0;
		thisz = 0;
		while (p < (detectedHeight * 9901)) { // yes whip through entire 3d structure, then pick out the indexes that are on this z, not empty and still left to be processed
			thisz = p % detectedHeight;
			if (thisz === currentz && newColorArray[p] !== 0 && indicesLeft.includes(p))
				planeIndicesLeft.push(p);
			p++;
		}
		//		console.log("assembling chunks on currentz=" + currentz + " DONE getting all planeIndicies, length=" + planeIndicesLeft.length);

		// now using the planeIndicesLeft, assemble this plane's chunks (no above checking yet)
		chunksOfThisPlane = [];
		thisChunk = [];
		indexToWorkOn = 0;
		var cCount = 0;
		while (planeIndicesLeft.length > 0) {
			planeIndicesOfThisColor = [];
			//			console.log("getting chunk " + cCount + " on this plane. planeIndicesLeft.length=" + planeIndicesLeft.length);
			indexToWorkOn = planeIndicesLeft[0]; 						// get the next index to process
			//			console.log("indexToWorkOn " + indexToWorkOn);
			colorOfChunk = newColorArray[indexToWorkOn];

			// we've got our master planeIndicesLeft for getting all chunks in all different colors
			// but we also need a planeIndicesOfThisColor left for checking the current chunk (we could (and were) passing the entire newColorArray for these checks, but it's heavy)
			p = 0;
			thisz = 0;
			while (p < (detectedHeight * 9901)) { // yes whip through entire 3d structure, then pick out the indexes that are on this z, not empty and still left to be processed
				thisz = p % detectedHeight;
				if (thisz === (indexToWorkOn % detectedHeight) && newColorArray[p] === colorOfChunk && indicesLeft.includes(p))
					planeIndicesOfThisColor.push(p);
				p++;
			}

			//						console.log("before starting getChunkOnThisPlane, planeIndicesOfThisColor=" + planeIndicesOfThisColor);
			globalHeight = detectedHeight;
			globalZ = indexToWorkOn % globalHeight;
			getChunkOnThisPlane(indexToWorkOn);			// start with empty array. the very first block will be added, first thing, inside getChunk
			//			console.log("getting chunk " + cCount + " on this plane. DONE");
			cCount++;
			thisChunk = [...soFar];
			soFar.clear();
			chunksOfThisPlane.push(thisChunk);							// once chunk finished, add it to chunksOfThisPlane
		}

		// now attempt to extrude each chunkOfThisPlane as far as it will go
		c = 0;
		while (c < chunksOfThisPlane.length) {
			chunksOfThisPlane[c] = extrudeThisChunk(chunksOfThisPlane[c], newColorArray, detectedHeight, indicesLeft); // get all above indicies satisfying extrusion and remove them from indicesLeft
			masterChunkArray.push(chunksOfThisPlane[c]);
			c++;
		}
		currentz++;
	}
	//	console.log("finished with generateMasterChunkArray=" + JSON.stringify(masterChunkArray));

	//				var o = 0;
	//				var x, y, z;
	//				var i = 0;
	//				while (o < masterChunkArray.length) {
	//					i = 0;
	//					while (i < masterChunkArray[o].length) {
	//						z = masterChunkArray[o][i] % detectedHeight;
	//						y = south_north_mapping[Math.floor(masterChunkArray[o][i] / detectedHeight)][1];
	//						x = south_north_mapping[Math.floor(masterChunkArray[o][i] / detectedHeight)][0];
	//						console.log("masterChunkArray[" + o + "][" + i + "]=" + masterChunkArray[o][i] + " x,y,z=", x, y, z);
	//						i++;
	//					}
	//					o++;
	//				}

	return masterChunkArray;
}

//////////////////////////////////////////////////////////

function getIndexFromXYZAndDirection(x, y, z, h, directionNum) {
	if (directionNum === 1) // northwest
		return getIndexFromXYZH(x - Math.abs((y + 1) % 2), y + 1, z, h);
	else if (directionNum === 2) // west
		return getIndexFromXYZH(x - 1, y, z, h);
	else if (directionNum === 3) // southwest
		return getIndexFromXYZH(x - Math.abs((y + 1) % 2), y - 1, z, h);
	else if (directionNum === 4) // southeast
		return getIndexFromXYZH(x + Math.abs(y % 2), y - 1, z, h);
	else if (directionNum === 5) // east
		return getIndexFromXYZH(x + 1, y, z, h);
	else if (directionNum === 0) // northeast
		return getIndexFromXYZH(x + Math.abs(y % 2), y + 1, z, h);
}

function thereIsAHexInThisDirection(x, y, z, h, directionNum, baseIndices) // directionNum = the segment we've just drawn + 1; So coming into vertex 0 (northeast) drawing northeast (0) and checking for northwest 1
{
	if (directionNum === 1) // northwest
		return blockHexCoordsValid(x - Math.abs((y + 1) % 2), y + 1) && baseIndices.includes(getIndexFromXYZH(x - Math.abs((y + 1) % 2), y + 1, z, h));
	else if (directionNum === 2) // west
		return blockHexCoordsValid(x - 1, y) && baseIndices.includes(getIndexFromXYZH(x - 1, y, z, h));
	else if (directionNum === 3) // southwest
		return blockHexCoordsValid(x - Math.abs((y + 1) % 2), y - 1) && baseIndices.includes(getIndexFromXYZH(x - Math.abs((y + 1) % 2), y - 1, z, h));
	else if (directionNum === 4) // southeast
		return blockHexCoordsValid(x + Math.abs(y % 2), y - 1) && baseIndices.includes(getIndexFromXYZH(x + Math.abs(y % 2), y - 1, z, h));
	else if (directionNum === 5) // east
		return blockHexCoordsValid(x + 1, y) && baseIndices.includes(getIndexFromXYZH(x + 1, y, z, h));
	else if (directionNum === 0) // northeast
	{
		//					console.log("checking northeast with xyz=" + x + "," + y + "," + z + " and h=" + h + " and directionNum=" + directionNum + " and baseIndices=" + baseIndices);
		//					console.log("blockHexCoordsValid(x + Math.abs(y % 2), y + 1)=" + blockHexCoordsValid(x + Math.abs(y % 2), y + 1) + " and baseIndices.includes(getIndexFromXYZH(x + Math.abs(y % 2), y + 1, z, h)=" + baseIndices.includes(getIndexFromXYZH(x + Math.abs(y % 2), y + 1, z, h)));
		//					console.log("returning " + (blockHexCoordsValid(x + Math.abs(y % 2), y + 1) && baseIndices.includes(getIndexFromXYZH(x + Math.abs(y % 2), y + 1, z, h))));
		return (blockHexCoordsValid(x + Math.abs(y % 2), y + 1) && baseIndices.includes(getIndexFromXYZH(x + Math.abs(y % 2), y + 1, z, h)));
	}
}



function getDrawingPointsForChunksBaseLayer(baseIndices, hole, detectedHeight) {
	//				console.log("getDrawingPointsForChunksBaseLayer baseIndices=" + baseIndices + " col=" + col + " row=" + row + " hole=" + hole + " detectedHeight=" + detectedHeight);

	var x, y, z;
	//				var bI = 0;
	//				while (bI < baseIndices.length) {
	//					z = baseIndices[bI] % detectedHeight;
	//					y = south_north_mapping[Math.floor(baseIndices[bI] / detectedHeight)][1];
	//					x = south_north_mapping[Math.floor(baseIndices[bI] / detectedHeight)][0];
	//					console.log("baseIndices[" + bI + "]=" + baseIndices[bI] + " x,y,z=", x, y, z);
	//					bI++;
	//				}
	// algo:
	// look at first block, keep going east until we reach the edge of the chunk
	// then start drawing around until we get back to where we started
	// Is the shape solid? If so, extrude. If not, we'll need to cut holes

	var foundEdge = false;
	var currentPlaneIndex = baseIndices[0];
	var lookaheadPlaneIndex = 0;

	while (foundEdge === false) {
		z = currentPlaneIndex % detectedHeight;
		y = south_north_mapping[Math.floor(currentPlaneIndex / detectedHeight)][1];
		x = south_north_mapping[Math.floor(currentPlaneIndex / detectedHeight)][0];
		//					console.log("on ", x, y, z);
		if (!blockHexCoordsValid(x + 1, y)) // there is nothing east (we're outside the tile hex)
			foundEdge = true;
		else							// the block hex to the east is within the tile hex, is it part of our chunk?
		{
			lookaheadPlaneIndex = getIndexFromXYZH(x + 1, y, z, detectedHeight);
			if (baseIndices.includes(lookaheadPlaneIndex)) {
				//							console.log("looks like ", x + 1, y, z, " is part of our chunk. Keep going east.");
				currentPlaneIndex = lookaheadPlaneIndex;
			}
			else {
				//							console.log("looks like ", x + 1, y, z, " is NOT part of our chunk, which means we've found the edge. Draw from here.");
				foundEdge = true;
			}
		}
	}

	//				console.log("found edge");
	var pointsArr = [];//new Set();
	var doneAssemblingChunkOutlinePoints = false;
	var comingIntoVertex = 5;
	var stoppingIndex = currentPlaneIndex;
	var stoppingVertex = comingIntoVertex;
	//	var count = 0;
	var firstPass = true;
	while (doneAssemblingChunkOutlinePoints === false) { // && count < 13) {

		z = currentPlaneIndex % detectedHeight;
		y = south_north_mapping[Math.floor(currentPlaneIndex / detectedHeight)][1];
		x = south_north_mapping[Math.floor(currentPlaneIndex / detectedHeight)][0];

		//					console.log("--- working on xyz=" + x + "," + y + "," + z + " as a hole? " + hole);
		//					console.log(comingIntoVertex + " drawing " + getDirectionByNumber(comingIntoVertex) + " segment, looking at " + getDirectionByNumber((comingIntoVertex + 1) % 6));
		pointsArr.push(hex_corner(getPointFromColRowXY(0, 0, x, y), blocksize, comingIntoVertex));
		pointsArr.push(hex_corner(getPointFromColRowXY(0, 0, x, y), blocksize, ((comingIntoVertex + 1) % 6))); // 6 back to 0
		//					console.log("stoppingIndex1=" + stoppingIndex + " currentPlaneIndex1=" + currentPlaneIndex + " stoppingVertex1=" + stoppingVertex + " comingIntoVertex=" + comingIntoVertex);
		if (stoppingIndex === currentPlaneIndex && stoppingVertex === comingIntoVertex && !firstPass) 	// we've reached our target x,y (planeIndex) and stoppingVertex
			doneAssemblingChunkOutlinePoints = true;
		else {																					// we have not reached the end yet
			var d = comingIntoVertex + 1;														// move to next vertex
			var limit = d + 5;																	// we will be checking (up to) the remaining 5 vertices
			var directionNumber;
			var hexExists = true;
			while (d < limit) {
				directionNumber = d % 6;														// directionNumber is 0-5, so caculate based on d. 0 = 0, 1 = 1...., 5 = 5, 6 = 0, 7 = 1 ...  11 = 5
				if (hole === true) {
					hexExists = !thereIsAHexInThisDirection(x, y, z, detectedHeight, directionNumber, baseIndices); // this is saying "there is a *like* hex in this direction, whether hole or not hole. So if hole is true, and there is a like hex in that direction, then there is NOT a hex in that direction.
					//								console.log("hole=true, hexExists=" + hexExists);
				}
				else {
					hexExists = thereIsAHexInThisDirection(x, y, z, detectedHeight, directionNumber, baseIndices);
					//								console.log("hole=false, hexExists=" + hexExists);
				}
				if (
					(hole === true && hexExists === true) // we are drawing a hole and the hex we looked at ahead exists, so draw next segment on this spot
					||
					(hole === false && hexExists === false) // we are drawing a real hex and the hext we looked at ahead does not exist (it's a hole), so draw next segment on this spot
				) {
					//								console.log(comingIntoVertex + " drawing " + getDirectionByNumber(directionNumber) + "(" + directionNumber + ") segment");
					pointsArr.push(hex_corner(getPointFromColRowXY(0, 0, x, y), blocksize, directionNumber + 1));
					if (stoppingIndex === currentPlaneIndex && stoppingVertex === (directionNumber + 1)) {
						doneAssemblingChunkOutlinePoints = true;
						break;
					}
				}
				else {
					//  4→5,check east, into 3 (sw)  5→0,check northeast, into 4 (s)   0→1,check northwest, into 5 (se)   1→2,check west, into 0 (NE)   2→3,check southwest, into 1 (n)   3→4, check southeast, into 2 (nw)  
					//								console.log(comingIntoVertex + "→" + ((directionNumber + 4) % 6) + " found new block hex to the " + getDirectionByNumber(directionNumber) + ". Moving into its " + getVertexByNumber((directionNumber + 4) % 6));
					currentPlaneIndex = getIndexFromXYZAndDirection(x, y, z, detectedHeight, directionNumber); //getIndexFromXYZH(x - Math.abs((y + 1) % 2), y + 1, z, detectedHeight);
					comingIntoVertex = ((directionNumber + 4) % 6);
					break;
				}
				d++;
			}
		}
		firstPass = false;
		//		count++;
	}
	return pointsArr;
}


function generateHexShapeFromChunk(chunkIndices, newColorArray, detectedPaletteCode, detectedHeight) { //, blockindex, sequencenum, keyx, keyy, keyz) {

	// taking a full 3D chunk 
	// and generating is hex shape + holes

	//				var col = 15;
	//				var row = 9;
	var hexShapeWithMetadata = {};

	// printing entire chunk for diagnosis
	//				console.log("generateHexShapeFromChunk ENTIRE CHUNK");
	//				var cI = 0;
	//				var x, y, z;
	//				while (cI < chunkIndices.length) {
	//					z = chunkIndices[cI] % detectedHeight;
	//					y = south_north_mapping[Math.floor(chunkIndices[cI] / detectedHeight)][1];
	//					x = south_north_mapping[Math.floor(chunkIndices[cI] / detectedHeight)][0];
	//					console.log("chunkIndices[" + cI + "]=" + chunkIndices[cI] + " x,y,z=", x, y, z);
	//					cI++;
	//				}

	// getting its base layer
	var lowestz = chunkIndices[0] % detectedHeight;
	var baseIndices = [];
	while (i < chunkIndices.length) {
		if (chunkIndices[i] % detectedHeight === lowestz) // if on the same level as the first index (which is necessarily lowest z), then this is a base layer hex
			baseIndices.push(chunkIndices[i]);
		i++;
	}

	// now that we know the number of indices on the base layer, we know the extrusion multiple
	var extrusionMultiple = chunkIndices.length / baseIndices.length; // z extrusion multiple is # indices in this chunk divided by # in the base layer. i.e. how many times do you replicate the base layer upwards

	// now get the chunk's outermost drawing points. We don't know if this is hollow or solid yet, but we are just getting the outside points for now
	var pointsArr = getDrawingPointsForChunksBaseLayer(baseIndices, false, detectedHeight); // hole = false;

	var hexShape = new THREE.Shape();
	for (var p = 0; p < pointsArr.length; p++) {
		if (p === 0)
			hexShape.moveTo(pointsArr[p].x, pointsArr[p].y);
		else
			hexShape.lineTo(pointsArr[p].x, pointsArr[p].y);
	}
	hexShape.moveTo(pointsArr[0].x, pointsArr[0].y);

	// ok we've assembled the chunk's outer shape. We may be done, but we need to check for holes inside the shape
	// these holes are the indices that are within the shape polygon, but NOT part of the chunk

	// get all indices on the base plane that are inside the poly but not part of the chunk

	var ip = 0;
	while (ip < (detectedHeight * 9901)) {
		z = ip % detectedHeight;
		if (z === lowestz) {
			y = south_north_mapping[Math.floor(ip / detectedHeight)][1];
			x = south_north_mapping[Math.floor(ip / detectedHeight)][0];

			if (isInside(getPointFromColRowXY(0, 0, x, y), pointsArr) && !baseIndices.includes(ip))
				indicesInsideShapeButNotPartOfChunk.push(ip); // then this index is part of one or more holes or other shapes inside our shape
		}
		ip++;
	}
	//				console.log("indicesInsideShapeButNotPartOfChunk=" + indicesInsideShapeButNotPartOfChunk); // holes or sub chunks

	// loop through these indices inside the shape but not part of the chunk 
	// and clump them together into their own chunks. could be one or many
	//				console.log("looping indicesInsideShapeButNotPartOfChunk to find connected chunks");
	while (indicesInsideShapeButNotPartOfChunk.length > 0) {
		//console.log("indicesInsideShapeButNotPartOfChunk.length=" + indicesInsideShapeButNotPartOfChunk.length);
		globalHeight = detectedHeight;
		globalZ = indicesInsideShapeButNotPartOfChunk[0] % globalHeight;
		getUnrelatedChunkOnThisPlane(indicesInsideShapeButNotPartOfChunk[0]);
		unrelatedChunks.push([...unrelatedsSoFar]);
		unrelatedsSoFar.clear();
	}
	//				console.log("FINISHED processing indicesInsideShapeButNotPartOfChunk and now unrelatedChunks=" + JSON.stringify(unrelatedChunks));
	// at this point the global variable unrelatedChunksOnThisPlane is our series of "holes" regardless if there is a subchunk inside

	var monkey = 0;
	var holeShape;
	while (monkey < unrelatedChunks.length) {
		//						console.log("holeChunks[" + monkey + "]=" + JSON.stringify(holeChunks[monkey]));
		var holePointsArr = getDrawingPointsForChunksBaseLayer(unrelatedChunks[monkey], true, detectedHeight); // hole = true

		holeShape = new THREE.Shape();
		for (var h = 0; h < holePointsArr.length; h++) {
			if (h === 0)
				holeShape.moveTo(holePointsArr[h].x, holePointsArr[h].y);
			else
				holeShape.lineTo(holePointsArr[h].x, holePointsArr[h].y);
		}
		holeShape.moveTo(holePointsArr[0].x, holePointsArr[0].y);
		hexShape.holes.push(holeShape);
		monkey++;
	}
	unrelatedChunks = [];

	var extrudeSettings = {
		depth: Math.round(blockextrude * extrusionMultiple*100)/100, 
//		steps: 1, // default is 1 already, commenting this out reduces size
//		material: 1, // not sure this is even a valid param
//		extrudeMaterial: 0, // not sure this is even a valid param and if 0 does that mean we don't want to extrude the material? I would think that we do.
//		bevelEnabled: false
	};

	//	console.log("chunkIndices[0]=" + chunkIndices[0]);
	//	console.log("newColorArray[chunkIndices[0]]=" + newColorArray[chunkIndices[0]]);
	//	console.log("detectedPaletteCode=" + detectedPaletteCode);
	var smallBitColorCode = newColorArray[chunkIndices[0]];
	//	console.log("smallBitColorCode=" + smallBitColorCode);
	var materialSettings = { color: PALETTE_DATA[detectedPaletteCode][smallBitColorCode].hexString };

	hexShapeWithMetadata.hexShape = hexShape.extractPoints();
	hexShapeWithMetadata.extrudeSettings = extrudeSettings;
	hexShapeWithMetadata.materialSettings = materialSettings;
	hexShapeWithMetadata.lowestz = lowestz;
	return hexShapeWithMetadata;
}


exports.handler = async (event) => {

	//	console.log("event=" + JSON.stringify(event));
	//	console.log("querystring=" + JSON.stringify(event.params.querystring));
	//	console.log("hexString=" + event.params.querystring.hexString);

	return new Promise((resolve, reject) => {

		if (!event || Object.keys(event).length === 0) {
			reject(new Error("event is invalid or missing"));
			return;
		}

		if (!event.params) {
			reject(new Error("event.params is invalid or missing"));
			return;
		}

		if (!event.params.querystring) {
			reject(new Error("event.params.querystring is invalid or missing"));
			return;
		}

		if (!event.params.querystring.hexString) {
			reject(new Error("event.params.querystring.hexString is invalid or missing"));
			return;
		}

		if (event.params.querystring.hexString.startsWith("0x"))
			event.params.querystring.hexString = event.params.querystring.hexString.substring(2);

		if (!isValidHexadecimal(event.params.querystring.hexString)) {
			reject(new Error("Incoming hexString was not a valid hexadecimal string. Rejected."));
			return;
		}

		var hexString = event.params.querystring.hexString;

		//		console.log("hexString is validHexadecimal");
		var namePartLength = parseInt(hexString.substring(0, 2), 16);
		//		console.log("namePartLength=" + namePartLength);
		var namePartHex = hexString.substring(2, namePartLength * 2 + 2);
		//		console.log("namePartHex=" + namePartHex);
		var namePartAscii = hex2a(namePartHex);
		//		console.log("namePartAscii=" + namePartAscii);
		var buildDataHex = hexString.substring(namePartLength * 2 + 2);
		//		console.log("buildDataHex=" + buildDataHex);

		//		console.log("decompressingHexStringToRawData...");
		var decompressedColorArray = decompressHexStringToRawData(buildDataHex);
		//		console.log("... done. decompressedColorArray.length=" + decompressedColorArray.length);

		var leadingByte0 = buildDataHex.substring(0, 2);
		var leadingByte1 = buildDataHex.substring(2, 4);
		var leadingByte1Int = parseInt(leadingByte1, 16);
		var detectedPaletteCode = parseInt(leadingByte0, 16);
		var detectedHeightCode = Math.floor(leadingByte1Int / 16);
		var detectedHeight = 0;
		if (detectedHeightCode === 0)
			detectedHeight = 2;
		else
			detectedHeight = detectedHeightCode * 16; // these actually line up now, 1=16,2=32, up to 128

		//		console.log("generateMasterChunkArray...");
		var masterChunkArray = generateMasterChunkArray(decompressedColorArray, detectedHeight);
		//		console.log("... done. masterChunkArray.length=" + masterChunkArray.length);

		//		console.log("looping through masterChunkArray and generating hex shapes from each chunk...");
		var hexShapes = [];
		var mci = 0;
		i = 0;
		while (mci < masterChunkArray.length) {
			i = 0;
			hexShapes.push(
				generateHexShapeFromChunk(
					masterChunkArray[mci],
					decompressedColorArray,
					detectedPaletteCode,
					detectedHeight
				)
			);
			//					console.log("drew masterChunkArray[" + mci + "]");
			// draw outermost polygon of the base layer.
			mci++;
		}
		//		console.log("... done. hexShapes.length=" + hexShapes.length);

		// round out the numbers in the hexshapes array
		//			console.log("hexShapes, pre-rounding=" + JSON.stringify(hexShapes));
		var shapeIndex = 0;
		var inner = 0, outer = 0;
		while (shapeIndex < hexShapes.length) // round all the xs and ys, cuts down size by about 33%
		{
			inner = 0;
			while (inner < hexShapes[shapeIndex].hexShape.shape.length) {
				hexShapes[shapeIndex].hexShape.shape[inner].x = Math.round(hexShapes[shapeIndex].hexShape.shape[inner].x * 100) / 100;
				hexShapes[shapeIndex].hexShape.shape[inner].y = Math.round(hexShapes[shapeIndex].hexShape.shape[inner].y * 100) / 100;
				inner++;
			}
			outer = 0;
			while (outer < hexShapes[shapeIndex].hexShape.holes.length) {
				inner = 0;
				while (inner < hexShapes[shapeIndex].hexShape.holes[outer].length) {
					hexShapes[shapeIndex].hexShape.holes[outer][inner].x = Math.round(hexShapes[shapeIndex].hexShape.holes[outer][inner].x * 100) / 100;
					hexShapes[shapeIndex].hexShape.holes[outer][inner].y = Math.round(hexShapes[shapeIndex].hexShape.holes[outer][inner].y * 100) / 100;
					inner++;
				}
				outer++;
			}
			shapeIndex++;
		}
		
		resolve(hexShapes);
	});

};




//exports.handler(
//	{
//		"body-json": {},
//		"params": {
//			"path": {},
//			"querystring": {
//				"hexString": "sdfgsdf",
//			}
//		}
//	}
//);


