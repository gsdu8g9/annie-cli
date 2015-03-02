var qs = require("querystring"),
    prop = require("propertize"),
    urlparse = require("url").parse,
    annie = require("annie-lib");

/**
 * @constructor
 */
function AnnieCliCommand() {
    prop.readonly(this, "method", "");
    prop.readonly(this, "url", "");
    prop.readonly(this, "data", "");
    prop.readonly(this, "data", null);
    prop.readonly(this, "headers", {});
    prop.readonly(this, "dataType", "");
}

/**
 * Create and return a new annie CLI command instance.
 * @returns {AnnieCliCommand}
 */
AnnieCliCommand.create = function() {
    return new AnnieCliCommand();
};

/**
 * @property {string}
 */
AnnieCliCommand.prototype.dataType = null;

/**
 * Execute this command and return the result.
 * @returns {annie.Result}
 */
AnnieCliCommand.prototype.execute = function() {
    var req = annie.createRequest(),
        url;

    if (this.method) req.method = this.method;
    if (!this.url) throw new Error("missing URL");
    url = urlparse(this.url);
    if (!url.hostname) throw new Error("URL must include hostname");
    else req.host = url.hostname;

    if (url.protocol) {
        if (!/^https?:$/.test(url.protocol))
            throw new Error("unsupported protocol " + url.protocol);
        else req.protocol = url.protocol;
    }
    
    if (url.auth) throw new Error("unsupported auth");
    if (url.port) req.port = url.port;
    if (url.pathname) req.path = url.pathname;
    if (url.query) req.query = url.query;

    if (this.dataType === "json") req.data = JSON.stringify(this.data);
    else if (this.dataType === "form") req.data = qs.stringify(this.data);
    else req.data = this.data;
    
    for (var header in this.headers)
        this.headers[header].forEach(function(value) {
            req.addHeader(header, value);
        });
    
    return req.send();
};

/**
 * Set the HTTP request method.
 * @param {string} method
 */
AnnieCliCommand.prototype.setMethod = function(method) {
    if (this.method) throw new Error("method already set");
    prop.readonly(this, "method", method);
};

/**
 * Set the request URL
 * @param {string} url
 */
AnnieCliCommand.prototype.setUrl = function(url) {
    if (this.url) throw new Error("url already set");
    prop.readonly(this, "url", url);
};

/**
 * Add an HTTP header.
 * @param {string} header
 */
AnnieCliCommand.prototype.addHeader = function(header) {
    var parts = header.split(":"),
        name = parts.shift();

    if (parts.length < 1) throw new Error("invalid argument");
    this.headers[name] = this.headers[name] || [];
    this.headers[name].push(parts.join(":"));
};

/**
 * Set the data type.  Possible values are "json" and "form".
 * @param {string} dataType
 */
AnnieCliCommand.prototype.setDataType = function(dataType) {
    if (dataType !== "json" && dataType !== "form")
        throw new Error("unrecognized data type " + dataType);

    if (this.dataType)
        throw new Error("data type already set to " + this.dataType);
    
    if (this.data)
        throw new Error("can't set type " + dataType + "; data already set");
    
    prop.readonly(this, "dataType", dataType);
};

/**
 * Set request data.
 * @param {string} data
 */
AnnieCliCommand.prototype.setData = function(data) {
    switch (this.dataType) {
        case "json": this.setJsonData(data); break;
        case "form": this.setFormData(data); break;
        default: prop.readonly(this, "data", data);
    }
};

/**
 * Set JSON request data.  Data can be a JSON object string or a JSON name:value
 * fragment.
 * @param {string} data
 */
AnnieCliCommand.prototype.setJsonData = function(data) {
    var k,v;
    
    // if data starts with string key, wrap in braces
    if (data.substr(0,1) === '"' || data.substr(0,1)  === "'")
        data = "{" + data + "}";
    
    // if data does not start with { or ", split key/val on :
    else if (data.substr(0,1) !== "{") {
        k = data.split(":", 2)[0];
        v = data.substr(k.length+1);

        // check for valid numeric value
        if (!isNaN(parseFloat(v)))
            v = parseFloat(v);

        // if val is not quoted, quote it
        else if (v.substr(0,1) !== '"' && v.substr(0,1) !== "'")
            v = JSON.stringify(v);

        // otherwise, it should be well-formatted JSON string
        else {
            try { JSON.parse(v); }
            catch (e) { throw new Error("malformed JSON string: " + v); }
        }

        data = "{" + JSON.stringify(k) + ":" + v + "}";
    }
    
    // merge in JSON values
    prop.readonly(this, "data", this.data || {});
    data = JSON.parse(data);
    for (k in data) {
        this.data[k] = data[k];
    }
};

/**
 * Set HTML form request data.  Data is expected to be form encoded such as in
 * a typical query string.
 * @param {string} data
 */
AnnieCliCommand.prototype.setFormData = function(data) {
    data = qs.parse(data);
    prop.readonly(this, "data", this.data || {});
    for (var name in data) this.data[name] = data[name];
};

/** export the AnnieCliCommand class */
module.exports = AnnieCliCommand;
