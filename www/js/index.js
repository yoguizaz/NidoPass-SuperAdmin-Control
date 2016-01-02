// Declaraci���n de variables globales
var myScroll, myScrollMenu, cuerpo, menuprincipal, wrapper, estado;

// Guardamos en variables elementos para poder rescatarlos despu���s sin tener que volver a buscarlos
cuerpo = document.getElementById("cuerpo"),
menuprincipal = document.getElementById("menuprincipal"),
wrapper = document.getElementById("wrapper");

var xhReq = new XMLHttpRequest();


/* Dani cambia la función a Jquery ready */
//window.onload = function ()


$(function()	{

    	estado="cuerpo";
    	
    	// Creamos el elemento style, lo a���adimos al html y creamos la clase cssClass para aplicarsela al contenedor wrapper
		var style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = '.cssClass { position:absolute; background:#e5e4e2; z-index:2; left:0; top:7%; width:100%; height: 100%; overflow:auto;}';
		document.getElementsByTagName('head')[0].appendChild(style);
		
	    
	    // A���adimos las clases necesarias
		cuerpo.className = 'page center';
		menuprincipal.className = 'page center';
		wrapper.className = 'cssClass';
		
			
		// Leemos por ajax el archivos opcion1.html de la carpeta opciones
		/*
		xhReq.open("GET", "templates/home.html", false);
		xhReq.send(null);
		document.getElementById("contenidoCuerpo").innerHTML=xhReq.responseText;
		*/
        /*if(window.location.href.indexOf("index2.html")>=0)*/
            showHome();
  
        if(window.location.href.indexOf("index.html")>=0)
            historyClear();



		// Leemos por ajax el archivos menu.html de la carpeta opciones
		xhReq.open("GET", "templates/menu.html", false);
		xhReq.send(null);
		document.getElementById("contenidoMenu").innerHTML=xhReq.responseText;
		
		// Creamos los 2 scroll mediante el plugin iscroll, uno para el men��� principal y otro para el cuerpo
		//myScroll = new iScroll('wrapper', { hideScrollbar: true });
		//myScrollMenu = new iScroll('wrapperMenu', { hideScrollbar: true });
		
		
		

		document.addEventListener("deviceready",onDeviceReady,false);
		//updateCurrentLocation();
		document.addEventListener("backbutton", onBackButtonTapped, false);
  
        document.addEventListener('orientationchange', doOnOrientationChange);

    	//directionsService = new google.maps.DirectionsService();


    	//new FastClick(document.body);

		
		 
		
		/* Añadido por Dani y Adrian el 7/04/2014 09:16 */
	 /* $("input.display-value").each(function(){
		var val = ($(this).val() - $(this).attr('min')) / ($(this).attr('max') - $(this).attr('min'));
		$(this).css('background-image',
					'-webkit-gradient(linear, left top, right top, '
					+ 'color-stop(' + val + ',red), '
					+ 'color-stop(' + val + ', #C5C5C5)'
					+ ')'
					);
	  });
		// display value of range while sliding
	  $("input.display-value").change( function(){
		$(this).next().val($(this).val());
                                      });

	  // see: http://stackoverflow.com/a/18389801/1148249
	
	  $('input[type="range"]').change(function () {
		var val = ($(this).val() - $(this).attr('min')) / ($(this).attr('max') - $(this).attr('min'));
		//console.log("valor: "+val);
		$(this).css('background-image',
					'-webkit-gradient(linear, left top, right top, '
					+ 'color-stop(' + val + ',red), '
					+ 'color-stop(' + val + ', #C5C5C5)'
					+ ')'
					);
		}	);*/
});



// Funci���n para a���adir clases css a elementos
function addClass( classname, element ) {
    var cn = element.className;
    if( cn.indexOf( classname ) != -1 ) {
    	return;
    }
    if( cn != '' ) {
    	classname = ' '+classname;
    }
    element.className = cn+classname;
}

// Funci���n para eliminar clases css a elementos
function removeClass( classname, element ) {
    var cn = element.className;
    var rxp = new RegExp( "\\s?\\b"+classname+"\\b", "g" );
    cn = cn.replace( rxp, '' );
    element.className = cn;
}

