const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const CONFIGURATIONS = require("../config");

// CONSTANT VARIABLES
// const algorithm = "aes-256-cbc";
// const key = "i8y4ryc3yboliyeb6tb7436b98YT6Tb7tbi7x7b77T777r8347783502npxuln4r";

// let encrypt = function (text) {
//   const iv = crypto.randomBytes(16);
//   let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
//   let encrypted = cipher.update(text);
//   encrypted = Buffer.concat([encrypted, cipher.final()]);
//   return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
// };

// let decrypt = function (text) {
//   let iv = Buffer.from(text.iv, "hex");
//   let encryptedText = Buffer.from(text.encryptedData, "hex");
//   let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
//   let decrypted = decipher.update(encryptedText);
//   decrypted = Buffer.concat([decrypted, decipher.final()]);
//   return decrypted.toString();
// };

const setView = function (file_name, is_sendfile = false) {
  let file_dir = path.join(__dirname, "views", file_name + ".html");
  if (fs.existsSync(file_dir)) {
    return is_sendfile ? file_dir : file_name;
  } else return "404";
};

const Base64 = {
  // private property
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  // public method for encoding
  encode: function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = Base64._utf8_encode(input);

    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output =
        output +
        this._keyStr.charAt(enc1) +
        this._keyStr.charAt(enc2) +
        this._keyStr.charAt(enc3) +
        this._keyStr.charAt(enc4);
    }

    return output;
  },

  // public method for decoding
  decode: function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {
      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }

    output = Base64._utf8_decode(output);

    return output;
  },

  // private method for UTF-8 encoding
  _utf8_encode: function (string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  },

  // private method for UTF-8 decoding
  _utf8_decode: function (utftext) {
    var string = "";
    var i = 0;
    var c = (c1 = c2 = 0);

    while (i < utftext.length) {
      c = utftext.charCodeAt(i);

      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(
          ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
        );
        i += 3;
      }
    }

    return string;
  },
};

const getClientIp = function (req) {
  return (
    (req.headers["x-forwarded-for"] || "").split(",").shift().trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null)
  );
};

const errHandler = function (err) {
  console.trace(err);
  return res.json({
    error: true,
    msg: "Server side error occurred! Please try again and ensure you do right thing.",
  });
};

const hashPassword = function (password) {
  return bcrypt.hashSync(
    crypto.createHash("sha256").update(password).digest("base64"),
    10
  );
};

const verifyPassword = function (password, hash) {
  if (!(password && hash)) return false;
  return bcrypt.compareSync(
    crypto.createHash("sha256").update(password).digest("base64"),
    hash,
    10
  );
};

const randomString = function (length = 32) {
  let character_set =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let random_string = "";
  for (let i = 0; i < length; i++) {
    const random_poz = Math.floor(Math.random() * character_set.length);
    random_string += character_set.substring(random_poz, random_poz + 1);
  }
  return random_string;
};

const randomNumbers = function (length) {
  return Math.floor(
    Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
  );
};

const getCurrentTime = function () {
  return Math.round(Date.now() / 1000);
};

const pickData = function (obj, only_fields) {
  let data = {};
  only_fields.forEach((key) => {
    if (obj[key]) data[key] = obj[key];
  });
  return data;
};

const greetingText = function () {
  const now = new Date();
  const currentHour = now.getHours();
  if (currentHour >= 12 && currentHour <= 17) return "Good Afternoon";
  else if (currentHour > 17) return "Good Evening";
  return "Good Morning";
};

const config = function (location) {
  let current_path = CONFIGURATIONS;

  const paths = location.split(".");
  if (!(paths.length > 0)) return "";
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i].toUpperCase();
    if (!(path && current_path[path])) {
      current_path = "";
      break;
    }
    current_path = current_path[path];
  }
  return current_path;
};

const convertSecondsToDays = function (seconds, to_whole_number = false) {
  let days = seconds / (60 * 60 * 24);
  if (to_whole_number) {
    return Math.round(days);
  } else {
    return days;
  }
};

const convertDateToSeconds = function (date) {
  let new_date = new Date(date);
  return new_date.getTime() / 1000;
};

const convertSecondsToDate = function (seconds) {
  return new Date(seconds * 1000).toISOString().substr(0, 19);
};

const formatAmount = function (amount, symbol = "") {
  return symbol + amount.toLocaleString("en-US", { maximumFractionDigits: 2 });
};

const getSavingsProgressRate = function (plan) {
  const current_time = getCurrentTime();
  if (plan.type == "SAFELOCK") {
    if (plan.maturity_date >= current_time) {
      let lock_duration = plan.maturity_date - plan.start_date;
      let time_reach = lock_duration - (plan.maturity_date - current_time);
      return (100 * (time_reach / lock_duration)).toFixed(2);
    } else {
      return 100;
    }
  } else if (plan.type == "TARGET") {
    if (plan.target_amount >= plan.reach_amount) {
      return (100 * (plan.reach_amount / plan.target_amount)).toFixed(2);
    } else {
      return 100;
    }
  }
  return 0;
};

const subString = function (string, from, length = null) {
  if (length == null) return string.substr(0, from);
  return string.substr(from, length);
};

const ucFirst = function (str) {
  return String(str).charAt(0).toUpperCase() + String(str).slice(1);
};

const getPercentage = function (reach, total) {
  return Math.round((reach / total) * 100);
};
const randomIntFromInterval = function (min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const downloadResource = (res, fileName, fields, data) => {
  const json2csv = new Parser({ fields });
  const csv = json2csv.parse(data);
  res.header('Content-Type', 'text/csv');
  res.attachment(fileName);
  return res.send(csv);
}

module.exports = {
  setView,
  Base64,
  getClientIp,
  errHandler,
  hashPassword,
  verifyPassword,
  randomString,
  randomNumbers,
  getCurrentTime,
  pickData,
  greetingText,
  config,
  convertSecondsToDays,
  convertDateToSeconds,
  formatAmount,
  getSavingsProgressRate,
  convertSecondsToDate,
  subString,
  ucFirst,
  getPercentage,
  randomIntFromInterval,
  downloadResource
};
