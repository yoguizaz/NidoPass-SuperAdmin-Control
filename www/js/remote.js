//Local:
//var nidopassApiUrl = 'http://192.168.56.1:8080/emenu-webapp/api/1.0';
//var nidopassApiKey = '0cb88650-ad87-4408-a5d1-ce9011539944';

//Test:
//var nidopassApiUrl = 'http://nidopass-eu-prod.nidoapp2.eu.cloudbees.net/api/1.0';
//var nidopassApiUrl = 'http://212.97.161.15:8095/nidopass-test/api/1.0';
//var nidopassApiKey = 'jl3h8Ls7-Hk72-46Fd-sLH2-t4Al87Dh39tL';
//Production:
var nidopassApiUrl = 'http://nidopub-eu-prod.nidoapp.eu.cloudbees.net/api/1.0';
var nidopassApiKey = '7S12Dk23-3D4K-sej3-648d-shdi8shdKsDH';

var pubIdentificator;

var eventIdentificator;

var foodTypes = null;


var pubAccesed = false;


/*
* Muestra la ventana de inicio de la apliccacion
*/
function showHome()
{
    //var found = historyRecover('home');
    historyClear();
    //if(!found)
    //{
        show('home');
        setAutocomplete();
    
        updatePubsList();
    
        updateYearsFrom();
        updateMonthsFrom();
        updateDaysFrom();
        
        updateYearsTo();
        updateMonthsTo();
        updateDaysTo();
    //}
}

/*
* Actualiza los tipos de comida que aparecen en el formulari ode inicio y guarda en el historial la ventana
*/
function pubAccessApp()
{
	var db = getDatabase();
    
    db.transaction(queryDB, errorCB);
    
    function queryDB(tx) {
    	tx.executeSql('CREATE TABLE IF NOT EXISTS ACCESS (id unique, id_pub, name, logoImage, accessCode, id_event)');
        tx.executeSql('SELECT * FROM ACCESS WHERE id=1', [], querySuccess, errorCB);
    }
    
    function querySuccess(tx, results) {
    	
    	var len = results.rows.length;
    	
        if(len > 0)
        {
        	pubAppAuthCodeSavedSend(results.rows.item(0).accessCode, function(correctAccess) {
	        	if (correctAccess == true) {
	        		pubIdentificator = results.rows.item(0).id_pub;
                    eventIdentificator = results.rows.item(0).id_event;
		        	var pubLogo = results.rows.item(0).logoImage;
		        	var pubName = results.rows.item(0).name;
		        	var pubId = results.rows.item(0).id_pub;
                    var eventId = results.rows.item(0).id_event;
		        	loadPubData(pubLogo, pubName, pubId, eventId);
		        	pubAccesed = true;
		        	$('#blockedDiv').hide();
		        	openAccessCodePrompt();
	        	} else {
	        		pubAccesed = false;
	        		$('#blockedDiv').show();
	            	openAccessCodePrompt();
	        	}
        	});
        }
        else
        {
        	pubAccesed = false;
        	$('#blockedDiv').show();
        	openAccessCodePrompt();
        }
    }
    
    function errorCB(err) {
        alert("Error procesando SQL: "+err.code);
    }
	
    function openAccessCodePrompt() {
	    if (pubAccesed == false) {
			if (pubAccesed == false && maxAccessIntents <3) {
				if (maxAccessIntents == 0) {
					navigator.notification.prompt(
					        'Por favor, introduzca su código de acceso.\nIntentos: '+maxAccessIntents+' de 3',  // message
					        pubAppAuthCodeSend,                  // callback to invoke
					        'Acceso NidoPass SuperAdmin Control',            // title
					        ['Acceder','Cancelar'],             // buttonLabels
					        'Introduzca el código'                 // defaultText
					    );
				} else {
					navigator.notification.prompt(
					        'CÓDIGO DE ACCESO INCORRECTO\nPor favor, introduzca su código de acceso.\nIntentos: '+maxAccessIntents+' de 3',  // message
					        pubAppAuthCodeSend,                  // callback to invoke
					        'Acceso NidoPass SuperAdmin Control',            // title
					        ['Acceder','Cancelar'],             // buttonLabels
					        'Introduzca el código'                 // defaultText
					    );
						
				}
			} else if (pubAccesed == false && maxAccessIntents >=3) {
				var title;
		        var message;
		
		        message = "CÓDIGO DE ACCESO INCORRECTO\nSuperado número máximo de intentos.\nPara introducir el código de nuevo, por favor, cierre la app y vuelva a abrirla. \nIntentos: "+maxAccessIntents+" de 3";
		        title = "Acceso NidoPass SuperAdmin Control";
		        
		        navigator.notification.alert(
		        	    message,     // mensaje (message)
		        	    null,         // función 'callback' (alertCallback)
		        	    title,            // titulo (title)
		        	    'Aceptar'                // nombre del botón (buttonName)
		        	);
		        
			}
	    }
    }
}

var pubAuth;
var maxAccessIntents = 0;

function pubAppAuthCodeSend(results) {
	if (results.buttonIndex == 1) {
		
		var service = "pubAppsAuthenticationCodeSearch";  
	    
		var params = "&appsAuthenticationCode=" + results.input1;  
	    
	    // http://emenu-eu-test.nidoapp.eu.cloudbees.net/api/1.0/restaurantsSearch?key=449860a8-630e-4e08-ba63-7de4b4f6e3d6
	    var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey + params;
	
	
	    $.ajax({        
	        url: url,
	        dataType: 'jsonp',
	        success: function(data) {	    		   
	            
	            if(data.error == true)
	            {
	            	//hideLoading();
	
	                /*var title;
                    var message;

                    message = "Error: " + data.errorCode;
                    title = "Error";
                    

                    phoneAlert(title, message);*/
                    
                    accesed = false;
                    
                    maxAccessIntents = maxAccessIntents + 1;
                    
                    pubAccessApp();
	            }
	            else
	            {
	            	
	                //show('eventDetail');
	                
	            	appAuthentication = data.appAuthentication;
	                
	                var db = getDatabase();
	                
	                db.transaction(populateDB, errorCB);
	                
	                function populateDB(tx) {
	                	tx.executeSql('CREATE TABLE IF NOT EXISTS ACCESS (id unique, id_pub, name, logoImage, accessCode, id_event)');
	                	tx.executeSql('DELETE FROM ACCESS WHERE id=1');
                        if (appAuthentication.event) {
                            tx.executeSql('INSERT INTO ACCESS (id, id_pub, name, logoImage, accessCode, id_event) VALUES (1, ' + appAuthentication.pub.id + ', "' + appAuthentication.pub.name + '", "' + appAuthentication.logoImage.url + '", "' + appAuthentication.code + '", ' +
                            appAuthentication.event.id + ')');
                        } else {
                            tx.executeSql('INSERT INTO ACCESS (id, id_pub, name, logoImage, accessCode, id_event) VALUES (1, ' + appAuthentication.pub.id + ', "' + appAuthentication.pub.name + '", "' + appAuthentication.logoImage.url + '", "' + appAuthentication.code + '", ' +
                             null + ')');
                        }
	                }

	                function errorCB(err) {
	                    alert("Error processing SQL: "+err.code);
	                }
	              
               
                    title = "Acceso";
                    message = "Código válido, acceso correcto.";
               
               
                    phoneAlert(title, message);
	                //alert ('Acceso Correcto');
	                
	                
	                accesed = true;
	                
	                pubAccessApp();
	                
	                $('#blockedDiv').hide();
	                //hide loading
	                 //hideLoading();
	                 
	                }
	                
	                
	            }
	    });
	} else {
		navigator.app.exitApp();
	}
}

function pubAppAuthCodeSavedSend(code, callback) {
		
	var service = "pubAppsAuthenticationCodeSearch";  
    
	var params = "&appsAuthenticationCode=" + code;  
    
    // http://emenu-eu-test.nidoapp.eu.cloudbees.net/api/1.0/restaurantsSearch?key=449860a8-630e-4e08-ba63-7de4b4f6e3d6
    var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey + params;


    $.ajax({        
        url: url,
        dataType: 'jsonp',
        success: function(data) {	    		   
            
            if(data.error == true)
            {
            	//hideLoading();

                /*var title;
                var message;

                message = "Error: " + data.errorCode;
                title = "Error";
                

                phoneAlert(title, message);*/
                
                accesed = false;
                
                //maxAccessIntents = maxAccessIntents + 1;
                
                //pubAccessApp();
                
                callback(false);
            }
            else
            {
            	
                //show('eventDetail');
                
                
                //alert ('Acceso Correcto 2');
                
                
                accesed = true;
                //hide loading
                 //hideLoading();
                 
                
                callback(true);
                
            }
        }
    });
}

function getPubData() {
	/*alert('entra');
	var db = getDatabase();
    
    db.transaction(queryDB, errorCB);
    
    function queryDB(tx) {
    	tx.executeSql('CREATE TABLE IF NOT EXISTS ACCESS (id unique, id_pub, name, logoImage, accessCode)');
        tx.executeSql('SELECT * FROM ACCESS WHERE id=1', [], querySuccess, errorCB);
    }
    
    function querySuccess(tx, results) {
    	
    	var len = results.rows.length;
    	
        if(len > 0)
        {
        	alert(results.rows.item(0).logoImage+','+ results.rows.item(0).name+','+ results.rows.item(0).id_pub);
        	var logo = results.rows.item(0).logoImage;
        	var name = results.rows.item(0).name;
        	var id = results.rows.item(0).id_pub;
        	loadPubData(logo, name, id);
        } else {
        	
        }
    }
    
    function errorCB(err) {
        alert("Error procesando SQL: "+err.code);
    }*/
}

/*
* Establece el sistema de autocompletado dentro de la ventana de inicio de la aplicacion
*/
function setAutocomplete()
{
    var service = "eventsArtistAutocomplete";  
    
    //var pubId = pubIdentificator;
    
    var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey;

     $( "#prependedInput" ).autocomplete({
      minLength: 3,
      source: function(request, response) {


            $.ajax({        
                url: url + '&query=' + request.term,
                dataType: 'jsonp',
                success: function(data) {                  
                    
                    response(data.results);

                  },

                error: function() {
                            response([]);
                }
            });



        }

    })
    .data( "ui-autocomplete" )._renderItem = function( ul, item ) {


      return $( "<li>" )
        .append( "<a href='#' onclick='eventDetail(" + item.id + ")'>" + item.preSearched+ "<b>" + item.searched+ "</b>" + item.posSearched + "</a>" )
        .appendTo( ul );
    };
}

/*
* Actualiza las salas que aparecen en el listado de la ventana Home
*/
function updatePubsList()
{
    var service = "pubsSearch";
    
    var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey;


    $.ajax({        
        url: url,
        dataType: 'jsonp',
        success: function(data) {                  
            
            if(data.error == true)
            {
 
            }
            else
            {
                pubs = data.pubs

                 $.each(pubs, function(i, item){


                    var option = $("<option></option>");
                    option.attr("value", item.id);
                    option.append(item.name);     
                   
                    
                    $("#pubsList").append(option);

    
                });

                 historySave( 'home' ); 
            }

          }
    });
}

/*
* Realiza la busqueda de eventos y muestra los resultados
*/
function showResults()
{
    searchEvents();
}

/*
* Realiza la busqueda de restaurantes cercanos y nuestra los resultados
*/
function showNearResults()
{
    $("#prependedInput").val(""); 
    $("#distanceSelect").val("800");
    $("#foodTypeSelect").val("all");
    searchRestaurants();
}


var events;

