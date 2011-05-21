var http = require('http');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var Schema = mongoose.Schema , 
    ObjectId = Schema.ObjectId;

var BlogPost = new Schema({
    author    : ObjectId, 
    title     : String, 
    body      : String, 
    date      : Date
});
mongoose.model('BlogPost', BlogPost);

var myModel = mongoose.model('BlogPost');

var instance = new myModel();

instance.title = 'hello';
instance.save(function (err) {
  //
});


var server = http.createServer(function (req, res) {
  res.writeHead(200, { "Content-Type": "text/plain" })
  res.end("Hello world in my home computer\n");
});
 
server.listen(process.env.PORT || 8001);

