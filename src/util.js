/**
 * this contains a mapping to basic dependencies
 * which should be easy to change
 */


import clone from 'clone';
import randomToken from 'random-token';

// rxjs cherry-pick
import {
    Observable
} from 'rxjs/Observable';
import {
    Subject
} from 'rxjs/Subject';
import {
    BehaviorSubject
} from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/defer';

import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/publish';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/distinct';

export const Rx = {
    Observable,
    Subject,
    BehaviorSubject
};


/**
 * check if the given module is a leveldown-adapter
 * throws if not
 */
export function isLevelDown(adapter) {
    if (!adapter ||
        typeof adapter.super_ !== 'function' ||
        typeof adapter.destroy !== 'function')
        throw new Error('given leveldown is no valid adapter');
}


/**
 * this is a very fast hashing but its unsecure
 * @link http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
 * @param  {object} obj
 * @return {number} a number as hash-result
 */
export function fastUnsecureHash(obj) {
    if (typeof obj !== 'string') obj = JSON.stringify(obj);
    let hash = 0,
        i, chr, len;
    if (obj.length === 0) return hash;
    for (i = 0, len = obj.length; i < len; i++) {
        chr = obj.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    if (hash < 0) hash = hash * -1;
    return hash;
}


/**
 *  spark-md5 is used here
 *  because pouchdb uses the same
 *  and build-size could be reduced by 9kb
 */
const Md5 = require('spark-md5');
export function hash(obj) {
    const salt = 'dW8a]Qsà<<>0lW6{3Fqxp3IdößBh:Fot';
    let msg = obj;
    if (typeof obj !== 'string') msg = JSON.stringify(obj);
    return Md5.hash(msg);
}



/**
 * generate a new _id as db-primary-key
 * @return {string}
 */
export function generate_id() {
    return randomToken(10) + ':' + new Date().getTime();
}


/**
 * [promiseWait description]
 * @param  {Number}  [ms=0]
 * @return {Promise}
 */
export async function promiseWait(ms = 0) {
    return new Promise(res => setTimeout(res, ms));
}

export async function requestIdlePromise(timeout = null) {
    if (
        typeof window === 'object' &&
        window.requestIdleCallback
    ) {
        return new Promise(
            res => window.requestIdleCallback(res, {
                timeout
            })
        );
    } else
        return new Promise(res => setTimeout(res, 0));
}


/**
 * uppercase first char
 * @param  {string} str
 * @return {string} Str
 */
export function ucfirst(str) {
    str += '';
    const f = str.charAt(0)
        .toUpperCase();
    return f + str.substr(1);
}


/**
 * @link https://de.wikipedia.org/wiki/Base58
 * this does not start with the numbers to generate valid variable-names
 */
const base58Chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789';
const base58Length = base58Chars.length;

/**
 * transform a number to a string by using only base58 chars
 * @link https://github.com/matthewmueller/number-to-letter/blob/master/index.js
 * @param {number} nr                                       | 10000000
 * @return {string} the string-representation of the number | '2oMX'
 */
export function numberToLetter(nr) {
    const digits = [];
    do {
        const v = nr % base58Length;
        digits.push(v);
        nr = Math.floor(nr / base58Length);
    } while (nr-- > 0);

    return digits
        .reverse()
        .map(d => base58Chars[d])
        .join('');
}

/**
 * removes trailing and ending dots from the string
 * @param  {string} str
 * @return {string} str without wrapping dots
 */
export function trimDots(str) {
    // start
    while (str.charAt(0) == '.')
        str = str.substr(1);

    // end
    while (str.slice(-1) == '.')
        str = str.slice(0, -1);

    return str;
}

/**
 * validates that a given string is ok to be used with couchdb-collection-names
 * @link https://wiki.apache.org/couchdb/HTTP_database_API
 * @param  {string} name
 * @throws  {Error}
 * @return {boolean} true
 */
export function validateCouchDBString(name) {
    if (
        typeof name != 'string' ||
        name.length == 0
    ) throw new TypeError('given name is no string or empty');


    // do not check, if foldername is given
    if (name.includes('/'))
        return true;


    const regStr = '^[a-z][a-z0-9]*$';
    const reg = new RegExp(regStr);
    if (!name.match(reg)) {
        throw new Error(`
            collection- and database-names must match the regex:
            - regex: ${regStr}
            - given: ${name}
            - info: if your database-name specifies a folder, the name must contain the slash-char '/'
    `);
    }

    return true;
}

/**
 * deep-sort an object so its attributes are in lexical order.
 * Also sorts the arrays inside of the object if no-array-sort not set
 * @param  {Object} obj unsorted
 * @param  {?boolean} noArraysort
 * @return {Object} sorted
 */
export function sortObject(obj, noArraySort = false) {
    if (!obj) return obj; // do not sort null, false or undefined

    // array
    if (!noArraySort && Array.isArray(obj)) {
        return obj
            .sort((a, b) => {
                if (typeof a === 'string' && typeof b === 'string')
                    return a.localeCompare(b);

                if (typeof a === 'object') return 1;
                else return -1;
            })
            .map(i => sortObject(i));
    }

    // object
    if (typeof obj === 'object') {

        if (obj instanceof RegExp)
            return obj;

        const out = {};
        Object.keys(obj)
            .sort((a, b) => a.localeCompare(b))
            .forEach(key => {
                out[key] = sortObject(obj[key]);
            });
        return out;
    }

    // everything else
    return obj;
}


/**
 * used to JSON.stringify() objects that contain a regex
 * @link https://stackoverflow.com/a/33416684 thank you Fabian Jakobs!
 */
export function stringifyFilter(key, value) {
    if (value instanceof RegExp)
        return value.toString();
    return value;
}


/**
 * get the correct function-name for pouchdb-replication
 * @param {object} pouch - instance of pouchdb
 * @return {function}
 */
export function pouchReplicationFunction(pouch, {
    pull = true,
    push = true
}) {
    if (pull && push) return pouch.sync.bind(pouch);
    if (!pull && push) return pouch.replicate.to.bind(pouch);
    if (pull && !push) return pouch.replicate.from.bind(pouch);
    if (!pull && !push)
        throw new Error('replication-direction must either be push or pull or both. But not none.');
}

/**
 * get a random string which can be used with couchdb
 * @link http://stackoverflow.com/a/1349426/3443137
 * @param {number} [length=10] length
 * @return {string}
 */
export function randomCouchString(length = 10) {
    let text = '';
    const possible = 'abcdefghijklmnopqrstuvwxyz';

    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

/**
 * shuffle the given array
 * @param  {Array<any>} arr
 * @return {Array<any>}
 */
export function shuffleArray(arr) {
    return arr.sort(() => (Math.random() - 0.5));
};
