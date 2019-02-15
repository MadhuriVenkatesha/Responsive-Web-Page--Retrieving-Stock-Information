var table_data="";
var selected_tab;
var fb_symbols={};
var refreshedDate="";
var pay_load='';
var app = angular.module("stockTable",['ngMaterial',"ngMessages",'ngAnimate']);
app.filter('split', function() {
        return function(input, splitChar, splitIndex) {
            // do some bounds checking here to ensure it has that index
            return input.split(splitChar)[splitIndex];
        }
    });
app.directive("directive", function() {
    return {
        restrict : "C",
        template : "<div class='well' ng-repeat='x in RSSinfo'><a target='_blank' href={{x.link}}>{{x.title}}</a><br><br>Author:{{x.author}}<br><br>Date:{{x.pubDate}}</div>"
    };
});

//Directive to display warning message - Price Table
app.directive("warningPriceTable",function(){
	return{
		restrict : "C",
		template :'<div class="alert alert-danger">Error!</strong>Could not fetch tabular data</div>'
	}
});

//Directive to display warning message - Historical Table
app.directive("warningHistorical",function(){
	return{
		restrict : "C",
		template :'<div class="alert alert-danger"> <strong>Error!</strong>Could not historical data</div>'
	}
});

//Directive to display warning message - RSS News Feed
app.directive("warningRSS",function(){
	return{
		restrict : "C",
		template :'<div class="alert alert-danger"> <strong>Error!</strong>Could not fetcg RSS data</div>'
	}
});

