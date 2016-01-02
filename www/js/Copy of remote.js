//var nidorestApiUrl = 'http://localhost:8080/emenu-webapp/api/1.0';
//var nidorestApiKey = '0cb88650-ad87-4408-a5d1-ce9011539944';

var nidorestApiUrl = 'http://emenu-eu-test.nidoapp.eu.cloudbees.net/api/1.0';
var nidorestApiKey = '449860a8-630e-4e08-ba63-7de4b4f6e3d6';

var map;

var location;

function searchRestaurants()
{  
    var service = "restaurantsSearch";
    var query = $("#prependedInput").val();    
    
    alert("Entrando... ");
    
    var params = "";
    
    
    if(navigator != null && navigator.geolocation != null)
	{
		
   		var onSuccess = function(position) {	
   			
   			alert("Position: " + position);
   			
   			location = {};
		    
		    location["latitude"] = position.coords.latitude;
		    location["longitude"] = position.coords.longitude;	
		    
		    executeSearch();
		};
		
		function onError(error) {
			alert("Error: " + error);
			executeSearch();
		}


		navigator.geolocation.getCurrentPosition(onSuccess, onError);
		
	}
	else
	{
		executeSearch();
	}
    
    
    
    
        
   
    
    function executeSearch() {
    	
    	 	if(query != null && query != "")
    	    {
    	        params = params + "&query=" + query;
    	    }
    	    else
    	    {
    	    	if(location != null)
    	    	{
    	    		
    	    		params = params + "&latitude=" + location["latitude"]  ;
	    		    params = params + "&longitude=" + location["longitude"]  ;
	    		    params = params + "&distance=1000" ;   	  		
    	    	}
    	    
    	    }
    	 
    	 
    	
    	
    	var url = nidorestApiUrl + "/" + service + '?key=' + nidorestApiKey + params;        
        
    	//alert("URL: " + url);

        $.ajax({        
            url: url,
            dataType: 'jsonp',
            success: function(data) {	    		   
                
                if(data.error == true)
                {
                    alert("Error: " + data.errorCode);
                }
                else
                {
                    //show loading
                    show('results');
                    
                    alert("Restaurants: " + data.restaurants);
                    
                
                     $.each(data.restaurants, function(i, item){
                     
                        var li = $("<li></li>");
                        var a = $("<a/>").attr("href", "#");
                        a.attr("onclick", "restaurantDetail(" + item.id + ", false)");
                        
                        var photoUrl = "http://media.salir-static.net/_images_/verticales/b/6/3/d/137577-el_peletazo___restaurante_espectaculo_tn.jpg/89fh52";
                        
                        if(item.photo != null)
                        {   
                            photoUrl = item.photo.url;
                        }
                        
                        var img = $("<img/>").attr("src", photoUrl);
                        
                        var h3 = $("<h3/>").append(item.name);
                        
                        var foodType = "";                    
                        if(item.foodType != null)
                        {   
                            foodType = item.foodType.name;
                        }
                        var span = $("<span/>").append(foodType);
                     
                        li.append(a);
                        a.append(img);
                        a.append(h3);
                        a.append(span);
                        
                        /*
                        <li>
                            <a href="#">
                                <img src="http://media.salir-static.net/_images_/verticales/b/6/3/d/137577-el_peletazo___restaurante_espectaculo_tn.jpg/89fh52">
                                <h3>El Koala</h3>
                                <span>Estás a 500 metros</span>
                            </a>
                        </li>
                        */
                        
                        $("#resultList").append(li);
                        
                        
                   

    	
                    });
                        
                    
                    //hide loading
                     historySave( "results" );
                     
                     
                     
                     
                     
                     
                     
                     
                     
                     
                     
                     
                     
                     
                     //show loading
                     show('map');
                     
                     var currentLatLon = new google.maps.LatLng(41.64707, -0.885859);
                     
                     var mapOptions = {
                    		    zoom: 4,
                    		    center: currentLatLon,
                    		    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    		    zoomControl: false, 
                    		    streetViewControl: false,
                    		    mapTypeControl: false
                    		  };
                     
                    		  map = new google.maps.Map(document.getElementById('map_results'),
                    		                                mapOptions);
                    		  
                    		  var bounds = new google.maps.LatLngBounds();
                    		  
                    		  
                    		 var image = 'img/restaurant.png';
                    		  
                    		  $.each(data.restaurants, function(i, item){
                    			  
                    			  if(item.coordinates != null && item.coordinates.latitude != null && item.coordinates.longitude != null)
                    			  {
                    				  var latLng = new google.maps.LatLng(item.coordinates.latitude, item.coordinates.longitude);
                            		  bounds.extend(latLng);
                            		  var marker = new google.maps.Marker({
                            		      position: latLng,
                            		      map: map,
                            		      icon: image
                            		  });
                            		  var infoWindow = new google.maps.InfoWindow({
                            				content: "",
                            	            maxWidth: 20
                            			});
                            			google.maps.event.addListener(marker, 'click', function() {
                            				infoWindow.setContent('<h1>' + item.name + '</h1>' + '<p><button type="button" onclick="restaurantDetail(' + item.id + ', false)">Ver</button>');
                            				infoWindow.open(mapa, this);
                            			});
                            			
                            			alert("Pintado en mapa: " + item.name);
                    			  }

              	
                              });		
                    			
                    		map.fitBounds(bounds);
                    		
                    		
                    		google.maps.event.addListenerOnce(map, 'idle', function(){
                                //hide loading
                                historySave( "map" );
                    		});

  
                     

                     

                     
                }

    		  }
        });
    	
	}

  
    
}

