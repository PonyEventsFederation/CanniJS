"use strict";

var fs = require("fs");
var Promise = require("bluebird");
var moment = require("moment");
var htmlEntities = require("html-entities");
var xmlEntities = htmlEntities.AllHtmlEntities;
var striptags = require('striptags');

module.exports = class Tools {

    constructor() {
        throw "Cannot construct singleton";
    }

    static getConfigValueByPath(config, path, defaultValue) {
        var pathParts = path.split(".");
        var currentConfig = JSON.parse(JSON.stringify(config));

        for (var i = 0; i < pathParts.length; i++) {
            var pathPart = pathParts[i];

            if (currentConfig[pathPart]) {
                currentConfig = currentConfig[pathPart];
            } else {
                return defaultValue || null;
            }
        }

        return currentConfig;
    }

    static getArrayDifferences(a, b) {
        var diff = [];

        for (var i = 0; i < b.length; i++) {
            var bval = b[i];
            var aval = a[i];

            if (bval instanceof Object) {
                for (var key in bval) {
                    if (aval instanceof Object) {
                        if (aval[key] != bval[key]) {
                            diff.push(bval);
                            break;
                        }
                    } else {
                        if (aval != bval[key]) {
                            diff.push(bval);
                            break;
                        }
                    }
                }
            } else {
                if (aval != bval) {
                    diff.push(bval);
                    break;
                }
            }
        }

        return diff;
    }

    static escapeForRegexp(str, delimiter) {
        if (!str) {
            return "";
        }

        str = str + "";
        return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
    }

    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    static loadCommentedConfigFile(path) {
        try {
            return this.parseCommentedJson(fs.readFileSync(path));
        } catch (e) {
            var Application = require('./Application.js');
            Application.log.error("Error loading JSON " + path);
        }
    }

    static parseCommentedJson(json) {
        return JSON.parse(this.minifyJson(json));
    }

    static minifyJson(json) {

        if (json instanceof Buffer) {
            json = json.toString();
        }

        try {
            if (JSON.parse(json)) {
                return json;
            }
        } catch (e) {

        }

        var tokenizer = /"|(\/\*)|(\*\/)|(\/\/)|\n|\r/g,
            in_string = false,
            in_multiline_comment = false,
            in_singleline_comment = false,
            tmp, tmp2, new_str = [], ns = 0, from = 0, lc, rc
        ;

        tokenizer.lastIndex = 0;

        while (tmp = tokenizer.exec(json)) {
            lc = RegExp.leftContext;
            rc = RegExp.rightContext;
            if (!in_multiline_comment && !in_singleline_comment) {
                tmp2 = lc.substring(from);
                if (!in_string) {
                    tmp2 = tmp2.replace(/(\n|\r|\s)*/g, "");
                }
                new_str[ns++] = tmp2;
            }
            from = tokenizer.lastIndex;

            if (tmp[0] == "\"" && !in_multiline_comment && !in_singleline_comment) {
                tmp2 = lc.match(/(\\)*$/);
                if (!in_string || !tmp2 || (tmp2[0].length % 2) == 0) {	// start of string with ", or unescaped " character found to end string
                    in_string = !in_string;
                }
                from--; // include " character in next catch
                rc = json.substring(from);
            } else if (tmp[0] == "/*" && !in_string && !in_multiline_comment && !in_singleline_comment) {
                in_multiline_comment = true;
            } else if (tmp[0] == "*/" && !in_string && in_multiline_comment && !in_singleline_comment) {
                in_multiline_comment = false;
            } else if (tmp[0] == "//" && !in_string && !in_multiline_comment && !in_singleline_comment) {
                in_singleline_comment = true;
            } else if ((tmp[0] == "\n" || tmp[0] == "\r") && !in_string && !in_multiline_comment && in_singleline_comment) {
                in_singleline_comment = false;
            } else if (!in_multiline_comment && !in_singleline_comment && !(/\n|\r|\s/.test(tmp[0]))) {
                new_str[ns++] = tmp[0];
            }
        }
        new_str[ns++] = rc;
        return new_str.join("");
    }

    static measureTime() {
        var start = new Date().getTime();

        return () => {
            var end = new Date().getTime();
            return end - start;
        }
    }

    static escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    static pad(str, width, padChar) {
        if (!padChar) {
            padChar = ' ';
        }
        const len = Math.max(0, width - String(str).length);
        return str + Array(len + 1).join(' ');
    }

    static padTime(num) {
        if (String(num).length == 2) {
            return String(num);
        }

        return '0' + String(num);
    }

    static isNumber(val) {
        return /^[\.0-9]+$/.test(String(val));
    }

    static formatDuration(duration) {
        var sec_num = parseInt(duration / 1000, 10); // don't forget the second param
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return hours + ':' + minutes + ':' + seconds;
    }

    static toPrecision(value, precision) {
        var precision = precision || 0,
            power = Math.pow(10, precision),
            absValue = Math.abs(Math.round(value * power)),
            result = (value < 0 ? '-' : '') + String(Math.floor(absValue / power));

        if (precision > 0) {
            var fraction = String(absValue % power),
                padding = new Array(Math.max(precision - fraction.length, 0) + 1).join('0');
            result += '.' + padding + fraction;
        }
        return result;
    }

    static isInDate(start, end) {
        if (end.unix() === -3600 || end.unix() === 0) {
            end = moment(new Date("INVALID DATE"));
        }
        if (start.unix() === -3600 || start.unix() === 0) {
            start = moment(new Date("INVALID DATE"));
        }

        if (start.isValid() && end.isValid()) {
            return start.isBefore() && end.isAfter();
        } else if (start.isValid()) {
            return start.isBefore();
        } else if (end.isValid()) {
            return end.isAfter();
        } else {
            return true;
        }
        return true;
    }

    static escapeForCDATA(val, keeptags) {
        if (!val) {
            return val;
        }

        if (typeof val !== "string") {
            val = val.toString();
        }

        val = xmlEntities.decode(val);

        if (keeptags === true) {
            return val;
        }

        return striptags(val, keeptags || []);
    }

    static parseReply(str) {
        var args = [].slice.call(arguments, 1), i = 0;

        try {
            return str.replace(/%s/g, () => args[0][i++])
        }
        catch (error) {
            return str.replace(/%s/g, () => args[i++])
        }
    }

    static getRandomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    static strContainsWord(str, word) {
        str = str.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, "");
        str = str.toLowerCase();
        let wrd = word.toLowerCase();
        let wrdArray = str.split(" ");

        for (var i = 0; i < wrdArray.length; i++) {
            if (wrd === wrdArray[i])
                return true;
        }

        return false;
    }
}