function show(opcion){
	
	// Si pulsamos en el bot���n de "menu" entramos en el if
	if(opcion=="menu"){
		if(estado=="cuerpo"){
			$('#menuPubLogo').attr('src', pubLogoUrl);
			cuerpo.className = 'page transition right';
			estado="menuprincipal";
		}else if(estado=="menuprincipal"){
			cuerpo.className = 'page transition center';
			estado="cuerpo";	
		}
	// Si pulsamos un bot���n del menu principal entramos en el else
	}else{
		
		// A���adimos la clase al li presionado
		//addClass('li-menu-activo' , document.getElementById("ulMenu").getElementsByTagName("li")[opcion]);
		
		// Recogemos mediante ajax el contenido del html seg���n la opci���n clickeada en el menu
		xhReq.open("GET", "templates/"+opcion+".html", false);
		xhReq.send(null);
		document.getElementById("contenidoCuerpo").innerHTML=xhReq.responseText;
		
		paginaActual = opcion;
        
        if(opcion=="home") {
            
            /* Añadido por Dani y Adrian el 7/04/2014 09:16 */
            $("input.display-value").each(function(){
                                          var val = ($(this).val() - $(this).attr('min')) / ($(this).attr('max') - $(this).attr('min'));
                                          $(this).css('background-image',
                                                      '-webkit-gradient(linear, left top, right top, '
                                                      + 'color-stop(' + val + ',#21c368), '
                                                      + 'color-stop(' + val + ', #C5C5C5)'
                                                      + ')'
                                                      );
                                          });
            // display value of range while sliding
            $("input.display-value").change( function(){
                                            $(this).next().val($(this).val());
                                            });
            
            
            $('input[type="range"]').change(function () {
                                            var val = ($(this).val() - $(this).attr('min')) / ($(this).attr('max') - $(this).attr('min'));
                                            //console.log("valor: "+val);
                                            $(this).css('background-image',
                                                        '-webkit-gradient(linear, left top, right top, '
                                                        + 'color-stop(' + val + ',#21c368), '
                                                        + 'color-stop(' + val + ', #C5C5C5)'
                                                        + ')'
                                                        );
                                            }	);
            
        }
		
		/*if (opcion=="home") {
		    var ismobile=(/Mobile/.test(navigator.userAgent))?1:0;

	        //Si es tablet el alto del separador es 40% para bajar mas los botones inferiores.
	        if (ismobile==0) {
	            document.getElementById("separator").style.height = "40% !important";
	        
	        //Si no, el alto es 12% para que se queden más arriba
	        } else {
	            document.getElementById("separator").style.height = "12% !important";
	        }

		}*/
        
       historySave(paginaActual);
		
		// Refrescamos el elemento iscroll seg���n el contenido ya a���adido mediante ajax, y hacemos que se desplace al top
		//myScroll.refresh();
		//myScroll.scrollTo(0,0);
		
		// A���adimos las clases necesarias para que la capa cuerpo se mueva al centro de nuestra app y muestre el contenido
		cuerpo.className = 'page transition center';
		estado="cuerpo";
		
		// Quitamos la clase a���adida al li que hemos presionado
        /*
		setTimeout(function() {
			removeClass('li-menu-activo' , document.getElementById("ulMenu").getElementsByTagName("li")[opcion]);
		}, 300);
        */

        
		 
	 }	

}


var history = {};
history["pages"] = {};
history["timeline"] = [];

function historyRecover( template ) {

	var found = true;

	var page = history["pages"][template];

	if(page != null)
	{
		document.getElementById("contenidoCuerpo").innerHTML=history["pages"][template];
	
		// Refrescamos el elemento iscroll seg���n el contenido ya a���adido mediante ajax, y hacemos que se desplace al top
		//myScroll.refresh();
		//myScroll.scrollTo(0,0);
		
		// A���adimos las clases necesarias para que la capa cuerpo se mueva al centro de nuestra app y muestre el contenido
		cuerpo.className = 'page transition center';
		estado="cuerpo";

		var last = null;

		if(history["timeline"].length > 0)
			last = history["timeline"][history["timeline"].length-1]

		if(template == last)
			history["timeline"].pop();

		history["timeline"].push(template);

		historyRecoverInitJs(template);
	}
	else
	{
		found= false;
	}
	
	return found;
	
}

function historyRecoverInitJs(template)
{
	if(template == "home")
	{
		setAutocomplete();
	}
}

function historySave( template ) {
	history["pages"][template] = document.getElementById("contenidoCuerpo").innerHTML;
	var last = null;

	if(history["timeline"].length > 0)
		last = history["timeline"][history["timeline"].length-1]

	if(template != last)
		history["timeline"].push(template);
}