/*
* Realiza la busqueda de eventos segun los criterios establecidos
*/
function searchEvents()
{  
	
	//show loading
    

	showLoading();
	
	
    var service = "eventsPubSearchByDateAndArtist";
    var query = $("#prependedInput").val();
    
    /*if (!pubIdentificator) {
    	var db = getDatabase();
        
        db.transaction(queryDB, errorCB);
        
        function queryDB(tx) {
        	tx.executeSql('CREATE TABLE IF NOT EXISTS ACCESS (id unique, id_pub, name, logoImage, accessCode, id_event)');
            tx.executeSql('SELECT * FROM ACCESS WHERE id=1', [], querySuccess, errorCB);
        }
        
        function querySuccess(tx, results) {
        	
        	var len = results.rows.length;
        	
            if(len > 0)
            {
            	pubIdentificator = results.rows.item(0).id_pub;
                eventIdentificator = results.rows.item(0).id_event;
            	
        	    var pubId = pubIdentificator;
                
                var eventId = eventIdentificator;
        	    
        	    var params = "";
        		
        		executeSearch();
        	
        	
        	    
        	    function executeSearch(near) {
        	    	
        	    	params = params + "&id=" + pubId + "&allDay=" + true + "&allDayAndExtra=" + true;
                    
                    if (eventId) {
                        params = params + "&eventId=" + eventId;
                    }
        	    	
        	    	var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey + params;
        	        
        	    	//alert("URL: " + url);
        	
        	        $.ajax({        
        	            url: url,
        	            dataType: 'jsonp',
        	            success: function(data) {	    		   
        	                
        	                if(data.error == true)
        	                {
        	                	hideLoading();
        	
        	                    var title;
        	                    var message;
        	
        	                    message = "Error: " + data.errorCode;
        	                    title = "Error";
        	                    
        	
        	                    phoneAlert(title, message);
        	                }
        	                else if(data.events.length == 0)
        	                {
        	                    hideLoading();
        	
        	                    var title;
        	                    var message;
        	
        	                    message = "No se han encontrado eventos."
        	                    title = "No hay resultados";
        	                    
        	
        	                    phoneAlert(title, message);
        	                }
        	                else
        	                {
        	                    
        	                	
        	                    show('results');  */
        	               
        	               
        	                    /*data.events.sort(function (a, b) {
        	                        return (parseInt(a.distance) - parseInt(b.distance));
        	                    });*/
        	               
        	               
        	 /*                    $.each(data.events, function(i, item){
        	                     
        	                        var li = $("<li></li>");
        	                        var a = $("<a/>").attr("href", "#");
        	                        //a.attr("onclick", "restaurantDetail(" + item.id + ", false)");
        	                        a.attr("onclick", "eventDetail(" + item.id + ")");
        	                        
        	                        var photoUrl = "http://media.salir-static.net/_images_/verticales/b/6/3/d/137577-el_peletazo___restaurante_espectaculo_tn.jpg/89fh52";
        	                        
        	                        if(item.photo != null)
        	                        {   
        	                            photoUrl = item.photo.url;
        	                        }
        	                        
        	                        var img = $("<img id='imagenrestaurante'/>").attr("src", photoUrl);
        	                        
                                    if (item.artist) {
        	                        	var h1 = $("<h1/>").append(item.title + "<br/>" + item.artist);
                                    } else {
        	                        	var h1 = $("<h1/>").append(item.title);
                                    }
        							
        	                        var date = $("<span id='date'/>").append(item.dateEvent);
        	                        
        	                        var totalTicketsOnlineSale = $("<span id='totalTicketsOnlineSale'/>").append("Entr. Venta: " + item.totalTicketsOnlineSale);
        	                        
        	                        var totalTicketsSold = $("<span id='totalTicketsSold'/>").append("Entr. Vendidas: " + item.totalTicketsSold);
        	                        
        	                        var totalTicketsValidated = $("<span id='totalTicketsValidated' style='font-weight:bolder;'/>").append("Entr. Validadas: " + item.totalTicketsValidated);
        	                        
        	                        var totalTicketsUnvalidated = $("<span id='totalTicketsUnvalidated' style='color:red; font-weight:bolder;'/>").append("Entr. Sin Validar: " + item.totalTicketsUnvalidated);
        	                        
        	                            
        							//var span = $("<span/>").append(foodType+priceMenu+distance);
        	                        li.append(a);
        	                        a.append(img);
        	                        a.append(h1);
        	                        a.append(date);
        	                        a.append(totalTicketsOnlineSale);
        	                        a.append(totalTicketsSold);
        	                        a.append(totalTicketsValidated);
        	                        a.append(totalTicketsUnvalidated);
        	                        //a.append(span);
        	                        //a.append(valoration);
        							//a.append(p);
        	                        //a.append(valoration);
        							//a.append(icono);
        	                        //a.append(span);
        	                        //li.append(icono);
        	                        
        	                        
        	                        $("#resultList").append(li);
        	                        
        	                    });
        	               
        	               
        	                    //hide loading
        	                     hideLoading();
        	               
        	                     historySave( "results" );
        	                     
        	                     
        	                     events = data.events;
        	                     
        	                     
        	                     
        	                     //viewMap();
        	                     
        	                     
        	                     
        	                     
        	                     
        	                     
        	                     
        	                    
        	                     
        	                }
        	
        	    		  }
        	        });
        	    	
        		}
            	
            } else {
    	        historyBack();
            }
        }
        
        function errorCB(err) {
            alert("Error procesando SQL: "+err.code);
        }
    } else { */
    
        var pubId = $("#pubsList").val();
        
        //var eventId = eventIdentificator;
	    
	    /*var distance = $("#distanceSelect").val();
	    var searchType = $("#searchTypeSelect").val();
	    var foodType = $("#foodTypeSelect").val();
	    var priceType = $("#priceSelect").val();*/
	    
        var dateFrom = null;
	    if ($("#eventsDateMonthFrom").val() != "all" && $("#eventsDateDayFrom").val() != "all" && $("#eventsDateYearFrom").val() != "all") {
	    	dateFrom = $("#eventsDateMonthFrom").val() + "/" + $("#eventsDateDayFrom").val() + "/" + $("#eventsDateYearFrom").val() + " 00:00:00";
		}
        var dateTo = null;
	    if ($("#eventsDateMonthTo").val() != "all" && $("#eventsDateDayTo").val() != "all" && $("#eventsDateYearTo").val() != "all") {
	    	dateTo = $("#eventsDateMonthTo").val() + "/" + $("#eventsDateDayTo").val() + "/" + $("#eventsDateYearTo").val() + " 23:59:59";
	    }
	    
	    
	    var params = "";
	    
	
	
		/*if (navigator != null && navigator.geolocation != null) {
	
			var onSuccess = function(position) {
	
	            currentLocation = {};
	            
	            if (searchType=="geolocation") {
	                currentLocation["latitude"] = position.coords.latitude;
	                currentLocation["longitude"] = position.coords.longitude;
	            } else if (searchType=="huesca") {
	                //AYUNTAMIENTO DE HUESCA
	                currentLocation["latitude"] = 42.1359063;
	                currentLocation["longitude"] = -0.4058484;
	            } else if (searchType=="teruel") {
	                //AYUNTAMIENTO DE TERUEL
	                currentLocation["latitude"] = 40.3450096;
	                currentLocation["longitude"] = -1.1009649;
	            } else if (searchType=="zaragoza") {
	                //PLAZA DEL PILAR
	                currentLocation["latitude"] = 41.6556891;
	                currentLocation["longitude"] = -0.8775525;
	            }
	
				executeSearch();
			};
	
			function onError(error) {
				executeSearch();
			}
	
			navigator.geolocation.getCurrentPosition(onSuccess, onError);
	
		} else {*/
			executeSearch();
		//}
	
	    
	    function executeSearch(near) {
	    	
	    	
	    	if(query != null && query != "")
	        {
	            params = params + "&query=" + query;
	        }
            
            if (pubId>0) {
                params = params + "&pubId=" + pubId;
            }
	
	        if(dateFrom != null && dateTo != null)
	        {
	        	params = params + "&dateFrom=" + dateFrom  ;
	            params = params + "&dateTo=" + dateTo;
	        
	        } else if(dateFrom != null && dateTo == null) {
	        	params = params + "&dateFrom=" + dateFrom  ;
	        } else if(dateFrom == null && dateTo != null) {
	        	params = params + "&dateTo=" + dateTo;
	    	}
	    	
	        //params = params + "&pubId=" + pubId;
	    	
	    	params = params + "&id=" + pubId + "&allDay=" + true + "&allDayAndExtra=" + true;
            
            if (eventId) {
                params = params + "&eventId=" + eventId
            }
	    	
	    	var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey + params;        
	        
	    	//alert("URL: " + url);
	
	        $.ajax({        
	            url: url,
	            dataType: 'jsonp',
	            success: function(data) {	    		   
	                
	                if(data.error == true)
	                {
	                	hideLoading();
	
	                    var title;
	                    var message;
	
	                    message = "Error: " + data.errorCode;
	                    title = "Error";
	                    
	
	                    phoneAlert(title, message);
	                }
	                else if(data.events.length == 0)
	                {
	                    hideLoading();
	
	                    var title;
	                    var message;
	
	                    message = "No se han encontrado eventos."
	                    title = "No hay resultados";
	                    
	
	                    phoneAlert(title, message);
	                }
	                else
	                {
	                    
	                	
	                    show('results');
	                    
	                    //alert("Restaurants: " + data.restaurants);
	               
	               
	                    /*data.events.sort(function (a, b) {
	                        return (parseInt(a.distance) - parseInt(b.distance));
	                    });*/
	               
	               
	                     $.each(data.events, function(i, item){
	                     
	                        var li = $("<li></li>");
	                        var a = $("<a/>").attr("href", "#");
	                        //a.attr("onclick", "restaurantDetail(" + item.id + ", false)");
	                        a.attr("onclick", "eventDetail(" + item.id + ")");
	                        
	                        var photoUrl = "http://media.salir-static.net/_images_/verticales/b/6/3/d/137577-el_peletazo___restaurante_espectaculo_tn.jpg/89fh52";
	                        
	                        if(item.photo != null)
	                        {   
	                            photoUrl = item.photo.url;
	                        }
	                        
	                        var img = $("<img id='imagenrestaurante'/>").attr("src", photoUrl);
	                        
                            if (item.artist) {
                                var h1 = $("<h1/>").append(item.title + "<br/>" + item.artist);
                            } else {
                                var h1 = $("<h1/>").append(item.title);
                            }
							
	                        var date = $("<span id='date'/>").append(item.dateEvent);
	                        
	                        var totalTicketsOnlineSale = $("<span id='totalTicketsOnlineSale'/>").append("Entr. Venta: " + item.totalTicketsOnlineSale);
	                        
	                        var totalTicketsSold = $("<span id='totalTicketsSold'/>").append("Entr. Vendidas: " + item.totalTicketsSold);
	                        
	                        var totalTicketsValidated = $("<span id='totalTicketsValidated' style='font-weight:bolder;'/>").append("Entr. Validadas: " + item.totalTicketsValidated);
	                        
	                        var totalTicketsUnvalidated = $("<span id='totalTicketsUnvalidated' style='color:red; font-weight:bolder;'/>").append("Entr. Sin Validar: " + item.totalTicketsUnvalidated);
	                        
	                        /*var musicType = "";                    
	                        if(item.musicType != null)
	                        {
	                            if(item.foodType.name != null && item.foodType != "null")
	                            musicType = item.foodType.name;
	                        }
	                        
	                        var priceMenu = "";
	                        if(item.menuPriceFrom!=null && item.menuPriceFrom!="0" &&
	                           item.menuPriceTo != null && item.menuPriceTo!="0") {
	                            priceMenu = item.menuPriceFrom + " - " + item.menuPriceTo + "eur<br>";
	                        } else if (item.menuPriceFrom != null && item.menuPriceFrom!="0" &&
	                                   (item.menuPriceTo == null || item.menuPriceTo=="0")) {
	                            priceMenu = "Desde " + item.menuPriceFrom + "eur.<br>";
	                        }
	                            
	                        if(item.description){
	                            var p
	                            if (item.name.length<=13)
	                                p = $("<p id='descripcion'/>").append(item.description.substr(0,50)+"...");
	                            else if (item.name.length<=26)
	                                p = $("<p id='descripcion'/>").append(item.description.substr(0,40)+"...");
	                            else
	                                p = $("<p id='descripcion'/>").append(item.description.substr(0,30)+"...");
	                        }else{
								var p = $("<p id='descripcion'/>").append("Descripción no disponible");
							}*/
							/*var icono;
	                            
	                        if(item.onlineReservations) {
	                            icono = $("<img id='reservar'/>");
	                            icono.attr("src", "./img/btn_reservas.png");
	                            icono.attr("onclick", "showRestaurantReservation(" + item.id + ", '" + item.name + "')");
	                        } else {
	                            icono = $("<img id='reservar'/>");
	                            icono.attr("src", "./img/btn_reservas-disabled.png");
	                            icono.attr("onclick", "");
	                        }*/
	                       /* var distance = "";
	                        distance = calculateDistance(currentLocation["latitude"], currentLocation["longitude"], item.coordinates.latitude, item.coordinates.longitude);
	                            
	                        if (distance >=1000) {
	                            distance = distance/1000;
	                            distance = "A " + distance.toFixed(0) + "Km.";
	                        } else {
	                            distance = "A " + distance + "m.";
	                        }
	                        
	                        var valoration;
	                        valoration= $("<p id='valoration'/>").append("<i id='star1-" + item.id + "' class='icon-star'></i> <i id='star2-" + item.id + "' class='icon-star'></i> <i id='star3-" + item.id + "' class='icon-star'></i> <i id='star4-" + item.id + "' class='icon-star'></i> <i id='star5-" + item.id + "' class='icon-star'></i>");
	                            
	                            var star1="#star1-"+item.id;
	                            var star2="#star2-"+item.id;
	                            var star3="#star3-"+item.id;
	                            var star4="#star4-"+item.id;
	                            var star5="#star5-"+item.id;
	                            
	                            
	                            
	                        if (foodType.length>14) {
	                            foodType = foodType.substr(0, 12) + "...<br>";
	                        } else if (foodType!="") {
	                            foodType = foodType + "<br>"
	                        }*/
	                            
							//var span = $("<span/>").append(foodType+priceMenu+distance);
	                        li.append(a);
	                        a.append(img);
	                        a.append(h1);
	                        a.append(date);
	                        a.append(totalTicketsOnlineSale);
	                        a.append(totalTicketsSold);
	                        a.append(totalTicketsValidated);
	                        a.append(totalTicketsUnvalidated);
	                        //a.append(span);
	                        //a.append(valoration);
							//a.append(p);
	                        //a.append(valoration);
							//a.append(icono);
	                        //a.append(span);
	                        //li.append(icono);
	                        
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
	                            
	                      /*  if(item.valoration) {
	                            if(item.valoration==1){
	                                $(star1).attr("style", "-webkit-text-fill-color: #21c368 !important;");
	                                $(star2).attr("style", "");
	                                $(star3).attr("style", "");
	                                $(star4).attr("style", "");
	                                $(star5).attr("style", "");
	                            } else if(item.valoration==2){
	                                $(star1).attr("style", "-webkit-text-fill-color: #21c368 !important;");
	                                $(star2).attr("style", "-webkit-text-fill-color: #21c368 !important;");
	                                $(star3).attr("style", "");
	                                $(star4).attr("style", "");
	                                $(star5).attr("style", "");
	                            } else if(item.valoration==3){
	                                $(star1).attr("style", "-webkit-text-fill-color: #21c368 !important;");
	                                $(star2).attr("style", "-webkit-text-fill-color: #21c368 !important;");
	                                $(star3).attr("style", "-webkit-text-fill-color: #21c368 !important;");
	                                $(star4).attr("style", "");
	                                $(star5).attr("style", "");
	                            } else if(item.valoration==4){
	                                $(star1).attr("style", "-webkit-text-fill-color: #21c368 !important;");
	                                $(star2).attr("style", "-webkit-text-fill-color: #21c368 !important;");
	                                $(star3).attr("style", "-webkit-text-fill-color: #21c368 !important;");
	                                $(star4).attr("style", "-webkit-text-fill-color: #21c368 !important;");
	                                $(star5).attr("style", "");
	                            } else if(item.valoration==5){
	                                $(star1).attr("style", "-webkit-text-fill-color: #21c368 !important;");
	                                $(star2).attr("style", "-webkit-text-fill-color: #21c368 !important;");
	                                $(star3).attr("style", "-webkit-text-fill-color: #21c368 !important;");
	                                $(star4).attr("style", "-webkit-text-fill-color: #21c368 !important;");
	                                $(star5).attr("style", "-webkit-text-fill-color: #21c368 !important;");
	                            } else {
	                                $(star1).attr("style", "");
	                                $(star2).attr("style", "");
	                                $(star3).attr("style", "");
	                                $(star4).attr("style", "");
	                                $(star5).attr("style", "");
	                            }
	                        }*/
	                        
	                        
	                   
	
	    	
	                    });
	               
	               
	                    //hide loading
	                     hideLoading();
	               
	                     historySave( "results" );
	                     
	                     
	                     events = data.events;
	                     
	                     
	                     
	                     //viewMap();
	                     
	                     
	                     
	                     
	                     
	                     
	                     
	                    
	                     
	                }
	
	    		  }
	        });
	    	
		//}
    }
  
    
}


var event;
var photo;

/*
* Muestra el detalle de un evento
*/
function eventDetail(id)
{  
	
	//show loading
	showLoading();
	
	
    var service = "eventDetail";
    //var id = $("#restaurantId").val();
    
    //alert("query: " + query);
    
    var params = "&eventId=" + id;    
    
    // http://emenu-eu-test.nidoapp.eu.cloudbees.net/api/1.0/restaurantsSearch?key=449860a8-630e-4e08-ba63-7de4b4f6e3d6
    var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey + params;


    $.ajax({        
        url: url,
        dataType: 'jsonp',
        success: function(data) {	    		   
            
            if(data.error == true)
            {
            	hideLoading();

                var title;
                    var message;

                    message = "Error: " + data.errorCode;
                    title = "Error";
                    

                    phoneAlert(title, message);
            }
            else
            {
            	
                show('eventDetail');
                
                event = data.event;
                
                
                $("#eventDetailTitle").html(data.event.title);
           
                if (data.event.dateEvent)
                    $("#eventDetailDate").html("<b>Fecha y Hora:</b> " + data.event.dateEvent);
           
                if (data.event.totalTicketsOnlineSale)
                    $("#eventDetailTotalTicketsOnlineSale").html("<b>Total Entradas Venta:</b> "+data.event.totalTicketsOnlineSale);
                
                if (data.event.totalTicketsSold)
                    $("#eventDetailTotalTicketsSold").html("<b>Total Entradas Vendidas:</b> "+data.event.totalTicketsSold);
                
                if (data.event.totalTicketsValidated) {
                	if (data.event.totalTicketsValidated=='0') {
                		$("#eventDetailTotalTicketsValidated").html("<b>Total Entradas Validadas:</b> <span style='color:red;'>"+data.event.totalTicketsValidated+"</span>");
                	} else {
                		$("#eventDetailTotalTicketsValidated").html("<b>Total Entradas Validadas:</b> <span style='color:green;'>"+data.event.totalTicketsValidated+"</span>");
                	}
                } else {
                    $("#eventDetailTotalTicketsValidated").html("<b>Total Entradas Validadas:</b> <span style='color:red;'>0</span>");
            	}
            
                if (data.event.totalTicketsUnvalidated) {
                	if (data.event.totalTicketsUnvalidated=='0') {
                		$("#eventDetailTotalTicketsUnvalidated").html("<b>Total Entradas Sin Validar:</b> <span style='color:green;'>"+data.event.totalTicketsUnvalidated+"</span>");
                	} else {
                		$("#eventDetailTotalTicketsUnvalidated").html("<b>Total Entradas Sin Validar:</b> <span style='color:red;'>"+data.event.totalTicketsUnvalidated+"</span>");
                	}
                } else {
                    $("#eventDetailTotalTicketsUnvalidated").html("<b>Total Entradas Sin Validar:</b> <span style='color:green;'>0</span>");
                }
                
                if (data.event.price)
                    $("#eventDetailPrice").html("<b>Precio:</b> "+data.event.price);
                
                if (data.event.commission)
                    $("#eventDetailCommission").html("<b>Comisión:</b> "+data.event.commission);
           
                if (data.event.pubMusicType && data.event.musicSubType) {
                    $("#eventDetailMusicType").html("<b>Tipo Música:</b> "+data.event.pubMusicType.name+" "+data.event.musicSubType);
                } else if (data.event.pubMusicType) {
                    $("#eventDetailMusicType").html("<b>Tipo Música:</b> "+data.event.pubMusicType.name);
                }
           
                if (data.event.description)
                	$("#eventDetailDescription").html(data.event.description);
           
                if(data.event.url)
                    $("#eventDetailUrl").html("<b>Web Evento:</b> <a href='#' onclick=\"navigator.app.loadUrl('" + data.event.url + "', { openExternal:true });\">" + data.event.url + "</a>");

                if (data.event.photo)
                    $("#eventDetailPhoto").attr("src", data.event.photo.url);
                
                $("#eventDetailButtonTicketsList").attr("onclick", "showTicketsList(" + data.event.id + ")");
                $("#eventDetailButtonTicketsSales").attr("onclick", "showTicketsSalesList(" + data.event.id + ")");
           
                
                //hide loading
                 hideLoading();
                 
                 historySave( "eventDetail" );
                }
                
                
            }
    });

    
}


var tickets;

/*
* Realiza la busqueda de tickets de un evento concreto
*/
function showTicketsList(id)
{  
	
	//show loading
    

	showLoading();
	
	
    var service = "eventTicketsSearch";
    //var query = $("#prependedInput").val();
    var eventId = id;
    
    
    var params = "";
    
    executeSearch();

    
    function executeSearch(near) {
    	
    	
    	if(eventId != null && eventId != "")
        {
            params = params + "&eventId=" + eventId;
        }
    	
    	var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey + params;        
        
    	//alert("URL: " + url);

        $.ajax({        
            url: url,
            dataType: 'jsonp',
            success: function(data) {	    		   
                
                if(data.error == true)
                {
                	hideLoading();

                    var title;
                    var message;

                    message = "Error: " + data.errorCode;
                    title = "Error";
                    

                    phoneAlert(title, message);
                }
                else if(data.tickets.length == 0)
                {
                    hideLoading();

                    var title;
                    var message;

                    message = "No se han encontrado entradas."
                    title = "No hay resultados";
                    

                    phoneAlert(title, message);
                }
                else
                {
                    
                	
                    show('ticketsResults');
                    
                    //alert("Restaurants: " + data.restaurants);
               
               
                    /*data.events.sort(function (a, b) {
                        return (parseInt(a.distance) - parseInt(b.distance));
                    });*/
               
                    //var table = $("<table/>");
               
                     $.each(data.tickets, function(i, item){
                     
                        var tr = $("<tr/>");
                        //var a = $("<a/>").attr("href", "#");
                        //a.attr("onclick", "restaurantDetail(" + item.id + ", false)");
                        //a.attr("onclick", "eventDetail(" + item.id + ")");
                        
                        
                        var td1 = $("<td id='ticketNumber'/>").append(item.ticketNumber);
						
                        var td2 = $("<td id='externaId'/>").append(item.externalId);
                        
                        if (item.accessed)
                        	var td3 = $("<td id='verified'/>").append('SÍ');
                        else
                        	var td3 = $("<td id='verified'/>").append('NO');
                        
                        
                        
                        tr.append(td1);
                        tr.append(td2);
                        tr.append(td3);
                        //table.append(tr)
                        
                        $("#resultList").append(tr);

                    });
                     
                    
               
                    $('#wrapper').animate({scrollTop: $('#wrapper').offset().top}, 600);
               
                    $('#cajaScroll').animate({scrollTop: $('#cajaScroll').offset().top}, 600);
               
                    $('#contenidoCuerpo').animate({scrollTop: $('#contenidoCuerpo').offset().top}, 600);
               
                    //hide loading
                     hideLoading();
               
                     historySave( "ticketsResults" );
                     
                     
                     tickets = data.tickets;
                     
                }
    		  }
        });	
	}
}


var sales;