function mapa ()
{


	 

	

}


function restaurantDetail(id, fromFavorites)
{  
    var service = "restaurantDetail";
    //var id = $("#restaurantId").val();
    
    //alert("query: " + query);
    
    var params = "&restaurantId=" + id;    
    
    // http://emenu-eu-test.nidoapp.eu.cloudbees.net/api/1.0/restaurantsSearch?key=449860a8-630e-4e08-ba63-7de4b4f6e3d6
    var url = nidorestApiUrl + "/" + service + '?key=' + nidorestApiKey + params;


    $.ajax({        
        url: url,
        dataType: 'jsonp',
        success: function(data) {	    		   
            
            if(data.error == true)
            {
                alert("Error: " + data.errorCode);
            }
            else
            {
                //show loading
                show('restaurantDetail');
                
                
                
                if(data.restaurant.coordinates != null && data.restaurant.coordinates.latitude != null && data.restaurant.coordinates.longitude != null)
                {
                	var coordinates =  "" + data.restaurant.coordinates.latitude + "," + data.restaurant.coordinates.longitude;
                    $("#restaurantDetailMapImage").attr("src", "http://maps.googleapis.com/maps/api/staticmap?center=" +coordinates + "&zoom=15&size=711x130&maptype=roadmap&markers=color:blue%7Clabel:R%7C" +coordinates + "&sensor=false");

                }
                
                
                $("#restaurantDetailName").html(data.restaurant.name);
                $("#restaurantDetailAddress").html(data.restaurant.address);
                
                $("#restaurantDetailDescription").html(data.restaurant.description);
                $("#restaurantDetailReservationButton").attr("onclick", "showRestaurantReservation(" + data.restaurant.id + ", '" + data.restaurant.name + "')");
                
                if(fromFavorites)
                {
                	$("#restaurantDetailBack").attr("onclick", "showFavorites();");
                }
                else
                {
                    $("#restaurantDetailBack").attr("onclick", "historyRecover('results');");
                }
                
            	
            	var db = getDatabase();
                
                db.transaction(queryDB, errorCB);
                
                function queryDB(tx) {
                	tx.executeSql('CREATE TABLE IF NOT EXISTS FAVORITES (id unique, photoUrl, name, foodTypeName)');
                    tx.executeSql('SELECT * FROM FAVORITES WHERE id=' + id, [], querySuccess, errorCB);
                }

                function querySuccess(tx, results) {
                	var len = results.rows.length;
                    if(len > 0)
                    {
                    	$("#restaurantDetailSaveOrDeleteFavoriteButton").attr("onclick", "deleteFavoriteFromDetail(" + data.restaurant.id + ", '" + data.restaurant.photo.url + "', '" + data.restaurant.name + "', '" + data.restaurant.foodType.name +"')");
                    	$("#restaurantDetailSaveOrDeleteFavoriteButton").attr("style", "color: #0088cc;");
                    	
                    }
                    else
                    {
                    	$("#restaurantDetailSaveOrDeleteFavoriteButton").attr("onclick", "saveFavoriteFromDetail(" + data.restaurant.id + ", '" + data.restaurant.photo.url + "', '" + data.restaurant.name + "', '" + data.restaurant.foodType.name +"')");
                    	$("#restaurantDetailSaveOrDeleteFavoriteButton").attr("style", "");
                    }
                }
                
                function errorCB(err) {
                    alert("Error processing SQL: "+err.code);
                }

                
                /*
                <ul id="restaurantDetailPhotos">
                    <li><img class="example-image" src="http://lokeshdhakar.com/projects/lightbox2/img/demopage/thumb-1.jpg" alt="thumb-1" width="150" height="150"/></li>
                    <li><img class="example-image" src="http://lokeshdhakar.com/projects/lightbox2/img/demopage/thumb-1.jpg" alt="thumb-1" width="150" height="150"/></li>
                    <li><img class="example-image" src="http://lokeshdhakar.com/projects/lightbox2/img/demopage/thumb-1.jpg" alt="thumb-1" width="150" height="150"/></li>
                    <li><img class="example-image" src="http://lokeshdhakar.com/projects/lightbox2/img/demopage/thumb-1.jpg" alt="thumb-1" width="150" height="150"/></li>
                </ul>
                */
                
                
                 $.each(data.restaurant.photos, function(i, item){
                 
                    var li = $("<li></li>");
                    
                    var photoUrl = item.url;          
        
                    
                    var img = $("<img/>").attr("src", photoUrl);
                    img.attr("class", "example-image");
                    img.attr("width", "150");
                    img.attr("height", "150");
                    

                 
                    li.append(img);
                    
                    $("#restaurantDetailPhotos").append(li);

	
                });
                                   
                
                //hide loading
                 historySave( "restaurantDetail" );
            }

		  }
    });

    
}


