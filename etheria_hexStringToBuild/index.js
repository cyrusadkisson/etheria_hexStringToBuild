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
		amount: blockextrude * extrusionMultiple,
		steps: 1,
		material: 1,
		extrudeMaterial: 0,
		bevelEnabled: false,
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
				hexShapes[shapeIndex].hexShape.shape[inner].x = Math.round(hexShapes[shapeIndex].hexShape.shape[inner].x * 10000) / 10000;
				hexShapes[shapeIndex].hexShape.shape[inner].y = Math.round(hexShapes[shapeIndex].hexShape.shape[inner].y * 10000) / 10000;
				inner++;
			}
			outer = 0;
			while (outer < hexShapes[shapeIndex].hexShape.holes.length) {
				inner = 0;
				while (inner < hexShapes[shapeIndex].hexShape.holes[outer].length) {
					hexShapes[shapeIndex].hexShape.holes[outer][inner].x = Math.round(hexShapes[shapeIndex].hexShape.holes[outer][inner].x * 10000) / 10000;
					hexShapes[shapeIndex].hexShape.holes[outer][inner].y = Math.round(hexShapes[shapeIndex].hexShape.holes[outer][inner].y * 10000) / 10000;
					inner++;
				}
				outer++;
			}
			shapeIndex++;
		}
		//		console.log("hexShapes, post-rounding=" + JSON.stringify(hexShapes));
		// now put in Dynamo
		//		var txIndexDecimals = (1 * event.params.querystring.transactionIndex) / 10000;
//		var compressed = pako.deflate(JSON.stringify(hexShapes), { to: 'string' });
//		console.log("DONE compressed.length=" + compressed.length);
		//		var params = {
		//			TableName: 'EtheriaBuilds',
		//			Item: {
		//				'tileIndex': event.params.querystring.tileIndex * 1,
		//				'blockNumberAndTxIndex': (1 * event.params.querystring.blockNumber) + txIndexDecimals,
		//				'build': compressed,
		//				'nameField': hexString
		//			}
		//		};

		//			dynamoDB.put(params, function(err, data) {
		//				if (err) {
		//					console.log(utils.getHrDate() + " doNameChange Insertion into EtheriaBuilds Error", err);
		//				}
		//				else {
		//					console.log(utils.getHrDate() + " put success.");
		//
		//					// update buildIndices globalVar. This is the running list of the indices with actual builds on them
		//					// so we don't have to grab every build for every tile everytime the explorer or builder is loaded
		//					var params = {
		//						TableName: "EtheriaGlobalVars",
		//						Key: {
		//							"name": "buildIndices"
		//						}
		//					};
		//
		//					dynamoDB.get(params, function(err, globalVarEntry) {
		//						if (err) {
		//							console.log("Error", err);
		//							//			reject(err);
		//						}
		//						else {
		//							console.log("Success", JSON.stringify(globalVarEntry));
		//							var buildIndices = JSON.parse(globalVarEntry.Item.value);
		//							var bI = 0;
		//							while (bI < buildIndices.length) {
		//								console.log("buildIndices[" + bI + "]=" + buildIndices[bI]);
		//								bI++;
		//							}
		//							var buildIndicesSet = new Set(buildIndices); // convert to set to eliminate dupes
		//							buildIndicesSet.add(tileIndex * 1);
		//							buildIndices = [...buildIndicesSet]; // back to array
		//							var params2 = {
		//								TableName: "EtheriaGlobalVars",
		//								Item: {
		//									"name": "buildIndices",
		//									"value": JSON.stringify(buildIndices)
		//								}
		//							};
		//							dynamoDB.put(params2, function(err, data) { // update
		//								if (err) {
		//									console.log(utils.getHrDate() + " error updating buildIndices globalVar", err);
		//								}
		//								else {
		//									console.log(utils.getHrDate() + " success putting buildIndices globalVar");
		//								}
		//							});
		//						}
		//					});
		//
		//				}
		//			});

		resolve(hexShapes);
	});

};




