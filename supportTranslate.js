
var btnToEng = $("#transToEng");
var btnToLang = $("#transToLang");
var customerMsg = $("#customerMsg");
var customerTrans = $("#customerTrans");
var myMsg = $("#myMsg");
var myTrans = $("#myTrans");
var lang="en";
var transBefore = "For your convenience, this message has been translated by Google Translate: "
var bestRegards = "Best regards, ";
var clipboardBtn = $('#clipboardBtn');
var isAuto=true;
var msgText;

var languageBar = $('#langInput').select2({ width: '150px' });

(function($) {
  $.fn.donetyping = function(callback){
    var _this = $(this);
    var x_timer;
    _this.keyup(function (){
      clearTimeout(x_timer);
      x_timer = setTimeout(clear_timer, 1500);
    });

    function clear_timer(){
      clearTimeout(x_timer);
      callback.call(_this);
    }
  }
})(jQuery);

function translateURL(sourceLang, transLang, message){
	return "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + transLang + "&dt=t&q="+encodeURIComponent(message);
}

function parseResponse(response){
	var responseText = "";
	var responseLang = "";
	response = response.replace(new RegExp(",{2,}", "g"), ",");

	//to prevent the json parser from parsing incorrect json
	if(response.indexOf(",")==1){
		response = response.replace(',',"");
	}

	response = JSON.parse(response);

	if(response[2] !== null && response[2] !== ""){
		responseLang = response[2];

		for(var i=0; i<response[0].length; i++){
			responseText+=response[0][i][0];
		}

	}
	else{
		responseText=" ";
		responseLang="en";
	}

	var responseArr = [responseText, responseLang];
	return responseArr;
}

function translateRequest(url, callbackfn){

	$.get(url, function(data){},"text")
		.then(function(data){

	    	response = parseResponse(data);
			
			callbackfn(response);
		});	
}

function translateToEng(){
	var langFrom;

	if(isAuto){
		langFrom='auto';
	}
	else{
		langFrom=$('#langInput').val();
	}

	var msgText = customerMsg.val();

	var urlToEng = translateURL(langFrom, 'en', msgText);

	translateRequest(urlToEng, function(response){
    	customerTrans[0].innerText = response[0];
    	lang = response[1];
    	if(isAuto && $('#langInput').val() !== lang){
			languageBar.val(lang).trigger('change');
			translateToLang();
			//updateFillerText();
    	}
	});
}

function translateToLang(){

	//updateFillerText();
	
	var langTo = $('#langInput').val();

	var msgText = myMsg.val()

	var urlToLang = translateURL('en', langTo, msgText);

	translateRequest(urlToLang, function(response){

		myTrans[0].innerText = response[0] +"\n\n"+ "------" + "\n\n"+ msgText;

		var urlBack = translateURL(langTo, 'en', response[0]);

		translateRequest(urlBack, function(response){	
			$('#backInEng')[0].innerText = response[0];
		})
	});
}


// function updateFillerText(){
// 	lang = $('#langInput').val();
// 	var urlRegards = translateURL('en', lang, "Best regards, ");
// 	var urlBefore = translateURL('en', lang, "For your convenience, this message has been translated by Google Translate: ");


// 	translateRequest(urlRegards, function(response){
// 		bestRegards = response[0];
// 	});
// 	translateRequest(urlBefore, function(response){
// 		transBefore = response[0];
// 	});

// }

btnToEng.click(translateToEng);

btnToLang.click(translateToLang);

customerMsg.on('paste', function(e){
	translateToEng();});


myMsg.on('paste', function(e){
	translateToLang();
});

customerMsg.donetyping(function(){
  translateToEng();
});
myMsg.donetyping(function(){
  translateToLang();
});

$('#langInput').on('paste', function(e){
	//updateFillerText();
	setTimeout("translateToLang()", 100);
});

$('#autoTranslate').on('change', function(e){
	isAuto = $('#autoTranslate')[0].checked
	$('#langInput')[0].disabled=isAuto;
	translateToEng();
})

var clipboard = new Clipboard('#clipboardBtn');

clipboard.on('success', function(e) {

    e.clearSelection();
});

clipboard.on('error', function(e) {
});

translateToLang();