function saveFavoriteFromDetail(id, photoUrl, name, foodTypeName)
{
	var db = getDatabase();

    
    db.transaction(populateDB, errorCB);
    
    function populateDB(tx) {
    	tx.executeSql('CREATE TABLE IF NOT EXISTS FAVORITES (id unique, photoUrl, name, foodTypeName)');
    	tx.executeSql('DELETE FROM FAVORITES WHERE id=' + id);
    	tx.executeSql('INSERT INTO FAVORITES (id, photoUrl, name, foodTypeName) VALUES (' + id + ', "' + photoUrl + '", "' + name + '", "' + foodTypeName + '")');
    }

    function errorCB(err) {
        alert("Error processing SQL: "+err.code);
    }
    
	$("#restaurantDetailSaveOrDeleteFavoriteButton").attr("onclick", "deleteFavoriteFromDetail(" + id + ", '" + photoUrl + "', '" + name + "', '" + foodTypeName +"')");
	$("#restaurantDetailSaveOrDeleteFavoriteButton").attr("style", "color: #0088cc;");

   
}

function deleteFavoriteFromDetail(id, photoUrl, name, foodTypeName)
{
	var db = getDatabase();

    
    db.transaction(populateDB, errorCB);
    
    function populateDB(tx) {
    	tx.executeSql('CREATE TABLE IF NOT EXISTS FAVORITES (id unique, photoUrl, name, foodTypeName)');
    	tx.executeSql('DELETE FROM FAVORITES WHERE id=' + id);
    }

    function errorCB(err) {
        alert("Error processing SQL: "+err.code);
    }
    

	$("#restaurantDetailSaveOrDeleteFavoriteButton").attr("onclick", "saveFavoriteFromDetail(" + id + ", '" + photoUrl + "', '" + name + "', '" + foodTypeName +"')");
	$("#restaurantDetailSaveOrDeleteFavoriteButton").attr("style", "");

   
}

