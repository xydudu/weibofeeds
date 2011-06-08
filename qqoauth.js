//xydudu
var qq = exports.qq = (function() {

    var 
    OAuth = require('./lib/oauth.js').OAuth,
    http= require('http'),
    https= require('https'),
    URL= require('url');

    var 
    appkey = '25beed9822d64933b19daeeb557129ed', 
    secret = 'f80966785e60a37cf4cf63f0a2c63c25';

    function createRequest( $url, $method, $callback ) {

        var 
        callback = $callback,
        method = $method,
        parsedUrl= URL.parse( $url, false );

        if( parsedUrl.protocol == "http:" && !parsedUrl.port ) parsedUrl.port= 80;
        if( parsedUrl.protocol == "https:" && !parsedUrl.port ) parsedUrl.port= 443;
        
        var path, headers;

        if( !parsedUrl.pathname  || parsedUrl.pathname == "" ) 
            parsedUrl.pathname ="/";
        if( parsedUrl.query ) 
            path= parsedUrl.pathname + "?"+ parsedUrl.query ;
        else 
            path= parsedUrl.pathname;

        var request;
        if( parsedUrl.protocol == "https:" ) {
            request = createClient(parsedUrl.port, parsedUrl.hostname, method, path, headers, true);
        } else {
            request = createClient(parsedUrl.port, parsedUrl.hostname, method, path, headers);
        }

        if( callback ) {
            var data = ""; 

            request.on('response', function (response) {
                response.setEncoding('utf8');

                response.on('data', function (chunk) {
                    data+=chunk;
                });

                response.on('end', function () {
                    if( response.statusCode != 200 ) {
                        // Follow 302 redirects with Location HTTP header
                        callback({ statusCode: response.statusCode, data: data }, data, response);
                    } else {
                        callback(null, data, response);
                    }
                });
            });

            request.on("error", callback);

            if( (method == "POST" || method =="PUT") && post_body != null && post_body != "" ) {
                request.write(post_body);
            }
            request.end();

        } else {
            if( (method == "POST" || method =="PUT") && post_body != null && post_body != "" ) {
                request.write(post_body);
            }
            return request;
        }


    }
    
    function createClient( port, hostname, method, path, headers, sslEnabled ) {
        var options = {
            host: hostname,
            port: port,
            path: path,
            method: method,
            headers: headers
        };
        var httpModel;
        if( sslEnabled ) {
            httpModel= https;
        } else {
            httpModel= http;
        }
        return httpModel.request(options);     
    }

    function stringToObj($str) {
        // ss=1&aa=2&df=3
        var 
        obj = {},
        item,
        arr = $str.split('&'); 
        
        while (arr.length) {
            item = arr.shift().split('=');
            obj[item[0]] = item[1];
        };
        
        return obj;
    }

    return {
        
        //get request_token
        getRequestToken: function($callbackurl, $fn) {
            
            var 
            url = 'https://open.t.qq.com/cgi-bin/request_token',
            options = {
                oauth_callback: $callbackurl,
                oauth_consumer_key: appkey,
                oauth_nonce: OAuth.nonce(32),
                oauth_signature: '',
                oauth_signature_method: 'HMAC-SHA1',
                oauth_timestamp: OAuth.timestamp(),
                oauth_version: '1.0'
            },
            message = {
                method: 'GET',
                action: url,
                parameters: OAuth.SignatureMethod.normalizeParameters(options) 
            };
            
                         
            OAuth.SignatureMethod.sign(message, {'consumerSecret': secret, 'tokenSecret': ''});
            options.oauth_signature = message.parameters.oauth_signature; 
            
            //console.log(options);
            url += '?';
            options.oauth_callback = OAuth.percentEncode($callbackurl);
            for(var key in options) {
                url += key +'='+ options[key] +'&'; 
            }
            //console.log(url);
            createRequest(url, 'GET', function($statusCode, $data, $response) {
                //console.log($response);
                if ($data) {
                    $fn(stringToObj($data));
                }
            
            });
            
        },
        getAccessToken: function($oauth_token, $oauth_verifier, $session, $fn) {
            
            var
            url = 'https://open.t.qq.com/cgi-bin/access_token',
            options = {
                oauth_consumer_key: appkey,
                oauth_token: $oauth_token,
                oauth_signature_method: 'HMAC-SHA1',
                oauth_signature: '',
                oauth_timestamp: OAuth.timestamp(),
                oauth_nonce: OAuth.nonce(32),
                oauth_verifier: $oauth_verifier,
                oauth_version: '1.0'
            },
            message = {
                method: 'GET',
                action: url,
                parameters: OAuth.SignatureMethod.normalizeParameters(options) 
            };
            
            OAuth.SignatureMethod.sign(message, {'consumerSecret': secret, 'tokenSecret': $session.oauth_token_secret});
            options.oauth_signature = message.parameters.oauth_signature; 
            
            url += '?';
            for(var key in options) {
                url += key +'='+ options[key] +'&'; 
            }
            //console.log(url);

            createRequest(url, 'GET', function($statusCode, $data, $response) {
                //console.log($response);
                if ($data) {
                    $fn(stringToObj($data));
                }
            
            });

             
        },

        homeTimeline: function($access_token, $access_token_secret, $fn) {
            
            var
            url = 'http://open.t.qq.com/api/statuses/home_timeline',
            options = {
                oauth_consumer_key: appkey,
                oauth_token: $access_token, 
                oauth_signature_method: 'HMAC-SHA1',
                oauth_signature: '',
                oauth_timestamp: OAuth.timestamp(),
                oauth_nonce: OAuth.nonce(32),
                oauth_version: '1.0',
                format: 'json',
                pageflag: 0,
                reqnum: 30,
                pagetime: 0
            },
            message = {
                method: 'GET',
                action: url,
                parameters: OAuth.SignatureMethod.normalizeParameters(options) 
            }

            OAuth.SignatureMethod.sign(message, {'consumerSecret': secret, 'tokenSecret': $access_token_secret});
            options.oauth_signature = message.parameters.oauth_signature; 
            
            url += '?';
            for(var key in options) {
                url += key +'='+ options[key] +'&'; 
            }
            //url += 'format=json&pageflag=0&reqnum=30&pagetime=0';
            
            console.log(url);
            createRequest(url, 'GET', function($statusCode, $data, $response) {
                //console.log($response);
                if ($data) {
                    $fn($data);
                }
            
            });

            
        },
        goOAuth: function() {
             
        }

    };


})();
