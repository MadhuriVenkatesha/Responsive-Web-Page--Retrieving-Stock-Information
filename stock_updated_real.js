var express = require('express');
var bodyParser= require("body-parser");
var app = express();
var url = require('url');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var router = express.Router();
app.get('/auto', function (req, res) {
  searchText=req.query.Autosymbol;
  var URL="http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input="+searchText;
  request(URL, function (error, response, body) {
   if (!error && response.statusCode == 200) {
       res.send(body); 
    }
});
})

//Serves the starting page of the application which is stock_carousal.html
app.get('/', function (req, res) {
   res.sendFile( __dirname + "/" + "stock_carousal.html" );
})

//Serves the controller file for the application which is controllers.js
app.get('/controllers.js', function (req, res) {
   res.sendFile( __dirname + "/" + "controllers.js" );
})
app.get('/time-zone.js', function (req, res) {
   res.sendFile( __dirname + "/" + "time-zone.js" );
})
app.get('/style.css', function (req, res) {
   res.sendFile( __dirname + "/" + "style.css" );
})
var request = require('request-promise');

//Fetches the intial stock details for the stock table
app.get('/index', function (req, res) {
   var API_KEY="YOUR_API_KEY";
   console.log("in here" + req.query.stockSymbol);
   var symbol=req.query.stockSymbol;
   var URL= "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="+symbol+"&outputsize=full&apikey="+API_KEY;
   request(URL, function (error, response, body) {
   if (!error && response.statusCode == 200) {
    	 res.send(body); 
  	}
});
})

//To fetch all the indicator data
app.get('/dummy', function (req, res) {
   var API_KEY="YOUR_API_KEY";
   console.log("in here" + req.query.stockSymbol);
   var symbol=req.query.stockSymbol;
   var indicator=req.query.indicator;
   var URL;
   if(indicator=="BBANDS"){
    URL="https://www.alphavantage.co/query?function=BBANDS"+"&symbol="+symbol+"&interval=daily&time_period=5&series_type=close&nbdevup=3&nbdevdn=3&apikey="+API_KEY;
   }
   else if(indicator=="STOCH"){
    URL="https://www.alphavantage.co/query?function=STOCH"+"&symbol="+symbol+"&interval=daily&time_period=10&series_type=close&slowkmatype=1&slowdmatype=1&apikey="+API_KEY;
   }
   else if(indicator=="PRICE"){
   URL="https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="+symbol+"&outputsize=full&apikey="+API_KEY;
   }
   else{
   URL="https://www.alphavantage.co/query?function="+indicator+"&symbol="+symbol+"&interval=daily&time_period=10&series_type=close&apikey="+API_KEY; 
   }
   request(URL, function (error, response, body) {
   if (!error && response.statusCode == 200) {
    	 res.send(body); 
  	}
});
})

//Fetch the news feed data
app.post('/newsFeed', function (req, res) {
    var API_KEY="YOUR_API_KEY";
   console.log(req.body.stockSymbol);
   var symbol=req.body.stockSymbol;
   console.log("in here");
   var parseString = require('xml2js').parseString;
		URL="https://seekingalpha.com/api/sa/combined/"+symbol+".xml";
   //var URL="https://www.alphavantage.co/query?function="+indicator+"&symbol="+symbol+"&interval=daily&time_period=10&series_type=close&apikey="+API_KEY;;
   request(URL, function (error, response, body) {
   if (!error && response.statusCode == 200) {
    	 parseString(body, function (err, result) {
    	 	console.log("in here");
    		res.send(JSON.stringify(result));
		});
  	}
});
})

//Starting the server
var server = app.listen(process.env.PORT || 8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Server listening at http://%s:%s", host, port)
})