var reservationMinMinutesFromNow = 15;
var reservationMaxDaysFromNow = 60;
var reservationValidHours = [13,14,15,21,22,23];
var reservationValidMinutes = [0,15,30,45];


function showRestaurantReservation(id, name)
{  
    //show loading
    show('reservation');
    
    $("#reservationRestaurantName").html(name);
    $("#reservationButton").attr("onclick", "restaurantReservation(" + id + ")");
    
    var storedCustomerName = window.localStorage.getItem("customerName");
    var storedCustomerEmail = window.localStorage.getItem("customerEmail");
    var storedCustomerPhone = window.localStorage.getItem("customerPhone");
        
    $("#reservationCustomerName").val(storedCustomerName);
    
    $("#reservationCustomerEmail").val(storedCustomerEmail);
    
    $("#reservationCustomerPhone").val(storedCustomerPhone);
    
    
    
    
    updateYears();
    
   

}

function calculateEstimatedReservationDate()
{
	var date = Date.today().add(1).days();
    estimatedReservationDate.setHours(14);
    estimatedReservationDate.setMinutes(0);
    
    return date;
}

function reservationMinDate()
{
	return new Date().add(reservationMinMinutesFromNow).minutes();
}

function reservationMaxDate()
{
	return Date.today().add(reservationMaxDaysFromNow).days();
}

function updateYears()
{
	var minDate = reservationMinDate();
    var maxDate = reservationMaxDate();
    
       
    //Estableciendo anyos:
    
    var minYear = minDate.getFullYear();
    var maxYear = maxDate.getFullYear();
    
    var yearIterator = minYear;
    while(yearIterator <= maxYear)
    {
    	var option = $("<option></option>");
        option.attr("value", yearIterator);
        option.append(yearIterator);     
       
        
        $("#reservationDateYear").append(option);
        
    	yearIterator++;
    }
    
    $("#reservationDateYear").val(minDate.getFullYear());
    
    
    $( "#reservationDateYear" ).change(function() {
    	updateMonths();
    }).change();
    
    
	 
}



function updateMonths()
{
	 var year = $("#reservationDateYear").val();
	 
	 var minDate = reservationMinDate();
	 var maxDate = reservationMaxDate();
	 
	 var minMonth = 1;
	 var maxMonth = 12;
	 var isMinYear = false;
	 if(year == minDate.getFullYear())
	 {
		 minMonth = minDate.getMonth() + 1;
		 isMinYear = true;
	 }
	 if(year == maxDate.getFullYear())
	 {
		 maxMonth = maxDate.getMonth() + 1;
	 }
     

	    var monthIterator = minMonth;
	    while(monthIterator <= maxMonth)
	    {
	    	var option = $("<option></option>");
	        option.attr("value", monthIterator);
	        option.append(monthIterator);
	        
	       	        
	        $("#reservationDateMonth").append(option);
	        
	        /*
	        if(isMinYear && monthIterator == minMonth)
	        {
	        	$("#reservationDateMonth").val(monthIterator);
	        }
	        */
	        	
	        
	        monthIterator++;
	    }
	    
	    if(isMinYear)
        {
        	$("#reservationDateMonth").val(minMonth);
        }
	    else
		 {
				$("#reservationDateMonth").val($("#reservationDateMonth option:first").val());
		 }
	    
	  
	 
	    $( "#reservationDateMonth" ).change(function() {
	    	updateDays();
	    }).change();
}

