var express = require('express'),
	app = express.createServer(),
    sys = require('sys'),
    tqq = require('./qqoauth').qq;
    tsina = require('./sinaoauth').sina;


app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'xydudu' }));
//app.use(app.router);

app.use(express.static(__dirname + '/public'));
//app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
//
//app.error(function(err, req, res){
//	console.log("500:" + err + " file:" + req.url)
//	res.render('500');
//});

app.set('views', __dirname + '/view');
app.set('view engine', 'jade');

//0 befor init, 1 error
var QQTimeline = SinaTimeline = 0;

app.get('/', function(req, res){
        
    readyForQQ( req.cookies.access_key_qq, req.cookies.access_secret_qq );
    readyForSina( req.cookies.access_key_sina, req.cookies.access_secret_sina );

    (function checkStatus() {
        console.log('check'); 
        if (QQTimeline === 0 || SinaTimeline === 0) {
            setTimeout(checkStatus, 100);
            return;
        }

        console.log('check over'); 
        res.render('index.jade', {
            qq: (QQTimeline === 1 ? 0 : QQTimeline),
            sina: (SinaTimeline === 1 ? 0 : SinaTimeline)
        });

    })();

});

function readyForQQ( $access_key, $access_secret ) {
    
    if ( !$access_key || !$access_secret ) {
        QQTimeline = 1; 
        return;
    }

    tqq.homeTimeline($access_key, $access_secret, function($data) {
        var
        timeline = JSON.parse($data);
        if (timeline.errcode === 0 ) {
            QQTimeline = JSON.parse($data).data.info;
            //res.render('timeline-qq.jade', {statuses: JSON.parse($data).data.info});
        } else {
            QQTimeline = 1; 
            //res.render('index.jade');
        }

    });

}

function readyForSina( $access_key, $access_secret ) {
    
    if ( !$access_key || !$access_secret ) {
        SinaTimeline = 1; 
        return;
    }
        
    tsina.homeTimeline($access_key, $access_secret, function($data) {
        var
        timeline = JSON.parse($data);
        if ($data == '' || timeline == '' || timeline.length == 0) {
            SinaTimeline = 1; 
        } else {
            SinaTimeline = timeline; 
        }
    });
    
}


//app.get('/sina', function(req, res){
//    
//    if ( req.cookies.access_key_sina && req.cookies.access_secret_sina ) {
//        
//        tsina.homeTimeline(req.cookies.access_key_sina, req.cookies.access_secret_sina, function($data) {
//            var
//            timeline = JSON.parse($data);
//            res.render('timeline.jade', {statuses: timeline});
//        });
//
//    } else {
//        res.render('index.jade');
//    }
//
//});

app.get('/oauth_sina', function(req, res){

    if (req.query.oauth_token && req.query.oauth_verifier) {

        tsina.getAccessToken(req.query.oauth_token, req.query.oauth_verifier, req.session, function($data) {
            res.cookie("access_key_sina", $data.oauth_token);
            res.cookie("access_secret_sina", $data.oauth_token_secret);
            res.redirect('/');
        });

    } else 
        tsina.getRequestToken('http://lab.local:3000/oauth_sina', function($data) {

            req.session.oauth_token = $data.oauth_token;
            req.session.oauth_token_secret = $data.oauth_token_secret; 
            res.redirect('http://api.t.sina.com.cn/oauth/authorize?oauth_token='+ $data.oauth_token);

        });

});

app.get('/oauth', function(req, res){

    if (req.query.oauth_token && req.query.oauth_verifier) {

        tqq.getAccessToken(req.query.oauth_token, req.query.oauth_verifier, req.session, function($data) {
            res.cookie("access_key_qq", $data.oauth_token);
            res.cookie("access_secret_qq", $data.oauth_token_secret);
            res.redirect('/');
        });

    } else 
        tqq.getRequestToken('http://lab.local:3000/oauth', function($data) {

            req.session.oauth_token = $data.oauth_token;
            req.session.oauth_token_secret = $data.oauth_token_secret; 
            res.redirect('https://open.t.qq.com/cgi-bin/authorize?oauth_token='+ $data.oauth_token);

        });

});

app.listen(process.env.PORT || 8001);