function historyBack() {

	if(history["timeline"].length >= 2) // back and current views
	{
		showLoading();
		history["timeline"].pop(); //current view
		var lastView = history["timeline"].pop();
        
        if(lastView=="home") {
            historyClear();
            showHome();
            hideLoading();
        } else if(lastView=="favorites") {
            //historyClear();
            history["timeline"].pop();
            showFavorites();
            hideLoading();
        } else if(lastView=="mapPromotions") {
            hideLoading();
            history["timeline"].pop();
            searchPromotions(false);
        } else {
            historyRecover( lastView );
            hideLoading();
        }
	}
	else
	{
		if(window.location.href.indexOf("index.html")<0){
			window.location.href="index.html";
		} else {
			if(navigator != null && navigator.app != null)
			{
				if(navigator && navigator.notification)
	            {
	                var message = "¿Seguro que desea salir de la aplicación?";
	                navigator.notification.confirm(
	                                             message,     // mensaje (message)
	                                             appExit,         // función 'callback' (alertCallback)
	                                             "Salir de la aplicación.",            // titulo (title)
	                                             'Salir, Cancelar'             // nombre del botón (buttonName)
	                                             );
	            }
	            else
	            {
	                //alert(message);
	            	var message = "¿Seguro que desea salir de la aplicación?";
	                var exitApp = window.confirm(message);
	                if (exitApp==true) {
	                    navigator.app.exitApp();
	                }
	            }
	            /*var exitApp = window.confirm("¿Seguro que desea salir de la aplicación?");
	            if (exitApp==true) {
	                navigator.app.exitApp();
	            }*/
			}
		}
	}
		
}

function appExit(buttonIndex) {
	if(buttonIndex==1) {
		navigator.app.exitApp();
	}
}

function historyClear() {
	history["pages"] = {};
	history["timeline"] = [];

}

function onBackButtonTapped() {
    historyBack();
}

function onDeviceReady() {

	//pubAccessApp();
	//getPubData();

}

var pubLogoUrl;
var pubName;
var pubId;
var eventId;

function loadPubData(logoUrl, name, id, id_event) {
	pubLogoUrl = logoUrl;
	pubName = name;
	pubId = id;
    eventId = id_event;
	$('#indexPubLogo').attr('src', pubLogoUrl);
	//$('#index2PubName').append(pubName);
}


function showLoading()
{
	
	$.blockUI({ 
        message: $('#floatingCirclesG'), 
        css: { 
        	border: 'none' ,
        	background: 'none'
        }
	
    });
    
}

function hideLoading()
{
	$.unblockUI();
}

function doOnOrientationChange()
{
	resizeDetailMap();
	
    switch(window.orientation)
    {
        case -90:
        case 90:
            $("#valorarRestaurante").css({left:'30%'});
            //$("#imgBigDiv").css({left:'20%', top:'5%'});
            break;
        default:
            $("#valorarRestaurante").css({left:'10%'});
            //$("#imgBigDiv").css({left:'2%', top:'20%'});
            break;
    }
}

var valoration = 0;
function getValoration() {
    valoration=5;
    $("#starVal1").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
    $("#starVal2").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
    $("#starVal3").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
    $("#starVal4").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
    $("#starVal5").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
    $.blockUI({
              message: $('#valorarRestaurante'),
              css: {
              border: 'none' ,
              background: 'none'
              }
              
              });
    doOnOrientationChange();
}

function setValorationValue(value) {
    switch(value) {
        case 1:
            $("#starVal1").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
            $("#starVal2").attr("style", "-webkit-text-fill-color: #FFFFFF !important; font-size:50px;");
            $("#starVal3").attr("style", "-webkit-text-fill-color: #FFFFFF !important; font-size:50px;");
            $("#starVal4").attr("style", "-webkit-text-fill-color: #FFFFFF !important; font-size:50px;");
            $("#starVal5").attr("style", "-webkit-text-fill-color: #FFFFFF !important; font-size:50px;");
            valoration=value;
            break;
        case 2:
            $("#starVal1").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
            $("#starVal2").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
            $("#starVal3").attr("style", "-webkit-text-fill-color: #FFFFFF !important; font-size:50px;");
            $("#starVal4").attr("style", "-webkit-text-fill-color: #FFFFFF !important; font-size:50px;");
            $("#starVal5").attr("style", "-webkit-text-fill-color: #FFFFFF !important; font-size:50px;");
            valoration=value;
            break;
        case 3:
            $("#starVal1").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
            $("#starVal2").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
            $("#starVal3").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
            $("#starVal4").attr("style", "-webkit-text-fill-color: #FFFFFF !important; font-size:50px;");
            $("#starVal5").attr("style", "-webkit-text-fill-color: #FFFFFF !important; font-size:50px;");
            valoration=value;
            break;
        case 4:
            $("#starVal1").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
            $("#starVal2").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
            $("#starVal3").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
            $("#starVal4").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
            $("#starVal5").attr("style", "-webkit-text-fill-color: #FFFFFF !important; font-size:50px;");
            valoration=value;
            break;
        case 5:
            $("#starVal1").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
            $("#starVal2").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
            $("#starVal3").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
            $("#starVal4").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
            $("#starVal5").attr("style", "-webkit-text-fill-color: #21c368 !important; font-size:50px;");
            valoration=value;
            break;
        default:
            valoration=0;
            break;
    }
}