/*
* Realiza la busqueda de ventas de tickets de un evento concreto
*/
function showTicketsSalesList(id)
{  
	
	//show loading
    

	showLoading();
	
	
    var service = "eventTicketsSalesSearch";
    //var query = $("#prependedInput").val();
    var eventId = id;
    
    
    var params = "";
    
    executeSearch();

    
    function executeSearch(near) {
    	
    	
    	if(eventId != null && eventId != "")
        {
            params = params + "&eventId=" + eventId;
        }
    	
    	var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey + params;        
        
    	//alert("URL: " + url);

        $.ajax({        
            url: url,
            dataType: 'jsonp',
            success: function(data) {	    		   
                
                if(data.error == true)
                {
                	hideLoading();

                    var title;
                    var message;

                    message = "Error: " + data.errorCode;
                    title = "Error";
                    

                    phoneAlert(title, message);
                }
                else if(data.sales.length == 0)
                {
                    hideLoading();

                    var title;
                    var message;

                    message = "No se han encontrado ventas de entradas."
                    title = "No hay resultados";
                    

                    phoneAlert(title, message);
                }
                else
                {
                    
                	
                    show('ticketsSalesResults');
                    
                    //alert("Restaurants: " + data.restaurants);
               
               
                    /*data.events.sort(function (a, b) {
                        return (parseInt(a.distance) - parseInt(b.distance));
                    });*/
               
                    var totalTicketsVal = 0;
                    
                    var totalTicketsUnval = 0;
               
                     $.each(data.sales, function(i, item){
                     
                        var li = $("<li></li>");
                        var a = $("<a/>").attr("href", "#");
                        //a.attr("onclick", "restaurantDetail(" + item.id + ", false)");
                            a.attr("onclick", "");//"ticketsSaleDetail(" + item.id + ")");
                        
                        if (item.totalTicketsValidated && item.totalTicketsValidated!='0'){
                        	totalTicketsVal = totalTicketsVal + parseInt(item.totalTicketsValidated);
                        }
                        
                        if (item.totalTicketsUnvalidated && item.totalTicketsUnvalidated!='0'){
                        	totalTicketsUnval = totalTicketsUnval + parseInt(item.totalTicketsUnvalidated);
                        }
                        
						var marker = $("<span id='enabled'/>").append();
						
						if(item.totalTicketsUnvalidated>0) {
							marker = $("<span id='enabled'/>").append('*');
						} else {
							a.attr('onclick', '');
							a.attr('style', 'color:gray;');
						}
                        
                        var h1 = $("<h1 id='customerName'/>").append(item.customer.name);
                        
                        //var td2 = $("<td id='customerMail'/>").append(item.customer.email);
                        
                        //var td3 = $("<td id='customerPhone'/>").append(item.customer.phone);
                        
                        var span1 = $("<p id='externalId'/>").append(item.externalId);
                        
                        var span2 = $("<span id='totalTicketsBuy'/>").append("Entr. Compradas: " + item.totalTicketsBuy);
                        
                        a.append(li);
                        li.append(marker);
                        li.append(h1);
                        //tr.append(td2);
                        //tr.append(td3);
                        li.append(span1);
                        li.append(span2);
                        
                        $("#customersResultList").append(a);

                    });
                     
                     var aFilter = $("<a id='linkSearch'/>").attr("href", "#");
                     aFilter.attr("onclick", "openSearchTicketsSalesList()");
                     
                     var imgSearch = $("<img id='imgSearch'/>").attr("src", "./img/ic_busqueda.png");
                     
                     aFilter.append(imgSearch);
               
                    var aBack = $("<a id='linkBack'/>").attr("href", "#");
                    aBack.attr("onclick", "historyBack()");
               
                    var imgBack = $("<img id='imgBack'/>").attr("src", "./img/ic_volver.png");
               
                    aBack.append(imgBack);
               
                    $("#totalTicketsValUnval").append(aBack);
               
                    $("#totalTicketsValUnval").append("<span><b>"+totalTicketsVal+" dentro, faltan "+totalTicketsUnval+"</b></span>")
                     
                     $("#totalTicketsValUnval").append(aFilter);
                     
                     
                     $('#wrapper').animate({scrollTop: $('#wrapper').offset().top}, 600);
                     
                     $('#cajaScroll').animate({scrollTop: $('#cajaScroll').offset().top}, 600);
                     
                     $('#contenidoCuerpo').animate({scrollTop: $('#contenidoCuerpo').offset().top}, 600);
                     //$("#wrapper").scrollTop();
                     //$("#cajaScroll").scrollTop();
                     //$("#contenidoCuerpo").scrollTop();
               
               
                    //hide loading
                     hideLoading();
               
                     historySave( "ticketsSalesResults" );
                     
                     
                     sales = data.sales;
                     
                }
    		  }
        });	
	}
}

var salesFiltered;

function openSearchTicketsSalesList() {
	navigator.notification.prompt(
	        'Por favor, introduzca el nombre o parte del nombre del cliente.',  // message
	        filterTicketsSalesList,                  // callback to invoke
	        'Busqueda compras clientes',            // title
	        ['Cerrar', 'Ver Todos', 'Buscar'],             // buttonLabels
	        ''                 // defaultText
	    );
}

/*
* Realiza un filtro por nombre de cliente en la lista de ventas de tickets
*/
function filterTicketsSalesList(results) {
	if (results) {
		showLoading();
		if (results.buttonIndex == 3) {
			if (results.input1 && results.input1 != '') {
				salesFiltered = $.grep(sales, function(element){
					return element.customer.name.toLowerCase().indexOf(results.input1.toLowerCase())>=0;
				});
				
				$("#customersResultList").html('');
				
				$.each(salesFiltered, function(i, item){
                    
                    var li = $("<li></li>");
                    var a = $("<a/>").attr("href", "#");
                    a.attr("onclick", "ticketsSaleDetail(" + item.id + ")");
                    
					var marker = $("<span id='enabled'/>").append();
					
					if(item.totalTicketsUnvalidated>0) {
						marker = $("<span id='enabled'/>").append('*');
					} else {
						a.attr('onclick', '');
						a.attr('style', 'color:gray;');
					}
                    
                    var h1 = $("<h1 id='customerName'/>").append(item.customer.name);
                    
                    var span1 = $("<p id='externalId'/>").append(item.externalId);
                    
                    var span2 = $("<span id='totalTicketsBuy'/>").append("Entr. Compradas: " + item.totalTicketsBuy);
                    
                    a.append(li);
                    li.append(marker);
                    li.append(h1);
                    li.append(span1);
                    li.append(span2);
                    
                    $("#customersResultList").append(a);

                });
				
                //hide loading
                 hideLoading();
				
			} else {
				salesFiltered = sales;
				
				$("#customersResultList").html('');
				
				$.each(salesFiltered, function(i, item){
                    
                    var li = $("<li></li>");
                    var a = $("<a/>").attr("href", "#");
                    a.attr("onclick", "ticketsSaleDetail(" + item.id + ")");
                    
					var marker = $("<span id='enabled'/>").append();
					
					if(item.totalTicketsUnvalidated>0) {
						marker = $("<span id='enabled'/>").append('*');
					} else {
						a.attr('onclick', '');
						a.attr('style', 'color:gray;');
					}
                    
                    var h1 = $("<h1 id='customerName'/>").append(item.customer.name);
                    
                    var span1 = $("<p id='externalId'/>").append(item.externalId);
                    
                    var span2 = $("<span id='totalTicketsBuy'/>").append("Entr. Compradas: " + item.totalTicketsBuy);
                    
                    a.append(li);
                    li.append(marker);
                    li.append(h1);
                    li.append(span1);
                    li.append(span2);
                    
                    $("#customersResultList").append(a);

                });
				
                //hide loading
                 hideLoading();
			}
		} else if (results.buttonIndex == 2) {
			salesFiltered = sales;

			$("#customersResultList").html('');
			
			$.each(salesFiltered, function(i, item){
                
                var li = $("<li></li>");
                var a = $("<a/>").attr("href", "#");
                a.attr("onclick", "ticketsSaleDetail(" + item.id + ")");
                
				var marker = $("<span id='enabled'/>").append();
				
				if(item.totalTicketsUnvalidated>0) {
					marker = $("<span id='enabled'/>").append('*');
				} else {
					a.attr('onclick', '');
					a.attr('style', 'color:gray;');
				}
                
                var h1 = $("<h1 id='customerName'/>").append(item.customer.name);
                
                var span1 = $("<p id='externalId'/>").append(item.externalId);
                
                var span2 = $("<span id='totalTicketsBuy'/>").append("Entr. Compradas: " + item.totalTicketsBuy);
                
                a.append(li);
                li.append(marker);
                li.append(h1);
                li.append(span1);
                li.append(span2);
                
                $("#customersResultList").append(a);

            });
			
            //hide loading
             hideLoading();
		} else {
			hideLoading();
		}
	}
}

var sale;

/*
* Muestra el detalle de un evento
*/
function ticketsSaleDetail(id)
{  
	
	//show loading
	showLoading();
	
	
    var service = "ticketsSaleDetail";
    //var id = $("#restaurantId").val();
    
    //alert("query: " + query);
    
    var params = "&saleId=" + id;    
    
    // http://emenu-eu-test.nidoapp.eu.cloudbees.net/api/1.0/restaurantsSearch?key=449860a8-630e-4e08-ba63-7de4b4f6e3d6
    var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey + params;


    $.ajax({        
        url: url,
        dataType: 'jsonp',
        success: function(data) {	    		   
            
            if(data.error == true)
            {
            	hideLoading();

                var title;
                    var message;

                    message = "Error: " + data.errorCode;
                    title = "Error";
                    

                    phoneAlert(title, message);
            }
            else
            {
            	
                show('ticketsSaleDetail');
                
                sale = data.sale;
                
                
                $("#ticketSaleDetailCustomerName").html(sale.customer.name);
           
                if (sale.externalId)
                    $("#ticketSaleDetailExternalId").html("<b>Localizador:</b> " + sale.externalId);
           
               if (sale.tickets) {
                	var ticketsNumbers;
                	$.each(sale.tickets, function(i, item){
                		if (i==0) {
                			ticketsNumbers = item.ticketNumber;
                		} else {
                			ticketsNumbers = ticketsNumbers+", "+item.ticketNumber;
                		}
                	});
                    $("#ticketSaleDetailTicketsNumbers").html("<b>Entradas:</b> "+ticketsNumbers);
                }
               
               if (sale.promotionalCode && sale.promotionalCode!="") {
                   $("#ticketSaleDetailPromotionalCode").html("<b>Código Promocional:</b> "+sale.promotionalCode.code+" (Desc: "+sale.promotionalCode.discount+")");
               } else {
            	   $("#ticketSaleDetailPromotionalCode").html("<b>Código Promocional:</b> Sin Código Promoc.");
               }
               var saleId = sale.id;
               
               if (sale.tickets) {
	               $.each(sale.tickets, function(i, item){
		           		if (item.accessed) {
		           			$("#ticketSaleDetailValidateButtons").append("<a href='#' class='validateDisabled' onclick=''>Validar Ent. "+item.ticketNumber+"</a><br/><br/><br/>");
		           		} else {
		           			var qr = item.externalId+"/"+item.ticketNumber;
		           			$("#ticketSaleDetailValidateButtons").append("<a href='#' class='validateEnabled' onclick=\"javascript:manualValidateTicket('"+qr+"',"+saleId+")\">Validar Ent. "+item.ticketNumber+"</a><br/><br/><br/>");
		           		}
		           	});
               }
                
                //$("#eventDetailButtonTicketsList").attr("onclick", "showTicketsList(" + data.event.id + ")");
                //$("#eventDetailButtonTicketsSales").attr("onclick", "showTicketsSalesList(" + data.event.id + ")");
           
                
                //hide loading
                 hideLoading();
                 
                 historySave( "ticketsSaleDetail" );
                }
                
                
            }
    });

    
}

/*
* Realiza la validación de tickets
*/
function validateTicket(qr)
{  
	
	//show loading
	//showLoading();
	
	
    var service = "readTicketQR";
    //var id = $("#restaurantId").val();
    
    //alert("query: " + query);
    
    var params = "&qr=" + qr;    
    
    // http://emenu-eu-test.nidoapp.eu.cloudbees.net/api/1.0/restaurantsSearch?key=449860a8-630e-4e08-ba63-7de4b4f6e3d6
    var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey + params;

    
    $.ajax({        
        url: url,
        dataType: 'jsonp',
        success: function(data) {	    		   
            
            if(data.error == true)
            {
            	hideLoading();

                var title;
                var message;

                if (data.errorCode == 'TICKET_ACCESSED_OR_NOT_VALID') {
                    message = "Esta entrada ya ha sido utilizada o no es valida.";
                    title = "Error";
                } else if (data.errorCode == 'TICKET_EVENT_NOT_STARTED') {
                    message = "Esta entrada no se puede validar, porque todavía no es la hora del evento.";
                    title = "Error";
                } else {
                    message = "Código QR no valido.";
                    title = "Error";
                }
           
           
                navigator.notification.confirm(
                    message,     // mensaje (message)
                    function (buttonIndex) {
                        readQRMessageResult(buttonIndex);
                    },         // función 'callback' (alertCallback)
                    title,            // titulo (title)
                    'Seguir Validando, Cerrar'             // nombre del botón (buttonName)
                );

                    //phoneAlert(title, message);
                    
                    //historyClear();
                    
                    //window.location.href="index.html";
            }
            else
            {
            	
            	hideLoading();

                var title;
                    var message;

                    //message = "Error: " + data.errorCode;
                    message = "VALIDACIÓN CORRECTA, entrada valida.";
                    title = "Validación Correcta";
           
                    navigator.notification.confirm(
                        message,     // mensaje (message)
                        function (buttonIndex) {
                            readQRMessageResult(buttonIndex);
                        },         // función 'callback' (alertCallback)
                        title,            // titulo (title)
                        'Seguir Validando, Cerrar'             // nombre del botón (buttonName)
                    );

                    //phoneAlert(title, message);
                    
                    //historyClear();
                    
                    //window.location.href="index.html";
           
                }
                
                
            }
    });

    
}

/*
 * Abre o no el lector de QR segun el botón pulsado del confirm
 */
function readQRMessageResult(buttonIndex)
{
	if (buttonIndex == 1) {
		showQRCodeScanner();
	}
}

/*
* Realiza la validación de tickets pero manualmente al pulsar un botón en lugar de
* leer un QR
*/
function manualValidateTicket(qrValue, saleId)
{
	var message = "¿Seguro que quieres validar la entrada " + qrValue.substr(qrValue.indexOf('/')+1) + " manualmente?";
	
    navigator.notification.confirm(
                                 message,     // mensaje (message)
                                 function (buttonIndex) {
                                	 validate(buttonIndex, qrValue, saleId);
                                 },         // función 'callback' (alertCallback)
                                 "Validación Manual de Entradas.",            // titulo (title)
                                 'Validar, Cancelar'             // nombre del botón (buttonName)
                                 );
	
}

/*
* Realiza la validación del qr (Esta función se utiliza desde la validación manual)
*/
function validate(buttonIndex, qr, id)
{  
	if (buttonIndex == 1) {
		//show loading
		//showLoading();
		
		
	    var service = "readTicketQR";
	    //var id = $("#restaurantId").val();
	    
	    //alert("query: " + query);
	    
	    var params = "&qr=" + qr;    
	    
	    // http://emenu-eu-test.nidoapp.eu.cloudbees.net/api/1.0/restaurantsSearch?key=449860a8-630e-4e08-ba63-7de4b4f6e3d6
	    var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey + params;
	
	    
	    $.ajax({        
	        url: url,
	        dataType: 'jsonp',
	        success: function(data) {	    		   
	            
	            if(data.error == true)
	            {
	            	hideLoading();
	
	                var title;
                    var message;
	
                    if (data.errorCode == 'TICKET_ACCESSED_OR_NOT_VALID') {
                        message = "Esta entrada ya ha sido utilizada o no es valida.";
                        title = "Error";
                    } else if (data.errorCode == 'TICKET_EVENT_NOT_STARTED') {
                        message = "Esta entrada no se puede validar, porque todavía no es la hora del evento.";
                        title = "Error";
                    }
	              
	
	                    phoneAlert(title, message);
	                    
	                    historyBack();
	                    ticketsSaleDetail(id);
	            }
	            else
	            {
	            	
	            	hideLoading();
	
	                var title;
	                    var message;
	
	                    message = "VALIDACIÓN CORRECTA, entrada valida.";
	                    title = "Validación Correcta";
	                    
	
	                    phoneAlert(title, message);
	                    
	                    historyBack();
	                    ticketsSaleDetail(id);
	                }
	                
	                
	            }
	    });
	}
}

function showQRCodeScanner() {
	cordova.plugins.barcodeScanner.scan(
		      function (result) {
		          //alert("VALOR QR: " + result.text);
		          validateTicket(result.text);
		          
		      }, 
		      function (error) {
		          alert("Fallo al escanear código QR: " + error);
		      }
		   );
}



var map;
/*
* Muestra el mapa de resultados de busqueda
*/
function viewMap ()
{
	 
	
    show('map');

    showLoading();
    
    var centerLatLon = new google.maps.LatLng(41.64707, -0.885859);
    if(currentLocation != null)
   	 centerLatLon =new google.maps.LatLng(currentLocation["latitude"], currentLocation["longitude"]);
    
    var mapOptions = {
   		    zoom: 4,
   		    center: centerLatLon,
   		    mapTypeId: google.maps.MapTypeId.ROADMAP,
   		    zoomControl: false, 
   		    streetViewControl: false,
   		    mapTypeControl: false
   		  };
    
   		  map = new google.maps.Map(document.getElementById('map_results'),
   		                                mapOptions);

          google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
                hideLoading();
            });
   		  
   		  var bounds = new google.maps.LatLngBounds();
   		  
   		var personImage = 'img/male.png';
   		
   		 if(currentLocation != null)
   		{
   			 bounds.extend(centerLatLon);
      		  	new google.maps.Marker({
      		      position: centerLatLon,
      		      map: map,
      		      icon: personImage
      		  });
   		}
     
   		  
   		  
   		  
   		 var image = 'img/restaurant.png';
   		  
   		  $.each(restaurants, function(i, item){
   			  
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
           	            maxWidth: 200
           			});
           			google.maps.event.addListener(marker, 'click', function() {
           				infoWindow.setContent('<div>' + item.name + '<br/><button class="btn btn-success btn-small" type="button" onclick="restaurantDetail(' + item.id + ')">Ver</button></div>');
           				infoWindow.open(map, this);
           			});
           			
           			//alert("Pintado en mapa: " + item.name);
   			  }

	
             });		
   			
   		map.fitBounds(bounds);
   		
   		

}




