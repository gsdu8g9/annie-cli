Annie Command Line HTTP Client
==============================
The **annie-cli** package provides the `annie` CLI script.  This script can be
used to make an HTTP request or series of requests and parse the responses.  The
goal is to be a competitor to cURL, offering a better interface for web
developers who prefer to work with HTTP methods and terms instead of quirky cURL
arguments.

This should be of special use to developers working with REST services.  `annie`
maps much more closely to the way RESTful services are documented, developed,
and used than does `curl`.  Fans of shell scripting should also find they can
easily work with complex REST applications.

Basic Usage
-----------

    Usage: annie [OPTS] [METHOD] URL
    
    Make an HTTP request and display the result.  METHOD can be any valid HTTP
    method or anything that *looks* like a valid HTTP method.  The default is
    GET.
    
    The following OPTS are recognized
      -H --head=HEADER      Send a request header
      -D --data=DATA        Send request body data; with -j DATA can be in form
                            foo:bar or {"foo":"bar"}; with -f DATA can be
                            foo=bar&baz=boo; else DATA is unparsed and sent raw
      -j --json             Enable JSON data (q.v., -D)
      -f --form             Enable HTML form data (q.v., -D)
      -o --output=FORMAT    One of: auto,body,full,head,headers,stat,status
         --session[=FILE]   Maintain session (enables cookies, defaults to
                            /tmp/annie.session.$UID) [not implemented]

Usage Examples
--------------

### Make a GET request against a URL

Make a GET request to `http://example.com/` and display the response.  By
default, `annie` displays only the response body if one is present.

`$ annie http://example.com/`

```
{"status":"ok"}
```

### Specify the HTTP request method

Make a HEAD request to check the status and headers.  Since the response to a
HEAD request does not have a body, `annie` will display the status and headers.

`$ annie head http://example.com/`

```
HTTP/1.0 200 OK
Content-Type: application/json
Content-Length: 15
Etag: ad5cb2e79b8f789
```

### Send a request header

Make a conditional GET using the *If-None-Match* header and the resource *ETag*.

`$ annie http://example.com/ -HIf-None-Match:ad5cb2e79b8f789`

```
HTTP/1.0 304 Not Modified
```

### Send raw request data

PUT a new plain text document containing the text "foo" at the specified URL.

`$ annie put http://example.com/foo -HContent-Type:text/plain -Dfoo`

```
HTTP/1.0 201 Created
```

### Send JSON request data

The `--json` option sets the *Content-Type* header and enables JSON parsing of
any data arguments.  The following examples are equivalent.

`$ annie post $URL -HContent-Type:application/json -D'{"action":"add","id":23}'`

`$ annie post $URL --json -Daction:add -Did:23`

```
HTTP/1.0 303 See Other
Location: http://example.com/svc/23
```

### Send HTML form request data
The `--form` option sets the *Content-Type* header and enables form-encoded
parsing of any data arguments.  The following examples are equivalent.

`$ annie post $URL -HContent-Type:application/x-www-form-urlencoded -D'a=1&b=2'`

`$ annie post $URL --form -Da=1 -Db=2`

```
HTTP/1.0 303 See Other
Location: http://example.com/svc/23
```
