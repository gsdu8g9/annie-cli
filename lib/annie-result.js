var prop = require("propertize");

/**
 * @constructor
 */
function AnnieResult() {
    prop.readonly(this, "response", null);
    prop.internal(this, "onResponse", []);

    prop.readonly(this, "error", null);
    prop.internal(this, "onError", []);
}

/**
 * Create a response receiver.  This receiver can be used as a callback to the
 * HttpRequest.send method.  When the receiver is called, the result will be
 * populated and trigger any additional waiting callbacks.
 * @returns {function}
 */
AnnieResult.prototype.receiver = function() {
    var result = this;
    return function(err, res) {
        var fn;
        if (err) while (fn = result.onError.shift()) fn(err);
        else while (fn = result.onResponse.shift()) fn(res);
    };
};

/**
 * Set a callback to run once response is available.
 * @param {function} handleResponse
 */
AnnieResult.prototype.ready = function(handleResponse) {
    var result = this;

    // trigger callback on next cycle if a response is already available
    if (this.response)
        setTimeout(function() {
            handleResponse.call(result, result.response);
        });
    
    // otherwise, add to the response callbacks
    else this.onResponse.push(handleResponse);
};

/**
 * Set a callback to run upon error.
 * @param {function} fail
 */
AnnieResult.prototype.failure = function(fail) {
    var result = this;
    
    // trigger callback on next cycle if an error is already available
    if (this.error)
        setTimeout(function() {
            fail.call(result, result.error);
        });
    
    // otherwise, add to the error callbacks
    else this.onError.push(fail);
};

/** export AnnieResult class */
module.exports = AnnieResult;