var restaurant;
var photos;
var photosDescriptions;

var restaurantCoordinates;
/*
* Muestra el detalle de un restaurante
*/
function restaurantDetail(id)
{  
	
	//show loading
	showLoading();
	
	
    var service = "restaurantDetail";
    //var id = $("#restaurantId").val();
    
    //alert("query: " + query);
    
    var params = "&restaurantId=" + id;    
    
    // http://emenu-eu-test.nidoapp.eu.cloudbees.net/api/1.0/restaurantsSearch?key=449860a8-630e-4e08-ba63-7de4b4f6e3d6
    var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey + params;


    $.ajax({        
        url: url,
        dataType: 'jsonp',
        success: function(data) {	    		   
            
            if(data.error == true)
            {
            	hideLoading();

                var title;
                    var message;

                    message = "Error: " + data.errorCode;
                    title = "Error";
                    

                    phoneAlert(title, message);
            }
            else
            {
            	
                show('restaurantDetail');
                
                restaurant = data.restaurant;
                
                restaurantCoordinates = "";
                
                if(data.restaurant.coordinates != null && data.restaurant.coordinates.latitude != null && data.restaurant.coordinates.longitude != null)
                {
                	var coordinates =  "" + data.restaurant.coordinates.latitude + "," + data.restaurant.coordinates.longitude;
                	
                	restaurantCoordinates = coordinates;
                	
                	var ismobile=(/Mobile/.test(navigator.userAgent))?1:0;
                	
                	//Si es tablet
                	if (ismobile==0) {
                		var anchoMapa = $(window).width();
                		$("#restaurantDetailMapImage").attr("src", "http://maps.googleapis.com/maps/api/staticmap?center=" +coordinates + "&zoom=15&size=" + anchoMapa + "x230&maptype=roadmap&markers=color:blue%7Clabel:R%7C" +coordinates + "&sensor=false");
                	
                	//Si es móvil
                	} else {
                		var anchoMapa = $(window).width();
                		$("#restaurantDetailMapImage").attr("src", "http://maps.googleapis.com/maps/api/staticmap?center=" +coordinates + "&zoom=15&size=" + anchoMapa + "x270&maptype=roadmap&markers=color:blue%7Clabel:R%7C" +coordinates + "&sensor=false");
                	}

                }
                
                
                $("#restaurantDetailName").html(data.restaurant.name);
           
                if (data.restaurant.address)
                    $("#restaurantDetailAddress").html(data.restaurant.address + ", " + data.restaurant.city.name);
           
                if (data.restaurant.telephone)
                    $("#restaurantDetailTelephone").html("<a href='tel:"+data.restaurant.telephone+"'>"+data.restaurant.telephone+"</a>");
           
                var priceMenu = "";
                if(data.restaurant.menuPriceFrom!=null && data.restaurant.menuPriceFrom!="0" &&
                    data.restaurant.menuPriceTo != null && data.restaurant.menuPriceTo!="0") {
                    priceMenu = data.restaurant.menuPriceFrom + " - " + data.restaurant.menuPriceTo + "eur<br>";
                } else if (data.restaurant.menuPriceFrom != null && data.restaurant.menuPriceFrom!="0" &&
                      (data.restaurant.menuPriceTo == null || data.restaurant.menuPriceTo=="0")) {
                    priceMenu = "Desde " + data.restaurant.menuPriceFrom + "eur.<br>";
                }
           
                var food = "";
                if (data.restaurant.foodType && data.restaurant.foodType != null && data.restaurant.foodType.id != null) {
                    food = data.restaurant.foodType.name;
                    if(data.restaurant.foodType.name.length>=18) {
                        food = data.restaurant.foodType.name.substr(0, 16)+"...";
                    }
                    if (priceMenu!="") {
                        food = food + ", ";
                    }
                }
           
                if (food != "" && priceMenu != "") {
                    $("#restaurantDetailMenuPrice").html(food+priceMenu);
                } else if (food != "" && priceMenu == "") {
                    $("#restaurantDetailMenuPrice").html(food+", Precio no disp.");
                } else if (food == "" && priceMenu != "") {
                    $("#restaurantDetailMenuPrice").html("T. comida no disp, " + priceMenu);
                } else {
                    $("#restaurantDetailMenuPrice").html("Tipo comida y precio no dispon.");
                }
           
                //PROMOCIONES
                if (data.restaurant.promotions.length>0 && data.restaurant.promotionsAvailable) {
                    $.each(data.restaurant.promotions, function(i, item) {
                        
                        var fechaDesde = new Date(item.dateFrom);
                        var fechaHasta = new Date(item.dateTo);
                           
                        var promotionLi = "<li><b>" + item.description + "</b><br>Desde: " + fechaDesde.getDate() + "/" + (fechaDesde.getMonth()+1) + "/"+fechaDesde.getFullYear() + " - Hasta: " + fechaHasta.getDate() + "/" + (fechaHasta.getMonth()+1) + "/" + fechaHasta.getFullYear() +  "</li>";
                           
                        $("#promotionsListDetail").append(promotionLi);
                       
                    });
                } else {
           
                    $("#promotionsListDetail").append("<li>No hay promociones en estos momentos</li>");
                }
           
                //MENÚ
                if (data.restaurant.menu && data.restaurant.menuSections.length>0 && data.restaurant.menuSectionPlates.length>0 && data.restaurant.cartesMenusAvailable) {
           
                    $.each(data.restaurant.menuSections, function(i, item) {
                           
                        var menuSectionLi = "<li><b>" + item.name + "</b></li>";
                  
                        $("#menuListDetail").append(menuSectionLi);
                           
                        /*$.each(item.plates, function(i, item2) {
                                  
                            var menuPlateLi = "<li>" + item2.id + "</li>";
                                  
                            $("#menuListDetail").append(menuPlateLi);
                                  
                        });*/
                           
                        $.each(data.restaurant.menuSectionPlates, function(i, item2) {
                                
                            $.each(item2, function(i, item3) {
                                $.each(item.plates, function(i, item4) {
                                       
                                    if (item4.id==item3.id) {
                                       var menuPlateLi = "<li>" + item3.name + "</li>";
                                  
                                       $("#menuListDetail").append(menuPlateLi);
                                    }
                                });
                            });
                        });
                        
                        var menuSectionLiSeparator = "<li>&nbsp;</li>";
                           
                        $("#menuListDetail").append(menuSectionLiSeparator);
                  
                    });
           
                    if (data.restaurant.menu.price) {
                        var menuSectionLi = "<li><b>" + data.restaurant.menu.price + "€ IVA incl.</b></li><li>&nbsp;</li>";
           
                        $("#menuListDetail").append(menuSectionLi);
                    }
           
                } else {
                    $("#menuListDetail").append("<li>No hay menú en estos momentos</li>");
                }
           
           
                //CARTA
                if (data.restaurant.carte && data.restaurant.carteSections.length>0 && data.restaurant.carteSectionPlates.length>0 && data.restaurant.cartesMenusAvailable){
           
                    $.each(data.restaurant.carteSections, function(i, item) {
                  
                       var carteSectionLi = "<li><b>" + item.name + "</b></li>";
                  
                       $("#carteListDetail").append(carteSectionLi);
                  
                       /*$.each(data.restaurant.menuSectionPlates, function(i, item) {
                         
                            var menuPlateLi = "<li>" + item.name + "</li>";
                         
                            $("#menuListDetail").append(menuPlateLi);
                         
                        });*/
                           
                        $.each(data.restaurant.carteSectionPlates, function(i, item2) {
                                  
                            $.each(item2, function(i, item3) {
                                $.each(item.plates, function(i, item4) {
                                                
                                    if (item4.id==item3.id) {
                                        var cartePlateLi = "<li>" + item3.name + "</li>";
                                                
                                        $("#carteListDetail").append(cartePlateLi);
                                    }
                                });
                            });
                        });
                           
                        var carteSectionLiSeparator = "<li>&nbsp;</li>";
                           
                        $("#carteListDetail").append(carteSectionLiSeparator);
                  
                    });
           
                } else {
                    $("#carteListDetail").append("<li>No hay carta en estos momentos</li>");
                }
           
                //CARTA VINOS
                if (data.restaurant.wineCarte && data.restaurant.wineCarteSections.length>0 && data.restaurant.wineCarteSectionPlates.length>0 && data.restaurant.cartesMenusAvailable){
           
                    $.each(data.restaurant.wineCarteSections, function(i, item) {
                  
                        var wineCarteSectionLi = "<li><b>" + item.name + "</b></li>";
                  
                        $("#carteWineListDetail").append(wineCarteSectionLi);
                  
                        /*$.each(data.restaurant.menuSectionPlates, function(i, item) {
                   
                            var menuPlateLi = "<li>" + item.name + "</li>";
                   
                            $("#menuListDetail").append(menuPlateLi);
                   
                         });*/
                  
                        $.each(data.restaurant.wineCarteSectionPlates, function(i, item2) {
                         
                               $.each(item2, function(i, item3) {
                                    $.each(item.plates, function(i, item4) {
                                       
                                       if (item4.id==item3.id) {
                                           var carteWinePlateLi = "<li>" + item3.name + "</li>";
                                       
                                           $("#carteWineListDetail").append(carteWinePlateLi);
                                       }
                                    });
                                });
                         });
                           
                        var carteWineSectionLiSeparator = "<li>&nbsp;</li>";
                           
                        $("#carteWineListDetail").append(carteWineSectionLiSeparator);
                  
                    });
           
                } else {
                    $("#carteWineListDetail").append("<li>No hay carta de vinos en estos momentos</li>");
                }
           
                var open = "-"
                var openingHours = "-";
                var closingDays = "-";
                var closingSpecial = "-";
           
                var fechaActual = new Date();
                var diaSemana = fechaActual.getUTCDay();
           
            if (data.restaurant.reservationsAvailable) {
                switch (diaSemana) {
                    case 0:
                        if (data.restaurant.DomingoM && data.restaurant.DomingoN) {
                            open = "Hoy está abierto";
                        } else if (data.restaurant.DomingoM && !data.restaurant.DomingoN) {
                            open = "Hoy está abierto solo por la mañana"
                        } else if (!data.restaurant.DomingoM && data.restaurant.DomingoN) {
                            open = "Hoy está abierto solo por la tarde/noche"
                        } else {
                            open = "Hoy está cerrado"
                        }
                        break;
           
                    case 1:
                        if (data.restaurant.LunesM && data.restaurant.LunesN) {
                            open = "Hoy está abierto";
                        } else if (data.restaurant.LunesM && !data.restaurant.LunesN) {
                            open = "Hoy está abierto solo por la mañana"
                        } else if (!data.restaurant.LunesM && data.restaurant.LunesN) {
                            open = "Hoy está abierto solo por la tarde/noche"
                        } else {
                            open = "Hoy está cerrado"
                        }
                        break;
           
                    case 2:
                        if (data.restaurant.MartesM && data.restaurant.MartesN) {
                            open = "Hoy está abierto";
                        } else if (data.restaurant.MartesM && !data.restaurant.MartesN) {
                            open = "Hoy está abierto solo por la mañana"
                        } else if (!data.restaurant.MartesM && data.restaurant.MartesN) {
                            open = "Hoy está abierto solo por la tarde/noche"
                        } else {
                            open = "Hoy está cerrado"
                        }
                        break;
           
                    case 3:
                        if (data.restaurant.MiercolesM && data.restaurant.MiercolesN) {
                            open = "Hoy está abierto";
                        } else if (data.restaurant.MiercolesM && !data.restaurant.MiercolesN) {
                            open = "Hoy está abierto solo por la mañana"
                        } else if (!data.restaurant.MiercolesM && data.restaurant.MiercolesN) {
                            open = "Hoy está abierto solo por la tarde/noche"
                        } else {
                            open = "Hoy está cerrado"
                        }
                        break;
           
                    case 4:
                        if (data.restaurant.JuevesM && data.restaurant.JuevesN) {
                            open = "Hoy está abierto";
                        } else if (data.restaurant.JuevesM && !data.restaurant.JuevesN) {
                            open = "Hoy está abierto solo por la mañana"
                        } else if (!data.restaurant.JuevesM && data.restaurant.JuevesN) {
                            open = "Hoy está abierto solo por la tarde/noche"
                        } else {
                            open = "Hoy está cerrado"
                        }
                        break;
           
                    case 5:
                        if (data.restaurant.ViernesM && data.restaurant.ViernesN) {
                            open = "Hoy está abierto";
                        } else if (data.restaurant.ViernesM && !data.restaurant.ViernesN) {
                            open = "Hoy está abierto solo por la mañana"
                        } else if (!data.restaurant.ViernesM && data.restaurant.ViernesN) {
                            open = "Hoy está abierto solo por la tarde/noche"
                        } else {
                            open = "Hoy está cerrado"
                        }
                        break;
           
                    case 6:
                        if (data.restaurant.SabadoM && data.restaurant.SabadoN) {
                            open = "Hoy está abierto";
                        } else if (data.restaurant.SabadoM && !data.restaurant.SabadoN) {
                            open = "Hoy está abierto solo por la mañana"
                        } else if (!data.restaurant.SabadoM && data.restaurant.SabadoN) {
                            open = "Hoy está abierto solo por la tarde/noche"
                        } else {
                            open = "Hoy está cerrado"
                        }
                        break;
           
                }
           }
           
                if (data.restaurant.openingHours)
                    openingHours = data.restaurant.openingHours;
           
                if (data.restaurant.closingDays)
                    closingDays = data.restaurant.closingDays;
           
                if (data.restaurant.closingSpecial)
                    closingSpecial = data.restaurant.closingSpecial;
           
                $("#restaurantDetailOpening").html("<span style='color:#21c368;'>" + open + "</span><br>" + "Horario: " + openingHours + "<br>Cierre: " + closingDays + "<br>Cierre especiales: " + closingSpecial);
                
                $("#restaurantDetailDescription").html(data.restaurant.description);
           
                if(data.restaurant.website)
                    $("#restaurantDetailWeb").html("<a href='" + data.restaurant.website + "'>" + data.restaurant.website + "</a>");
           
                var distance = "";
                distance = calculateMapDistance(currentLocation["latitude"], currentLocation["longitude"], data.restaurant.coordinates.latitude, data.restaurant.coordinates.longitude);
           
                if (distance >=1000) {
                    distance = distance/1000;
                    distance = "A " + distance.toFixed(0) + "Km.";
                } else {
                    distance = "A " + distance + "m.";
                }
           
                $("#restaurantDetailDistance").html("<span id='restaurantDetailVerMapaText'>Ver mapa.</span> <img id='restaurantDetailIcLocation' src='./img/ic_location-green.png' /> " + distance);
           
                if(data.restaurant.onlineReservations && data.restaurant.reservationsAvailable) {
                    $("#restaurantDetailReservationButton").attr("onclick", "showRestaurantReservation(" + data.restaurant.id + ", '" + data.restaurant.name + "')");
                    $("#restaurantDetailReservationButtonImg").attr("src", "./img/btn_reservas.png");
           
                } else {
                    $("#restaurantDetailReservationButton").attr("onclick","");
                    $("#restaurantDetailReservationButtonImg").attr("src", "./img/btn_reservas-disabled.png");
                }
                
                if (data.restaurant.inquiryAvailable && data.restaurant.inquiryActive) {
                    $("#restaurantDetailButtonEncuesta").attr("onclick", "showEncuesta('" + data.restaurant.uri + "')");
                } else {
                    $("#restaurantDetailButtonEncuesta").attr("onclick", "showNoEncuesta()");
                }

           
                if(data.restaurant.valoration) {
                    if(data.restaurant.valoration==1){
                        $("#star1").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                        $("#star2").attr("style", "");
                        $("#star3").attr("style", "");
                        $("#star4").attr("style", "");
                        $("#star5").attr("style", "");
                    } else if(data.restaurant.valoration==2){
                        $("#star1").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                        $("#star2").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                        $("#star3").attr("style", "");
                        $("#star4").attr("style", "");
                        $("#star5").attr("style", "");
                    } else if(data.restaurant.valoration==3){
                        $("#star1").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                        $("#star2").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                        $("#star3").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                        $("#star4").attr("style", "");
                        $("#star5").attr("style", "");
                    } else if(data.restaurant.valoration==4){
                        $("#star1").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                        $("#star2").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                        $("#star3").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                        $("#star4").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                        $("#star5").attr("style", "");
                    } else if(data.restaurant.valoration==5){
                        $("#star1").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                        $("#star2").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                        $("#star3").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                        $("#star4").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                        $("#star5").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    } else {
                        $("#star1").attr("style", "");
                        $("#star2").attr("style", "");
                        $("#star3").attr("style", "");
                        $("#star4").attr("style", "");
                        $("#star5").attr("style", "");
                    }
                }
           
                /*
                if(fromFavorites)
                {
                	$("#restaurantDetailBack").attr("onclick", "showFavorites();");
                }
                else
                {
                    $("#restaurantDetailBack").attr("onclick", "historyRecover('results');");
                }
                */
                
            	
            	/*var db = getDatabase();
                
                db.transaction(queryDB, errorCB);
                
                function queryDB(tx) {
                	tx.executeSql('CREATE TABLE IF NOT EXISTS FAVORITES (id unique, photoUrl, name, foodTypeName, description, menuPriceFrom, menuPriceTo, latitude, longitude)');
                    tx.executeSql('SELECT * FROM FAVORITES WHERE id=' + id, [], querySuccess, errorCB);
                }

                function querySuccess(tx, results) {
                	var len = results.rows.length;
                    if(len > 0)
                    {
                    	$("#restaurantDetailSaveOrDeleteFavoriteButton").attr("onclick", "deleteFavoriteFromDetail(" + data.restaurant.id + ", '" + data.restaurant.photo.url + "', '" + data.restaurant.name + "', '" + data.restaurant.foodType.name + "', '" + data.restaurant.description + "', '" + data.restaurant.menuPriceFrom + "', '" + data.restaurant.menuPriceTo + "', '" + data.restaurant.coordinates.latitude + "', '" + data.restaurant.coordinates.longitude + "')");
                    	$("#restaurantDetailSaveOrDeleteFavoriteButton").attr("style", "color: #0088cc; width:20px;");
                        $("#restaurantDetailSaveOrDeleteFavoriteButton").attr("src", "./img/ic_favoritos-green-active.png");
           
                        $("#restaurantDetailButtonFavorites").attr("onclick", "deleteFavoriteFromDetail(" + data.restaurant.id + ", '" + data.restaurant.photo.url + "', '" + data.restaurant.name + "', '" + data.restaurant.foodType.name + "', '" + data.restaurant.description + "', '" + data.restaurant.menuPriceFrom + "', '" + data.restaurant.menuPriceTo + "', '" + data.restaurant.coordinates.latitude + "', '" + data.restaurant.coordinates.longitude + "')");
           
                        $("#restaurantDetailButtonFavorites").attr("src", "./img/btn_favorites_detail_delete.png");
           
                    }
                    else
                    {
                    	$("#restaurantDetailSaveOrDeleteFavoriteButton").attr("onclick", "saveFavoriteFromDetail(" + data.restaurant.id + ", '" + data.restaurant.photo.url + "', '" + data.restaurant.name + "', '" + data.restaurant.foodType.name + "', '" + data.restaurant.description + "', '" + data.restaurant.menuPriceFrom + "', '" + data.restaurant.menuPriceTo + "', '" + data.restaurant.coordinates.latitude + "', '" + data.restaurant.coordinates.longitude + "')");
                        $("#restaurantDetailSaveOrDeleteFavoriteButton").attr("src", "./img/ic_favoritos-green.png");
                    	$("#restaurantDetailSaveOrDeleteFavoriteButton").attr("style", "width:20px;");
           
                        $("#restaurantDetailButtonFavorites").attr("onclick", "saveFavoriteFromDetail(" + data.restaurant.id + ", '" + data.restaurant.photo.url + "', '" + data.restaurant.name + "', '" + data.restaurant.foodType.name + "', '" + data.restaurant.description + "', '" + data.restaurant.menuPriceFrom + "', '" + data.restaurant.menuPriceTo + "', '" + data.restaurant.coordinates.latitude + "', '" + data.restaurant.coordinates.longitude + "')");
           
                        $("#restaurantDetailButtonFavorites").attr("src", "./img/btn_favorites_detail.png");
                    }

                    continueRestaurantDetailsLoading();
                }
                
                function errorCB(err) {
                    alert("Error processing SQL: "+err.code + " PRINCIPAL");
                }*/

                
                /*
                <ul id="restaurantDetailPhotos">
                    <li><img class="example-image" src="http://lokeshdhakar.com/projects/lightbox2/img/demopage/thumb-1.jpg" alt="thumb-1" width="150" height="150"/></li>
                    <li><img class="example-image" src="http://lokeshdhakar.com/projects/lightbox2/img/demopage/thumb-1.jpg" alt="thumb-1" width="150" height="150"/></li>
                    <li><img class="example-image" src="http://lokeshdhakar.com/projects/lightbox2/img/demopage/thumb-1.jpg" alt="thumb-1" width="150" height="150"/></li>
                    <li><img class="example-image" src="http://lokeshdhakar.com/projects/lightbox2/img/demopage/thumb-1.jpg" alt="thumb-1" width="150" height="150"/></li>
                </ul>

                <div class="row-fluid">
  
                  <div class="span6">
                    <img src="http://emenu-eu-test.nidoapp.eu.cloudbees.net/foto/restaurante/el-chalet/60/b331d3dc-0a90-479a-8901-313c2650a6bd" class="imagen2" width="150" height="150" style="">
                    </div>
                  
                  <div class="span6">
                    <img src="http://emenu-eu-test.nidoapp.eu.cloudbees.net/foto/restaurante/el-chalet/60/b331d3dc-0a90-479a-8901-313c2650a6bd" class="example-image" width="150" height="150" style="">
                    </div>
                </div>
                */

                function continueRestaurantDetailsLoading()
                {
           
                $.each(data.restaurant.features, function(i, item){
                  
                  
                  
                  var li = $("<li></li>");
                  
                  var feature = item.code;
                  
                  
                  var img = $("<img/>").attr("src", "./img/features/"+feature+".png");
                  //img.attr("class", "example-image");
                  //img.attr("class", "imagen2-list");
                  //img.attr("width", "150");
                  //img.attr("height", "150");
                  
                  
                  
                  li.append(img);
                  
                  $("#restaurantDetailFeatures").append(li);
                  
                  
                  
                  });
           
           
                    //var divRow

                photos = new Array();
                photosDescriptions = new Array();
           
                clearActualImg();
           
                 $.each(data.restaurant.photos, function(i, item){

                    
                 
                    /*var li = $("<li></li>");
                    
                    var photoUrl = item.url;          
        
                    photos[i] = photoUrl;
                    photosDescriptions[i] = item.description;
                        
                    var img = $("<img/>").attr("src", photoUrl);
                    img.attr("onclick", "getImgBig("+i+");");
                    //img.attr("class", "example-image");
                    //img.attr("class", "imagen2-list");
                    //img.attr("width", "150");
                    //img.attr("height", "150");
                    

                 
                    li.append(img);
                    
                    $("#restaurantDetailPhotos").append(li);*/
                        
                        
                        
                        var photoUrl = item.url;
                        
                        photos[i] = photoUrl;
                        
                        if(i==0){
                            $("#restaurantDetailPhotos").attr("src", photoUrl);
                        }
                    

                    /*if(i%2==0)
                    {
                        divRow = $("<div></div>");
                        divRow.attr("class", "row-fluid");
                    }

                    

                    var span = $("<div></div>");
                    span.attr("class", "span6");

                    var photoUrl = item.url;       

                    var img = $("<img/>").attr("src", photoUrl);
                    img.attr("class", "imagen2");*/
                    //img.attr("width", "150");
                    //img.attr("height", "150");
                    

                    /*span.append(img);
                    divRow.append(span);

                    if(i%2==0)
                    {
                        $("#restaurantDetailPhotos").append(divRow);
                        $("#restaurantDetailPhotos").append($("<br/>"));
                    }*/


                        /*var li2 = $('<li><img src="'+ photoUrl +'"></li><li><img src="'+ photoUrl +'"></li><li><img src="'+ photoUrl +'"></li>');
                        $("#restaurantDetailPhotos").append(li2);*/


    
                });
           
                clearDetailListsDisplay();
           
                
                //hide loading
                 hideLoading();
                 
                 historySave( "restaurantDetail" );
                 
                 //var anchoImagen = $(window).width();
                 $("#restaurantDetailPhotos").width(3000);
                }
                
                
            }

		  }
    });

    
}