//exports.handler(
//	{
//		"body-json": {},
//		"params": {
//			"path": {},
//			"querystring": {
//				"hexString": "0c4574686572526f636b2336340f82789ced9d6d6f23d9756eeb4be00fb9770c1b70c640806b74a9a5d64c1004632246804c90ffffaf6e93ac2a9e3a2f55e765bf50adb59cd82d89d4dae7902c5155fbd19e2600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000155ea6376fbf67012fcfe0572ee0e5cef49afd92be7f29e135e3bf7ec16afdafaf990abeebf59f009b3eb703264fbfbb3ff70c3062d97ebf02a6d2fe03000000000000000000000000000000000000c087e5e5c559efe9bfb507bbb541dfdb73dddab05f5cfd0fbb8b7fb55b348197fc6f6f6efe87dec31ef8f535b90080fe83ff1290f65fbf18ecffce9f2bc0c87e0f00bca65f555dffb17f32dcfed7bcff9a7f507dfa47feb880dbe2755f7e477e13ee2f7edf0236bb4f06e3c573f9000000000000000000000000000000000000006a3c4102c153ee9840d8f48e09002fff4ba8b7f7bf3c8ddf2584b05fbc9b7f0d8068b781c7bdc777fbf4b6a2e52d052076abd7d0cff34be40f0bd8efbeb87e9ee7698ef56101bafef946ea7f14103dfcc2f6fd439ff34f8afe443e4d6903fcfed5a7aa2f17a0f6eccfef7efc12b07aed07fe7003a637d543ef997f9ad4d36fa9de3a83e1ed9fe2ed37cfa084f11fa7088cb31e00000000000000000000000000000000007e60eead908e6e37ffcbe6f70d00b804105e5cfd2f91dedcef1b40d875077bfa27a33ed87de767bc782dffae0738fdfc34a92520e6a30042aa970d809402007b7fa0175dfe3c9f04101ecbd7d8fe9c3e1a4110fb059bd0e739f54fd10482875efce9bf973f3e7fbc7e49fdfec87e5680f4c3ff1273e4d778f62705ac15640a5039f6940a784d0a5079f1e72a788db8df484b5f4c1f456df83a87de4c0589de200870e6bf62937e29fb5fb5dff59ce80de218c7fec960f059e2dfbe629646b1dc7000000000000000000000000000000000f8a4f8cd60485a251ddc2f1e018c5d939c470061f2f3471d9ae6018070ed0e018470ed93ab7fb2f0c72fefbd5dd71f7461c69fdb3e56f1970310c9014fdc7f1c80c82e5fce3f4fc7018848af9000980e0310f1ee4f925dd0f34900e2b5b0fbf2fa796739f54b1410c893afc505c47e597de6dd445480b83f7ee08bfed7f4d827e04f5f727505886d7ffc8a4b2a788d0a780b11d0a7834fa20a0efcc3fa29973c89b620da00617da1846201d2cbafa820f4bf6ae55f12ffaefb3ff8b752fae660fc4ca600797b52c16b09b50dd85550d4bfeabeed3cf5ab4f3d2bf96f5f340983bc44e35f5e1d2228ae72000000000000000000000000000000f82cdc1b35be39ba6f7ef302f67d4adf6c0b88dbb4bedb0dfd4997d8db37abf55f3be2e206b9b7b7379bf5bfc4f6fba76f7e6dfd4b220f9bc035fd9bee256bd7f5274fb554afe34f3b620b76057f260060e5cf75e0dfdaf0ca7a417f3600f0b2b401eafbe300c02a5b1af0ca7a11ff3ca7fee54bfb02a2fbddfdb2faf88baf6105a97edc7f247f14a0b5fd67f67d0139bfb67e2a3d0002db5f61df17a0a64f9fdc893f2a60dc3f2f91a7c2abfbb8807b13b8c0f20f0eafb1ff35f60b3cfb5e62ce0a080310c3affdc49eafe0d10abd8fbf8c1ffbb205a415e4fdc3f6620dd9026eff1deac5de79d43c06eb1ea8e45f3215c40df88f7f9904605e4be8d8930a0efd5a198c3abf8a3aae202f9f6c86af24f18fbbdc88e57de7e422dfd8bde4bcf07403000000000000000000000000000058b0344ab8e42f8296708ffc45d8a862164058e5513bbca5ff25b1dff426fea52f2cea10fbf6cda480b8396cfb8281bfe856f6c7de9c7ed2d117d4895dc19fed49b5f1e71308877a317f2601b0182dfcf31c16f05ba07b3d485f88f9e77957c077ff7f9cb1f38fdb777df8bf4dd37ffcc79f6efcfce0975f7efae9d77ffce3d72b92fe347d11f8c3027ed6f0e7020807fe5f23ffdb983f1f7f28f97ffee9d785d5ff36163f2ca42ff28fff77fe91f847965fb087fe9f8ffd6f52fefd17567f64bf3dfe19ffb03efecacd1fcb33fea1e5ef0eb723fe4efd56417a642df9a3c7ff6dc89ffca8a958ffce3fa43f0cbfd4f897f8cbd88bbff0e3bde6f15ffdddfa42f8a5c93f205fc85670f39f20157dccd470f51ff22611be3aa820ebdfdae12de22fa93ccd9fe8c65fa66c02e25573fac9ceef123f39b7ebb9830a4a5baf2d5f2ac8eb4de401aef2470d3603670000000000000000000000000000dcc9f42ad8a9ef57cbedf307d3ae11df78fec394993f619c7fd87a4436bf550149abd08b5607fca97bfbbc853f597780ae3f3627aff76fd70226ab08427abb9b5c3a81502b9fb600886c04a1d21df8c5d419ffe1dd44fc51077ea53af04bda377fe9f6ff7243cc1fdb7ffbedb754fd2f0942fed83e4ddffd07b717f6679ae0affeeafcc7983f635ffdbbdb451f4eb15fd06ee72fe8dbfcdddb5fb2f7f845f54dfedee597ed26fe237dcbeb6f7cf9992f36ac7f7cf9c5f5d7f8059efc999f33fafebd3eaea0dadf7fe8dddba30a0cfcf7c461e15d4ead7f30fe527c8f57f7fa1bcb7e15de5f6ffe5346d337c51a2afcebf0179137dd0d6fb55ff7f357a4def3d75590c43f047fe539ad609fffb83d0272f64c05e5f0875afce3dcae957b892ac8c72fb4e56b056be8c15ebec7551ed420ff540700000000000000000000000000c8716dc19f5c06403c2210f6f98769378cc038ff90f42a58e61f72ad1a56f987547effa468ff7bb53cf88281ffb83b46c99f3ed439b986ffd69c56e8ceca20fa00249d81c76e49ff9cf44556c8551210d5ee875f4e5e680b3df60fc99302eae58bfffd7d401f7174eb347fb1f885ecb74ffe96863d3248f8f3cbaef36f05c80710b2cb2c221f40689077fb0f9e71bf35c83b5f7e874ff8dfeae59dfef93001f05b83bd4f7ffc62af687f1ef29f1d6b5afc1d07ffd3435db35f56dfe21f5a7ee916aafe8a1f35f5cfff8eb71e3b7ffe87ec6f4d87befe873f33fae4e1af29a1eb9d5764cf54f05be58f9fce377e893eaea0f2e76ff7fbcec41e5550e71f78db1b476fa20a8e5f7f3b7f8ffd46ae80bab79c8ff88742fca5da2e367de5e017eb03f9357e22f72b675c4176e283d2dc93b48235009195ebe74fd2c117faf24705f9e089befc5ec13df6b18b9f4c56f21dd1f26de5410d13e913000000000000000000000000f83cdcae163be61fae5dd27ef1873be6f98ba86561a4fd7558bef8279b02f29d1263fdc783f2ad004377d223a25140fa4017e44b0172feb43beb582ee88f5be36adcab7fb4807d6360837cdc3f27d4ab57bf580bfee6afff16b7e5f7f9b3f6d66f22a9effa369d7a09f595cee58bb817bfa3bdcb2fb3f18bbedd2f68eff08bdadb8ffe0afa16bfacbd79f9d2fac6875fdadeb8fde2ab6fdb7e157dbd5f475ffdfb8ff00bafdd2ffff46bf1cf7bc4f4f5bf7feefc12a3235b3308a1bdfadde589bd2b7ed3f80657c8be56d0f6ee5e547fada0ed979b9847fca2f3d4c7d790d60ac2f847ff89974dfffafada52c12efd317adee7ebd7a5cfbdb282300a2078ce29a9e038fea1d0101f56b00510f272a576fcb5827df6c248fea8203377443777b3ab605a579d499f68cbe35a1e7aaf0806e90f000000000000000000000000b0e6f657e2ed9aff23f78241ef7d59fef2d2dd7b2be0bef94d0b48db36069a9fc7e4eb676f7ef5028efa55740ba86896917f0452e9618f88a43fe98f3a934b151075a755bb05fc734c8b7bd09fb877feca6fd21d4090494074fa6faa61f7905ea425b3ebf823e45efc23fa1175a75f6ae57d7eb18deff30bdb1bfde2f626bff4d62ffa5a7f78bc11b2b72c5f61f12dcbd7b0f72d5f505fefd7d157fb95f4b5f1179d07bf3afea3a4ff307ea502aaf33f1a07de258450e39f2304f575bdf07b7dc35b6b197d61bcddb8befef619fd40057de19b7df8e31ec068f3eee2278d318858fe75d7e8afae4f8a88a30675f26bfc6374fac9d5be9bf3705e81561620aa205f8a6a06238d5d14e3278af9936c096f56d347a2b11f71fec32009b12dfaa9e2275e11905bfcc4470d0000000000000000000000e08ac45fb1ec36df2ea07be42fc20bf8cef9075b7fa62fdb227d90936f9f3629e0a8215daf80b40b3fdb3122efcf8acbed2ad2f98726b95401717f52b57cd41ff766a5fed36f213a7f6129a0e5fb080500ba7bd3040200436d711d7e3177975e4cbdfabb3bf065f207ae018036bdf0e25bfde2f6eefc8190bdab035d52dfe597b357fb95ecb52f3f2d7de5f235f5157e35fdb5808a1b69ea9b962fadaff22bea6bfc9afa8fe5972fa022ffa174d8bfd96bf227b35a0175c31767ad022afbe0679d02ea43003bfbbdf7df523f45ee8d1e6d987f680abfa4f18bafade98b5efd94c97e04f18b36fb5bffec95bcbeb682b51b7e70e2ecf2d01f041e8ee4320df1dff5eb3ff7155cff37ad453787e01eff282550def628c98b25d8c9b712c24256b1790623d0db8ac312487f0000000000000000000000c027a4b23759c7bcb5a85bcfbf88fbc23f6bfe627de0dfbdf3178a05d4a510140a585575290459ffdc357e42347fd1245f0a1011e70ba8f81e92f9879bbfed3bf5e51fe422109d0104b1ceb866bf744bda40fe41660242af5d40def8fa17b7bb0f40f09e40d0f127f0a5271034ff0d7441bd77fea16efdc1d14ed6deda01efd281af68afd97e4d7dc5f23537bf62f9aafa26bf82fe7cfb75f5a77ebdd77d9d5f595fe55ffe4b497fb2ff4fb2fd2a159c4f9f0c7fe88a1750317e64562ce0960268f28ba76f4eb300a17c20f69153d7a520f6eea1ecc98d20fe511b7fc9a53fae018c299b36389487f193a9368891b7f7e64fbad22707faca0a04a200057b450582418425fb72ff202ae1347ea2d0957f143fb14980e4e3276f36f2a0845d2186f2b492bdde4ebe153079a64f1a8f890000000000000000000000f0431036273be41f42bf67fe61f1db1450684837c83f1c37c3ff88f987e2008aec8d65f5c5f8c3fb4aae00890ad63691c2c2cb7ee9fcc3f9968bf853f17cef92adb48ef9b3f6ce0ea1e1fcc16067d2a07f44bd16d022976fc96c9a8020df12d8174090b277061044f5b50104956ed476bda4dd7d02c147f813fc8af68a166cbdad5ff4b57e057bcbf255f4677e03fd915f5b7fb27cdda75e8b5f4f7fe0d74e3f542f5f4b5fe957d357f8f5dc757ec7e5ebefbff3abef24ffa17cf4391b3fa2fc83f77cfc896601f71c40ed3b1f8dec474d0ee1bb532efb71ed4a0fdd3531886cf6e36bd8e9dea47f6b59fc56415c4573fa62b5778effd817d09abed8dc435de907e98fb30a849af1ef4fbecd98adc33afe91a92227d6cc03e4b62176ab8711a20202b15ffcc34e1b55e09afe20fe0100000000000000000000e048757bb4bc35ec4a7753af5df17ef297e9453f7f713286413d7f3195dd6a056437bbf46c179e3f113fbdee18e42fd65e8dacffbbe5f2ffbe7cfdfe9f6cfe4240bb71b2dd1904f3174b016ddfa9c35f94f7f4e948e42f861a841afd52da3ebf424b5453fe42a121ab237f21686ff06be91b074088da9b273008db2b8fff5a8baf1e00a1643ff70b1f6c72fe23bbefdf60d75e7cb55fcb7efcf0ebaffed06fa03fda7e237dc96fa13ff41be40faab65f515fe357d69ff935f5a77e55f9747cf0b359ff99fe477ef8ab8efd5e7efd0d388ebf681f7e4ee327d77e77797d98803879e32994fa28c82b267008464f6eeca78f544531d2f049d8edde665fe2278d45e7c32febd085167b67fce456c1b4b337c64fb6404297fe5ec2544c9f9cd420163f99be6643274115fb422c4218a5ad304c80a41598c74ff655d8cb7735986bf715d8266e00000000000000000000009e86a045da74fec5b3e51f2ce65f1c470134f3177511048d020a6b36c83fcc4577b9275faa807bb344f2f45af30fc5fc85c0048ea04b73b7e2f7cb2f3ffffcf3fffe7ccb5f7cf9bf5ffecf97ff14f4cf590ef73acb8f917f18e85469f34b593bfd0a4d410d7e959ea4e6fc83a8bd3dff20acaff56bb583b5e51fc4f54d0320e4ed757e45bdf704829a1e584dfd817fded217934707bec5e20fdeff98d8ab96afac3f5bbea6bee837d217b7df487fead7d77bfbf35fb0d1977ff81bf90fd7af2d3ff09b3dfc852f3cc3f63bbefab69fbb3fb2fee49d975ceca0c071fe4332f7108b6bf2175bcbbda8799fff38beb170f8636a9d3e221e40691efe11a72fee9feb4a7facd34f1aef1457d093beb8cbfbf31f23c33f02f948637a597f5a85601420d09c5691842074baf2b31518b9f33518cb9332ec731fbb223ce5d7e91fa43f00000000000000000000c095f64669296bd8a1ee257e34c87b78770dfad6e2f0462a05b44420640b984beae3f8855cfe22f3f09ee52f24fc8f66bddd9adf2f3ffffcfef3cf4bfe62befe4736ff31271c6f7616effc45fb0090acd82b7f31de26f481e64fa8b4c57d94fc85cae2ebfd6a2d79cef98b2abf9ebde6f8a7f5c857f8e50e331d7ec9a35cbb7f7774d7b217fdcb0f15e5c517fd061b7fe437b3e7df7fd9ad3e7ff831d567966fd57f7eb6fdeafae3679fbededb9fffedc3db6f963e3938f8eabbcb7ee7a7bfe9f667fd93e3c1e75680ebf2adfc47a71ed4d31fe77add02be1d9f7951087fdcb58ff0c9fbe19fbf590b90cd9f84b347eac78f68e82b7ee912aea067fc47b6849ef4c93a7ea4f56e61095de18f55de1f3f29cf1eb98f41a993bf0d8c1fb91771103fc954b1e400beffbf4e22e1b0843484a1150b482bb0738745c4f18fb76de3b5e54111afbee33fa665f88a8f1c00000000000000000000bca9684b57b5861dea06d6832c8266fea2287d6cbc52fea22185205bc1d97a3388f96f2d0b2d66c102b67eb1bdd960fec5bc67bfe6fbfc8b5f15f21773899e3588e41f06fa551afd92ea76bf9cb6c7afd218f6c1f20fc2f66b01befa2abfca235fef57b4573cfe9a8b3ff18bbfda1bfcf3ee68a3a52ff8f7073add00c2b95f557fd8ffeff137d0ede459bfa9fec86fa42feebf91df537fb0fd56facfee8f3ff599fca5579f85bbe4b719beb0f90b7ab7edb75cff81df4f6f5740f1577ff5f4c3aa3ff2ffa0f98f5b177ee9645054807809f70120e59351990a244bd8c217e7f10f85fc4760affa9d3f1dfd21a06fbc935405ddf18fc3e91ff5f2bbbf43ff28a23e7b91918fc63f769cd790094128b4e5176ab091678b70897f84554452d32cc4ddef3982e3d576c10000000000000000000090e231fde2d9e65f18e42f8e7318c6f98b2490201d00a992ea14706d596831871548b853bf45fe22ea13ddaf399c7ff1faf3979fbfff9f987fced2754cf960f98b543f30fba2dd2fb3e64ebf4a6b5c73fe423c80e16aff50f90b05bb7bfee2dcaff6c89ffb855feb597d317f217ea8a9f74b1ddcfbfc86f68c7ff61dc060e93ef49bd873fb6faccffb8df4a9ff7271f65bebf7fe8b6903bef7f24b4f3f43fd93f99d5f7d76b337ca7ed3839fb73ff99ca1bf1cbf31f3673e6b5640e1dc8b4dfae3e0d48f5dfcc431ff7278e24b2d7fb2654f4ecefc69a43f6efa6f35f6492ef850b09f9ff5104e7fecf575a71c442b688abee44ae88e7f4c4bfca4fb546f317f5257844c0c61f557a43f36e914e421a42f351c14611700c954609b3e898b089db7ff361e0072577aa5306ef91300000000000000000080cf4b7573ba96f7913fb0f5a57e8d021edb5b36df6f68967f283ddea2f9873a655a8084fb469359a880b04d3332d75dececf6c74da2739c7f787fbdcebff8df9f8ff31fedf9874200a26f1502f987c16e9191fc8344a34a8b5fcedae35790df0a70b5937ff828f9071dbb7bfea1e4173eccb4f9e7fdf00bdd0910a95cfa18dbe0b7754fc9f137d8797575ce6f1c3f48fc17637de2bfd8ea53ffc5b503fb72519d3653e1bf7c267f9afff0f5fb3ffdbcfdc6079f247f6327bf17b0ff78b60d80a4f117537f21ffe0ed778cbf58faf32724ace2179f3cff7174664ab380bbf4e4c498cef48f9b38c87f1cdc4c29ff11644fccc77f84fa8adff9e5f31fe7535f8e6ad8f20f5363f66227ef38d93a3eff63baa51f3af55b1185fcc769156bfa42f04ac36915490242e3424ba104c7f11fdf4bf099ffb1a5720c9d69118bdfc30d000000000000000000f0d9e96991d730ebe62f0aba9c5fb4802a6970fba14b427b0af18b93075bc6bf740cd608b31508b877fea66f30e08f5b452373e535bf0e7fd2203bd2b2f1b1f217f2cdc14d7e8dc6e0e6f91762e626bf5a477453fe42a135a9217fa1d21845fee254ada97fc6fc85f841aec52f7b786ff55fec363eefb7541ff88de4b1ff62dc009df1dbf6ff473fffaf7e537d26ffe1ecb7d6fbae3fcd3f7c76bfb5dedb1fe95dfdd7e3bfb17ee7b7fdc993f73b86efac37203d3b60bb01e9c989ef76a3f4c5943ff96317ffc8e9bfabcd0a28aede75fc875101c51363fa3bf0fe7e76e255b38473fba494feb8db2be3272a03486aedf712221ef10f0379a68aeef4c7cedd75b2b9943fa92be2913ee971a75455b1c410b6d91fe2177a9212caf33f1aceb08ed5f09a4d9f28c9b35544f33f26c33046e0b793c6257899010000000000000000e059e8e9131712ef32026a27a673e67cfe415e5217839816bf5405e7f987dc232ee3bf37ec35aa850a083a25cf5ca50224dcabbf6c295e81b2c83f88fa85fb6307f30f43ee66bf466b6e73fe41b83fa6d6afd5164cfea156af6127fff07cf907e1236ca33f4e20d8e61f96010446eed47fb958271032f903db1ed0fd87b67f7f3ef2dbc70fd2fdffec7ed7fc85fdfa9f2bffe2a0c7bfd37be63f3c9efdf1fe9bfb838f8c7ff2257e87fcc7e4ec8fa76f594f9f49966f96be28e8bf4e5ef98f5973f043d61ebdf75bed66e33f52bdd50e644f8729cc7c68b04725b8e827f54da8eac5572aa13e8510872fc2fcc1b0bcf2845bf06ac8e41f7adddd0340fac2170ff9d0a9f6078d45bc49a73f0a55ecebd88ffe50487fdc4a483320b9fc85ea90f9b80297e91f4b19d3c36f22cd556119380100000000000000000088082318c6e6048573d3353188875eac80257d50a37fdc49e8d2c0ad61b066bdc93dc70b78346ad69bfffddf771508b8377ff8e5e08ad7fee257e8ef2da0a24337f45ffef5768942c43f8ff6e7eefc0ef98bbdbf2d0426d11bdcef97e90ceef54bf525f7f9e51ab27bfc92ede0ed7ed566f4dafc855663d693e62ff6af75357b69fe844ad4abce7f9d006066cfe43f2eb6332092fcc7c54c9dfa2fb7010cb63d98b1de523ec5eb9f5cf307def90f6fff33e43facf5f877fa4fe64ff217b6fabddf65fb9fc86f1effd8b7c05bfed47ff8838fec0b70f66702108ef90f6b7de4b77ddb99d79ba53fa6f4b96735fb62b3ef9f7c41cfbf4105c7f90f13fb81de3f7ea2b607cb0090c257f7990b79774d182013fed8f20f22f29ef11f61fe42dbfd2822a8639f34682962247c12d39c409194674bc856b11bfda191ff58030f491949fa43277db21511e53f52bf963c5b846dec242dc471f8c7ad044f390000000000000000c0d3e031fde2ee0d530276f32fa66c3242f4ec6c4d0221f14b1470bb705aabdcdd5330ffd0aade0a10703f0aa8ba9f44fe628e496f7290bff8fb839e02cedd37ffe5a7bf7de7a75bfee275befe47227f51e53e64247ff1f0f6b72a0ce71f06bb2406f30fc31d1ae41ffe1e629e7f685ebfa83de1d03f6ba72f8ef30ffaf6827ffc2837e08f464018e71f7601085d75cebf24109cf20f0e0984347f61aa0ffd17effc857df77fb47efbf8479cbff0f67fb6fcc927cf1f247e63bdb7ff99f2072eafbe27f27b1cfe9df317bba7bf833fe9c037f73bebf78fbe7dfc64f37f6efd9afe30d687cf3ebbe847c66e3af924a3b70c7f9402185f2da77f9cc63f548a386fc65ff22f09b72f8ef5375727010ef21f9d11902085507fbab598ff786ddb882e79524c4dece158deed0ea92ee26d671771178bd815b2041034d31fa542a6287fa12bcf9410cefd308e423cfca6da7d096e6a0000000000000000007850ecc8b7d006f90737b560fe62bafdf1b8da00c663db250770d4e63ff6f792383bbf348a369a830a06c5c546d583fcc5987f8ec9dfecfdf2b7bffdf4d3dffe76cf5fbc5e5efffb9f64f217a37f18fedfffb3df2fd197bcf3b7e53f44fa92bbf31f423dd1fbf557fbc53ab2bbfc820de11dfb2fda8ede9bbf90ea8e69f3abb7e21ff8c75febfd7e89234db7ff6266cfe73f2e36eaacdf3a8091cb7f58f681a6f90bbffc876ffec225fe11e54facedd1fa7df31f1edbff6cf913733dfea7f1fbe72f8ced4f95bff039fa3ccffe1bbee709fddb3f3dfc490bbeb9df59ef19800897efa4df0a70d0bf3f8f7e9abeceb365f8248e4018c73fcad3479cf45318ffb090e77eeb578f7f9c37e467a31752a53ce447e79cb2f1937bfea2bfc3bb238351ca9fb4d7301e0089f2272d45d46d7a2d8d55a8e43f966742b9887bfee36197944775c49b910eff50bdc49894603cfc23aec56ffac7bd80c975fc070000000000000000c03370d2136f205e30f8f338f95cc4b4faa52cd5f32f76bb2e177fa8f4c7f71e2a206e516d1107058caa4b176e6df217e59bede75f5cf317ff2d90bf10e80b1ec85f48f4245fbae76fc834255fc6f20fc35d027d7eb986ec8b73fea1dd2fdc8cdee8176f856ff04bbcdece389a7fa16f2ff82f264b2ff94d0310d9fcc5c5ae21299b7fb8d8354365e65f98b66132ff62a737b6c77e73fdc3efa37f9ef5fbe73f7c1ad0f1077e6b7de8f79efff0b9f30f4e47ffddfe9beb03bfd91baec8bffecbc5ff34cbb77ab75df0bbe943bf873ef07be8d77f3ae877cdb95fbf7a645fa2fc85b53df8c96f1bbfc88eff30cca064fbb20dd217abba74da3d895dc89652134328a42fd6fc8184bbee9473dedf5542ab7a5fc2f2bf9df10b99e91f2b49bf7f750043ee42db6b450ae4de86ff7e34eb46a2927d11710043579eade12d1c00a22fdf1572abc52ffe31dde66f384eff000000000000000000781e0e7ae2f5cd5b57beed19c22415207d82f4113538cf412c7e9102ae2311ea0218fb877ddcffe8926d330b14b04b22b4ccbf886e34a82e5eb97ebffc74e5cbd5ff76cd5fbcbe4ae43fe6dafc479181fcc7badb43ed02fdf90f912e894beffc0da18eecb92fff21d60fde95ff106c47ef58bf68337c73fe43ba15bfc9af9042a8f68f1d666a29f82f36f6c2fc0bc304463e7f6117c048e65f4cb6018ca79a7fe1d085cafc0b57fdf3e42f9ec0ef30fee389e69f78e70f3ebbdf2900e0ac7f16bf53fa6bf5fb1cfcf7fb6fafdf77e0bbf8a787ffd30510bcf31793f3f257bfdbea03bfa3de2d7eb2bef86cc31789de3cfe918d9f585690e63f84b30ea7f6f8bca37af263e7ce9df54cd21f6aeee249df6cf2e3917f1072d79cf22de44ffa6ae8ca6094f227ad1910b90048a684b32a24c327511515b340c4b327f94a7625dc877f04f90fcb00481a3fd195670a718a9f2c35b80dff0000000000000000000828f4c31b89cb0df956e63b626708e786fc43b06ea15394b7aba78deab5000975a53f7377a1fc452e7e51377bbbc73fc714bef5eb4f3f7df9fe9f24ff3194bfa8521fd39fbf78ecf7c8f5ea5e7ff9a16ea273fe86583b76cffc09c90c40875fb415dd3bffd0e8976fc3ef997f2167aff78f1d65aac9fbed0210f9f917760988c47fb11d4151c85fd8c8133ff32f3e6dfec27bfe834ffc61bf7e4fff33ac9ffc85a3df3fff606e7fa2fcc5e7ce3f38e977fbefa0dffc4efdf793bbde3500e09c3f70df7e67ff7a4acc59ef1efff86a3f7e238e7f98e73f92f8876905d179e1afc61194f4bcb46aee2175174ebbeac62f86021863e98b2af96125fde98b8ee11f990272c987aa727adc5932fed33d910b7f94cb785453b40ba92b6a99b6111ceaf27c0ddb080eebfcc5e49fbfb86effaa37fedb7e000000000000000000cf43b923df46bc62788eeeb6de582f98ff680980ac7713f2d70630d2477cb880208a106b4ed4ab5f22ff91bd78aa93ff9833b47d8791fcc7a83af137e72f16edc805f34ebf5437785ffe43ae17bd67fe86642b7c7bfe43b6117f6ef44bc7009ad63ff4422b50efd7b0d7facd021859ff2380e130ff624d60f8ccbfd8f416f2d46f2b4ffc4f30ffc239ff616b4ffcd6fa68fe86b9fe79f20fde7eaf0ee887de37ffe234fee369fc5e018027f193bff0cc5f38e957ffec74f0dbfc4e2df093bbdedb3fad7e0f7db0fd2e7a67ff93e43fbefaea5da66f3cd3f80ffbf84774ded12c7b11ea8bf3378c2220f12793d4859ab97c563e57c13d0022ea7e3f3de998865006e21f7100a4f694f759fea3b2229900c86b66e245450d8601904c25ea118ca3128cf21f690d86d33f3295388dff78b0f93de40000000000000000005b6bbcf9df28897bf275cf911dc60104fd73d3048c208920738672e9926d11070548a8637f46933f1d3cb0012d3184f2358056ff9c0b60347d8781fc451480e8bd6a3d967fd8fc3dea7ebf5c2b784ffe42b211fdd29cbf90ed836ff54b77e1b7e53fe433002d7e950442adff7299541208957eab0914e5fcc7c5a42fa69cbfd07767fdc6098864fe866bfee2d684ec367fc3397fe1d285fa3cf30ffce74f78fb1df4cf93bf7882c7df43ffb9f3074fe37f82fc81b7df41bffabdf48b7f9ebdfd4efdf7de01806df99f327f10f87df493eff6bffb3efccf12fff0ce5fb8f8777afb04c6febca35df4e1a12fcedf3028247bde7d6fd74e6014beacb909f7e44555fe227d3c32e31d1ad58d518465eec849fea2a228a1fcc551eea15c8b8c7c5fc9dd55538278f6a3508c6f0063ba6bf7010c8ffcc5f428c0c3be94704b60b8a53f0000000000000000009c79f4e91b9f2153ca5f54880a48cebff0ca7fe4021847d210c9fcc71ca98253efc54b00031b106611b23708fd5ffeb03096ff48a31f3d978e7bf31f7100a3f7aaf548fea27bd1837ec13efc8efcc7d1d3ac99f6f91bb22184d6f91bd21188c6f91bdfd5b283101af327f263181afcb71084acbd61fe868a3d21eb37cc40e4fc96118cd4ef3a7fc37c00c7ce7f311fff91f31bda33f91353fb93e53fbcfdf67af227dbbffcf3179e7eb706fc87ff33afdf397fe1b7fc2dffe1a1dffc7e0df8be1df89bdf47ef1d40d802003e7ae7fcc3f3f8bdec57bf77fcc469fc4698fff0d44fe6d98bbdde2700b23bef6896bb08f567f90fcd42f2e7dd6d2a38e90ccf6c84581d2d5104e122763988ba53ee75f98fd60048ef0597f3f447be140175532925bb8cba54cc1497f0babb0065445883bd7d57828ffd5181971d00000000000000009e84624fbc89796994b73d41a5957f38f7bc643e378dc70feecc8d018ce0ae1205640210c75241ffbe257faf0af30fa5d3e07de748a32440e1e2e9fbe57a1ef69fff592c7f914f5f58e52f12ab67fea2cb3be6176b83ef99bf310976e1b7e61fa6fb2804217bbb5fba25b9cd2fdf10dde257e906aff62bf5a2d7cfdf306907cffbed1af19df21f7f59c9f82dd6fe97bf2cff48fc363b5ff09b3dee79bf5dfc23e7377cd6fd25f7fc73f923f07bbfb59dfcc733e53f3ce74fb8e73f665fff3cbbe61f669fe5affed96df9abdf20ea5af67bf6402f7e17fd130c8078820082f7f67fdaf8c9e4bcfc67c95f78eaaff90b4ffd73e42fcc4b789cfab5ce3eacfae023dbf4c3943bf19df8354b289c7737da85f793b3beb908864c25ef0d33114e6bb876ddb7b8db8308913ecd1ad40530de631aaa0e384d5fec8b797d7b4fed7de64225f9921eb7d9db65d4c562a2128208824f0063f39bc9a312dc0218b7877e09a038d8010000000000000000a6cf98ffc8a41234fc75e98fdbdeff08f98fa02bbf35fd31ec8f22097b954afea32180f17ef9facb975f7ed9f21fafafdfbe8de43fa4e21f42f98fb9fbba7957fee2f6b7f8652e94efe64f54fa05131097fdfc8b1abf685f6cfbfc0dd9b6dc4ba35fba29b971fde23dd14df9138d8eec8f923f316ac52ff8cd820087f9133d6d397f61613ff49bec7cc96ff5b81fe63f0c5a81b37e8367dd9592ffe2d1831fe54f8cede44f9e267fe2b4fd8ffc854b0221f47bf4a106f90f57bf570bbeb3ff91ff70fb23f0cfe0277fe2e677d67bfb5df54fe3f7b22f7e67bd7bfec3230012e53fac6b084efddac52e76faf043b5c441591fffde6d5941f1bc7b367a215f47c5595f9d2a5a5af20fb7224a1b34b95b2e7a9c4540b2d98723f37777ff359f28ec918b803c6efb965cfc916fc82feec29240e8dbf49e1a32c5d8e73f763538d8c30afcf21f5b328bfc0700000000000000c0a7e5b02d5edfac987fa8f16e7ef9025a421022a707ab0210852cc478016900a23e7d2196bf583f8abfb778fea22500f17ef9faf5975ffef99f6ef98baf5fbfceaf6f6fdf06f217897dea8b5f74e62fee1984bdbfdd9df1571670118b40f4e43f04db523be76f88f5e6f5cddfb84c7e7ed9a6e0bef91f92f99326bf7c47747bfec229ffe19abf309b85709cff50d31ee62f4c263194fd163bcffc8f9c5f5b7f9cbf5038d89d13e52f9ce77f90fff864fee0fd9f7ffec2a11194fc87b3fe39fce43fbcf31f5e7e67bdb7df55ff14f98bced35822f6d5efa87f8afc854300e391bf98a2de725bfd1435999be9771f673aed352bc99d775dac169b7170da379fc0102ea4eaacaf4e152d6de1075b71167938507774a5574730c23bbdbd6da27d0662e89acfa13e28e1f5f5e64f19915796b37c3ef1cbaa4fabf1c85f4ccefaa5846bfec13180010000000000000000e0cad298ef70726c9fbff012abe53f5ae21f22f98f8afc45398c6192ff38b8b74cfea3f8bdc5f31fd90048e1a6bbf91bf7e4c4cb58fe63ba44e2be2bc77df98f7b6b66cdc21bfd0df90f99f6b8eef91f42dd793df90fc9dec4e6f91b936c676c5ffe44ae35d2397fd2ea17efc86ef22bf483d7fb57b96a5bec69fe44b929b7e457efc43ff4ab2f9df91f79bf5500c4277f7292fff00880247e537b9a7f31d6933ff1f5eff31fbe7ef7fc87a7df39ffe1b6fcc06faf277ff21c7ee70004cbeffd631a22fecf9a3f790430bc9e7c4fa09f1cc217a17ef299c0b13bf368103948f5fb4fd856903fef5ac85ea8ccbf383eeda45c45dd59df380c2353455b577ae901c9472eaad47d4df1a1be2e01f2f6366d2ed11c444d02e4b590ff10bfe47950877dfe6357cef5439ff445a0b7b62f254c2d2f0b00000000000000000059d6ce78f7fc855d01b96080fcd9c9a6f88590bf2980b1bfeb70015114a13a7821e33f8c0254e62fda857b73f1d2e9fbe57a167abee72ffe70b9cc2fa3f98b28fe700b6034957f6760fec6e574d5edfe96fc85c8048eaefc8560736257fe42b037b2277f219aff68ce5fc806303af31f6eeb97ee88ee99ffe195ff30e8463fcf7fe836c516fdbaf693fc85c1248623bffec633ff23efd77ed61de72f1c0218e43f5cf5def98ff7e7f25beb9f287fe1edff94f98ff767f13be72fbcfd9f37ffe1acf7f6bbea9fc4ef9d40f0d73b1d7a9663dfd7afb37d00233cf567937928eaadd30f53f6bca3650d85f3aef96e7ff942aa4efb2a16517bd657632f7a5af1d31a961ef7206e900963bce5fede54771220e33f4860bcbebd150660885cf43a0b60dcf21759bf803c574ba6a8d06f1685881f07075ec93f000000000000000000f851dfa0afa6b6ce7f64b3103f5cfee33400b2bfa7c4e9f04200a4eecee3fe7d1e22fadee2f98ffc008e42fee4f2f377e65feef98f3ffce1b63943f98fe992d3372ea03fff315d3ce76f4c8f004aa737e76f1e4032e84efcb5f90bc9f9233df98f67c89ff8f95df31f9f3a7fa21fc138f25ff4f55ef33fcef21ffa93180efdea1bcffc8f825ff9597792ff304abf043c5ffec4d29ee63f3e59fee43df21beb9f2a7fe2d187bacf7f78fa9df31f5ecb7f92fc87b79ffc89670082e5933ff1b03ffcce7a9f43df76ecb5cd5ec4fa7d6bb9bd3eaec0a094cafc875619a5f3aee51a448ba83bedab5744c359e7f2667436d9f7a510e2024ed217d375fcc5128048e5dd575d2afc5b14e2ad1c00e9b4873c621e45ccf21f715dabfffab19d39aec0c6562881fc0700000000000000007c5a82fc83a3dbd49fcf22289c13bd7de3da1484a0ff247e3145e6cd2f50c03e7f71dd82eabb0efb0fc2083af98bac357bfdf4fdf51fdfd9f217ef7fb83296bf28c43f1aabefce5f4c977d00a46ffcc758fee2d2b7e692bf6503a45a33fbf21772cd917df90bb9de4cf7fc498fdf357f21db94dcec176e896ef46b77e21ffa0d0218077e4dfb5f568a7edda57f88f91f8a0ffb13cfff500c21fc25a590ffd0b067c9e63fccece43f76f907fb04449cbff8ccf98fefefabbdfdd6fa27f23be72f9ec16fae7f9efc875f0ff8a6f7f14f9bdf45ffa997ffc9f31fefe1c3efabb79f7f119e7bd34e1b9ce80b5dee76fa52057a25e4ce3b1a851f16fde9791fc5222a4ffbaa6d45eb69f7b48adc9483ba9ef7de5efc82bf98c038c83f8c5c7539f72fc108ddfcc5dae07f9cbf48fcd5e3aefbeb4a9e19d6010ce65f0000000000000000007c621e910027f573e43f5e54e67f9c653fc25d173d257c98ffc8c63f84f21f612aa1f139259eff08ec8af98f9c39b9801cfa5fffb0309aff904880f4e73fa6680047df65fbeefcc7368063280332f7e63f96deccc1568179ef6fb82025d31a1afb1df2277dfe67c89fb8f9259ba2bbe77f38e54f947bf14ffcea498023bf41fca462fe876e4f70c96f222ffaadec87f33f4c9ab153bf6600a4c26f1c00c9e74facece44f9cf32749fee333e74ffcf31fe66db8cef98ff0f70f9fe5effcd67af227cf943ff11c3f33fa571d7af5de7e57fdd3f8474ee88cd81f7e6bf74e7fedaa365f7f78eeedd6d36deb8f4efde53afd351320c99947c3f4c55438ef785082700d55e75df58a6838edabb217eda7dde312a236ffe59f5102e41e40d86987a200597f3e00f27acf7f9402205dfab08cc3fcc716bf28f887ec31bb554705ece75fd86430e2f88703e43f000000000000000000bc08e631b8b87fecfcc57902e3714be1d3c1a7f98bf80e72e7a31ff18ba66795803fca5f64ed1af98b447d70fdb47cfabfb380a104c640fe62549df38f04405ad557faf317bb00488ffaca6b77fe42a63d709e3be76f48752776e73fa4ba133f70fe4342fff1f21fbadde8b5f33f7cf21ffa9df835f90f3dfb81df26fe7136ffc327ff6118c038f01bd8b3f98f9bdbaa13bc90ff30b293ff70ce7fbca77e437bec77ce7fccb377fec3bc1136ce7fd837c13e8ddfa307fa89fc2e3de0cfe31ffcbdb6dbbffecbc51f2cdfe9e9b7fdf3336ebfb3ff3d79f69bfaf7010873ffeedcdbb5a77abe8e01d18b1c1ce99712e6af11867ac3f4c3543cef186bb56aa83cefaab5138da77d85cbe8ebc3dffbd726fb7cfae1c62d7f900600866200db53e2207d719f7fa198bfb8d6915d7a5dfe62d41db38f1a04052c9fd9bcccbf000000000000000000801f9b6b837c2910a0ee3e0924587955f31f270190f016d2feb6f88760fe63b980dafab08af8c34040e3936ad47f9485a8bade315040770c632cff911b00d2f60d46f21fd3651a515fd9e71f9af3278f044abbfaa68ff217cdf993ef05f499f3fe96ab6232cd99fdf91399f648e7fccb48fe645cdeeb17ec47eff02f1de12abda94f9e3f51cf211cfa0d5210077e9314c4d9fc0fed86e893fc89b2fd78fe88babce0b74c0114f2276ef33fc89fd8ea33f913db2eccd86fdd841a7e348f8e971bf3dfdf57fbaddfbe09789fffb0ef417fcfacdfcdefd383fd347ea71ef458eff5f263f9f86dfdefb9579f9dff3d77f0f1d24f5f970a4cd217a9fe1681310a5f64f5d71db04b80549d774c0a92d4579e7752d98ae6d3be490debc085f046b9a1076f0fd1700a2193ffc80630eee237ad00c6993f8c5fe80dc0380d8094fc02eeb3ca8287c105f21f00000000000000000060ceb539fe99f2175a7f92e73807f140fe6c74619df9cd963d1d3e07f33f2aef22e47fb4e39be73ff669803970d75c70187b00227774e5f6fdf2c73ffddbfffce98fef712983f98b9cb9e9a2f150fe62ba8ca8137ff3065cc20920cdead4df96bf58da03c7aed2f7e72f649a23bbe76f082520fafd32ada1bd7ea9ced491f9235ef34f14bbd12bfcaaadf8a77ee54efcbaf91f7a1dd135f33f34fbb1cb7e9b08c459fe43d77e96ffd0b63fe3fc0fc961473dfee587bc977f798b61a4cfe43f4cc730c4efbf2ec63df0b1dfbe0735fa84abdfa30737e3b7d467f21fb64db8f8f17be9b3f1a74fb5fde147f86df5efbe0f7f7cf2cbd89f9c7bdbfc26098cfca93fb304468b5ea188caf38efef98bb4889132fafbf0d3fc45d8661fa71f16ca0184bed3ee55f98b7b0d6f070188d1cb4ecf90bf9896f0cbeb3eef101570fd9459f062ab8bfc030000000000000000008035c7f3206cb41615b8e53fcae6dc2d84cfcacf19db2162fee5c265ebe32ae19f43027770b1a578dd65f0b2c81cb3fbde972f5fbf7ce7eabffced7649462cff9171d7df732cff31624efded1b70b98cb8137f63fe231800d2a3cef8dbae454af4e58ee63f1cf3272243303e74fe64d8deeb576b87af9effe1963fd14d419cf9b573081f60fe876a14a0e8370a809ce44f94ed07f33f8c3ae1f2f913bb36f88cff629902c8f86ddb109df589dfba0934af77f31b2740f2f9974fe34f7eff7816bf5d13f273fa6df489df78f94fe0df7ffc2c0fbfd74f9f67f1dbe89d1ffef4ec93a93f73f26bf36ba72ff2fa5c0444ab8ae2a93f9b04c8c199c7520044f049517fde735780cc33b3a31f7f2da0ffd1188f4064f31ffb2110d32e017290bfe83feb5e93ffb8167190ff18d1af54e73fde36a75202e335cadc0405a8f82a20ff010000000000000000009f0ed3d045ec350d60542630fccc4b0043cf5d756bb96b02b76b533ef98ff941e3833a7c51648e08dcc5fc874cfee23407f17ef9e397972f5f6ef33f2ebfff79fefdcf7fcefa7b0a38369f3096bf88edcdf78ee65f34fbb70046ef95d891fcc11a00e9548ffbef7f9b7c443f327f643883f05fdff19c3f32e4bfc9ddf21f9ef90bcd66f80f33ff43a915ffc4af9e4278f2f91feacd6065bf4d2f5ac16fd60997f7dbf5e165fd866d80477e037dd66fda0459d47bf92df5f9f79f76fa83f51be97df7ff89fd16fa675cbfd94f9ee7f0279ffa4cfea3a79f8d3ffddc27da7e677ff6ec939d3f7ff26bf36b47300ae7de1e6edd0446630042f6f1a84c2024e107992a1af30ffb02ba6b180b405c9f068fe765fe36712bfe74cb40640210bda79de724ff900d222c62a509148df98bc43fa00ea9cc5f343fdb442a9b5eddc21700000000000000000000f099b08c7e948c46f98f960088f86581e2da96cfc57ec102e630ff51b7b352d745d60b73ad8faac085997947e056cf7f9c244076f33ffe38bffd79fea358fe632801b2ebffeff2f7bb6ffe91f91bdfb9f4ab33fee63f84b7c44fbad402fe7b4b74affb967f18c87f8cc65ffefe9de1f927037b2f913ff19a7fa2d48bff11e67f68a6203ec4fc0fc57eac33bf763bd8917fb4e567d06fd20a57f45b2cfec06f633ff52bdbcff237ea7aeffc4dfefd9799fe207f61a22fbdffb4d21faedf44efbbff85df3f9ec46fd203eda93ff17bafdffbf0f7c3fbd97e57ffc9d1473b795c3afb64e32fb765af7ac5f4c5b17e8a3218f23b71d6949ea43f241f91964efc247c3156435f0c202aa0bd068904c4a17f1fbe58b9271012f3c859e7abfb3c7f11c42f7203304639cf7f64fcc3d6845dfa65fddcae007967555dccbf00000000000000000000f81418a42d0ada4ce4403f7fd190c0d0759fd7217b5562de7def6c6dd3cbe3df92fefb55a9d67d15b92c135e16ab71cbe52f9200467859ee20fff1f707fd059c5d907c7ffde39ffeed7ffe749ffff136bffdf16d4ef31fbd1b30722d7470fec6f5afd00d5d0b1eca1f4ce3cd5183fecbe845f031ff58fc6430ffb04d5fe9d42ffebf8734e73f469b20fad77f1198be92d038ff435adf32ff43a525a8ce2fdaffd2e897e97ce9f6abda4ffdba8b3ff3abdbebf21f9a8d704f9b3ff19d7f62d6047d967fd1d69fcc7f51d69ff9b5f5e5f79fbe7ebbe5fbeeffb3fbf55f7ecfed9ff47bc00ffdfa3de8852f38fbcdf4aefef2d9874fe13f38f962e03f6c8a36d29f6effbdf35ecb7ef8de3f0d3f48d551d5087fcf9e24e187e1229adbf0d3f0434f0da32980a484ea1ab203285acbcf95b17c2a0d3fac62a500c4cd5d9f7f7813130734e42fde54b217612199cfbc3ac62f00000000000000000000007e685ea224c6ed73aac18fcd7c639f8730ca7f4ce177b7cd7f64b6fba40241fff5aa54ebc64a5d92da2ec9d5b805f31fc965c9c07d90ffd8df48ca1d5d100dfdd7ab61f3db9b5cfe632401323a7f63ca5e85edf5b7e73f467bd386fd837d00a3fed12e04117faffcbffe6bcc7fb94ca33d18a3f33fc65b40bafd220d289dfe91e61301bf92bdd2afb5f83abfa2bd257fa2d38c563b7fc427ffa26dafcdbf68d92be7afe8e96bf22f8a76f7fccbc1fb2f0bfd81df64f9e7ebd7d59f37a06bebcff6dfdbefd5016eb3011fc0efd5026fb1fe9ae5abfef0f1f51f9e7ed0f71f9ffdf8d1fd671dd94fa2574a9d9ff6a3cf31f2f6d35f3dd2f0854019abbbee17cf4cf8a2b786fe1042a684a61aa402182735a459807b0823320f9ef38d4ac8c61fc2f917917fc8bdafa125ff21a2dd730f5a9cf915c4e785ddf21f0e660000000000000000000000037ce67e2cea8af1174ae5addfdd23ffb1fbeea705885e979977bae931ea237d20a6cd2f793d6a7eb82b11f0efaec6b53ea48357c62aaf891e5cfb1bf0d75f8d3dbaf6287025b6eb1b3c0a18d08f99bbfd62ad007d7e497bfffc13217db35f58dfe8bf9a45f56dfefbd2657b611aedb2ab6ff04b1d70fafc4af6d6f9233ef9133dfb479a7fe2923f51b657e74f94eccf9d3f316841aeea8174f21be86bd6afa9af59bfaefef9fd5e0df0362f3fd7d7dfd9ef9ffafec32f5bacdfd35fb9fd6ad14f5fff795fb0ee1baf27d0bbf9ab9ac1e7000dfb79f4f97ccc6cbfbc31f82e51445f23be400d12f987ee1adede06a21fe765dc3e1b661f76eacc048c117bae86d3fcc59b4600e2c01ee52fa4cd21e9b6efd7afe9060000000000000000000080cf4610ffb077d7e63f740320f73cc2710044cbbdf98f0b10f3dfae85edb735dedce54be1ae4b5f0d6c7d48a52f86b67f8711ffa1baf2726bb75fe27afcad8021fb90badf2f66eff30beafbf32f22f6fefc8b90de7efec9985ff2a16ff7af7627bfd021a7d3af61ff78f34f5cf22f6af60f30ffc439ffa26baff7ebd8abf3376a7af70e6c577d9d5f53ffd9fdc75f577ff67f0cbfe21fe13fb985eeb1b7daaf974070f4d7fcf6bfeab53200957e8d373e1f40afe6af6d45d7f1d777c2cf3b44e5edbf780854d19e0248f49d350c4620b235d456122720facff9756c4694c0e83ce17652c43e7d119ac304c8b0395fc349fe422d0631dfff16c749fe43c7fd209979f2c87f68ab0100000000000000000000e03371ebf3dfe72fc22faea10425f72298ed078064f21787085e129b13ddfdcae0b15fa480ed4adcf9a65e1f99c747e31705f797219b1f50c9fc47f29d55f31767098cf7cbef7ffdf2e5f7bfbe9f94329affe8bcfba85fc83e983f19d77fdcfc87504b4cf7fa65f41f2e7f22f5baebf34bdbfbf2279205f4cc3f915cfe07997fa2957ea95cbfd2e22bfd5af64abf9ebecaaf67aff22bdaa78ad79fb6deb501fcf91be0d5f5aeebaf6f8057f39fdd4473035a5ab07f507fc5add40aa8fced5bf1674fd34f5f0dbf9fbeba215ae96d5ff5a917057f531bbcb87f28ff2025effcb567a08a91044252c05648652d5102a2a3fca3324ee5fb04c418e512ae8df77133fe3e002175ba37f5c70330a209181a518065146ac61ee72f14e461159904865dfc22c73d7fe16106000000000000000000000050462be2716ebdc51fd2fcc5f2e5973581a2e17ec42f8cf32769fe63fd4c3104227545f27e19f0b1aadb7f6fd765f3055cbf20704934bc0adabca3b2f993e83baf977c8fae3c4bcdff48bff1e5afbf7ff9fdafbf5ffd977ffdf29d5f45f31f528d311f3b7f32de94f211f327def34f240320cef9939ed7bfdce6f7f8c59ef95dfef201cfc47f70c035f08bdb9b7efec9db9bfc4a7ad7f927cd3da0f2f197a6fc8bac7d6acdbf88ebeb5e7e6af6b6fc8d8efee903008afaa6a79f8efee3f87502083537533cf8341d7dbdfc4a1bd0fcc34f5edff8c3d749afe16fea0697d6b736a3cbfe006eefc37fbcfd91cb5f34ea333534d7339080980fa8fa06bb04c4d039879e1276098c2ef969152772d111148512a2f117d37e02868839ac61cada2d07602c85cc99211856f18f8560dbf77e03370000000000000000000000c067e0d6863f1f4ff9508a8654e72f14d22971fce2340022f617e1a6d476bb2e77ea1728e0710d72cb75dcfe77774d36d9fd1bc27f8eaffdf1949bff917ce3aafcc740fee2b82fe53affe3f765fec765fef2e5d75fbffc50f90fa9a698c1fcc9a87e2c7f326c1fcb9f48e807f22702fa8fe9977aeef5f92b5a6e14fdc5036ea7befb2fe10ae97de79f74b6e1c9d9ddba105bfde28b6ff26bd8970a9afcb2766fbdf39f806f1d3fa3a1ff087ecd0040d5ed7c9f7d6a057c38bffc0884dadb2af8bb7ef6c9eadb7ff67be985fdedbde0820f40571fbc98be2f0330079cfce1892a797fec3d43ddddc30444bbfc3081511980901802d15542988018919fd570e0964f40cc995a1ee32f22b77a00623e0c6028dad712e20486e3008c87dede0d0000000000000000000000009a388dff58bc61202273ab1785f2b6604955fe637a196aff8fc8e53f4ee21f32f98fed1268e2bf7f755b6dc6ff6ddc1f5cff5d1fd0bb2fbd1efd28e4fef1b7e9db3731f95e5795fff8f66dd05fbef2be9bff317ff9f5cb974cfe63d05fdbfd5064c83f6cbff947f327832d39dd7e11fb77fd987f50dfef97d10ffa87f5fdf9335fbfcc93afd7bfda65bae13aed22ebef68c812b43737618ae7107ce32f9d3da8b25db0ed7667bd98bda9000d7b835f4defdd80dfa477f3eb4d2068f3ff5001849e97bfb0de3180f04103105205bcf92510a6b517bfed3e621bb036c3b7de6fefefada63b83301768fa2603118892bfa184d104c4480922118883026a0218ed4ffa7c116dcf05bd19144b390715d82630c20c86993c28c17100c68defab4efc56eeb812d21f0000000000000000000000003f1ef7f113b6ce256770d3c78984f0562f0aa5b5e72fc40680cca9adc63fd0ff1ecb13ddee6a70493f9abfc82730167ffe0eb7dccd8d6fe3fee295f79afcc7b8bf7ce1fffd359aff91c97f7c1bc93f04fadebb0ffa07eda3fe61bd44fe64c43ee497d0bbfb3f6efec5d95fd1f354c5d8dfe21db5f7e42f24032083fa41fb60fa65d8deb17c49fbd4be7e597bab5f78f153e79fa0176ec16ef5cbd93f5603fc8fe9afbfb1f3b34f2980d0eef779f1070508e91d0300377d472fb69c5f22803066ef6a069f33f4ea7bba8373feb612c67ab20bfeea12462308657f4d0922118483f041650262c47eab60f7ab4f5509ba8df827db601103283d14b6232822cc0310d7553fc1008cd06fed06000000000000000000000000f8717904120a37500b802cfa5cfe22bd9d0c89ed7611f62cfe311cbfd8e4896dbd0cbd5bbc7cfe23bcf4fc12ea922bf1490102f98f7c5bd2cb6db2ca49fee3661fcedf941a1f42ffeb975f33f33f24fcd5cd27396e7ac7fcc9e8fa87167f2fa07ffe87443b9844fe65403f967f91188131f4f2ff31fc1f347f34fcda5bf523f34f9cf4c556b366ffa07ec8de193e12b3bb4f5f698fdf88da3b0a90d7778d7f91b1bb37e0774ebf91d47fa4ed17df80de979f90de3580700b40340f9f14f48f0420040a180b40acffea9c40261b80e8b4f7b526e70ae80b6074e9cbd90313fbd43e7c2167ef964f8ff4437b0952edf091a5ae06d566fcb37d785bf4935e3b7ef1b1b00b41a415bcd9c9b325b82530eec538ca97fc87871a000000000000000000000000408d5936e250c14b98e9d80712723796e4669b02d7f51ae861fc42d69e895f9cf8a5d21fdb85dfc4bfdea0a097f1efaeb8ef0a486f2befcff51cdc1edced33f9fc8748f8a4aa27aa347f4429fc52cb33c44f9a5be072fadebb0bc47f46f442f357faef3f0dbe02f00ffa05f2276eeb8ffaac8cf5719b57af7fd43ef4e8bff7e985eca3c35f2486cf78dac7f227e3f69efd97d67b4e00e8f7cbe807b65f44dff397e005fd5d7f895e6e0386030002fe8ebbedfc03657477c6ce11fd76b100429f5d3480d02c1f09200c9420d0917d340042df7eafe0a16a2841ab1bbd721b34bbd14f1f0afd46fc831256b77d0062b61c80912bc1230191ea0de5610dbd3fe3000000000000000000000000000032cc611c439f7bfc23d027f90b4d7b285bec69015ac5a4b2b509a0a8171b3e52913fb9f258b7b03f6c78d8fbb337bf163049cd3e99d2a6b8557f7c2fa1f849a925afb478e9028e5a6e0cfcfdfa7bfbb74801bdf71ddf80fec5e39728e063fb45ec6e8f7fe1c057cffb883e6c72ebf577e63f64ec536ffe432e8032ac1fb2f7c43f04ed9d7e317bdfc32fa8efc91f080620baf20f7205bcf5cc5f90f5f7e42fa412204201047bbd480063a81d3b2ea0b984c1aee4d4df54834402a2bf048986f04700a3f5c9a0d18d5ebf0d6abdf0550f856a277e5ac03305300ceca51ac20118daf66c092430dc22187293ca00000000000000000000000000e029301eff11114722948945732e7eb1dd58d67dbbe0db92ffd0d4bf6cfafb57f3f10f617b3e7eb263a7174f9fcc917e3a6886918a5f4c514b5cb8f8c30bf052fe794a5d67eed56f33fee4a08071ff400bbc5cfea4efbe9fdd2f5180b77f2881f104fb2f61eff5bfbf8ff9c7ecfdf187bdbdbf8011ffb87dc42f611ff08bd8fbf20762f671ff987deacc1f4825107af30742fef100c074f4eeb24a3f1c00a808f92ae8051210e201044b7d6904439b5d2680d05c82503bf6666a2cc1240051aa41af15bdeaa1d06d843fabc0a011fea004ab36fc7c09b61184b8028700c433242096edf74c40dcf44e6e00000000000000000000000000801f8cd92afa51d047f10b0b59f889b990ff9814823981ebd42fbf15b12bed42518c9f24f993a33e9c2d7e225740515fbc87a4ff218b176f927f894d875a85024e167ae417d3f7dcf187c8bfe0ffd07e217d9f7f60fec5dede59c050fc63d83eecaf39ca9ff8070a18b677e71f64ecbdf31f227daf7d20ff203284e36dc43f963adbf402018021bd4c00a1dfdfab1f4e608c0710529afd03fa4202a2c53eda167cf775d4b0d8c5da92db4a50e945af7e28f43ae1637dae04e53efc935d304901944b304b01642b30ce204415b8242062bfad3d2861720c60dc1318443000000000000000000000000000003e3ef3d6f6efa34ff30f9abae4bbcf9902b44ad84c3bfb7caf2b45327e31452b2d34c1e8e53f76f19393562405ffa2aad2af25c8cf3fb93ff815fa5b05e2f34fb67f57dd49ce7fbcd022def913d9000afe66c40e017d7eb91f04ddfef1fcc5b47ff53716309abf08ec3dfee1fcc75023fa48fe20b677fe09fe21fd907d307f301c00916bc0efbabb4047aa805fc0de5782403feefe5d4ecffc8721fd500242247f901d0161a6dfca68af41ba19bba9049d56f0da12de141be157ef4109da1184c81f956012802846a30c3300996783d1da8b357cea00c4cdef605f4b90cb7a010000000000000000000000000000b8e115fdb8b38f5ff816b0460f4ced737e0288862bd3d2bcb6e0e8573017e21f61179262fee5b1cf893d6ac452c9bf6c8f73a6f928bdb552fe250e9f64ff0aef568178fea5217cb2e45f44fdad77921e00f3b1fca2cfc0aef50b1e023ad72f760cecf50be9bb123857bf40fe637a74f9f9f84b87f91346f30f91bd75f9320da1bd76996edc6ebb7400a1f9be42edb863bb2f266f2e417af58d35087623779520db0dddbc0df2cdd82d252835c25756a0da867f5a827e0ae0e891b0ca20646a98edeca512ac131039bd9d3d2ec1297ff124010c121800000000000000000000000000000083cc6ec98b7d014e655cdb0f0cb21787fe340032a9e43f322b5bdb7f0c0228f7f849aefb68ed81d22c602ec62fe23e3015ff7ccb19c5deac7fad403cff51df07b8f8e50a38d6e52b90f737dc41f801e8f20b26a05afde2af802ebf60019fdcdff7f88bc65f5afd622d9127c7ba2c72dda8a7c75a557d975d4c7ffe83e6c03faeef2d414e5ff9e356cddf3fff4148df51824a237843095a9de055dba0db849f29211a01a1b6fae31aee45984510f23558062032259827109cf55109ee01080ffb56839f1c0000000000000000000000000000004000df00ca3c07b903177f92ffb02f605f814afaa4ecceec80c61ea4f98badfb6c69c0d12ce0bac6827edffea35441d19d761fad7ed1012c75ea5d012afe9adb2afa2b6fadf6f857cba50b6859bedaf3bff2b63facbf6dffc5f33f4d7e41f9baf8a601041a13002aef20ea3f3bd82aeb3b1218aaf317acf5cd2328141ab16b7fee6af90b35648bb09cff9029423903902f612be22e576e452fd5b006200c3ae18ffcfaf64209ce010c9704c44e6f6e0f8b600404000000000000000000000000000000c007c631fe31ad8329fc4228731cbfb0f77b55f0683f528f7f1c4620ee3750ce9f1c55b0dd4a2f8052b6ef6ea75540853a2c40563ed5f741ebaffff8766a4fc03afdb3f8c5f5b51104e5f59fdeec07f557eefee297ee855ded957e617deda167f52b74025797a0b7f967c7fdd5afd1865dfdc36752d1974b488a50ed422fd5f028c269fec352845100a158c175fe8549237a41ef1f803092676b701e01e19b4060040400000000000000000000000000000000402faef9932080e2e4dfc52f1cecb3570561fb994900e6a0f951397eb2c84f0671681670b0f4079afb7fe69e74d75fd384adfdf057fabd966fe42fdfc6d96ff3f42bdfc4c47f70138ba3cfd18dd4f435cffdcdafd2077d7cdc0bfd06faa3a3aff1fc8778f8966a177aa184e0c7af7e13fc5c7c13a0987e894a286d845d04a1a4b7b1178a70094038eb1f55f8c90100000000000000000000000000000000e023e39affb815e017ff98aedd577e0994b5fbcc238012f4debd9815506a01b508c0dc4dd9de4fdde6f7d09f514f36fe9279e7b7d2275f565fff813f7c051af9b7221eaf41e3c73f467b034ef4eaeb3f980164e13f5bbefee3efbefe930ad49ffe274f01fd9f7ee504e2e237f833fc477eab290005ff64da839f16e0100170d68755f88e800000000000000000000000000000000000000068c7357f322df1078f1cceaef9d52d7e32ab37ff06da42fba9510107ddb7160514f59fc35fd69b3cfe077a93029cfd877a7dffb1dea4fddfd77f5cc06473003edc00037fb908ebf700defeb808bff740eb13d049bf16e1aa0700000000000000000000000000000000000080563cf31f56ddbf45f7bdfbd2cdecd0fd9be9007e82ee63a3029cbbaff3fa6bfbb9ab7f36f217670058c59f7cd75fb29bed7fb1062b7ba90a6b7f52844b018f22dcf400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f081f8fff52ce1a9"
//			}
//		}
//	}
//);