function sendRestaurantValoration() {
    var comment = $("#comment").val();
    valorateRestaurant(valoration, comment);
    //alert(device.uuid);
    hideLoading();
    
}


var actualBigImg = 0;
function getImgBig(item) {
    actualBigImg = item;
    $('#imgBig').attr("src", getPhotoBig(actualBigImg));
    $('#imgBigDescription').html(getPhotoBigDescription(actualBigImg));
    
    $.blockUI({
              message: $('#imgBigDiv'),
              css: {
              border: 'none' ,
              background: 'none'
              }
              
              });
    doOnOrientationChange();
}

function getNextImgBig (){
    var totalPhotos = getPhotoBigListSize();
    if (totalPhotos>0 && actualBigImg<totalPhotos-1) {
        actualBigImg = actualBigImg+1;
        $('#imgBig').attr("src", getPhotoBig(actualBigImg));
        $('#imgBigDescription').html(getPhotoBigDescription(actualBigImg));
    }
}

function getPrevImgBig (){
    if (actualBigImg>0) {
        actualBigImg = actualBigImg-1;
        $('#imgBig').attr("src", getPhotoBig(actualBigImg));
        $('#imgBigDescription').html(getPhotoBigDescription(actualBigImg));
    }
}

var actualImg = 0;

function clearActualImg() {
    actualImg = 0;
}

function getNextImg (){
    var totalPhotos = getPhotoListSize();
    if (totalPhotos>0 && actualImg<totalPhotos-1) {
        actualImg = actualImg+1;
        $('#restaurantDetailPhotos').attr("src", getPhotoBig(actualImg));
    }
}

function getPrevImg (){
    if (actualImg>0) {
        actualImg = actualImg-1;
        $('#restaurantDetailPhotos').attr("src", getPhotoBig(actualImg));
    }
}

var promocionesListDisplay = 0;
var menuListDisplay = 0;
var cartaListDisplay = 0;
var cartaVinosListDisplay = 0;

function clearDetailListsDisplay() {
    promocionesListDisplay = 0;
    menuListDisplay = 0;
    cartaListDisplay = 0;
    cartaVinosListDisplay = 0;
}

function showDetailList(lista) {
    
    if (lista=="promociones") {
        if (promocionesListDisplay == 0) {
            $('#restaurantDetailPromocionesList').css({display: 'block'});
            promocionesListDisplay = 1;
        } else {
            $('#restaurantDetailPromocionesList').css({display: 'none'});
            promocionesListDisplay = 0;
        }
    } else if (lista=="menu") {
        if (menuListDisplay == 0) {
            $('#restaurantDetailMenuList').css({display: 'block'});
            menuListDisplay = 1;
        } else {
            $('#restaurantDetailMenuList').css({display: 'none'});
            menuListDisplay = 0;
        }
    }else if (lista=="carta") {
        if (cartaListDisplay == 0) {
            $('#restaurantDetailCartaList').css({display: 'block'});
            cartaListDisplay = 1;
        } else {
            $('#restaurantDetailCartaList').css({display: 'none'});
            cartaListDisplay = 0;
        }
    }else if (lista=="cartaVinos") {
        if (cartaVinosListDisplay == 0) {
            $('#restaurantDetailCartaVinosList').css({display: 'block'});
            cartaVinosListDisplay = 1;
        } else {
            $('#restaurantDetailCartaVinosList').css({display: 'none'});
            cartaVinosListDisplay = 0;
        }
    }
}