/*
* Guarda un restautante como favorito 
*/
function saveFavoriteFromDetail(id, photoUrl, name, foodTypeName, description, menuPriceFrom, menuPriceTo, latitude, longitude)
{
	/*var db = getDatabase();

    
    db.transaction(populateDB, errorCB);
    
    function populateDB(tx) {
    	tx.executeSql('CREATE TABLE IF NOT EXISTS FAVORITES (id unique, photoUrl, name, foodTypeName, description, menuPriceFrom, menuPriceto, latitude, longitude)');
    	tx.executeSql('DELETE FROM FAVORITES WHERE id=' + id);
    	tx.executeSql('INSERT INTO FAVORITES (id, photoUrl, name, foodTypeName, description, menuPriceFrom, menuPriceTo, latitude, longitude) VALUES (' + id + ', "' + photoUrl + '", "' + name + '", "' + foodTypeName + '", "' + description+ '", "' + menuPriceFrom + '", "' + menuPriceTo + '", "' + latitude + '", "' + longitude + '")');
    }

    function errorCB(err) {
        alert("Error processing SQL: "+err.code);
    }
    
	$("#restaurantDetailSaveOrDeleteFavoriteButton").attr("onclick", "deleteFavoriteFromDetail(" + id + ", '" + photoUrl + "', '" + name + "', '" + foodTypeName + "', '" + description + "', '" + menuPriceFrom + "', '" + menuPriceTo + "', '" + latitude + "', '" + longitude + "')");
    $("#restaurantDetailSaveOrDeleteFavoriteButton").attr("src", "./img/ic_favoritos-green-active.png");
	$("#restaurantDetailSaveOrDeleteFavoriteButton").attr("style", "color: #0088cc; width:20px;");
    
    $("#restaurantDetailButtonFavorites").attr("onclick", "deleteFavoriteFromDetail(" + id + ", '" + photoUrl + "', '" + name + "', '" + foodTypeName + "', '" + description + "', '" + menuPriceFrom + "', '" + menuPriceTo + "', '" + latitude + "', '" + longitude + "')");
    $("#restaurantDetailButtonFavorites").attr("src", "./img/btn_favorites_detail_delete.png");
   */
}

/*
* Elimina un restautante como favorito 
*/
function deleteFavoriteFromDetail(id, photoUrl, name, foodTypeName, description, menuPriceFrom, menuPriceTo, latitude, longitude)
{
	/*var db = getDatabase();

    
    db.transaction(populateDB, errorCB);
    
    function populateDB(tx) {
    	tx.executeSql('CREATE TABLE IF NOT EXISTS FAVORITES (id unique, photoUrl, name, foodTypeName, description, menuPriceFrom, menuPriceTo, latitude, longitude)');
    	tx.executeSql('DELETE FROM FAVORITES WHERE id=' + id);
    }

    function errorCB(err) {
        alert("Error processing SQL: "+err.code);
    }
    

	$("#restaurantDetailSaveOrDeleteFavoriteButton").attr("onclick", "saveFavoriteFromDetail(" + id + ", '" + photoUrl + "', '" + name + "', '" + foodTypeName + "', '" + description + "', '" + menuPriceFrom + "', '" + menuPriceTo + "', '" + latitude + "', '" + longitude + "')");
    $("#restaurantDetailSaveOrDeleteFavoriteButton").attr("src", "./img/ic_favoritos-green.png");
	$("#restaurantDetailSaveOrDeleteFavoriteButton").attr("style", "width:20px;");
    
    $("#restaurantDetailButtonFavorites").attr("onclick", "saveFavoriteFromDetail(" + id + ", '" + photoUrl + "', '" + name + "', '" + foodTypeName + "', '" + description + "', '" + menuPriceFrom + "', '" + menuPriceTo + "', '" + latitude + "', '" + longitude + "')");
    $("#restaurantDetailButtonFavorites").attr("src", "./img/btn_favorites_detail.png");
   */
}


var restaurantMap;
var directionsService;
var directionsDisplay;
var restaurantLatLng;

/*
* Muestra el mapa desde el detalle de un restaurante
*/
function viewRestaurantMap ()
{
     
    
    show('restaurantMap');
    
    var centerLatLon = new google.maps.LatLng(41.64707, -0.885859);
    if(currentLocation != null)
        centerLatLon =new google.maps.LatLng(currentLocation["latitude"], currentLocation["longitude"]);
    
    var mapOptions = {
            zoom: 4,
            center: centerLatLon,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoomControl: false, 
            streetViewControl: false,
            mapTypeControl: false
          };
    
          restaurantMap = new google.maps.Map(document.getElementById('map_restaurant'),
                                        mapOptions);
          
          var bounds = new google.maps.LatLngBounds();
          
        var personImage = 'img/male.png';
        
        if(currentLocation != null)
        {
            bounds.extend(centerLatLon);
            
            new google.maps.Marker({
                  position: centerLatLon,
                  map: restaurantMap,
                  icon: personImage
              });
        }
     
          
          
          
         var image = 'img/restaurant.png';

         var item = restaurant;

         if(item.coordinates != null && item.coordinates.latitude != null && item.coordinates.longitude != null)
              {
                  restaurantLatLng = new google.maps.LatLng(item.coordinates.latitude, item.coordinates.longitude);
                  bounds.extend(restaurantLatLng);
                  var marker = new google.maps.Marker({
                      position: restaurantLatLng,
                      map: restaurantMap,
                      icon: image
                  });
                  
              }
          
                 
            
        restaurantMap.fitBounds(bounds);


        directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
        directionsDisplay.setMap(restaurantMap);
        
        calcRoute();
        

}

/*
* Calcula la ruta para llegar a un restaurante
*/
function calcRoute() {
    if(currentLocation != null)
    {
        var request = {
          origin: new google.maps.LatLng(currentLocation["latitude"], currentLocation["longitude"]),
          destination: restaurantLatLng,
          // Note that Javascript allows us to access the constant
          // using square brackets and a string value as its
          // "property."
          travelMode: google.maps.TravelMode[$("#restaurantMapGoMode").val()]
      };
      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);

          $("#distanceMap").html(response.routes[0].legs[0].distance.text);
          $("#timeMap").html(response.routes[0].legs[0].duration.text);

        }
      });
    }

  
}





/*
* Muestra la ventana de reserva de un restarurante
*/
function showRestaurantReservation(id, name)
{  
    //show loading
	showLoading();
	
	
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
    
    hideLoading();

    historySave( "reservation" );
    
   

}


var reservationMinMinutesFromNow = 15;
var reservationMaxDaysFromNow = 60;
var reservationValidHours = [13,14,15,21,22,23];
var reservationValidMinutes = [0,15,30,45];



/*
* Calcula la fecha y hora estimada para reserva,
*/
function calculateEstimatedReservationDate()
{
	var date = Date.today().add(1).days();
    estimatedReservationDate.setHours(14);
    estimatedReservationDate.setMinutes(0);
    
    return date;
}

/*
* Calcula la fecha y hora minima aceptada para una reserva
*/
function reservationMinDate()
{
	var date = new Date().add(reservationMinMinutesFromNow).minutes();
	
	if(date.getHours() > Math.max.apply(null, reservationValidHours) && date.getMinutes() > Math.max.apply(null, reservationValidMinutes))
	{
		date = Date.today().add(1).days();
	}

	
	return date;
}


/*
* Calcula la fecha y hora maxima aceptada para una reserva
*/
function reservationMaxDate()
{
	return Date.today().add(reservationMaxDaysFromNow).days();
}

/*
* Actualiza el campo de años de la fecha desde del formulario de busqueda
*/
function updateYearsFrom()
{
	$("#eventsDateYearFrom").html("");
	
	var minDate = new Date(); //reservationMinDate();
    var maxDate = new Date(); //reservationMaxDate();
    
       
    //Estableciendo anyos:
    
    var minYear = minDate.getFullYear()-1 //minDate.getFullYear();
    var maxYear = maxDate.getFullYear()+1 //maxDate.getFullYear();
    
    var defaultOption = $("<option></option>");
    defaultOption.attr("value", 'all');
    defaultOption.append('Año');
    $("#eventsDateYearFrom").append(defaultOption);
    
    var yearIterator = minYear;
    while(yearIterator <= maxYear)
    {
    	var option = $("<option></option>");
        option.attr("value", yearIterator);
        option.append(yearIterator);     
       
        
        $("#eventsDateYearFrom").append(option);
        
    	yearIterator++;
    }
    
    $("#eventsDateYearFrom").val("all");
    
    
    $( "#eventsDateYearFrom" ).change(function() {
    	updateMonthsFrom();
    }).change();
    
	 
}

/*
* Actualiza el campo de años de la fecha hasta del formulario de busqueda
*/
function updateYearsTo()
{
	$("#eventsDateYearTo").html("");
	
	var minDate = new Date(); //reservationMinDate();
    var maxDate = new Date(); //reservationMaxDate();
    
       
    //Estableciendo anyos:
    
    var minYear = minDate.getFullYear()-1 //minDate.getFullYear();
    var maxYear = maxDate.getFullYear()+1 //maxDate.getFullYear();
    
    var defaultOption = $("<option></option>");
    defaultOption.attr("value", 'all');
    defaultOption.append('Año');
    $("#eventsDateYearTo").append(defaultOption);
    
    var yearIterator = minYear;
    while(yearIterator <= maxYear)
    {
    	var option = $("<option></option>");
        option.attr("value", yearIterator);
        option.append(yearIterator);     
       
        $("#eventsDateYearTo").append(option);
        
    	yearIterator++;
    }
    
    $("#eventsDateYearTo").val("all");
    
    
    $( "#eventsDateYearTo" ).change(function() {
    	updateMonthsTo();
    }).change();
    
	 
}


/*
* Actualiza el campo de meses de la fecha desde del formulario de busqueda
*/
function updateMonthsFrom()
{
	$("#eventsDateMonthFrom").html("");
	
	 var yearFrom = $("#eventsDateYearFrom").val();
	 
	 /*var minDate = new Date(); //reservationMinDate();
	 var maxDate = new Date(); //reservationMaxDate();*/
	 
	 var minMonth = 1;
	 var maxMonth = 12;
	 //var isMinYear = false;
	 /*if(year == minDate.getFullYear())
	 {
		 minMonth = minDate.getMonth() + 1;
		 isMinYear = true;
	 }
	 if(year == maxDate.getFullYear())
	 {
		 maxMonth = maxDate.getMonth() + 1;
	 }*/
     
	 var defaultOption = $("<option></option>");
	    defaultOption.attr("value", 'all');
	    defaultOption.append('Mes');
	    $("#eventsDateMonthFrom").append(defaultOption);

	    var monthIterator = minMonth;
	    while(monthIterator <= maxMonth)
	    {
	    	var option = $("<option></option>");
	        option.attr("value", monthIterator);
	        option.append(monthIterator);
	        
	       	        
	        $("#eventsDateMonthFrom").append(option);
	        
	        /*
	        if(isMinYear && monthIterator == minMonth)
	        {
	        	$("#reservationDateMonth").val(monthIterator);
	        }
	        */
	        	
	        
	        monthIterator++;
	    }
	    
	    $("#eventsDateMonthFrom").val('all');
	    
	    /*if(isMinYear)
        {
        	$("#eventsDateMonthFrom").val(minMonth);
        	$("#eventsDateMonthTo").val(minMonth);
        }
	    else
		 {
				$("#eventsDateMonthFrom").val($("#eventsDateMonthFrom option:first").val());
				$("#eventsDateMonthTo").val($("#eventsDateMonthTo option:first").val());
		 }*/
	    
	  
	 
	    $( "#eventsDateMonthFrom" ).change(function() {
	    	updateDaysFrom();
	    }).change();
	    
}

