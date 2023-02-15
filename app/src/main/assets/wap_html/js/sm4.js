var SM4 = {};

(function () {
    var SM4_ENCRYPT = 1
    var SM4_DECRYPT = 0

    function sm4_context() {
        this.mode = 0;
        this.sk = []
    }

    function GET_ULONG_BE(n, b, i) {
        return (b[i] << 24) | (b[i + 1] << 16) | (b[i + 2]) << 8 | (b[i + 3])
    }

    function PUT_ULONG_BE(n, b, i) {
        b[i] = n >>> 24
        b[i + 1] = n >>> 16
        b[i + 2] = n >>> 8
        b[i + 3] = n
    }

    function ROTL(x, n) {
        var a = (x & 0xFFFFFFFF) << n
        var b = x >>> (32 - n)

        return a | b
    }

    var SboxTable = [
        [0xd6, 0x90, 0xe9, 0xfe, 0xcc, 0xe1, 0x3d, 0xb7, 0x16, 0xb6, 0x14, 0xc2, 0x28, 0xfb, 0x2c, 0x05],
        [0x2b, 0x67, 0x9a, 0x76, 0x2a, 0xbe, 0x04, 0xc3, 0xaa, 0x44, 0x13, 0x26, 0x49, 0x86, 0x06, 0x99],
        [0x9c, 0x42, 0x50, 0xf4, 0x91, 0xef, 0x98, 0x7a, 0x33, 0x54, 0x0b, 0x43, 0xed, 0xcf, 0xac, 0x62],
        [0xe4, 0xb3, 0x1c, 0xa9, 0xc9, 0x08, 0xe8, 0x95, 0x80, 0xdf, 0x94, 0xfa, 0x75, 0x8f, 0x3f, 0xa6],
        [0x47, 0x07, 0xa7, 0xfc, 0xf3, 0x73, 0x17, 0xba, 0x83, 0x59, 0x3c, 0x19, 0xe6, 0x85, 0x4f, 0xa8],
        [0x68, 0x6b, 0x81, 0xb2, 0x71, 0x64, 0xda, 0x8b, 0xf8, 0xeb, 0x0f, 0x4b, 0x70, 0x56, 0x9d, 0x35],
        [0x1e, 0x24, 0x0e, 0x5e, 0x63, 0x58, 0xd1, 0xa2, 0x25, 0x22, 0x7c, 0x3b, 0x01, 0x21, 0x78, 0x87],
        [0xd4, 0x00, 0x46, 0x57, 0x9f, 0xd3, 0x27, 0x52, 0x4c, 0x36, 0x02, 0xe7, 0xa0, 0xc4, 0xc8, 0x9e],
        [0xea, 0xbf, 0x8a, 0xd2, 0x40, 0xc7, 0x38, 0xb5, 0xa3, 0xf7, 0xf2, 0xce, 0xf9, 0x61, 0x15, 0xa1],
        [0xe0, 0xae, 0x5d, 0xa4, 0x9b, 0x34, 0x1a, 0x55, 0xad, 0x93, 0x32, 0x30, 0xf5, 0x8c, 0xb1, 0xe3],
        [0x1d, 0xf6, 0xe2, 0x2e, 0x82, 0x66, 0xca, 0x60, 0xc0, 0x29, 0x23, 0xab, 0x0d, 0x53, 0x4e, 0x6f],
        [0xd5, 0xdb, 0x37, 0x45, 0xde, 0xfd, 0x8e, 0x2f, 0x03, 0xff, 0x6a, 0x72, 0x6d, 0x6c, 0x5b, 0x51],
        [0x8d, 0x1b, 0xaf, 0x92, 0xbb, 0xdd, 0xbc, 0x7f, 0x11, 0xd9, 0x5c, 0x41, 0x1f, 0x10, 0x5a, 0xd8],
        [0x0a, 0xc1, 0x31, 0x88, 0xa5, 0xcd, 0x7b, 0xbd, 0x2d, 0x74, 0xd0, 0x12, 0xb8, 0xe5, 0xb4, 0xb0],
        [0x89, 0x69, 0x97, 0x4a, 0x0c, 0x96, 0x77, 0x7e, 0x65, 0xb9, 0xf1, 0x09, 0xc5, 0x6e, 0xc6, 0x84],
        [0x18, 0xf0, 0x7d, 0xec, 0x3a, 0xdc, 0x4d, 0x20, 0x79, 0xee, 0x5f, 0x3e, 0xd7, 0xcb, 0x39, 0x48]
    ]

    var FK = [0xa3b1bac6, 0x56aa3350, 0x677d9197, 0xb27022dc];
    var CK = [
        0x00070e15, 0x1c232a31, 0x383f464d, 0x545b6269,
        0x70777e85, 0x8c939aa1, 0xa8afb6bd, 0xc4cbd2d9,
        0xe0e7eef5, 0xfc030a11, 0x181f262d, 0x343b4249,
        0x50575e65, 0x6c737a81, 0x888f969d, 0xa4abb2b9,
        0xc0c7ced5, 0xdce3eaf1, 0xf8ff060d, 0x141b2229,
        0x30373e45, 0x4c535a61, 0x686f767d, 0x848b9299,
        0xa0a7aeb5, 0xbcc3cad1, 0xd8dfe6ed, 0xf4fb0209,
        0x10171e25, 0x2c333a41, 0x484f565d, 0x646b7279
    ]

    function sm4Sbox(n) {
        var l = n >>> 4
        var r = n % 16
        return SboxTable[l][r]
    }

    function sm4Lt(ka) {
        var bb = 0;
        var c = 0;
        var a = new Uint8Array(4);
        var b = new Array(4);
        PUT_ULONG_BE(ka, a, 0)
        b[0] = sm4Sbox(a[0])
        b[1] = sm4Sbox(a[1])
        b[2] = sm4Sbox(a[2])
        b[3] = sm4Sbox(a[3])
        bb = GET_ULONG_BE(bb, b, 0)

        c = bb ^ (ROTL(bb, 2)) ^ (ROTL(bb, 10)) ^ (ROTL(bb, 18)) ^ (ROTL(bb, 24))
        return c;
    }

    function sm4F(x0, x1, x2, x3, rk) {
        return (x0 ^ sm4Lt(x1 ^ x2 ^ x3 ^ rk))
    }

    function sm4CalciRK(ka) {
        var bb = 0;
        var rk = 0;
        var a = new Uint8Array(4);
        var b = new Array(4);
        PUT_ULONG_BE(ka, a, 0)
        b[0] = sm4Sbox(a[0]);
        b[1] = sm4Sbox(a[1]);
        b[2] = sm4Sbox(a[2]);
        b[3] = sm4Sbox(a[3]);
        bb = GET_ULONG_BE(bb, b, 0)

        rk = bb ^ (ROTL(bb, 13)) ^ (ROTL(bb, 23))

        return rk;
    }

    function sm4_setkey(SK, key) {
        var MK = new Array(4);
        var k = new Array(36);
        var i = 0;
        MK[0] = GET_ULONG_BE(MK[0], key, 0);
        MK[1] = GET_ULONG_BE(MK[1], key, 4);
        MK[2] = GET_ULONG_BE(MK[2], key, 8);
        MK[3] = GET_ULONG_BE(MK[3], key, 12);

        k[0] = MK[0] ^ FK[0]
        k[1] = MK[1] ^ FK[1]
        k[2] = MK[2] ^ FK[2]
        k[3] = MK[3] ^ FK[3]

        for (; i < 32; i++) {
            k[i + 4] = k[i] ^ (sm4CalciRK(k[i + 1] ^ k[i + 2] ^ k[i + 3] ^ CK[i]))
            SK[i] = k[i + 4];
        }
    }

    function sm4_one_round(sk, input, output) {
        var i = 0;
        var ulbuf = new Array(36);

        ulbuf[0] = GET_ULONG_BE(ulbuf[0], input, 0)
        ulbuf[1] = GET_ULONG_BE(ulbuf[1], input, 4)
        ulbuf[2] = GET_ULONG_BE(ulbuf[2], input, 8)
        ulbuf[3] = GET_ULONG_BE(ulbuf[3], input, 12)
        while (i < 32) {
            ulbuf[i + 4] = sm4F(ulbuf[i], ulbuf[i + 1], ulbuf[i + 2], ulbuf[i + 3], sk[i]);
            i++;
        }

        PUT_ULONG_BE(ulbuf[35], output, 0);
        PUT_ULONG_BE(ulbuf[34], output, 4);
        PUT_ULONG_BE(ulbuf[33], output, 8);
        PUT_ULONG_BE(ulbuf[32], output, 12);
    }

    function sm4_setkey_enc(ctx, key) {
        ctx.mode = SM4_ENCRYPT;
        sm4_setkey(ctx.sk, key);
    }

    function sm4_setkey_dec(ctx, key) {
        var i, j;
        ctx.mode = SM4_ENCRYPT;
        sm4_setkey(ctx.sk, key);
        for (i = 0; i < 16; i++) {
            j = ctx.sk[31 - i]
            ctx.sk[31 - i] = ctx.sk[i]
            ctx.sk[i] = j
        }
    }

    function sm4_crypt_ecb(ctx, mode, length, input, output) {
        var index = 0;
        while (length > 0) {
            var oneInput = input.slice(index, index + 16)
            var oneOutput = new Uint8Array(16)
            sm4_one_round(ctx.sk, oneInput, oneOutput);

            for (var i = 0; i < 16; i++) {
                output[index + i] = oneOutput[i]
            }
            index += 16;
            length -= 16;
        }
    }

    function sm4_crypt_cbc(ctx, mode, length, iv, input, output) {
        var i;
        var temp = new Array(16);
        var index = 0;

        if (mode == SM4_ENCRYPT) {
            while (length > 0) {
                var oneInput = input.slice(index, index + 16)
                var oneOutput = new Array(16)
                for (i = 0; i < 16; i++) {
                    oneOutput[i] = oneInput[i] ^ iv[i]
                }

                sm4_one_round(ctx.sk, oneOutput, oneOutput);

                for (i = 0; i < 16; i++) {
                    iv[i] = oneOutput[i]
                    output[index + i] = oneOutput[i]
                }

                index += 16;
                length -= 16;
            }
        } else /* SM4_DECRYPT */ {
            while (length > 0) {
                var oneInput = input.slice(index, index + 16)
                var oneOutput = new Array(16)
                index += 16;
                for (i = 0; i < 16; i++) {
                    temp[i] = oneInput[i]
                }

                sm4_one_round(ctx.sk, oneInput, oneOutput);

                for (i = 0; i < 16; i++) {
                    oneOutput[i] = oneOutput[i] ^ iv[i]
                    output[index + i] = oneOutput[i]
                }

                for (i = 0; i < 16; i++) {
                    iv[i] = temp[i]
                }

                index += 16;
                length -= 16;
            }
        }
    }

    function strfix(str, len) {
        var length = len - str.length
        while (length-- > 0) {
            str = "0" + str
        }
        return str
    }

    function HEXStrXOR(str1, str2) {
        var buf1 = hex2Array(str1)
        var buf2 = hex2Array(str2)

        var result = ''
        for (var i = 0; i < 16; i++) {
            result +=  strfix((buf1[i] ^ buf2[i]).toString(16).toUpperCase(), 2)
        }

        return result
    }

    function hex2Array(str) {
        var len = str.length / 2,
            substr = '',
            result = new Array(len);
        for (var i = 0; i < len; i++) {
            substr = str.slice(2 * i, 2 * (i + 1))
            result[i] = parseInt(substr, 16) || 0
        }
        return result
    }

    

	stringToByteArray=function(str) {
		var bytes = new Array();
		var len, c;
		len = str.length;
		for(var i = 0; i < len; i++) {
			c = str.charCodeAt(i);
			if(c >= 0x010000 && c <= 0x10FFFF) {
				bytes.push(((c >> 18) & 0x07) | 0xF0);
				bytes.push(((c >> 12) & 0x3F) | 0x80);
				bytes.push(((c >> 6) & 0x3F) | 0x80);
				bytes.push((c & 0x3F) | 0x80);
			} else if(c >= 0x000800 && c <= 0x00FFFF) {
				bytes.push(((c >> 12) & 0x0F) | 0xE0);
				bytes.push(((c >> 6) & 0x3F) | 0x80);
				bytes.push((c & 0x3F) | 0x80);
			} else if(c >= 0x000080 && c <= 0x0007FF) {
				bytes.push(((c >> 6) & 0x1F) | 0xC0);
				bytes.push((c & 0x3F) | 0x80);
			} else {
				bytes.push(c & 0xFF);
			}
		}
		return bytes;
	}

	hexStringToByteArray=function(str) {
		var pos = 0;
		var len = str.length;
		if (len % 2 != 0) {
			return str;
		}
		len /= 2;
		var arrBytes = new Array();
		for (var i = 0; i < len; i++) {
			var s = str.substr(pos, 2);
			var v = parseInt(s, 16);
			arrBytes.push(v);
			pos += 2;
		}
		return arrBytes;
	}
	byteArrayToHexString=function(arr){
		var str = "";
		for(var i=0; i<arr.length; i++){
			var tmp = arr[i].toString(16);
			if(tmp.length == 1){
				tmp = "0" + tmp;
			}
			str += tmp;
		}
		return str;
	}
	byteArrayToString=function(arr) {
		if(typeof arr === 'string') {
			return arr;
		}
		var str = '',
			_arr = arr;
		for(var i = 0; i < _arr.length; i++) {
			var one = _arr[i].toString(2),
				v = one.match(/^1+?(?=0)/);
			if(v && one.length == 8) {
				var bytesLength = v[0].length;
				var store = _arr[i].toString(2).slice(7 - bytesLength);
				for(var st = 1; st < bytesLength; st++) {
					store += _arr[st + i].toString(2).slice(2);
				}
				str += String.fromCharCode(parseInt(store, 2));
				i += bytesLength - 1;
			} else {
				str += String.fromCharCode(_arr[i]);
			}
		}
		return str;
	}

	SM4CryptECBWithPKCS7Padding = function (data, sCryptFlag) {
		szSM4Key = "a43ba307eeee94084d6ebf794a06e62b";
        if (szSM4Key.length !== 32) {
            // console.log("传入密钥[" + szSM4Key + "]长度不为32位");
            return "";
        }
		var szData = null;
		if (sCryptFlag === SM4_ENCRYPT) {//加密
            szData = stringToByteArray(data);
        } else {//解密
            szData = hexStringToByteArray(data);
        }
		var len = szData.length;

		if (sCryptFlag === SM4_ENCRYPT) {//加密,进行填充PKCS7Padding
             var p = 16 - len % 16;
			 for(var i=0;i<p;i++){
			     szData.push(p);
			 }
        } 

        var ctx = new sm4_context()
        var lpbKey = hex2Array(szSM4Key)
        if (sCryptFlag === SM4_ENCRYPT) {
            sm4_setkey_enc(ctx, lpbKey); //加密
        } else {
            sm4_setkey_dec(ctx, lpbKey); //解密
        }
        var pbyCryptResult = new Array(szData.length)
        sm4_crypt_ecb(ctx, sCryptFlag, szData.length, szData, pbyCryptResult)
		if (sCryptFlag === SM4_DECRYPT) {//解密,去除填充PKCS7Padding
             var p = pbyCryptResult[pbyCryptResult.length-1];
			 for(var i=0;i<p;i++){
			     pbyCryptResult.pop();
			 }
        } 
		if (sCryptFlag === SM4_ENCRYPT) {//加密
		    return byteArrayToHexString(pbyCryptResult);
        } else {//解密
            return byteArrayToString(pbyCryptResult);
        }
    }

	/****************sm3*******************/
// 左补0到指定长度
function leftPad(str, totalLength) {
  var len = str.length;
  return Array(totalLength > len ? totalLength - len + 1 : 0).join(0) + str;
}

// 二进制转化为十六进制
function binary2hex(binary) {
  var binaryLength = 8;
  var hex = '';
  for (var i = 0; i < binary.length / binaryLength; i += 1) {
    hex += leftPad(parseInt(binary.substr(i * binaryLength, binaryLength), 2).toString(16), 2);
  }
  return hex;
}

// 十六进制转化为二进制
function hex2binary(hex) {
  var hexLength = 2;
  var binary = '';
  for (var i = 0; i < hex.length / hexLength; i += 1) {
    binary += leftPad(parseInt(hex.substr(i * hexLength, hexLength), 16).toString(2), 8);
  }
  return binary;
}

// 普通字符串转化为二进制
/*function str2binary(str) {
  var binary = '';
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = str[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var ch = _step.value;

      binary += leftPad(ch.codePointAt(0).toString(2), 8);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return binary;
}*/
function str2binary(str) {
  var array =  stringToByteArray(str);
  var binary = "";
  for(var i=0;i<array.length;i++){
     var tmp = array[i].toString(2);
	 if(tmp.length>8){
		tmp = tmp.substring(tmp.length-8);
	 }
	 else if(tmp.length<8){
		var len = tmp.length;
		for(var x=len;x<8;x++){
			tmp = '0' + tmp;
		}
	 }
	 binary += tmp;
  }
  return binary;
}

// 循环左移
function rol(str, n) {
  return str.substring(n % str.length) + str.substr(0, n % str.length);
}

// 二进制运算
function binaryCal(x, y, method) {
  var a = x || '';
  var b = y || '';
  var result = [];
  var prevResult = void 0;
  // for (let i = 0; i < a.length; i += 1) { // 小端
  for (var i = a.length - 1; i >= 0; i -= 1) {
    // 大端
    prevResult = method(a[i], b[i], prevResult);
    result[i] = prevResult[0];
  }
  // console.log(`x     :${x}\ny     :${y}\nresult:${result.join('')}\n`);
  return result.join('');
}

// 二进制异或运算
function xor(x, y) {
  return binaryCal(x, y, function (a, b) {
    return [a === b ? '0' : '1'];
  });
}

// 二进制与运算
function and(x, y) {
  return binaryCal(x, y, function (a, b) {
    return [a === '1' && b === '1' ? '1' : '0'];
  });
}

// 二进制或运算
function or(x, y) {
  return binaryCal(x, y, function (a, b) {
    return [a === '1' || b === '1' ? '1' : '0'];
  }); // a === '0' && b === '0' ? '0' : '1'
}

// 二进制与运算
function add(x, y) {
  var result = binaryCal(x, y, function (a, b, prevResult) {
    var carry = prevResult ? prevResult[1] : '0' || '0';
    if (a !== b) return [carry === '0' ? '1' : '0', carry]; // a,b不等时,carry不变，结果与carry相反
    // a,b相等时，结果等于原carry，新carry等于a
    return [carry, a];
  });
  // console.log('x: ' + x + '\ny: ' + y + '\n=  ' + result + '\n');
  return result;
}

// 二进制非运算
function not(x) {
  return binaryCal(x, undefined, function (a) {
    return [a === '1' ? '0' : '1'];
  });
}

function calMulti(method) {
  return function () {
    for (var _len = arguments.length, arr = Array(_len), _key = 0; _key < _len; _key++) {
      arr[_key] = arguments[_key];
    }

    return arr.reduce(function (prev, curr) {
      return method(prev, curr);
    });
  };
}

// function xorMulti(...arr) {
//   return arr.reduce((prev, curr) => xor(prev, curr));
// }

// 压缩函数中的置换函数 P1(X) = X xor (X <<< 9) xor (X <<< 17)
function P0(X) {
  return calMulti(xor)(X, rol(X, 9), rol(X, 17));
}

// 消息扩展中的置换函数 P1(X) = X xor (X <<< 15) xor (X <<< 23)
function P1(X) {
  return calMulti(xor)(X, rol(X, 15), rol(X, 23));
}

// 布尔函数，随j的变化取不同的表达式
function FF(X, Y, Z, j) {
  return j >= 0 && j <= 15 ? calMulti(xor)(X, Y, Z) : calMulti(or)(and(X, Y), and(X, Z), and(Y, Z));
}

// 布尔函数，随j的变化取不同的表达式
function GG(X, Y, Z, j) {
  return j >= 0 && j <= 15 ? calMulti(xor)(X, Y, Z) : or(and(X, Y), and(not(X), Z));
}

// 常量，随j的变化取不同的值
function T(j) {
  return j >= 0 && j <= 15 ? hex2binary('79cc4519') : hex2binary('7a879d8a');
}

// 压缩函数
function CF(V, Bi) {
  // 消息扩展
  var wordLength = 32;
  var W = [];
  var M = []; // W'

  // 将消息分组B划分为16个字W0， W1，…… ，W15 （字为长度为32的比特串）
  for (var i = 0; i < 16; i += 1) {
    W.push(Bi.substr(i * wordLength, wordLength));
  }

  // W[j] <- P1(W[j−16] xor W[j−9] xor (W[j−3] <<< 15)) xor (W[j−13] <<< 7) xor W[j−6]
  for (var j = 16; j < 68; j += 1) {
    W.push(calMulti(xor)(P1(calMulti(xor)(W[j - 16], W[j - 9], rol(W[j - 3], 15))), rol(W[j - 13], 7), W[j - 6]));
  }

  // W′[j] = W[j] xor W[j+4]
  for (var _j = 0; _j < 64; _j += 1) {
    M.push(xor(W[_j], W[_j + 4]));
  }

  // 压缩
  var wordRegister = []; // 字寄存器
  for (var _j2 = 0; _j2 < 8; _j2 += 1) {
    wordRegister.push(V.substr(_j2 * wordLength, wordLength));
  }

  var A = wordRegister[0];
  var B = wordRegister[1];
  var C = wordRegister[2];
  var D = wordRegister[3];
  var E = wordRegister[4];
  var F = wordRegister[5];
  var G = wordRegister[6];
  var H = wordRegister[7];

  // 中间变量
  var SS1 = void 0;
  var SS2 = void 0;
  var TT1 = void 0;
  var TT2 = void 0;
  for (var _j3 = 0; _j3 < 64; _j3 += 1) {
    SS1 = rol(calMulti(add)(rol(A, 12), E, rol(T(_j3), _j3)), 7);
    SS2 = xor(SS1, rol(A, 12));

    TT1 = calMulti(add)(FF(A, B, C, _j3), D, SS2, M[_j3]);
    TT2 = calMulti(add)(GG(E, F, G, _j3), H, SS1, W[_j3]);

    D = C;
    C = rol(B, 9);
    B = A;
    A = TT1;
    H = G;
    G = rol(F, 19);
    F = E;
    E = P0(TT2);
  }

  return xor(Array(A, B, C, D, E, F, G, H).join(''), V);
}

// sm3 hash算法 http://www.oscca.gov.cn/News/201012/News_1199.htm
sm3=function(str) {
  var binary = str2binary(str);
  // 填充
  var len = binary.length;
  // k是满足len + 1 + k = 448mod512的最小的非负整数
  var k = len % 512;
  // 如果 448 <= (512 % len) < 512，需要多补充 (len % 448) 比特'0'以满足总比特长度为512的倍数
  k = k >= 448 ? 512 - (k % 448) - 1: 448 - k - 1;
  var m = (binary + '1' + leftPad('', k) + leftPad(len.toString(2), 64)).toString(); // k个0

  // 迭代压缩
  var n = (len + k + 65) / 512;

  var V = hex2binary('7380166f4914b2b9172442d7da8a0600a96f30bc163138aae38dee4db0fb0e4e');
  for (var i = 0; i <= n - 1; i += 1) {
    var B = m.substr(512 * i, 512);
    V = CF(V, B);
  }
  return binary2hex(V);
}
})()
