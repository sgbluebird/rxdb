'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Crypter = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

exports.create = create;

var _objectPath = require('object-path');

var _objectPath2 = _interopRequireDefault(_objectPath);

var _clone = require('clone');

var _clone2 = _interopRequireDefault(_clone);

var _util = require('./util');

var util = _interopRequireWildcard(_util);

var _RxError = require('./RxError');

var _RxError2 = _interopRequireDefault(_RxError);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * handle the en/decryption of documents-data
 */

var Crypter = exports.Crypter = function () {
    function Crypter(password, schema) {
        (0, _classCallCheck3['default'])(this, Crypter);

        this._password = password;
        this._schema = schema;
    }

    /**
     * encrypt and stringify data
     * @overwritten by plugin (optional)
     * @param  {any} value
     * @return {string}
     */


    (0, _createClass3['default'])(Crypter, [{
        key: '_encryptValue',
        value: function _encryptValue(value) {
            throw _RxError2['default'].pluginMissing('encryption');
        }

        /**
         * decrypt and json-parse an encrypted value
         * @overwritten by plugin (optional)
         * @param  {string} encValue
         * @return {any}
         */

    }, {
        key: '_decryptValue',
        value: function _decryptValue(encValue) {
            throw _RxError2['default'].pluginMissing('encryption');
        }
    }, {
        key: 'encrypt',
        value: function encrypt(obj) {
            var _this = this;

            obj = (0, _clone2['default'])(obj);
            if (!this._password) return obj;
            Object.keys(this._schema.encryptedPaths).map(function (path) {
                var value = _objectPath2['default'].get(obj, path);
                var encrypted = _this._encryptValue(value);
                _objectPath2['default'].set(obj, path, encrypted);
            });
            return obj;
        }
    }, {
        key: 'decrypt',
        value: function decrypt(obj) {
            var _this2 = this;

            obj = (0, _clone2['default'])(obj);
            if (!this._password) return obj;

            Object.keys(this._schema.encryptedPaths).map(function (path) {
                var value = _objectPath2['default'].get(obj, path);
                var decrypted = _this2._decryptValue(value);
                _objectPath2['default'].set(obj, path, decrypted);
            });
            return obj;
        }
    }]);
    return Crypter;
}();

function create(password, schema) {
    return new Crypter(password, schema);
}

exports['default'] = {
    create: create,
    Crypter: Crypter
};