/*
* Actualiza el campo de meses de la fecha hasta del formulario de busqueda
*/
function updateMonthsTo()
{
	$("#eventsDateMonthTo").html("");
	
	 var yearTo = $("#eventsDateYearTo").val();
	 
	 /*var minDate = new Date(); //reservationMinDate();
	 var maxDate = new Date(); //reservationMaxDate();*/
	 
	 var minMonth = 1;
	 var maxMonth = 12;
	 //var isMinYear = false;
	 /*if(year == minDate.getFullYear())
	 {
		 minMonth = minDate.getMonth() + 1;
		 isMinYear = true;
	 }
	 if(year == maxDate.getFullYear())
	 {
		 maxMonth = maxDate.getMonth() + 1;
	 }*/
     
	 var defaultOption = $("<option></option>");
	    defaultOption.attr("value", 'all');
	    defaultOption.append('Mes');
	    $("#eventsDateMonthTo").append(defaultOption);

	    var monthIterator = minMonth;
	    while(monthIterator <= maxMonth)
	    {
	    	var option = $("<option></option>");
	        option.attr("value", monthIterator);
	        option.append(monthIterator);
	        
	        $("#eventsDateMonthTo").append(option);
	        
	        /*
	        if(isMinYear && monthIterator == minMonth)
	        {
	        	$("#reservationDateMonth").val(monthIterator);
	        }
	        */
	        	
	        
	        monthIterator++;
	    }
	    
	    $("#eventsDateMonthTo").val('all');
	    
	    /*if(isMinYear)
        {
        	$("#eventsDateMonthFrom").val(minMonth);
        	$("#eventsDateMonthTo").val(minMonth);
        }
	    else
		 {
				$("#eventsDateMonthFrom").val($("#eventsDateMonthFrom option:first").val());
				$("#eventsDateMonthTo").val($("#eventsDateMonthTo option:first").val());
		 }*/
	    
	  
	 
	    $( "#eventsDateMonthTo" ).change(function() {
	    	updateDaysTo();
	    }).change();
}

/*
* Actualiza el campo de dias de la fecha desde del formulario de busqueda
*/
function updateDaysFrom()
{
	$("#eventsDateDayFrom").html("");
	
	var minDate = new Date(); //reservationMinDate();
	
	var year = $("#eventsDateYearFrom").val();
	var month = $("#eventsDateMonthFrom").val() - 1;
	
	
	 	
	var daysInMonth = Date.getDaysInMonth(year, month);
	
	var isMinMonth = false;
	var daysIterator = 1;
	/*if(minDate.getFullYear() == year && minDate.getMonth() == month)
	{
		isMinMonth = true;
		daysIterator = minDate.getDate();
	}*/
	
	//alert("daysInMonth: " + daysInMonth);
	//alert("daysIterator: " + daysIterator);
	
	/*var defaultOption = $("<option></option>");
    defaultOption.attr("value", 'all');
    defaultOption.append('Día');
    $("#eventsDateDayFrom").append(defaultOption);*/
	
	/*while(daysIterator <= daysInMonth)
    {
    	var option = $("<option></option>");
        option.attr("value", daysIterator);
        option.append(daysIterator);
        
        
        
        $("#eventsDateDayFrom").append(option);
        
        daysIterator++;
    }*/
    
    var option = $("<option></option>");
    option.attr("value", daysIterator);
    option.append(daysIterator);
    
    
    
    $("#eventsDateDayFrom").append(option);
	
	//$("#eventsDateDayFrom").val('all');
    $("#eventsDateDayFrom").val(daysIterator);

	
	 /*if(isMinMonth)
     {
     	$("#eventsDateDayFrom").val(minDate.getDate());
     	$("#eventsDateDayTo").val(minDate.getDate());
     }
	 else
	 {
			$("#reservationDateFrom").val($("#eventsDateDayFrom option:first").val());
			$("#reservationDateTo").val($("#eventsDateDayTo option:first").val());
	 }*/
	 
	 /*$( "#eventsDateDayFrom" ).change(function() {
		 	updateHours();
	    }).change();
	 
	 $( "#eventsDateDayTo" ).change(function() {
		 	updateHours();
	    }).change();*/
	
}

/*
* Actualiza el campo de dias de la fecha hasta del formulario de busqueda
*/
function updateDaysTo()
{
	$("#eventsDateDayTo").html("");
	
	var minDate = new Date(); //reservationMinDate();
	
	
	var year = $("#eventsDateYearTo").val();
	var month = $("#eventsDateMonthTo").val() - 1;
	
	 	
	var daysInMonth = Date.getDaysInMonth(year, month);
	
	var isMinMonth = false;
	var daysIterator = 1;
	/*if(minDate.getFullYear() == year && minDate.getMonth() == month)
	{
		isMinMonth = true;
		daysIterator = minDate.getDate();
	}*/
	
	//alert("daysInMonth: " + daysInMonth);
	//alert("daysIterator: " + daysIterator);
	
	/*var defaultOption = $("<option></option>");
    defaultOption.attr("value", 'all');
    defaultOption.append('Día');
    $("#eventsDateDayTo").append(defaultOption);*/
	
	/*while(daysIterator <= daysInMonth)
    {
    	var option = $("<option></option>");
        option.attr("value", daysIterator);
        option.append(daysIterator);
        
        
        
        $("#eventsDateDayTo").append(option);
        
        daysIterator++;
    }*/
    
    var option = $("<option></option>");
    option.attr("value", daysInMonth);
    option.append(daysInMonth);
    
    
    
    $("#eventsDateDayTo").append(option);

	
	//$("#eventsDateDayTo").val('all');
    $("#eventsDateDayTo").val(daysInMonth);
    
	 /*if(isMinMonth)
     {
     	$("#eventsDateDayFrom").val(minDate.getDate());
     	$("#eventsDateDayTo").val(minDate.getDate());
     }
	 else
	 {
			$("#reservationDateFrom").val($("#eventsDateDayFrom option:first").val());
			$("#reservationDateTo").val($("#eventsDateDayTo option:first").val());
	 }*/
	 
	 /*$( "#eventsDateDayFrom" ).change(function() {
		 	updateHours();
	    }).change();
	 
	 $( "#eventsDateDayTo" ).change(function() {
		 	updateHours();
	    }).change();*/
	
}

