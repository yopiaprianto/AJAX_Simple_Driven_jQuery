var default_content="";

$(document).ready(function(){

	checkURL();
	populateCurrency();
	$('ul li a').click(function (e){
			checkURL(this.hash);
	});

	//filling in the default content
	default_content = $('#pageContent').html();


	setInterval("checkURL()",250);

});

var lasturl="";

function checkURL(hash)
{
	if(!hash) hash=window.location.hash;

	if(hash != lasturl)
	{
		lasturl=hash;
		// FIX - if we've used the history buttons to return to the homepage,
		// fill the pageContent with the default_content
		if(hash=="")
		$('#pageContent').html(default_content);

		else{
		 if(hash=="#products")
		 	loadProducts();
		 else
		   loadPage(hash);
		}
	}
}


function loadPage(url)
{

   // url=url.replace('#page',''); // if hash matches withn #page = ''

	url=url.replace('#','');

	$('#loading').css('visibility','visible');

	$.ajax({
		type: "POST",
		url: "load_page.jsp",
		data: 'page='+url,
		dataType: "html",
		success: function(msg){

			if(parseInt(msg)!=0)
			{
				$('#pageContent').html(msg);
				$('#loading').css('visibility','hidden');
			}
		}

	});

}

function loadProducts() {
  $('#loading').css('visibility','visible');
  var jsonURL = "products.json";
  $.getJSON(jsonURL, function (json)
  {
    var imgList= "<ul class=\"products\">";
    $.each(json.products, function () {
      //imgList += '<li><img src= "' + this.imgPath + '"><h3>\
     // <a href=\'#' + this.detailsPage + '\' > </a>' + this.name + '</h3></li>';
     
     
      imgList += '<li>\
                     <img src= \'' + this.imgPath + '\'>\
                     <h3>\
                        <a href=\'#'+this.detailsPage+'\' \
                          onclick="sessionStorage.setItem(\'basePrice\',  \'' + this.price+ '\' )">' 
                           + this.name +  '</a>\
       <h3 id='+this.id+' > SGD '+ this.price + '</h3></h3><h3>\
       </h3></li>';
	});
   imgList+='</ul>'
  $('#pageContent').html(imgList);
  $('#loading').css('visibility','hidden');
 });
}


function populateCurrency() {
    var jsonURL = "currency.json";
    var selectionBox = document.getElementById("currency_selector");
    $.getJSON(jsonURL, function(json) {
        $.each(json.currencies, function() {
            opt = document.createElement('option');
            opt.value = this.code;
            opt.text = this.name; 
            selectionBox.appendChild(opt);
        })
    })
    selectionBox.onchange=function() {
        currencyCode = selectionBox.options[selectionBox.selectedIndex].value; 
           setCookies(currencyCode);
        
    }
}


function setCookies(currencyCode) {
    var jsonURL = "currency.json";
    $.getJSON(jsonURL, function(json) {
        $.each(json.currencies, function() {
            if(currencyCode ===this.code) {
                setCookie("CC", this.country);
                setCookie("CR", this.conversion);
                refreshPrice();
            }
        })
    })
       
}

function setCookie(name, value) {
    var date = new Date();
    date.setTime(date.getTime()+(2*24*60*60*1000));
    var expires = "expires" + date.toGMTString();
    
    var strCookie = name + "=" +value+ ";" +expires + "; path=/"
    document.cookie=strCookie;
}

function refreshPrice(){
    hash = window.location.hash;
    var basePrice;
    var newPrice;
    
    var exchangeRate = readCookie('CR'); 
    
    if (hash == "#products") {
        var jsonURL = "products.json";
        $.getJSON(jsonURL, function(json) {
            $.each(json.products, function() {
                 basePrice = this.price;
                 newPrice = basePrice * exchangeRate;  
                 $('#'+this.id).html(currencyCode+' '+newPrice);
            })
        })
    } else {
                 basePrice = sessionStorage.getItem('basePrice');
                 newPrice = basePrice * exchangeRate;    
                $('#price').html(currencyCode+' '+newPrice);
    }
   
}


function readCookie(conversionRate) {
                
   var allcookies = document.cookie;

   var name = ""; value = "";

   // Get all the cookies pairs in an array
   cookiearray = allcookies.split(';');

   // Now take key value pair out of this array
   for(var i=0; i<cookiearray.length; i++){
        var cookieItem = cookiearray[i];

        name = cookieItem.split('=')[0].trim();
        // unescape to characters
        value = unescape(cookieItem.split('=')[1]);
       
       if (name === conversionRate) {
           return value;
       }  
   }
           }
