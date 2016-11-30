var http = require('http');
var https = require('https');
var net = require('net');
var url = require('url');

var LOCAL_PORT  = 8080;
var REMOTE_PORT = 443;
var REMOTE_HOST = "google.com";
const server = http.createServer( (c_req, c_res) => {
    console.log('Receiving Connection!!!');
    client_headers = c_req.headers;
    client_method = c_req.method;
    client_url = c_req.url;

    // Update proxy headers
    client_headers['host'] = REMOTE_HOST;

    // Proxy http request to Google
    options = {
        hostname: REMOTE_HOST,
        path: client_url,
        method: client_method,
        headers: client_headers
    };
    p_req = https.request( options, (p_res) => {
            console.log('Connecting to proxy');
            console.log('Proxy status code: ', p_res.statusCode);
            if ( p_res.statusCode == 301 || p_res.statusCode == 307 ){
                // Get new hostname
                options['hostname']  = p_res.headers['location'];
                console.log('Options: ', options);
                
                p_redirect_req = https.request( options, (p_redirect_res) => {
                    console.log('Inside the magic');
                    p_redirect_res.on('data', (data) => {
                        c_res.writeHead(200, {'X-Super-Proxy': 'Proxying'});
                        c_res.end(data);
                    })
                });
                p_redirect_req.end();
            }
            else {
                p_res.on('data', (data) => {
                    c_res.writeHead(200, {'X-Super-Proxy': 'Proxying'});
                    c_res.end(data);
                });
            }
        }
    );
    p_req.end();
    p_req.on('error', (err) => {
        console.error(err);
    });
});

server.listen(8080);