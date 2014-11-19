var request = require("request");
var jar = request.jar();

function get_csrftoken(string) {
    var valuepairs = string.split(';');
    var arrayLength = valuepairs.length;
    for (var i = 0; i < arrayLength; i++) {
        var bits = valuepairs[i].split('=');
        if (bits[0] == 'csrftoken') {
            return bits[1];
        }
    }
    return "";
}

function retrieve_token(options, callback) {
    request({
        uri: options.login_uri,
        method: "GET",
        jar: jar
    }, function(error, response, body) {
        token = get_csrftoken(jar.getCookieString(options.login_uri));
        if (options.debug) {
            console.log('Getting token:', response.statusCode, token);
        }
        callback(token);
    });
}

function do_login(options, token, callback) {
    request({
        uri: options.login_uri,
        method: "POST",
        form: {
            username: options.username,
            password: options.password,
            csrfmiddlewaretoken : token
        },
        headers: {
            'X-CSRFToken' : token,
            'REFERER': options.login_uri,
        },
        jar: jar
    }, function(error, response, body) {
        token = get_csrftoken(jar.getCookieString(options.login_uri))
        if (options.debug) {
            console.log('Login response:', response.statusCode, token);
        }
        // Expect a 302 from a login request completion.
        var ok = (response.statusCode == 200 || response.statusCode == 302);
        callback(ok, response, token);
    });
}

function do_test(options, token, callback) {
    request({
        uri: options.test_uri,
        method: options.test_method,
        jar: jar,
        form: {
            csrfmiddlewaretoken : token,
        },
        headers: {
            'X-CSRFToken' : token,
            'REFERER':      options.test_uri,
            'Content-Type': 'text/json',
            'X-Requested-With': 'XMLHttpRequest',
        }                
    }, function(error, response, body) {
        if (options.debug) {
            console.log("Test Response:", error, response.statusCode, token);
        }
        callback(response.statusCode == 200, response);
    });
}

function django_endpoint_test(options, callback) {
    retrieve_token(options, function(token) {
        do_login(options, token, function(ok, response, token) {
            if (ok) {
                do_test(options, token, callback);
            }
            else {
                // Failed to login
                callback(false, response);
            }
        });
    });
}

module.exports.test = django_endpoint_test;