//Directive to display warning message - Stock Indicators Data
app.directive("warningIndicators",function(){
	return{
		restrict : "C",
		template :'<div class="alert alert-danger"> <strong>Error!</strong> Could not fetch data</div>'
	}
});
app.controller('stockTableController', function($scope, $rootScope,$http){
			var input_table_data=[];
			var highstock_datePrice=[];
			var my_symbols=[];
			var refresh;
			
			// To enable stocks table display 
			$scope.go_to_tab2=function(){
				$scope.checked_con1=true;
				$scope.checked_con2=false;
			}
	
			// To enable favorite table display 
			$scope.go_to_tab1=function(){
				$scope.checked_con1=false;
				$scope.checked_con2=true;
			}
	
			// Autocomplete search input processing
			$scope.key_up=function(text){
				console.log($scope.stock_form.selectedItem);
				if($scope.stock_form.mandatoryInput.$touched && $scope.stock_form.mandatoryInput.$invalid){
						document.getElementById("submit_btn").disabled=true;
				}
				else if(text==undefined || text==''){
					document.getElementById("submit_btn").disabled=true;
				}
				else{
					document.getElementById("submit_btn").disabled=false;	
				}
			}
	
			// Querying stock symbol
			$scope.query=function(searchText){
				console.log(searchText);
    			return $http({
        		method : "GET",
        		url : "/auto",
        		params: {Autosymbol:searchText}
    		}).then(function mySuccess(response) {
      			var arr=[];
      			return response.data.map(function(r){
             	return r["Symbol"]+"-"+r["Name"]+"("+r["Exchange"]+")"
         	});
         
    		}, function myError(response) {
        		console.log(response.statusText);
    		});
   		} 
			$scope.fetchFromFav=function(symbol){
				$scope.table_controller(symbol);
				$scope.stock_form.item=symbol;
			}
	
			// Setting the directives accordingly
			$scope.setWarnings=function(indicators){
					$('.directive','#newsFeed').hide();
					$('.warningRSS','#newsFeed').hide();
					$('#progressRSS').show();

					var indicator_arr=indicators;
					$('#progressINDEX').show();
					$('#stock_table').hide();
					$('.warningPriceTable','#stock_table_data').hide();

					$('.warningHistorical','#historicalCharts').hide();
					$('#highstock_container').hide();
					$('#progressHISTORY').show();

					for(var i in indicator_arr){
						$('.warningIndicators','#'+indicator_arr[i].toLowerCase()).hide();
						$('#progress'+indicators[i]).show();
						$('#container'+indicators[i]).hide();
					 }
					 fb_symbols={};
					 document.getElementById("fb_btn").disabled = true;
					 document.getElementById("star_btn").disabled = true;	
					 document.getElementById("item1").disabled= false;

					 $scope.checked_con1=true;
					 $scope.checked_con2=false;		
			}
			
			//Resetting the Search form
			$scope.clear=function(){
				document.getElementById("stock_form").reset();
				//localStorage.removeItem("favoriteData");
				$scope.favorite_list=[];
				my_symbols=[];
				$scope.checked_con1=false;
				$scope.checked_con2=true;
				document.getElementById("submit_btn").disabled=true;
				if((stock_form.mandatoryInput.$touched && stock_form.mandatoryInput.$error)==true){
					stock_form.mandatoryInput.$touched=false
				}			
			}
			$scope.set_tab=function(tab){
				selected_tab=tab;
				var val;
				console.log(fb_symbols);
				if(fb_symbols[selected_tab]==undefined || fb_symbols[selected_tab]=='' ){
					val=true;
				}
				else{
					val=false
				}

				document.getElementById("fb_btn").disabled = val;
			}
	
			// Enabling interface to post details on facebook
			$scope.fb_display=function(){
				window.fbAsyncInit = function() {
				    FB.init({
				      appId      : '522582838077068',
				      cookie     : true,
				      xfbml      : true,
				      version    : 'v2.5'
				    });
				      
				    FB.AppEvents.logPageView();   
				      
				  };
				  (function(d, s, id){
				     var js, fjs = d.getElementsByTagName(s)[0];
				     if (d.getElementById(id)) {return;}
				     js = d.createElement(s); js.id = id;
				     js.src = "https://connect.facebook.net/en_US/sdk.js";
				     fjs.parentNode.insertBefore(js, fjs);
				   }(document, 'script', 'facebook-jssdk'));

				//window.alert(selected_tab);
				var exportUrl = 'http://export.highcharts.com/';
				var str= JSON.stringify(fb_symbols[selected_tab]);
				var dataString = encodeURI('async=true&type=jpeg&width=400&options=' + str);
				$.ajax({
                type: 'POST',
                data: dataString,
                url: exportUrl,
                success: function (data) {
                    console.log('get the file from relative url: ', data);
                    FB.ui({
						display: 'popup',
						method: 'feed',
						link: 'http://export.highcharts.com/'+data
						}, (response) => {
						if (response && !response.error_message) {
						 window.alert("successfully posted");
						} else {
						 window.alert("Not Posted");
						}
						});
				    },
				                error: function (err) {
				                    debugger;
				                    console.log('error', err.statusText)
				                }
				            });


			}			
			$scope.change_article_left=function(){
				$scope.right_tab=false;
				$scope.left_tab=true;
			}
			$scope.change_article_right=function(){
				$scope.right_tab=true;
				$scope.left_tab=false;	
			}
	
			// Enabling refresh of favorite stocks data
			$scope.simpleRefresh=function(){
				var symbol;
				for(symbol in my_symbols){
						$scope.makeFreshCall(my_symbols[symbol],$scope.fetchFreshData,1);
			  		}
		  }
			$('#toggle_btn').change(function(){
				$scope.test_var=0;
				if($("#toggle_btn").is(':checked')){			         
				refresh=setInterval(function(){
					var symbol;
					console.log(my_symbols);
					for(symbol in my_symbols){
						$scope.makeFreshCall(my_symbols[symbol],$scope.fetchFreshData,1);	
					}
				//$scope.$apply();
				}, 5000);
				}
				else{
					if(refresh){
						clearInterval(refresh);
					}
				}	
		});
		$scope.makeFreshCall=function(symbol,call_back,vol_refresh){
			$.ajax({
    			url: '/index', 
    			//type: "POST",
    			type:"GET",
    			data: {stockSymbol:symbol},
    			success: function(result){
    				call_back(symbol,result,vol_refresh)
    			}
    		})
		}
		$scope.fetchFreshData=function(symbol,result,vol_refresh){
			var response = JSON.parse(result);
			var table_data=response['Time Series (Daily)'];
			var i=0;
			var color;
			console.log(table_data);
			if(table_data==undefined){
				return;
			}
			for (var y in table_data){
						var x=table_data[y];
    				if(i==0){
    			 		var close= x['4. close'];
    			 		var volume= x['5. volume'];
    				}
    				if(i==1){
    					var previous_close_change=x['4. close'];
    					var change= close-previous_close_change;
    					if(change<0){
    						var img_src="http://cs-server.usc.edu:45678/hw/hw6/images/Red_Arrow_Down.png";
    						color="red";
    					}
    					else{
    						var img_src="http://cs-server.usc.edu:45678/hw/hw6/images/Green_Arrow_Up.png";
    						color="green"	
    					}
    					var change_percent=(change/previous_close_change)*100;
    					break;
        			}
        		i=i+1;	
        		}
        		console.log($scope.favorite_list);
					for(var i=0;i<$scope.favorite_list.length;i++){
						if($scope.favorite_list[i]["symbol"]==symbol){
							$scope.favorite_list[i]["price"]=parseFloat(close);
							$scope.favorite_list[i]["change"]=parseFloat(change).toFixed(2);
							$scope.favorite_list[i]["change_percent"]=parseFloat(change_percent).toFixed(2);
							if(vol_refresh==1){
							$scope.favorite_list[i]["volume"]=parseFloat(volume);
							}
							$scope.favorite_list[i]["img_src"]=img_src;
							$scope.favorite_list[i]["color"]=color;
							console.log("volume"+$scope.favorite_list[i]["volume"]);
							$scope.$apply();
							break;
						}
					 }		

		}

			$scope.enable=function(){
				if($scope.ListBy!=""){
					document.getElementById("order").disabled=false;
				}
				else{
				document.getElementById("order").disabled=true;	
				}
				$("#order").selectpicker('refresh');
			}
			
			// Ordering the data displayed in the favorite table
			$scope.adjust=function(){
				if(order_data=="asc"){
					$scope.order_values=false;
				}
				else if(order_data=="dsc"){
					$scope.order_values=true;
				}
			}
			
			// deleting the symbols from favorite table
			$scope.delete_symbol= function(symbol){
				if(localStorage.favoriteData){
					var output=JSON.parse(localStorage.getItem("favoriteData"));
					for(var i=0;i<output.length;i++){
						if(output[i]["symbol"]==symbol){
							break;
						}
					}
					output.splice(i,1);
					var j=my_symbols.indexOf(symbol);
					my_symbols.splice(j,1);

					document.getElementById("star").style.color=null;	
					localStorage.setItem("favoriteData",JSON.stringify(output));
					$scope.favorite_list.splice(i,1);
				}
			}
	
			// Changing the dispaly for different screen sizes
			$(window).on('resize',function(){
				var winWidth =  $(window).width();
				if(winWidth <= 1199){
					document.getElementById("small").style.display="";
					document.getElementById("big").style.display="none";
				}
				else{
					document.getElementById("small").style.display="none";
					document.getElementById("big").style.display="";

				}
			})
			$scope.display_favorite=function(){var winWidth =  $(window).width();
				if(winWidth <= 1199){
					document.getElementById("small").style.display="";
					document.getElementById("big").style.display="none";
				}
				else{
					document.getElementById("small").style.display="none";
					document.getElementById("big").style.display="big";

				}
				document.getElementById("order").disabled=true;
				$scope.checked_con1=false;
				$scope.checked_con2=true;
				$scope.data = {
               		selectedIndex: 0
            	};
				$scope.favorite_list=[];
				// Fetching favorite data from local storage
				if(localStorage.favoriteData){
					var src;
					var color;
					var output=JSON.parse(localStorage.getItem("favoriteData"));
						for(var i=0;i<output.length;i++){
							my_symbols.push(output[i]["symbol"]);
							color="green";
							if(output[i]["change"]<0){
								color="red";
							}
							var obj={
								"symbol": output[i]["symbol"],
								"price" : parseFloat(output[i]["price"]),
								"change": parseFloat(output[i]["change"]),
								"change_percent":parseFloat(output[i]["change_percent"]),
								"volume": parseFloat(output[i]["volume"]),
								"img_src":output[i]["img_src"],
								"color":color
							}
							$scope.favorite_list.push(obj);
						}
				}
			}
			
			//Fetching the stocks data and displaying it in tables and charts using HighCharts and HighStock graphics
			$scope.table_controller=function(param){
				if(selected_tab==undefined){
				selected_tab="PRICE";
				}
				var indicators=["PRICE","SMA","EMA","CCI","STOCH","BBANDS","RSI","ADX","MACD"];
				$scope.setWarnings(indicators);
				//$("#myCarousel").carousel(1);
				//$scope.go_to_tab2();
				if(param==null){
					$('.directive','#newsFeed').hide();
					$('.warningRSS','#newsFeed').show();
					$('#progressRSS').hide();

					var indicator_arr=indicators;
					$('#progressINDEX').hide();
					$('#stock_table').hide();
					$('.warningPriceTable','#stock_table_data').show();

					$('.warningHistorical','#historicalCharts').show();
					$('#highstock_container').hide();
					$('#progressHISTORY').hide();

					for(var i in indicator_arr){
						$('.warningIndicators','#'+indicator_arr[i].toLowerCase()).show();
						$('#progress'+indicators[i]).hide();
						$('#container'+indicators[i]).hide();
					 }
					 fb_symbols={};
					 document.getElementById("fb_btn").disabled = true;
					 document.getElementById("star_btn").disabled = true;	
					 document.getElementById("item1").disabled= false;
					return;
				}
				var param_arr=param.split('-');
				if(param_arr.length>1){
					pay_load=param_arr[0]
				}
				else{
				pay_load=param;
				}
				//window.alert(param);
        		var payload={stockSymbol : pay_load};
        		$scope.FetchIndicatorData();
        		$scope.getNewsFeed()
        		if(my_symbols.includes(payload.stockSymbol)){
								document.getElementById("star").style.color="yellow";	
        		}
        		else{
        		document.getElementById("star").style.color=null;		
        		}
                 $http( {
    		 	url:'/index' , 
    			method: "GET",
    			timeout: 20000,
    			params: payload}).then(function(response){
                	var result= response.data;
                	if(Object.keys(result).length==0 || Object.keys(result).includes("Error Message")){
                		$('#progressINDEX').hide();
						$('#stock_table').hide();
						$('.warningPriceTable','#stock_table_data').show();

						document.getElementById("star_btn").disabled = true;

						$('.warningHistorical','#historicalCharts').show();
						$('#highstock_container').hide();
						$('#progressHISTORY').hide();	
						return;               
						 	}
					$("#progressINDEX").hide();
    				$('#stock_table').show();
    				$('.warningPriceTable','#stock_table_data').hide();
 	
					document.getElementById("star_btn").disabled = false;
                	console.log(result);
                	console.log("I HAVE THE RESPONSE WITH ME!")
                    refreshedDate=result['Meta Data']['3. Last Refreshed'];
        			table_data=result['Time Series (Daily)'];
        			var y;
        			var tableDisplayData=[];
        			var i=0;
        			highstock_datePrice=[];
					for (y in table_data){
						var x=table_data[y];
						highstock_datePrice.push([new Date(y).getTime(),parseFloat(x['4. close'])]);
    				if(i==0){
    			 		$rootScope.ticker=pay_load;
    			 		$rootScope.close= x['4. close'];
    			 		$rootScope.previous_close=x['4. close'];
    			 		$rootScope.open= x['1. open'];
    			 		$rootScope.low= x['3. low'];
    			 		$rootScope.high= x['2. high'];
    			 		$rootScope.volume= x['5. volume'];
    				}
    				if(i==1){
    					$rootScope.Timestamp=check_date(refreshedDate);
    					//$rootScope.Timestamp=refreshedDate;
    					var previous_close_change=x['4. close'];
    					$rootScope.change= $scope.close-previous_close_change;
    					$scope.previous_close_val=x['4. close'];
    					if($rootScope.change<0){
    						$rootScope.color="red";
    						$rootScope.img_src="http://cs-server.usc.edu:45678/hw/hw6/images/Red_Arrow_Down.png";
    					}
    					else{
    						$rootScope.color="green";
    						$rootScope.img_src="http://cs-server.usc.edu:45678/hw/hw6/images/Green_Arrow_Up.png";	
    					}
    					$rootScope.change_percent=($scope.change/previous_close_change)*100;
    					//break;
        			}
        			if(i>=999){
        				break;
        			}
        			i=i+1;
				  }
				  $scope.getHistoricalData();
				  $('.warningHistorical','#historicalCharts').hide();
				  $('#progressHISTORY').hide();	
				  $('#highstock_container').show();
			}, function(response) {
        		//Second function handles error
					var indicator_arr=indicators;
					$('#progressINDEX').hide();
					$('#stock_table').hide();
					$('.warningPriceTable','#stock_table_data').show();

					$('.warningHistorical','#historicalCharts').show();
					$('#highstock_container').hide();
					$('#progressHISTORY').hide();
			 })

    		}	
			//Fetch historical stock data and display it using HighStocks graphics
			$scope.getHistoricalData=function(){
				//document.getElementById('progressHISTORY').style.display='none';
				console.log(highstock_datePrice);
				highstock_datePrice.sort(function(a, b) { return (a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0)); });
				var chart = Highcharts.stockChart('highstock_container', {

			        		chart: {
			            		height: 400
			        		},

			        		title: {
			            		text: pay_load+' Stock Value'
			        		},

			        		subtitle: {
			            		text: '<a target="_blank" style="color:blue" href="https://www.alphavantage.co">Source: Alpha Vantage</a>',
			            		useHTML:true
			        		},
			        		 tooltip: {
        						 split: false
    						},

			        		rangeSelector: {
			            		buttons: [
						                {
						                type: 'week',
						                count: 1,
						                text: '1w'
						            }, {
						                type: 'month',
						                count: 1,
						                text: '1m'
						            }, {
						                type: 'month',
						                count: 3,
						                text: '3m'
						            },
						            {
						                type: 'month',
						                count: 6,
						                text: '6m'
						            }, 
						            {
						                type: 'ytd',
						                count: 1,
						                text: 'YTD'
						            },{
						                type: 'year',
						                count: 1,
						                text: '1y'
						            }, {
						                type: 'all',
						                text: 'All'
						            } ] ,
						            selected: 0
			        		},
			        		 yAxis: {
        						title: {
            						text: "Stock Value"
        						}
    						},


			        		series: [{
			            		name: pay_load,
			            		data: highstock_datePrice,
			            		type: 'area',
			            		threshold: null,
			            		tooltip: {
			                		valueDecimals: 2
			            		}
			        		}],

        		responsive: {
            		rules: [{
                		condition: {
                    		maxWidth: 500
                		},
                		chartOptions: {
                    		chart: {
                        		height: 300
                    		},
                    		subtitle: {
                        		text: null
                    		},
                    		navigator: {
                        		enabled: false
                    		}
                		}
            		}]
        		}
    		});
			}

			$scope.getNewsFeed=function(){
									var URL="/newsFeed";
									var payload={stockSymbol : pay_load};
									$http({
    		 							url:URL , 
						    			method: "POST",
						    			timeout: 10000,
						    			data: payload}).then(function(result){
						    				//document.getElementById('newsFeed').childNodes[0].style.display='';
						    				//var children=document.getElementById('newsFeed').getElementsByTagName("div");
											//children[0].style.display='';
											//children[1].style.display='none';
						    				var response=result.data;
						    				if(response==undefined || Object.keys(response).length==0){
						    					$('.directive','#newsFeed').hide();
												$('.warningRSS','#newsFeed').show();
												$('#progressRSS').hide();
												return;
											}
											$('.directive','#newsFeed').show();
											$('.warningRSS','#newsFeed').hide();
											$('#progressRSS').hide();
						    				console.log(response["rss"]["channel"]);
											console.log(response["rss"]["channel"][0]["item"]);
										    var i;
										    var RSSdata=response["rss"]["channel"][0]["item"];
										    document.getElementById('progressRSS').style.display='none';
										    var rss_data=[];
										    var j=1;
										    for(i=0;i<RSSdata.length;i++){
										         if(RSSdata[i]["link"][0].split('/').includes("article")){
										         	var published_date= String(RSSdata[i]["pubDate"][0]).split('-');
										         	console.log(moment.tz(RSSdata[i]["pubDate"][0],'America/New_York').zoneAbbr());
										         	var obj={"title":RSSdata[i]["title"][0],
										         	"link":RSSdata[i]["link"][0],
										         	"pubDate":published_date[0] +String(moment.tz(RSSdata[i]["pubDate"][0],'America/New_York').zoneAbbr()),
										         	"author":RSSdata[i]["sa:author_name"][0]
										         	}
										         	rss_data.push(obj);
										         	if(j>=5){
										         		break;
										         	}
										         	j=j+1;
										         }
										    }
										console.log(rss_data);
										$scope.RSSinfo=rss_data;
						    			},function(error){
						    				$('.directive','#newsFeed').hide();
											$('.warningRSS','#newsFeed').show();
											$('#progressRSS').hide();
						    			})
			}
			$scope.store=function(){
				var symbol=pay_load;
				var price=$scope.close;
				var price_change=$scope.change;
				var volume= $scope.volume;
				var star_ele=document.getElementById("star");
				if(star_ele.style.color=="yellow"){
					star_ele.style.color=null;
					$scope.delete_symbol(pay_load);
					return;
				}

				var src="http://cs-server.usc.edu:45678/hw/hw6/images/Green_Arrow_Up.png";
				if($scope.change<0){
					var src="http://cs-server.usc.edu:45678/hw/hw6/images/Red_Arrow_Down.png";
				}
				var obj={
					"symbol":pay_load,
					"price":$scope.close,
					"change":$scope.change.toFixed(2),
					"change_percent":$scope.change_percent.toFixed(2),
					"volume":$scope.volume,
					"img_src":src
				}
				if (typeof(Storage) !== "undefined") {
					if(localStorage.favoriteData){
						var output=JSON.parse(localStorage.getItem("favoriteData"));
						for(var i in output){
							console.log(output[i]);
						}
						output.push(obj);
						my_symbols.push(pay_load);
						localStorage.setItem("favoriteData",JSON.stringify(output));
					}
					else{
						var input=[];
						input.push(obj);
						localStorage.setItem("favoriteData",JSON.stringify(input));
					}
					star_ele.style.color="yellow";
					obj["color"]="green";
					if(obj["change"]<0){
						obj["color"]="red"
					}
					$scope.favorite_list.push(obj);
				}				
			}

$scope.Price_data=function(result,data){
		document.getElementById("fb_btn").disabled = false;
		refreshedDate=result['Meta Data']['3. Last Refreshed'];
        table_data=result['Time Series (Daily)'];
		var symbol=pay_load;
        var display_date=refreshedDate.split(" ")[0];
        var Refreshed_date= $scope.Extract_Date(refreshedDate);
        var new_date=new Date(Refreshed_date);
        var compare_month=new_date.getMonth()+1;
        display_date=compare_month+"/"+ new_date.getDate()+"/"+new_date.getFullYear();
        var priceData = {};
        var volume_data=[];
        var price_data=[];
        for (y in table_data){
						var x=table_data[y];
						priceData[y]={
							"price":table_data[y]['4. close'],
							"volume":table_data[y]['5. volume']
						}
        } 
        var volume=[];
        var price=[];
        var category_data=[];
        var low=10000,f=0,check_num=12,l=0;
        for(var values in priceData){
            //start_date=values.split(" ")[0]+" "+"14:07:23";
            start_date=$scope.Extract_Date(values);
            console.log(start_date+"\n")
            var XDate=new Date(start_date);
            var XDay= XDate.getDate();
            var XMonth= XDate.getMonth()+1;
            day_month=$scope.InString(XMonth)+"/"+$scope.InString(XDay);
            category_data.push(day_month);
            volume.push(parseFloat(priceData[values]["volume"]/1000000));
            price.push(parseFloat(priceData[values]["price"]));
            if(parseFloat(priceData[values]["price"])<low){
                low=parseFloat(priceData[values]["price"]);
            }
            // if(compare_month-XMonth>5 && f%5==0) {
            //                 break;
            //             }
            if(compare_month-XMonth!=check_num){
            	check_num=compare_month-XMonth;
            	l=l+1;
            }
            if(l>5){
            	break;
            }
            if(f>125){
                                break;
                            }            
            f=f+1;            
        }
        low=low/10;
        low=(low*10)-5;
        volume=volume.reverse();
        price=price.reverse();
        var chart_dic={
	chart: {
            marginRight: 70,
            zoomType: 'x',
      		resetZoomButton: {
            	position: {
                	x: 0,
               		y: -30
            				}
       	 				}
                },
     title: {
       text: pay_load+" Stock Price and Volume"
    }, 
     navigation: {
        buttonOptions: {
            enabled: true
        }
    },  
    subtitle:{
                text: '<a target="_blank" style="color:blue" href="https://www.alphavantage.co">Source: Alpha Vantage</a>',
                useHTML:true
            },
    legend: {
                
        		layout: 'horizontal', // default
        		itemDistance: 50,
            },     
    xAxis: {
                categories: category_data.reverse(),
                labels: {
                            //step: 5,
                            rotation: -30,
                            align: 'right'
                        },
                tickInterval: 5,
                tickLength: 5,
            },
    yAxis: [{ // Primary yAxis
        min:0,       
        tickInterval: 5, 
        labels: {
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        title: {
            text: 'Stock Price',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        }
    }, { // Secondary yAxis
        min: 0,
        //tickInterval: 80,
        title: {
            text: 'Volume',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        labels: {

            format: '{value}M',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        opposite: true
    }],     
     series: [{
        name: 'Price',
        type: 'area',
        zoomType: 'x',
        panning: true,
        panKey: 'shift',
        data: price,
        color:'#A3C8F1'

    }, {
        name:'Volume',
        type: 'column',
        color: "red",
        yAxis: 1,
        data: volume,
         tooltip: {
            valueSuffix: 'M'
        }
    }]   
}
Highcharts.chart('containerPRICE',chart_dic);
fb_symbols["PRICE"]=chart_dic;
}
$scope.FetchIndicatorData=function(){
	var URL;

	var indicators=["SMA","EMA","CCI","STOCH","BBANDS","RSI","ADX","MACD"];/*ACTUAL INDICATORS*/
	//var indicators=[];
	//var indicators=["sma","ema","cci","stoch","brands","rsi","adx","macd"]
	var i;

	//AJAXcall('/charts/PRICE',{stockSymbol : $("#stockSymbol").val()},Price_data);/* ACTUAL CALL*/
	//window.alert(pay_load);
	$scope.AJAXcall('/dummy',{stockSymbol : pay_load,indicator:"PRICE"},$scope.Price_data);
	for(i in indicators){
	  var payload={stockSymbol : pay_load, indicator:indicators[i]};
	  /* URL='/charts/'+indicators[i]; // ACTUAL CALL*/
	  URL='/dummy';
	  $scope.AJAXcall(URL,payload,$scope.fetchChartData);
    }
}     
$scope.fetchChartData=function(xmlDoc,data){
     	var indicator_symbol = xmlDoc["Meta Data"]["2: Indicator"];
                    var Refreshed_date= xmlDoc["Meta Data"]["3: Last Refreshed"];
                    //var time_stamp= "14:07:23";
                    //Refreshed_date = Refreshed_date +" "+time_stamp
                    var ind=data.indicator;
                    var symbol=data.stockSymbol;
                    var containerID= "container"+data.indicator;
                    console.log(containerID);
                    var indicator=data.indicator;
                    Refreshed_date=$scope.Extract_Date(Refreshed_date);
                   // console.log(Refreshed_date);
                    var compare_month=new Date(Refreshed_date).getMonth()+1;
                    chart_data= xmlDoc["Technical Analysis: "+indicator];
                    category_data=[];
                    series_data={};
                    var flag=1,check_num=12,l=0;
                    var week=0;
                    var f=0;
                    for(var data in chart_data ){
                            //start_date=data+" "+time_stamp;
                            start_date=$scope.Extract_Date(data);
                          //  console.log(start_date+"\n")
                            var XDate=new Date(start_date);
                            var XDay= XDate.getDate();
                            var XMonth= XDate.getMonth()+1;
                            var XYear= XDate.getFullYear();
                          //  console.log(XMonth+"/"+XDay+"/"+XYear+"\n");
                        day_month=$scope.InString(XMonth)+"/"+$scope.InString(XDay);
                        category_data.push(day_month);
                        //create_lists(object.keys(chart_data[data]).length,series_data);
                        if(flag==1){
                            var field_keys=Object.keys(chart_data[data]);
                            var symbol_display;
                            if(field_keys.length==1){
                                symbol_display=false;
                            }
                            else{
                                symbol_display=true;
                            }
                            for(var k=0;k<field_keys.length;k++){
                                if(symbol_display){
                                var name=symbol+" "+field_keys[k];
                                }
                                else{
                                 var name=symbol;   
                                }
                                series_data[name]=[];
                            }
                            flag=0;
                        }
                        for(var data_in_data in chart_data[data]){
                           // console.log(chart_data[data][data_in_data]);
                            if(symbol_display){
                            var key=symbol+" "+data_in_data;
                            }
                            else{
                                var key=name;
                            }
                            series_data[key].push(parseFloat(chart_data[data][data_in_data]));
                        }

                        // if(compare_month-XMonth>5 && f%5==0) {
                        //    // console.log(f);
                        //     break;
                        // }
		                if(compare_month-XMonth!=check_num){
			            	check_num=compare_month-XMonth;
			            	l=l+1;
		            	}
			            if(l>5){
			            	break;
			            }
                        if(f>125){
                                break;
                            }
                        f=f+1;
                    }
                   // console.log("categories= ",category_data);
                   // console.log("\nseries= ",series_data);
                    var series_data_list=[];
                    var colors=["red","black","green"];
                    var c=0;
                    for(var t in series_data){
                        var obj={
                            name :  t,
                            data : series_data[t].reverse(),
                            color: colors[c++]
                        }
                        series_data_list.push(obj);
                    }
	                   var chart_dic_data={   //chart object
                        title: {
                                text: indicator_symbol
                                },
                         navigation: {
                                buttonOptions: {
                                    enabled: true
                                }
                            },        
                        subtitle:{
                        		useHTML:true,
                                text: '<a target="_blank" style="color:blue" href="https://www.alphavantage.co">Source: Alpha Vantage</a>'
                                },
                        chart: {
                                marginRight: 0,
                                zoomType: 'x',
        						resetZoomButton: {
            						position: {
                						x: 0,
               		 					y: -30
            						}
       	 						}
                            },

                        legend: {
                    
        						layout: 'horizontal', // default
        						itemDistance: 50,
                                },

                        xAxis: {
                                categories: category_data.reverse(),
                                labels: {
                                            rotation: -50,
                                            align: 'right'
                                },
                                 tickInterval: 5,
                                 tickLength: 5,
                             },
                        yAxis:{
                               title:{
                                              text:indicator
                               }   
                        },    
                            series:series_data_list
                        }
                    Highcharts.chart(containerID,chart_dic_data);
                    console.log(ind);
                    fb_symbols[ind]=chart_dic_data;
}

 $scope.Extract_Date=function(date){
		return(date.split(" ")[0]+" "+"14:07:23");
	}  

$scope.InString=function(num){
		if(num < 10){

			return('0'+num);
		}
		else{
    		return (num.toString());
		}
	} 
$scope.warningsForIndicators=function(indicator_sym){
	$("#progress"+indicator_sym).hide();
	$("#container"+indicator_sym).hide();
	console.log('#'+indicator_sym.toLowerCase());
	$('.warningIndicators','#'+indicator_sym.toLowerCase()).show();
}	
$scope.AJAXcall=function(URL,post_payload,call_back){
				$.ajax({
    			url: URL, 
    			//type: "POST",
    			type:"GET",
    			data: post_payload,
    			success: function(result){
        		//$("#result").html(result);
        		if(result.exit){
        			console.log("PROBLEM!!!!!!!!!");
        		}
        		tb_data = JSON.parse(result);  
        		console.log(tb_data);
        		var array_tb_data=Object.keys(tb_data);
 				console.log(array_tb_data.length==0);
        		if(array_tb_data.length==0 || array_tb_data.includes("Error Message") ){
        			console.log("in here")
        			// var div_element=document.createElement("div");
        			// div_element.className='warning';
        			// var id="container"+post_payload.indicator;
        			// document.getElementById(id).appendChild(div_element);
        			$scope.warningsForIndicators(post_payload.indicator);
        		}
        		else{
		        		var indi=post_payload.indicator;
		        		var str=post_payload.indicator;
		        		$("#progress"+post_payload.indicator).hide();
		        		$("#container"+post_payload.indicator).show();
		        		$('.warningIndicators','#'+indi.toLowerCase()).hide();
		        		call_back(tb_data,post_payload);

        			}
    			},
    			error: function(xhr,status,error){
    				console.log("some error occured"+ error+" "+"status"+status);
    				// var div_element=document.createElement("div");
        // 			//div_element.className='warning';
        // 			div_element.className='alert alert-danger';
        // 			var text=document.createTextNode("Some error occurred");
        // 			div_element.appendChild(text);
        // 			document.getElementById("container"+post_payload.indicator).appendChild(div_element);
        			$scope.warningsForIndicators(post_payload.indicator);
    			},
    			 timeout: 10000 
    		});
			}


	});
//Controller Ends Here	 
			