/*
* Actualiza el campo de horas del formulario
*/
function updateHours()
{
	$("#reservationDateHour").html("");
	
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

/*
* Actualiza el campo de minutos del formulario
*/
function updateMinutes()
{
	$("#reservationDateMinutes").html("");
	
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

/*
* Ejectua la reserva de un restaurante
*/
function restaurantReservation(id)
{  
	showLoading();
	
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
    var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey + params;

    
    
    $.ajax({        
        url: url,
        dataType: 'jsonp',
        success: function(data) {	    		   
            
            if(data.error == true)
            {
            	hideLoading();

                var title;
                var message;

                if(data.errorCode == "RESTAURANT_NOT_VALID_FOR_RESERVATION")
                {
                    title = "No admite reservas";
                    message = "Acualmente el restaurante no admite reservas.";     
                }
                else if(data.errorCode == "RESERVATION_DATE_AND_HOUR_NOT_VALID")
                {
                    title = "Revise fecha y hora";
                    message = "Fecha u hora incorrecta.";     
                }
                else if(data.errorCode == "NECESSARY_CUSTOMER_NAME")
                {
                    title = "Indica tu nombre";
                    message = "Es necesario indicar tu nombre.";     
                }
                else if(data.errorCode == "NECESSARY_EMAIL")
                {
                    title = "Indica tu email";
                    message = "Es necesario indicar un tu email.";     
                }
                else if(data.errorCode == "EMAIL_NOT_VALID")
                {
                    title = "Revise los datos";
                    message = "El email no es correcto.";     
                }
                else if(data.errorCode == "NECESSARY_PHONE")
                {
                    title = "Indica tu telefono movil";
                    message = "Es necesario indicar un tu telefono movil.";     
                }
                else if(data.errorCode == "PHONE_NOT_VALID")
                {
                    title = "Revisa tu telefono movil";
                    message = "Debe ser un telefono movil.";     
                }
                else if(data.errorCode == "RESERVATION_ALREADY_DONE")
                {
                    title = "Ya habias hecho antes esta reserva";
                    message = "Esta reserva ya la habias hecho antes.";     
                }
                else
                {
                    message = "Error: " + data.errorCode;
                    title = "Error en la reserva.";
                }

                phoneAlert(title, message);  

                    
                    
            }
            else
            {
               
                
                var customerName = $("#reservationCustomerName").val();
                window.localStorage.setItem("customerName", customerName);
                
                var customerEmail = $("#reservationCustomerEmail").val();
                window.localStorage.setItem("customerEmail", customerEmail);
                
                var customerPhone = $("#reservationCustomerPhone").val();
                window.localStorage.setItem("customerPhone", customerPhone);
                
                hideLoading();
                
                show('reservationDone');  

                historySave( "reservationDone" );                
   
            }

		  }
    });
   
    

    
}

/*
* Obtiene la base de datos local al telefono
*/
function getDatabase()
{
	return window.openDatabase("nidopasssuperadmincontrol", "1.0", "nidopasssuperadmincontrol", 1000000);
}


/*
* Muestra los restaurantes favoritos
*/
function showFavorites()
{  
   /* //show loading
	showLoading();
	
	//updateCurrentLocation();
	
    show('favorites');

    var db = getDatabase();
    
    db.transaction(queryDB, errorCB);
    
    function queryDB(tx) {
    	tx.executeSql('CREATE TABLE IF NOT EXISTS FAVORITES (id unique, photoUrl, name, foodTypeName, description, menuPriceFrom, menuPriceTo, latitude, longitude)');
        tx.executeSql('SELECT * FROM FAVORITES', [], querySuccess, errorCB);
    }
    
    function calculateDistance(lat1, lon1, lat2, lon2)
    {
        rad = function(x) {return x*Math.PI/180;}
        
        //var R     = 6378.137;                          //Radio de la tierra en km
        var R     = 6378137;                          //Radio de la tierra en m
        var dLat  = rad( lat2 - lat1 );
        var dLong = rad( lon2 - lon1 );
        
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        
        return d.toFixed(0);                      //Retorna cero decimales
    }*/

    /*function querySuccess(tx, results) {
    	var len = results.rows.length;
        console.log("DEMO table: " + len + " rows found.");
        if (len > 0) {
			for (var i=0; i<len; i++)
			{
				var item = results.rows.item(i);
        	
				var li = $("<li></li>");
				var a = $("<a/>").attr("href", "#");
				//a.attr("onclick", "restaurantDetail(" + item.id + ", true)");
				a.attr("onclick", "restaurantDetail(" + item.id + ")");
				
				var photoUrl = "http://media.salir-static.net/_images_/verticales/b/6/3/d/137577-el_peletazo___restaurante_espectaculo_tn.jpg/89fh52";
				
				if(item.photoUrl != null)
				{   
					photoUrl = item.photoUrl;
				}
				
				var img = $("<img id='imagenrestaurante'/>").attr("src", photoUrl);
				
				var h3 = $("<h3/>").append(item.name);
				
				var foodType = "";                    
				if(item.foodTypeName != null)
				{   
					foodType = item.foodTypeName+"<br>";
				}
                
                var priceMenu = "";
                if(item.menuPriceFrom!='undefined' && item.menuPriceFrom!=null && item.menuPriceFrom!="0" &&
                   item.menuPriceTo!='undefined' && item.menuPriceTo != null && item.menuPriceTo!="0") {
                    priceMenu = item.menuPriceFrom + " - " + item.menuPriceTo + "eur<br>";
                } else if (item.menuPriceFrom!='undefined' && item.menuPriceFrom != null && item.menuPriceFrom!="0" && (item.menuPriceTo == null || item.menuPriceTo=="0" || item.menuPriceTo=='undefined')) {
                    priceMenu = "Desde " + item.menuPriceFrom + "eur.<br>";
                }
                
                var distance = "";
                distance = calculateDistance(currentLocation["latitude"], currentLocation["longitude"], item.latitude, item.longitude);
                
                if (distance >=1000) {
                    distance = distance/1000;
                    distance = "A " + distance.toFixed(0) + "Km.";
                } else {
                    distance = "A " + distance + "m.";
                }
                
				var span = $("<span/>").append(foodType+priceMenu+distance);
                
                if(item.description){
                    var p
                    if (item.name.length<=13)
                        p = $("<p id='descripcion'/>").append(item.description.substr(0,50)+"...");
                    else if (item.name.length<=26)
                        p = $("<p id='descripcion'/>").append(item.description.substr(0,40)+"...");
                    else
                        p = $("<p id='descripcion'/>").append(item.description.substr(0,30)+"...");
                }else{
                    var p = $("<p id='descripcion'/>").append("Descripción no disponible");
                }
                */
                /*var icono;
                
                if(item.onlineReservations) {
                    icono = $("<img id='reservar'/>");
                    icono.attr("src", "./img/btn_reservas.png");
                    icono.attr("onclick", "showRestaurantReservation(" + item.id + ", '" + item.name + "')");
                } else {
                    icono = $("<img id='reservar'/>");
                    icono.attr("src", "./img/btn_reservas-disabled.png");
                    icono.attr("onclick", "");
                }*/
                
            /*    var valoration;
                valoration= $("<p id='valoration'/>").append("<i id='star1-" + item.id + "' class='icon-star'></i> <i id='star2-" + item.id + "' class='icon-star'></i> <i id='star3-" + item.id + "' class='icon-star'></i> <i id='star4-" + item.id + "' class='icon-star'></i> <i id='star5-" + item.id + "' class='icon-star'></i>");
                
                var star1="#star1-"+item.id;
                var star2="#star2-"+item.id;
                var star3="#star3-"+item.id;
                var star4="#star4-"+item.id;
                var star5="#star5-"+item.id;
                
			 
				li.append(a);
				a.append(img);
				a.append(h3);
				//a.append(span);
                a.append(valoration);
                a.append(p);
                //a.append(icono);
                a.append(span);
                //li.append(icono);*/
				
				/*
				<li>
					<a href="#">
						<img src="http://media.salir-static.net/_images_/verticales/b/6/3/d/137577-el_peletazo___restaurante_espectaculo_tn.jpg/89fh52">
						<h3>El Koala</h3>
						<span>Estás a 500 metros</span>
					</a>
				</li>
				*/
				
			/*	$("#resultList").append(li);
                
                searchRestaurantsValorations(item.id);
				
			}  */
       /* }
		else {
			var li = $("<center><li style=' padding-top: 10px; padding-right: 10px; '><font color='white'>No has indicado restaurantes favoritos</font></li></center>");
			$("#resultList").append(li);
		}
        hideLoading();

        historySave( "favorites" ); 
    	
    }*/

    /*function errorCB(err) {
    	hideLoading();
        alert("Error processing SQL: "+err.code);
    }*/
}

/*
* Muestra una alerta
*/
function phoneAlert(title, message) {

                    function alertDismissed() {
                        // do something
                    }
                    
                    if(navigator && navigator.notification)
                    {
                        navigator.notification.alert(
                        message,     // mensaje (message)
                        alertDismissed,         // función 'callback' (alertCallback)
                        title,            // titulo (title)
                        'Cerrar'                // nombre del botón (buttonName)
                        );
                    }
                    else
                    {
                        alert(message);
                    }
}




var twitterLoaded = false;


/*
* Muestra la ventana de Twitter
*/
function showTwitter()
{  
    //show loading
    showLoading();

    show('twitter');

    if(!twitterLoaded)
    {
            !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
            twitterLoaded = true;
    }

    twttr.widgets.createTimeline(
      '463675893668270080',
      document.getElementById('timeline'),
      function (el) {
        console.log("Embedded a timeline.")
      },
      {
        width: '900',
        height: '390'
      }
    );




    hideLoading();

    historySave( "twitter" ); 

}

function showEncuesta(uri) {
    //show loading
    showLoading();
    
    show('Enc');
    
    if(uri != "" && uri != null)
    {
        $("#encuestaRestaurante").attr("src", "http://encuestas.nidoapp.com/4.mostrarEncuesta.php?r="+uri);
    
        hideLoading();
    
        historySave( "Enc" );
    }
}

function showNoEncuesta() {
    message = "Este restaurante no dispone de encuesta de satisfacción.";
    title = "Encuesta no disponible.";

    phoneAlert(title, message);
}

/**
 * Abre la página de la aplicación en Play Store para poder valorarla.
 */
function showPlayStore() {
    window.location.href=window.location.href="market://details?id=com.nidoapp.comerenaragon";
}

/**
 * Abre la página de la aplicación en App Store para poder valorarla.
 */
function showAppStore() {
    window.location.href=window.location.href="itmss://itunes.apple.com/us/app/gmail-correo-electronico-google/id422689480?mt=8";
}

/*
* Actualiza la posicion actual del telefono
*/
function updateCurrentLocation()
{
    /*var onSuccess = function(position) {
            currentLocation = {};
            
            currentLocation["latitude"] = position.coords.latitude;
            currentLocation["longitude"] = position.coords.longitude;
        };

        function onError(error) {
        }
        
        navigator.geolocation.getCurrentPosition(onSuccess, onError);*/
        
}
function encuesta(){
//show loading
// showLoading();
	
//$('#contenidoCuerpo').load("./templates/Enc.html");
  document.getElementById("contenidoCuerpo").innerHTML='<iframe src="./templates/Enc.html"  width="100%" height="100%" style="background:#E54D39; margin-top:-10; border:0; overflow: scroll !important;-webkit-overflow-scrolling:touch !important;"></iframe>';    
}

function showIndexTemplate(template)
{
    if(template=="favorites")
        window.location.href = 'index2.html?movefav=true';
    else if(template=="home")
        window.location.href = 'index2.html?movehome=true';
    else if(template=="misReservas")
        window.location.href = 'index2.html?movemisreservas=true';
    else if(template=="promotionsIndex")
        window.location.href = 'index2.html?movepromociones=true';
    else if(template=="noticiasEventos")
        window.location.href = 'index2.html?moveeventos=true';
    else if(template=="contacto")
        window.location.href = 'index2.html?movecontacto=true';
    else if(template=="sugerencias")
        window.location.href = 'index2.html?movesugerencias=true';
    else if(template=="avisoLegal")
        window.location.href = 'index2.html?moveavisolegal=true';
    else if(template=="twitter")
        window.location.href = 'index2.html?movetwitter=true';
	
}

function menuShowTemplate(template) {
    if(window.location.href.indexOf("index2.html")>=0){
        if(template=="favorites")
            showFavorites();
        else if(template=="home")
        	showResults();
        else if(template=="twitter")
            showTwitter();
        else if(template=="noticiasEventos")
            searchAssociationNews();
            //searchNews();
        else
            show(template);
    }
    else if(window.location.href.indexOf("index.html")>=0){
        showIndexTemplate(template);
    }
}

/*
 * Ejectua la valoración de un restaurante
 */
function valorateRestaurant(valoration, comment)
{
    showLoading();
	
    var service = "sendRestaurantValoration";
    var id = restaurant.id;
    var phoneNumber = device.uuid;
    
    //alert("query: " + query);
    
    var params = "&restaurantId=" + id + "&valoration=" + valoration + "&comment=" + comment + "&phoneNumber=" + phoneNumber;
    
    var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey + params;
    
    
    $.ajax({
           url: url,
           dataType: 'jsonp',
           success: function(data) {
           
           if(data.error == true)
           {
           
           hideLoading();
           
           var title;
           var message;
           
           if(data.errorCode == "RESTAURANT_NOT_FOUND")
           {
           title = "Restaurante no encontrado";
           message = "No se ha encontrado el restaurante.";
           }
           else if(data.errorCode == "NECESSARY_VALORATION")
           {
           title = "Valoración necesaria";
           message = "No se ha marcado correctamente la valoración.";
           }
           else
           {
           message = "Error: " + data.errorCode;
           title = "Error en la valoración.";
           }
           
           phoneAlert(title, message);
           
           
           
           }
           else
           {
           
           reloadValorationRestaurantDetail(restaurant.id);
           
           hideLoading();
           
           var title = "Valoración correcta";
           var message = "Valoración del restaurante enviada correctamente. Gracias.";
           phoneAlert(title, message);
           
           //historySave( "reservationDone" );
           
           }
           
           }
           });
    
    
}

/*
 * Recarga el detalle de un restaurante
 */
function reloadValorationRestaurantDetail(id)
{
	
	//show loading
	//showLoading();
	
	
    var service = "restaurantDetail";
    //var id = $("#restaurantId").val();
    
    //alert("query: " + query);
    
    var params = "&restaurantId=" + id;
    
    // http://emenu-eu-test.nidoapp.eu.cloudbees.net/api/1.0/restaurantsSearch?key=449860a8-630e-4e08-ba63-7de4b4f6e3d6
    var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey + params;
    
    
    $.ajax({
           url: url,
           dataType: 'jsonp',
           success: function(data) {
           
           if(data.error == true)
           {
           //hideLoading();
           
           var title;
           var message;
           
           message = "Error: " + data.errorCode;
           title = "Error";
           
           
           phoneAlert(title, message);
           }
           else
           {
           
           //show('plateDetail');
           
           restaurant = data.restaurant;
           
           if(data.restaurant.valoration) {
                if(data.restaurant.valoration==1){
                    $("#star1").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $("#star2").attr("style", "");
                    $("#star3").attr("style", "");
                    $("#star4").attr("style", "");
                    $("#star5").attr("style", "");
                } else if(data.restaurant.valoration==2){
                    $("#star1").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $("#star2").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $("#star3").attr("style", "");
                    $("#star4").attr("style", "");
                    $("#star5").attr("style", "");
                } else if(data.restaurant.valoration==3){
                    $("#star1").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $("#star2").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $("#star3").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $("#star4").attr("style", "");
                    $("#star5").attr("style", "");
                } else if(data.restaurant.valoration==4){
                    $("#star1").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $("#star2").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $("#star3").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $("#star4").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $("#star5").attr("style", "");
                } else if(data.restaurant.valoration==5){
                    $("#star1").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $("#star2").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $("#star3").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $("#star4").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $("#star5").attr("style", "-webkit-text-fill-color: #21c368 !important;");
                } else {
                    $("#star1").attr("style", "");
                    $("#star2").attr("style", "");
                    $("#star3").attr("style", "");
                    $("#star4").attr("style", "");
                    $("#star5").attr("style", "");
                }
           }
           
           /*
            if(fromFavorites)
            {
            $("#restaurantDetailBack").attr("onclick", "showFavorites();");
            }
            else
            {
            $("#restaurantDetailBack").attr("onclick", "historyRecover('results');");
            }
            */
           
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
            
            <div class="row-fluid">
            
            <div class="span6">
            <img src="http://emenu-eu-test.nidoapp.eu.cloudbees.net/foto/restaurante/el-chalet/60/b331d3dc-0a90-479a-8901-313c2650a6bd" class="example-image" width="150" height="150" style="">
            </div>
            
            <div class="span6">
            <img src="http://emenu-eu-test.nidoapp.eu.cloudbees.net/foto/restaurante/el-chalet/60/b331d3dc-0a90-479a-8901-313c2650a6bd" class="example-image" width="150" height="150" style="">
            </div>
            </div>
            */
           
           // function continuePlateDetailsLoading()
           //{
           //   var divRow
           
           //   $.each(data.restaurant.photos, function(i, item){
           
           /*
            
            var li = $("<li></li>");
            
            var photoUrl = item.url;
            
            
            var img = $("<img/>").attr("src", photoUrl);
            img.attr("class", "example-image");
            img.attr("width", "150");
            img.attr("height", "150");
            
            
            
            li.append(img);
            
            $("#restaurantDetailPhotos").append(li);
            
            */
           
           /*          if(i%2==0)
            {
            divRow = $("<div></div>");
            divRow.attr("class", "row-fluid");
            }
            
            
            
            var span = $("<div></div>");
            span.attr("class", "span6");
            
            var photoUrl = item.url;
            
            var img = $("<img/>").attr("src", photoUrl);
            img.attr("class", "example-image");
            img.attr("width", "150");
            img.attr("height", "150");
            
            span.append(img);
            divRow.append(span);
            
            if(i%2==0)
            {
            $("#restaurantDetailPhotos").append(divRow);
            $("#restaurantDetailPhotos").append($("<br/>"));
            }
            
            
            
            
            
            
            });   */
           
           
           //hide loading
           //hideLoading();
           
           //historySave( "plateDetail" );
           //   }
           
           
           }
           
           }
           });
    
    
}

function searchRestaurantsValorations(id) {
    var service = "restaurantsValorationsSearch";
    //var id = $("#restaurantId").val();
    
    //alert("query: " + query);
    
    var params = "&restaurantId=" + id;
    
    // http://emenu-eu-test.nidoapp.eu.cloudbees.net/api/1.0/restaurantsSearch?key=449860a8-630e-4e08-ba63-7de4b4f6e3d6
    var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey + params;
    
    
    $.ajax({
           url: url,
           dataType: 'jsonp',
           success: function(data) {
           
           if(data.error == true)
           {
           hideLoading();
           
           var title;
           var message;
           
           message = "Error: " + data.errorCode;
           title = "Error";
           
           
           phoneAlert(title, message);
           }
           else
           {
           
           //show('restaurantDetail');
           
           restaurant = data.restaurants[0];
           
           var star1="#star1-"+restaurant.id;
           var star2="#star2-"+restaurant.id;
           var star3="#star3-"+restaurant.id;
           var star4="#star4-"+restaurant.id;
           var star5="#star5-"+restaurant.id;
           
           if(restaurant.valoration) {
                if(restaurant.valoration==1){
                    $(star1).attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $(star2).attr("style", "");
                    $(star3).attr("style", "");
                    $(star4).attr("style", "");
                    $(star5).attr("style", "");
                } else if(restaurant.valoration==2){
                    $(star1).attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $(star2).attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $(star3).attr("style", "");
                    $(star4).attr("style", "");
                    $(star5).attr("style", "");
                } else if(restaurant.valoration==3){
                    $(star1).attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $(star2).attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $(star3).attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $(star4).attr("style", "");
                    $(star5).attr("style", "");
                } else if(restaurant.valoration==4){
                    $(star1).attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $(star2).attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $(star3).attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $(star4).attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $(star5).attr("style", "");
                } else if(restaurant.valoration==5){
                    $(star1).attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $(star2).attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $(star3).attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $(star4).attr("style", "-webkit-text-fill-color: #21c368 !important;");
                    $(star5).attr("style", "-webkit-text-fill-color: #21c368 !important;");
                } else {
                    $(star1).attr("style", "");
                    $(star2).attr("style", "");
                    $(star3).attr("style", "");
                    $(star4).attr("style", "");
                    $(star5).attr("style", "");
                }
           }
           
           
           }
           
           }
           
           });
}

function getPhotoBig (item) {
    return photos[item];
}

function getPhotoBigListSize () {
    return photos.length;
}

function getPhotoBigDescription (item) {
    return photosDescriptions[item];
}

function getPhoto (item) {
    return photos[item];
}

function getPhotoListSize () {
    return photos.length;
}


var promotions;

/*
 * Realiza la busqueda de promociones de restaurantes
 */
function searchPromotions(showPromotionsList)
{
	
	//show loading
	showLoading();
	
	//updateCurrentLocation();
	
    var service = "promotionsSearch";
    //var query = $("#prependedInput").val();
    //var distance = $("#distanceSelect").val();
    //var searchType = $("#searchTypeSelect").val();
    //var foodType = $("#foodTypeSelect").val();
    //var priceType = $("#priceSelect").val();
    
    
    
    var params = "";
    params = params + "&latitude=" + currentLocation["latitude"]  ;
    params = params + "&longitude=" + currentLocation["longitude"]  ;
    
    
    
	/*if (navigator != null && navigator.geolocation != null) {
        
		var onSuccess = function(position) {
            
            currentLocation = {};
            
            
            currentLocation["latitude"] = position.coords.latitude;
            currentLocation["longitude"] = position.coords.longitude;
            
			executeSearch();
		};
        
		function onError(error) {
			executeSearch();
		}
        
		navigator.geolocation.getCurrentPosition(onSuccess, onError);
        
	} else {
		executeSearch();
	}*/
    
    executeSearch();
    
    function calculateDistance(lat1, lon1, lat2, lon2)
    {
        rad = function(x) {return x*Math.PI/180;}
        
        //var R     = 6378.137;                          //Radio de la tierra en km
        var R     = 6378137;                          //Radio de la tierra en m
        var dLat  = rad( lat2 - lat1 );
        var dLong = rad( lon2 - lon1 );
        
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        
        return d.toFixed(0);                      //Retorna cero decimales
    }
    
    
    function executeSearch(near) {
    	
    	
    	/*if(query != null && query != "")
        {
            params = params + "&query=" + query;
        }*/
    	
    	
    	var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey + params;
        
        
        $.ajax({
               url: url,
               dataType: 'jsonp',
               success: function(data) {
               
               if(data.error == true)
               {
               hideLoading();
               
               var title;
               var message;
               
               message = "Error: " + data.errorCode;
               title = "Error";
               
               
               phoneAlert(title, message);
               }
               else if(data.promotions.length == 0)
               {
               hideLoading();
               
               var title;
               var message;
               
               message = "No se han encontrado promociones."
               title = "No hay resultados";
               
               
               phoneAlert(title, message);
               }
               else
               {
               
                if (showPromotionsList)
                    show('promociones');
               else
                    show('mapPromotions');
               
               //alert("Restaurants: " + data.restaurants);
               
               data.promotions.sort(function (a, b) {
                    return (parseInt(a.distance) - parseInt(b.distance));
                });
               var promotionsCount = 0;
               $.each(data.promotions, function(i, item){
            	   if (item.restaurant.promotionsAvailable) {
                       promotionsCount = promotionsCount + 1;
                if (showPromotionsList){
                      var li = $("<li></li>");
                      var aReservation = $("<a id='promo-reservation'/>").attr("href", "#");
                      var aFavorite = $("<a id='promo-favorite'/>").attr("href", "#");
                      var aDetail = $("<a id='promo-detail'/>").attr("href", "#");
                      
                      var div1 = $("<div id='div1-promo'/>");
                      var div2 = $("<div id='div2-promo'/>");
                      var div3 = $("<div id='div3-promo'/>");
                      
                      //a.attr("onclick", "restaurantDetail(" + item.id + ", false)");
                      if (item.restaurant.onlineReservations) {
                        aReservation.attr("onclick", "showRestaurantReservation(" + item.restaurant.id + ", '" + item.restaurant.name + "')");
                      }
                      aFavorite.attr("onclick", "restaurantDetail(" + item.restaurant.id + ")");
                      
                      if (item.url) {
                        aDetail.attr("href", item.url);
                      }
                      
                      var photoUrl = "http://media.salir-static.net/_images_/verticales/b/6/3/d/137577-el_peletazo___restaurante_espectaculo_tn.jpg/89fh52";
                      
                      if(item.restaurantPhoto != null)
                      {
                      photoUrl = item.restaurantPhoto.url;
                      }
                      
                      //var img = $("<img id='imagenrestaurantepromo'/>").attr("src", photoUrl);
                      li.css('background-image', 'url(' + photoUrl + ')');
                      
                      var h3 = $("<h3 id='restname-promo'/>").append(item.restaurant.name);
                      
                      
                      var foodType = "";
                      if(item.restaurantFoodType != null)
                      {
                        if(item.restaurantFoodType.name != null)
                            foodType = item.restaurantFoodType.name;
                      }
                      
                      var priceMenu = "";
                      if(item.restaurant.menuPriceFrom!=null && item.restaurant.menuPriceFrom!="0" &&
                         item.restaurant.menuPriceTo != null && item.restaurant.menuPriceTo!="0") {
                            priceMenu = item.restaurant.menuPriceFrom + " - " + item.restaurant.menuPriceTo + "eur";
                      } else if (item.restaurant.menuPriceFrom != null && item.restaurant.menuPriceFrom!="0" &&
                                 (item.restaurant.menuPriceTo == null || item.restaurant.menuPriceTo=="0")) {
                            priceMenu = "Desde " + item.restaurant.menuPriceFrom + "eur.";
                      }
                      
                      if (priceMenu!="" && foodType!="") {
                      priceMenu = ", " + priceMenu;
                      }
                      
                      if(item.description){
                        var p
                        p = $("<p id='descripcionpromo'/>").append(item.description);
                        /*if (item.restaurant.name.length<=13)
                            p = $("<p id='descripcionpromo'/>").append(item.description.substr(0,50)+"...");
                        else if (item.restaurant.name.length<=26)
                            p = $("<p id='descripcionpromo'/>").append(item.description.substr(0,40)+"...");
                        else
                            p = $("<p id='descripcionpromo'/>").append(item.description.substr(0,30)+"...");*/
                      }else{
                        var p = $("<p id='descripcionpromo'/>").append("Descripción no disponible");
                      }
                      /*var icono;
                       
                       if(item.onlineReservations) {
                       icono = $("<img id='reservar'/>");
                       icono.attr("src", "./img/btn_reservas.png");
                       icono.attr("onclick", "showRestaurantReservation(" + item.id + ", '" + item.name + "')");
                       } else {
                       icono = $("<img id='reservar'/>");
                       icono.attr("src", "./img/btn_reservas-disabled.png");
                       icono.attr("onclick", "");
                       }*/
                      var distance = "";
                      distance = calculateDistance(currentLocation["latitude"], currentLocation["longitude"], item.restaurantCoordinates.latitude, item.restaurantCoordinates.longitude);
                      
                      if (distance >=1000) {
                      distance = distance/1000;
                      distance = "<br>A " + distance.toFixed(0) + "Km.";
                      } else {
                      distance = "<br>A " + distance + "m.";
                      }
                      
                      var valoration;
                      valoration= $("<p id='valorationpromo'/>").append("<i id='star1promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i> <i id='star2promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i> <i id='star3promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i> <i id='star4promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i> <i id='star5promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i>");
                      
                      var star1="#star1promo-"+item.restaurant.id + "-" + item.id;
                      var star2="#star2promo-"+item.restaurant.id + "-" + item.id;
                      var star3="#star3promo-"+item.restaurant.id + "-" + item.id;
                      var star4="#star4promo-"+item.restaurant.id + "-" + item.id;
                      var star5="#star5promo-"+item.restaurant.id + "-" + item.id;
                      
                      
                      
                      if (foodType.length>14) {
                        foodType = foodType.substr(0, 12) + "...";
                      } else if (foodType!="") {
                        foodType = foodType
                      }
                      
                      var span = $("<p id='restdata-promo'/>").append(foodType+priceMenu+distance);
                      
                      var dates = "";
                      if(item.dateFrom != null && item.dateTo != null)
                      {
                        dates = "<p id='dates-promo'><img id='ic-calendar-promo' src='./img/ic_calendar-green.png'/>&nbsp;Desde " + item.dateFrom + "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Hasta " + item.dateTo + "</p>";
                      }
                      
                      var line = $("<hr id='line-separation-promo'/>");
                      
                      if (item.restaurant.onlineReservations && item.restaurant.reservationsAvailable) {
                        var imgReservation = $("<img id='img-reservation'/>").attr("src", "./img/ic_reservas-green.png");
                      } else {
                        var imgReservation = $("<img id='img-reservation'/>").attr("src", "./img/ic_reservas.png");
                      }
                      
                      var imgFavorite = $("<img id='img-favorite'/>").attr("src", "./img/ic_restaurant-green.png");
                      
                      if (item.url) {
                        var imgDetail = $("<img id='img-detail'/>").attr("src", "./img/ic_web.png");
                      } else {
                        var imgDetail = $("<img id='img-detail'/>").attr("src", "./img/ic_web-gray.png");
                      }
                      
                      aReservation.append(imgReservation);
                      
                      aFavorite.append(imgFavorite);
                      
                      aDetail.append(imgDetail);
                      
                      /*li.append(a);
                      a.append(img);
                      a.append(h3);
                      //a.append(span);
                      a.append(valoration);
                      a.append(span);
                      a.append(dates);
                      a.append(p);
                      //a.append(valoration);
                      //a.append(icono);
                      //li.append(icono);*/
                      
                      div1.append(h3);
                      div1.append(valoration);
                      div1.append(span);
                      div2.append(dates);
                      div2.append(line);
                      div2.append(p);
                      div3.append(aReservation);
                      div3.append("<br>");
                      div3.append("<hr style='border:none;'>");
                      div3.append(aFavorite);
                      div3.append("<br>");
                      div3.append("<hr style='border:none;'>");
                      div3.append(aDetail);
                      li.append(div1);
                      li.append(div2);
                      li.append(div3);
                      
                      
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
                      
                      if(item.restaurantValoration) {
                      if(item.restaurantValoration==1){
                      $(star1).attr("style", "-webkit-text-fill-color: #000000 !important;");
                      $(star2).attr("style", "");
                      $(star3).attr("style", "");
                      $(star4).attr("style", "");
                      $(star5).attr("style", "");
                      } else if(item.restaurantValoration==2){
                      $(star1).attr("style", "-webkit-text-fill-color: #000000 !important;");
                      $(star2).attr("style", "-webkit-text-fill-color: #000000 !important;");
                      $(star3).attr("style", "");
                      $(star4).attr("style", "");
                      $(star5).attr("style", "");
                      } else if(item.restaurantValoration==3){
                      $(star1).attr("style", "-webkit-text-fill-color: #000000 !important;");
                      $(star2).attr("style", "-webkit-text-fill-color: #000000 !important;");
                      $(star3).attr("style", "-webkit-text-fill-color: #000000 !important;");
                      $(star4).attr("style", "");
                      $(star5).attr("style", "");
                      } else if(item.restaurantValoration==4){
                      $(star1).attr("style", "-webkit-text-fill-color: #000000 !important;");
                      $(star2).attr("style", "-webkit-text-fill-color: #000000 !important;");
                      $(star3).attr("style", "-webkit-text-fill-color: #000000 !important;");
                      $(star4).attr("style", "-webkit-text-fill-color: #000000 !important;");
                      $(star5).attr("style", "");
                      } else if(item.restaurantValoration==5){
                      $(star1).attr("style", "-webkit-text-fill-color: #000000 !important;");
                      $(star2).attr("style", "-webkit-text-fill-color: #000000 !important;");
                      $(star3).attr("style", "-webkit-text-fill-color: #000000 !important;");
                      $(star4).attr("style", "-webkit-text-fill-color: #000000 !important;");
                      $(star5).attr("style", "-webkit-text-fill-color: #000000 !important;");
                      } else {
                      $(star1).attr("style", "");
                      $(star2).attr("style", "");
                      $(star3).attr("style", "");
                      $(star4).attr("style", "");
                      $(star5).attr("style", "");
                      }
                      }
                      
                      historySave( "promociones" );
                      
                      }
                      
            		  }
                      });
               
               
               //hide loading
               //hideLoading();
               
               //historySave( "promociones" );
               
               
               promotions = data.promotions;
               
               if(promotionsCount == 0)
               {
               
                    var title;
                    var message;
               
                    message = "No se han encontrado promociones."
                    title = "No hay resultados";
               
               
                    phoneAlert(title, message);
                    historyBack();
               }
               
               if (!showPromotionsList) {
                    historySave( "mapPromotions" );
                    viewMapPromotions();
               }
               //viewMap();
               
               
               //hide loading
               hideLoading();
               
               
               
               
               
               
               }
               
               }
               });
    	
	}
    
    
    
}

var map;
/*
 * Muestra el mapa de resultados de busqueda de promociones
 */
function viewMapPromotions ()
{
	
    //show('mapPromotions');
    
    //showLoading();
    
    var centerLatLon = new google.maps.LatLng(41.64707, -0.885859);
    if(currentLocation != null)
        centerLatLon =new google.maps.LatLng(currentLocation["latitude"], currentLocation["longitude"]);
    
    var mapOptions = {
    zoom: 4,
    center: centerLatLon,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false
    };
    
    map = new google.maps.Map(document.getElementById('map_results'),
                              mapOptions);
    
    google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
                                      //hideLoading();
                                      });
    
    var bounds = new google.maps.LatLngBounds();
    
    var personImage = 'img/male.png';
    
    if(currentLocation != null)
    {
        bounds.extend(centerLatLon);
        new google.maps.Marker({
                               position: centerLatLon,
                               map: map,
                               icon: personImage
                               });
    }
    
    
    
    
    var image = 'img/ic_promotion_map.png';
    $.each(promotions, function(i, item){
           if(item.restaurantCoordinates != null && item.restaurantCoordinates.latitude != null && item.restaurantCoordinates.longitude != null)
           {
           
           var valoration;
           
           if(item.restaurantValoration) {
                if(item.restaurantValoration==1){
                    valoration= "<p id='valorationpromomap' ><i id='star1promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star starpromomapactive'></i> <i id='star2promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i> <i id='star3promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i> <i id='star4promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i> <i id='star5promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i></p>";
                } else if(item.restaurantValoration==2){
                    valoration= "<p id='valorationpromomap' ><i id='star1promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star starpromomapactive'></i> <i id='star2promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star starpromomapactive'></i> <i id='star3promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i> <i id='star4promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i> <i id='star5promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i></p>";
                } else if(item.restaurantValoration==3){
                    valoration= "<p id='valorationpromomap' ><i id='star1promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star starpromomapactive'></i> <i id='star2promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star starpromomapactive'></i> <i id='star3promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star starpromomapactive'></i> <i id='star4promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i> <i id='star5promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i></p>";
                } else if(item.restaurantValoration==4){
                    valoration= "<p id='valorationpromomap' ><i id='star1promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star starpromomapactive'></i> <i id='star2promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star starpromomapactive'></i> <i id='star3promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star starpromomapactive'></i> <i id='star4promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star starpromomapactive'></i> <i id='star5promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i></p>";
                } else if(item.restaurantValoration==5){
                    valoration= "<p id='valorationpromomap' ><i id='star1promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star starpromomapactive'></i> <i id='star2promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star starpromomapactive'></i> <i id='star3promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star starpromomapactive'></i> <i id='star4promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star starpromomapactive'></i> <i id='star5promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star starpromomapactive'></i></p>";
                } else {
                    valoration= "<p id='valorationpromomap' ><i id='star1promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i> <i id='star2promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i> <i id='star3promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i> <i id='star4promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i> <i id='star5promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i></p>";
                }
           } else {
        	   valoration= "<p id='valorationpromomap' ><i id='star1promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i> <i id='star2promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i> <i id='star3promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i> <i id='star4promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i> <i id='star5promo-" + item.restaurant.id + "-" + item.id + "' class='icon-star'></i></p>";
           }
           
           var star1="#star1promo-"+item.restaurant.id + "-" + item.id;
           var star2="#star2promo-"+item.restaurant.id + "-" + item.id;
           var star3="#star3promo-"+item.restaurant.id + "-" + item.id;
           var star4="#star4promo-"+item.restaurant.id + "-" + item.id;
           var star5="#star5promo-"+item.restaurant.id + "-" + item.id;
           
           var latLng = new google.maps.LatLng(item.restaurantCoordinates.latitude, item.restaurantCoordinates.longitude);
           bounds.extend(latLng);
           var marker = new google.maps.Marker({
                                               position: latLng,
                                               map: map,
                                               icon: image
                                               });
           var infoWindow = new google.maps.InfoWindow({
                                                       content: "",
                                                       maxWidth: 250,
                                                       minWidth: 250
                                                       });
           google.maps.event.addListener(marker, 'click', function() {
                                         infoWindow.setContent('<div id="infoMap"><div style="width:45%;float:left;"><h1 style="margin-top:0px !important;">' + item.restaurant.name + '</h1>' + valoration + '</div><div  style="width:45%;float:left;"><p id="promoDescriptionMap">' + item.description + '</p></div><div style="width:10%;float:left;padding-top:10%; padding-bottom:10%;"><img id="imgDetailMap" src="./img/ic_select-green.png" onclick="restaurantDetail(' + item.restaurant.id + ')"/></div></div>');
                                         
                                         
                                         infoWindow.open(map, this);
                                         });
           
           //alert("Pintado en mapa: " + item.name);
           
           }
           
           
           });
    
    map.fitBounds(bounds);
    
    
    
}