function updateDays()
{
	var minDate = reservationMinDate();
	
	var year = $("#reservationDateYear").val();
	var month = $("#reservationDateMonth").val() - 1;	
	
	 	
	var daysInMonth = Date.getDaysInMonth(year, month);
	
	var isMinMonth = false;
	var daysIterator = 1;
	if(minDate.getFullYear() == year && minDate.getMonth() == month)
	{
		isMinMonth = true;
		daysIterator = minDate.getDate();
	}
	
	//alert("daysInMonth: " + daysInMonth);
	//alert("daysIterator: " + daysIterator);
	
	while(daysIterator <= daysInMonth)
    {
    	var option = $("<option></option>");
        option.attr("value", daysIterator);
        option.append(daysIterator);
        
        
        
        $("#reservationDateDay").append(option);
        
        daysIterator++;
    }
	
	 if(isMinMonth)
     {
     	$("#reservationDateDay").val(minDate.getDate());
     }
	 else
	 {
			$("#reservationDateDay").val($("#reservationDateDay option:first").val());
	 }
	 
	 $( "#reservationDateDay" ).change(function() {
		 	updateHours();
	    }).change();
	
}

function updateHours()
{
	var minDate = reservationMinDate();

	var year = $("#reservationDateYear").val();
	var month = $("#reservationDateMonth").val() - 1;
	var day = $("#reservationDateDay").val();
	
	
	var isMinDay = false;
	var minHour = 0;
	
	
	if(minDate.getFullYear() == year && minDate.getMonth() == month && minDate.getDate() == day)
	{
		isMinDay = true;
		minHour = minDate.getHours();
	}
		
	
	var hourIterator = minHour;
	
	var selected = false;
	var selectedValue = null;
	while(hourIterator <= 23)
    {
		if ($.inArray(hourIterator, reservationValidHours) != -1)
		{
			var option = $("<option></option>");
	        option.attr("value", hourIterator);
	        
	        if(hourIterator < 10)
	        	option.append("0" + hourIterator);
	        else
	        	option.append("" + hourIterator);
        	
	        
	        $("#reservationDateHour").append(option);
	        
	        if(isMinDay && !selected && hourIterator >= minDate.getHours())
	        {
	        	selectedValue = hourIterator;
	        	selected = true;	        	
	        }
		}
    	
		hourIterator++;
    }	
	
	if(selected)
    {
    	$("#reservationDateHour").val(selectedValue);
    }
	else
	{
		$("#reservationDateHour").val($("#reservationDateHour option:first").val());
	}
	
	
	$( "#reservationDateHour" ).change(function() {
		updateMinutes();
    }).change();
}


function updateMinutes()
{
	var minDate = reservationMinDate();
	
	var year = $("#reservationDateYear").val();
	var month = $("#reservationDateMonth").val() -1;
	var day = $("#reservationDateDay").val();
	var hour = $("#reservationDateHour").val();
	
	var isMinHour = false;
	var minMinutes = 0;
	
	
	if(minDate.getFullYear() == year && minDate.getMonth() == month && minDate.getDate() == day && minDate.getHours() == hour)
	{
		isMinHour = true;
		minMinutes = minDate.getMinutes();
	}
	

	var minutesIterator = minMinutes;
	
	var selected = false;
	var selectedValue = null;
	while(minutesIterator <= 59)
    {
		if ($.inArray(minutesIterator, reservationValidMinutes)  != -1)
		{
			var option = $("<option></option>");
	        option.attr("value", minutesIterator);
	       
	        if(minutesIterator < 10)
	        	option.append("0" + minutesIterator);
	        else
	        	option.append("" + minutesIterator);
	        
	        $("#reservationDateMinutes").append(option);
	        
	        if(isMinHour && !selected && minutesIterator >= minMinutes)
	        {
	        	selectedValue = minutesIterator;
		        selected = true;
	        }
		}
    	
		minutesIterator++;
    }
	
	if(selected)
    {
    	$("#reservationDateMinutes").val(selectedValue);
    }
	else
	{
		$("#reservationDateMinutes").val($("#reservationDateMinutes option:first").val());
	}
	
}


