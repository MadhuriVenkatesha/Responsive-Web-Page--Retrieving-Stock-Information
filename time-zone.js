
//var moment = require('moment-timezone');
var check_date=function(lastRefreshedDate){
		var today=moment().format('YYYY-MM-DD HH:mm');
		var check_date1=moment().format('YYYY-MM-DD');
		//console.log(moment.defineLocale)
		//console.log(check_date);
		var date= new Date();
		console.log(moment.tz);
		if(lastRefreshedDate!=check_date1){
		   return lastRefreshedDate+" "+"16:00:00"+" "+moment.tz(lastRefreshedDate, 'America/New_York').zoneAbbr();
		 }
		else{
			var today=moment().format('YYYY-MM-DD HH:mm:ss');
			var current=moment(today, "YYYY-MM-DD hh:mm:ss");
			var beforetime = moment(today.split(" ")[0]+" 09:30:00", "YYYY-MM-DD HH:mm:ss"); 
			var afterTime = moment(today.split(" ")[0]+" 16:00:00","YYYY-MM-DD HH:mm:ss");
			if(current.isBetween(beforetime,afterTime)){
				return today+" "+moment.tz(current, 'America/New_York').zoneAbbr();
			}
			else if(current.isAfter(afterTime)){
				return lastRefreshedDate+" "+"16:00:00"+" "+moment.tz(lastRefreshedDate, 'America/New_York').zoneAbbr();
			}
}
}
//console.log(check_date("2017-11-10"));