function calculateMapDistance(lat1, lon1, lat2, lon2)
{
    rad = function(x) {return x*Math.PI/180;}
    
    //var R     = 6378.137;                          //Radio de la tierra en km
    var R     = 6378137;                          //Radio de la tierra en m
    var dLat  = rad( lat2 - lat1 );
    var dLong = rad( lon2 - lon1 );
    
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    
    return d.toFixed(0);                      //Retorna cero decimales
}

var associationNews;

/*
 * Realiza la busqueda de promociones de restaurantes
 */
function searchAssociationNews()
{
	
	//show loading
	showLoading();
	
	
    var service = "associationNewsSearch";
    //var query = $("#prependedInput").val();
    //var distance = $("#distanceSelect").val();
    //var searchType = $("#searchTypeSelect").val();
    //var foodType = $("#foodTypeSelect").val();
    //var priceType = $("#priceSelect").val();
    
    
    
    var params = "";
    
    
	/*if (navigator != null && navigator.geolocation != null) {
        
		var onSuccess = function(position) {
            
            currentLocation = {};
            
            
            currentLocation["latitude"] = position.coords.latitude;
            currentLocation["longitude"] = position.coords.longitude;
            
			executeSearch();
		};
        
		function onError(error) {
			executeSearch();
		}
        
		navigator.geolocation.getCurrentPosition(onSuccess, onError);
        
	} else {
		executeSearch();
	}
    
    function calculateDistance(lat1, lon1, lat2, lon2)
    {
        rad = function(x) {return x*Math.PI/180;}
        
        //var R     = 6378.137;                          //Radio de la tierra en km
        var R     = 6378137;                          //Radio de la tierra en m
        var dLat  = rad( lat2 - lat1 );
        var dLong = rad( lon2 - lon1 );
        
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        
        return d.toFixed(0);                      //Retorna cero decimales
    }
    */
    
    executeSearch();
    
    function executeSearch(near) {
    	
    	
    	/*if(query != null && query != "")
         {
         params = params + "&query=" + query;
         }*/
    	
    	
    	var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey + params;
        
        
        $.ajax({
               url: url,
               dataType: 'jsonp',
               success: function(data) {
               
               if(data.error == true)
               {
               hideLoading();
               
               var title;
               var message;
               
               message = "Error: " + data.errorCode;
               title = "Error";
               
               
               phoneAlert(title, message);
               }
               else if(data.associationNews.length == 0)
               {
               hideLoading();
               
               var title;
               var message;
               
               message = "No se han encontrado noticias."
               title = "No hay resultados";
               
               
               phoneAlert(title, message);
               }
               else
               {
               
               
               show('noticiasEventos');
               
               //alert("Restaurants: " + data.restaurants);
               
               
               /*data.associationNews.sort(function (a, b) {
                                     return (parseInt(a.distance) - parseInt(b.distance));
                                     });*/
               
               
               $.each(data.associationNews, function(i, item){
                      
                      var divTitle = $("<div id='divTitleNews'/>");
                      var divPhoto = $("<div id='divPhotoNews'/>");
                      var divDescription = $("<div id='divDescriptionNews'/>");
                      
                      var divSeparator = $("<div />").attr("style", "clear:both;");
                      
                      var li = $("<li></li>");
                      var a = $("<a id='linkDetalleNoticia'/>").attr("href", "#");
                      //a.attr("onclick", "restaurantDetail(" + item.id + ", false)");
                      a.attr("onclick", "associationNewDetail(" + item.id + ")");
                      
                      var photoUrl = "";
                      var img = "";
                      
                      if(item.photo != null)
                      {
                        photoUrl = item.photo.url;
                      
                        img = $("<img id='imagennoticia'/>").attr("src", photoUrl);
                      
                      }
                      
                      var h3 = $("<h3/>").append(item.title);
                      
                      var icon = $("<img id='iconGetDetail'/>").attr("src", "./img/ic_select-green.png");
                      
                      if(item.description){
                        var p;
                        if (item.description.length<=200)
                            p = $("<p id='descripcion'/>").append(item.description);
                        else
                            p = $("<p id='descripcion'/>").append(item.description.substr(0,200)+"...");
                      }else{
                        var p = $("<p id='descripcion'/>").append("Contenido de noticia no disponible");
                      }
                      
                      divTitle.append(h3);
                      divTitle.append(icon);
                      divPhoto.append(img);
                      divDescription.append(p);
                      
                      li.append(a);
                      a.append(divTitle);
                      a.append(divSeparator);
                      a.append(divPhoto);
                      a.append(divSeparator);
                      a.append(divDescription);
                      
                      
                      $("#resultList").append(li);
                      
                      
                      });
               
               
               associationNews = data.associationNews;
               
               
               //viewMap();
               
               
               //hide loading
               hideLoading();
               
               historySave( "noticiasEventos" );
               
               
               }
               
               }
               });
    	
	}
    
    
    
}

var associationNew;

/*
 * Muestra el detalle de un restaurante
 */
function associationNewDetail(id)
{
	
	//show loading
	showLoading();
	
	
    var service = "associationNewDetail";
    //var id = $("#restaurantId").val();
    
    //alert("query: " + query);
    
    var params = "&associationNewId=" + id;
    
    // http://emenu-eu-test.nidoapp.eu.cloudbees.net/api/1.0/restaurantsSearch?key=449860a8-630e-4e08-ba63-7de4b4f6e3d6
    var url = nidopassApiUrl + "/" + service + '?key=' + nidopassApiKey + params;
    
    
    $.ajax({
           url: url,
           dataType: 'jsonp',
           success: function(data) {
           
           if(data.error == true)
           {
           hideLoading();
           
           var title;
           var message;
           
           message = "Error: " + data.errorCode;
           title = "Error";
           
           
           phoneAlert(title, message);
           }
           else
           {
           
           show('noticiasEventosDetail');
           
           associationNew = data.associationNew;
           
           
           $("#newsDetailTitle").html(data.associationNew.title);
           
           var newUrl = "";
           
           if (data.associationNew.url) {
                newUrl = data.associationNew.url;
           }
           
           var newSocialUrl = null;
           
           if (data.associationNew.url) {
                newSocialUrl = "'" + data.associationNew.url + "'";
           }
           
           $("#linkMailDetail").attr("href", "mailto:?subject=Mira esta noticia de Comer en Aragón&body=He leido esta noticia en la <b>App Móvil de Comer en Aragón</b> y creo que puede interesarte.<br><br>" + newUrl + "<br><br>También puedes descargarte la App en tu teléfono o tablet y así poder realizar reservas en restaurantes, estar al día de todas las novedades y ofertas, y muchas cosas más.");
           
           
           $("#iconTwitterDetail").attr("onclick", "window.plugins.socialsharing.shareViaTwitter('Noticia interesante en @ComerEnAragon. Descarga la App móvil y reserva en restaurantes, revisa las ofertas ...', null, " + newSocialUrl + ", console.log('share ok'), function(errormsg){phoneAlert('Error Twitter', 'Error al conectar con Twitter. Comprueba que tienes configurada la cuenta en el dispositivo.');})");
           
           $("#iconFacebookDetail").attr("onclick", "window.plugins.socialsharing.shareViaFacebook('He leido esta noticia en la App Móvil de Comer en Aragón y creo que es interesante. " + newUrl + " También puedes descargarte la App en tu teléfono o tablet y así poder realizar reservas en restaurantes, estar al día de todas las novedades y ofertas, y muchas cosas más.', null, " + newSocialUrl + ", console.log('share ok'), function(errormsg){phoneAlert('Error Facebook', 'Error al conectar con Facebook. Comprueba que tienes configurada la cuenta en el dispositivo.');})");
           
           $("#newsDetailDescription").html(data.associationNew.description);
           
           
           var photoUrl = "";
           
           if (data.associationNew.photo) {
           
                photoUrl = data.associationNew.photo.url;
           
                $("#newsDetailPhoto").attr("src", photoUrl);
           
           }
           
           
           //hide loading
           hideLoading();
           
           historySave( "noticiasEventosDetail" );
           }
           
           
           }
           });
    
    
}

function resizeDetailMap() {
	var coordinates = restaurantCoordinates;
	
	var ismobile=(/Mobile/.test(navigator.userAgent))?1:0;
	
	if (coordinates != "") {
		//Si es tablet
		if (ismobile==0) {
			var anchoMapa = $(window).width();
			$("#restaurantDetailMapImage").attr("src", "http://maps.googleapis.com/maps/api/staticmap?center=" +coordinates + "&zoom=15&size=" + anchoMapa + "x230&maptype=roadmap&markers=color:blue%7Clabel:R%7C" +coordinates + "&sensor=false");
		
		//Si es móvil
		} else {
			var anchoMapa = $(window).width();
			$("#restaurantDetailMapImage").attr("src", "http://maps.googleapis.com/maps/api/staticmap?center=" +coordinates + "&zoom=15&size=" + anchoMapa + "x270&maptype=roadmap&markers=color:blue%7Clabel:R%7C" +coordinates + "&sensor=false");
		}
	}
}

function openWeb(url) {
	alert(url.toString());
	//$("#contenidoCuerpo").load("http://google.com");
}