function restaurantReservation(id)
{  
    var service = "restaurantTableBook";
    //var id = $("#restaurantId").val();
    
    //alert("query: " + query);
    
    var params = "&restaurantId=" + id;  

    var reservationDate = $("#reservationDateDay").val() + "/" + $("#reservationDateMonth").val() + "/" + $("#reservationDateYear").val() + " " + $("#reservationDateHour").val() + ":" + $("#reservationDateMinutes").val();
    params = params + "&reservationDate=" + reservationDate;  
    
    var customerName = $("#reservationCustomerName").val();
    params = params + "&customerName=" + customerName;  
    
    var customerEmail = $("#reservationCustomerEmail").val();
    params = params + "&customerEmail=" + customerEmail;  
    
    var customerPhone = $("#reservationCustomerPhone").val();
    params = params + "&customerPhone=" + customerPhone;  
    
    params = params + "&customerPhoneCountryIsoCode=ES"; 
    
    var adults = $("#reservationAdults").val();
    params = params + "&adults=" + adults; 
    
    var children = $("#reservationChildren").val();
    params = params + "&children=" + children; 
    
    // http://emenu-eu-test.nidoapp.eu.cloudbees.net/api/1.0/restaurantsSearch?key=449860a8-630e-4e08-ba63-7de4b4f6e3d6
    var url = nidorestApiUrl + "/" + service + '?key=' + nidorestApiKey + params;

    
    $.ajax({        
        url: url,
        dataType: 'jsonp',
        success: function(data) {	    		   
            
            if(data.error == true)
            {
                alert("Error: " + data.errorCode);
            }
            else
            {
                //show loading
                show('reservationDone');  
                
                var customerName = $("#reservationCustomerName").val();
                window.localStorage.setItem("customerName", customerName);
                
                var customerEmail = $("#reservationCustomerEmail").val();
                window.localStorage.setItem("customerEmail", customerEmail);
                
                var customerPhone = $("#reservationCustomerPhone").val();
                window.localStorage.setItem("customerPhone", customerPhone);
                
   
                
                //hide loading
            }

		  }
    });
    
    
    

    
}

function getDatabase()
{
	return window.openDatabase("horeca", "1.0", "horeca", 1000000);
}


function showFavorites()
{  
    //show loading
    show('favorites');

    var db = getDatabase();
    
    db.transaction(queryDB, errorCB);
    
    function queryDB(tx) {
    	tx.executeSql('CREATE TABLE IF NOT EXISTS FAVORITES (id unique, photoUrl, name, foodTypeName)');
        tx.executeSql('SELECT * FROM FAVORITES', [], querySuccess, errorCB);
    }

    function querySuccess(tx, results) {
    	var len = results.rows.length;
        console.log("DEMO table: " + len + " rows found.");
        for (var i=0; i<len; i++)
        {
        	var item = results.rows.item(i);
        	
        	var li = $("<li></li>");
            var a = $("<a/>").attr("href", "#");
            a.attr("onclick", "restaurantDetail(" + item.id + ", true)");
            
            var photoUrl = "http://media.salir-static.net/_images_/verticales/b/6/3/d/137577-el_peletazo___restaurante_espectaculo_tn.jpg/89fh52";
            
            if(item.photoUrl != null)
            {   
                photoUrl = item.photoUrl;
            }
            
            var img = $("<img/>").attr("src", photoUrl);
            
            var h3 = $("<h3/>").append(item.name);
            
            var foodType = "";                    
            if(item.foodTypeName != null)
            {   
                foodType = item.foodTypeName;
            }
            var span = $("<span/>").append(foodType);
         
            li.append(a);
            a.append(img);
            a.append(h3);
            a.append(span);
            
            /*
            <li>
                <a href="#">
                    <img src="http://media.salir-static.net/_images_/verticales/b/6/3/d/137577-el_peletazo___restaurante_espectaculo_tn.jpg/89fh52">
                    <h3>El Koala</h3>
                    <span>Estás a 500 metros</span>
                </a>
            </li>
            */
            
            $("#resultList").append(li);
        	
        }  
    	
    }

    function errorCB(err) {
        alert("Error processing SQL: "+err.code);
    }
   

}


