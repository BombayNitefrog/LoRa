/**
Values can be written in bulk

{
    "write1": 22,
    "write2": 1,
    "write3": 2,
    "write4": 700,
    "write5": 2,
    "write6": 500
}
write1 = Room Setpoint
write1 = Heating deadzone
write1 = Cooling deadzone
write1 = CO2 setpoint
write1 = Temp P-band
write1 = CO2 P-band


or as single register and value
{
    "register": 501,
    "value": 1
}

https://www.senticon.co.uk/docs-ds?id=8
*/


/**
 * Decode uplink function
 * 
 * @param {object} input
 * @param {number[]} input.bytes Byte array containing the uplink payload, e.g. [255, 230, 255, 0]
 * @param {number} input.fPort Uplink fPort.
 * @param {Record<string, string>} input.variables Object containing the configured device variables.
 * 
 * @returns {{data: object}} Object representing the decoded payload.
 */
var bytes;


function twoBytes(byte1) {
  return (bytes[byte1] << 8) | (bytes[byte1 + 1])
}


function decodeUplink(input) {
  bytes = input.bytes;
  var decoded = {};
  var value = 0;

  decoded.read1 = twoBytes(2);
  decoded.read2 = twoBytes(4);
  decoded.read3 = twoBytes(6);
  decoded.read4 = twoBytes(8);
  decoded.read5 = twoBytes(10);
  decoded.read6 = twoBytes(12);
  decoded.read7 = twoBytes(14);
  decoded.read8 = twoBytes(16);
  decoded.read9 = twoBytes(18);
  decoded.read10 = twoBytes(20);
  decoded.read11 = twoBytes(22);
  decoded.read12 = twoBytes(24);



  return {
    data: decoded
  };
}

/**
 * Encode downlink function.
 * 
 * @param {object} input
 * @param {object} input.data Object representing the payload that must be encoded.
 * @param {Record<string, string>} input.variables Object containing the configured device variables.
 * 
 * @returns {{bytes: number[]}} Byte array containing the downlink payload.
 */
function encodeDownlink(input) {

  let bytes = [0x3E, 0x44, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x23];
  let value = 0
  
  // Write standard
  if(input.data?.write1) {
    value = Math.round(input.data.write1 * 10);
    bytes[2] = (value >> 8) & 0xFF;
    bytes[3] = value & 0xFF;
    value = Math.round(input.data.write2 * 10);
    bytes[4] = (value >> 8) & 0xFF;
    bytes[5] = value & 0xFF;
    value = Math.round(input.data.write3 * 10);
    bytes[6] = (value >> 8) & 0xFF;
    bytes[7] = value & 0xFF;
    value = Math.round(input.data.write4 * 10);
    bytes[8] = (value >> 8) & 0xFF;
    bytes[9] = value & 0xFF;
    value = Math.round(input.data.write5 * 10);
    bytes[10] = (value >> 8) & 0xFF;
    bytes[11] = value & 0xFF;
    value = Math.round(input.data.write6 * 10);
    bytes[12] = (value >> 8) & 0xFF;
    bytes[13] = value & 0xFF;
  }
  // Write single
  if(input.data?.value) {
    const header = ">P";
    const regHex = Number(input.data.register).toString(16).toUpperCase().padStart(4, "0");
    const valHex = Number(input.data.value * 10).toString(16).toUpperCase().padStart(8, "0");
    const footer = "#";
    const str = header + regHex + valHex + footer;
    bytes = Array.from(Buffer.from(str, "ascii"));
  }
  return {
    bytes: bytes
  };
}
