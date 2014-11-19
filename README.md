django-endpoint-test
====================

Node.js script for testing django API's

Example Usage
-------------

    var django_endpoint_test = require('./django_endpoint_test');

    var options = {
        login_uri: 'http://mysite/login/',
        username: 'test',
        password: 'test',    
        test_uri: 'http://mysite/path-to-endpoint/',
        test_method: 'POST',
        debug: true,
    };

    django_endpoint_test.test(options, function(ok, response){
        if (ok) {
            var json = JSON.parse(response.body);
            console.log(json.data['2']);
        }
        callback(ok, response);
    });
