(function(){
var voterRegistration = new Object();

// canvas
voterRegistration.canvas = document.getElementById('output-canvas');
voterRegistration.signarea = document.getElementById('sign-area');

// form data
voterRegistration.data = {
	"optin": false,
	"idcard": "",
	"gender": "",
	"name-zh": "",
	"name-en-surname": "",
	"name-en-othername": "",
	"address-flat": "",
	"address-floor": "",
	"address-block": "",
	"address-line0": "",
	"address-line1": "",
	"address-line2": "",
	"address-line3": "",
	"extra-landline": "",
	"extra-mobile": "",
	"extra-office": "",
	"extra-email": "",
	"extra-lang": "✔ ",
	"date": (new Date().toJSON().slice(0,10).split("-").join("")),
	"step": 0,
};

// text position on canvas
voterRegistration.textPosition = [
	{"key":"idcard", // data key
		"position": [
			[376,273],[409,273],
			[508,273],[542,273],[574,273],[606,273],[638,273],[670,273],[782,273]
		], // position for each char
		"size": 36,
	},
	{"key":"gender",
		"position": [[1006,273],[1092,273]],
		"size": 36,
	},
	{"key":"name-zh", "position": [[294,360]], "size": 36, "align": "left"},
	{"key":"name-en-surname",
		"position": [
			[306,401],[336,401],[365,401],[395,401],
			[424,401],[454,401],[484,401],[514,401],
			[543,401],[573,401],[603,401],[633,401],
			[663,401],[693,401],[723,401],[753,401],
			[782,401],[812,401],[842,401],[872,401],
			[902,401],[932,401],[962,401],[992,401],
			[1022,401],[1052,401],[1082,401],[1112,401],
			[1138,401],
		],
		"size": 28,
	},
	{"key":"name-en-othername",
		"position": [
			[306,440],[336,440],[365,440],[395,440],
			[424,440],[454,440],[484,440],[514,440],
			[543,440],[573,440],[603,440],[633,440],
			[663,440],[693,440],[723,440],[753,440],
			[782,440],[812,440],[842,440],[872,440],
			[902,440],[932,440],[962,440],[992,440],
			[1022,440],[1052,440],[1082,440],[1112,440],
			[1138,440],
		],
		"size": 28,
	},
	{"key":"address-flat", "position": [[160,510]], "size": 28, "align": "left"},
	{"key":"address-floor", "position": [[460,510]], "size": 28, "align": "left"},
	{"key":"address-block", "position": [[960,510]], "size": 28, "align": "left"},
	{"key":"address-line0", "position": [[320,554]], "size": 28, "align": "left"},
	{"key":"address-line1", "position": [[320,600]], "size": 28, "align": "left"},
	{"key":"address-line2", "position": [[320,640]], "size": 28, "align": "left"},
	{"key":"address-line3", "position": [[320,680]], "size": 28, "align": "left"},
	{"key":"extra-landline", "position": [[190,725]], "size": 28, "align": "left"},
	{"key":"extra-mobile", "position": [[730,725]] ,"size": 28, "align": "left"},
	{"key":"extra-office", "position": [[190,765]], "size": 28, "align": "left"},
	{"key":"extra-email", "position": [[190,805]], "size": 22, "align": "left"},
	{"key":"extra-lang",
		"position": [[536,1186],[690,1186]],
		"size": 22,
	},
	{"key":"date",
		"position": [
			[425,1545],[458,1545],[490,1545],[515,1545],
			[305,1545],[335,1545],
			[185,1545],[215,1545],
		],
		"size": 22,
	},
];

// calculate checkdigit for id card
voterRegistration.calculateCheckdigit = function(letters, digits){
	var checkdigit = 0;
	var weightedSum = 0;
	var charList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	// Add letters' value to the sum
	if (letters.length == 2) {
		weightedSum += ((10 + charList.indexOf(letters.charAt(0)))*9 );
		weightedSum += ((10 + charList.indexOf(letters.charAt(1)))*8 );
	} else {
		weightedSum += ( 36*9 );
		weightedSum += ((10 + charList.indexOf(letters.charAt(0)))*8 );
	}
	// Add digits' value to the sum
	for (var i = 0, j = 7; i < digits.length; i++, j--) {
		weightedSum += j * digits.charAt(i);
	}
	// Calculate numeric checkdigit
	checkdigit = 11-(weightedSum%11);
	// Return checkdigit srting
	switch(checkdigit) {
	    case 11:
	        return '0';
	    case 10:
	        return 'A';
	    default:
	        return checkdigit.toString();
	}
}

// check id card number format, call calculate checkdegit and show it.
voterRegistration.setIdCheckdigit = function(){
	// Calculate ID card checksum
	var letterRegExp = new RegExp("^[A-z]{1,2}$");
	var letters = $("#idcard-letters").val().match(letterRegExp)[0].toUpperCase();

	var digitsRegExp = new RegExp("^[0-9]{6}$");
	var digits = $("#idcard-digits").val().match(digitsRegExp)[0];

	var checkdigit = voterRegistration.calculateCheckdigit(letters, digits);
	console.log(checkdigit);

	// UI draw checksum
	$("#idcard-checksum").text("("+checkdigit+")");
	// save data to voterRegistration object
	if (letters.length==1) {
		letters = " "+letters;
	}
	voterRegistration.data["idcard"] = letters+digits+checkdigit;
}

// FIXME: quick and dirty radio button to string
voterRegistration.setRadio = function(){
	if (this.id == "optin-agree") {
		voterRegistration.data.optin = true;
		return false;
	}
	if (this.id == "optin-decline") {
		voterRegistration.data.optin = false;
		return false;
	}
	if ($.inArray(this.id, ["gender-male", "dc-yes-new", "dc-yes-exist", "extra-lang-zh"]) >= 0) {
		voterRegistration.data[this.name] = "✔ ";
	} else {
		voterRegistration.data[this.name] = " ✔";
	}
	if ($.inArray(this.id, ["dc-fc"]) >= 0) {
		voterRegistration.data[this.name] = "  ";
	}
}

// FIXME: quick and dirty next step button
voterRegistration.nextStep = function(){
	voterRegistration.data.step++;
	voterRegistration.setStep(voterRegistration.data.step);
	return false;
}
voterRegistration.setStep = function(step){
	var target = $(".step-container");
	target.removeClass("step-current-"+(step-1)).addClass("step-current-"+step);

	var navtarget = $(".step-nav-container");
	navtarget.removeClass("step-current-"+(step-1)).addClass("step-current-"+step);

	$(".step-nav-2 .nav-content").text(voterRegistration.data["name-zh"]);
	$(".step-nav-3 .nav-content").text(voterRegistration.data["name-en-surname"]+", "+voterRegistration.data["name-en-othername"]);
	$(".step-nav-4 .nav-content").text(voterRegistration.data["idcard"]+", "+	$(".gender-btn.active .btn-text").text());
	$(".step-nav-5 .nav-content").text(
		voterRegistration.data["address-flat"]+" "+
		voterRegistration.data["address-floor"]+" "+
		voterRegistration.data["address-block"]+" "+
		voterRegistration.data["address-line0"]+" "+
		voterRegistration.data["address-line1"]+" "+
		voterRegistration.data["address-line2"]+" "+
		voterRegistration.data["address-line3"]
  );
	$(".step-nav-6 .nav-content").text(
		voterRegistration.data["extra-landline"]+" "+
		voterRegistration.data["extra-mobile"]+" "+
		voterRegistration.data["extra-office"]+" "+
		voterRegistration.data["extra-email"]+" "+
		$(".lang-btn.active .btn-text").text()+" "+
		$(".extra-dc-btn.active .btn-text").text()
	);

	$('html, body').animate({
		scrollTop: 0
	}, 500);

	return false;
}

// FIXME: quick and dirty generate button
voterRegistration.generate = function(){
	if (voterRegistration.data.optin) {
		$("<img src='https://www.google-analytics.com/collect?v=1&t=event&tid=UA-72771086-1&cid=force-anonymous-client-id&ec=Form&ea=Generate&ni=1'>").appendTo("body");
	}
	var canvas = voterRegistration.canvas;
	var context = voterRegistration.canvas.getContext('2d');
	canvas.height = 3368;
	canvas.width = 1190;

	context.drawImage(document.getElementById("source-img"), 0, 0);

	voterRegistration.insertTexts(context);
	voterRegistration.initSign();
	voterRegistration.resetSign();
}

// signature area initialisation and set event handle
voterRegistration.initSign = function(){
	var canvas = voterRegistration.signarea;
	var context = voterRegistration.signarea.getContext('2d');
	canvas.height = 90;
	canvas.width = 340;

	context.drawsignature = function(x, y) {
		var path=new Path2D();

		context.strokeStyle = 'black';
		context.lineWidth = 2;
		context.lineJoin = 'round';
		context.lineCap = 'round';

		path.moveTo(context.prevX,context.prevY);
		path.lineTo(x,y);
		path.closePath();

		context.stroke(path);

		context.prevX = x;
		context.prevY = y;
	};
	canvas.onmousemove = function(e) {
		if (!canvas.isDrawing) {
			return;
		}
		var x = e.pageX - $(canvas).offset().left;
		var y = e.pageY - $(canvas).offset().top;
		context.drawsignature(x, y);
	};
	canvas.onmousedown = function(e) {
		canvas.isDrawing = true;
		var x = e.pageX - $(canvas).offset().left;
		var y = e.pageY - $(canvas).offset().top;
		context.prevX = x;
		context.prevY = y;
	};
	document.onmouseup = function(e) {
		canvas.isDrawing = false;
		voterRegistration.sendSign();
		voterRegistration.updateImgLink();
	};
	canvas.addEventListener('touchmove', function(e) {
		if (!canvas.isDrawing) {
			return;
		}
		var x = e.targetTouches[0].pageX - $(canvas).offset().left;
		var y = e.targetTouches[0].pageY - $(canvas).offset().top;
		context.drawsignature(x, y);
		e.preventDefault();
	}, false);
	canvas.addEventListener('touchstart', function(e) {
		canvas.isDrawing = true;
		var x = e.targetTouches[0].pageX - $(canvas).offset().left;
		var y = e.targetTouches[0].pageY - $(canvas).offset().top;
		context.prevX = x;
		context.prevY = y;
		e.preventDefault();
	}, false);
	canvas.addEventListener('touchend', function(e) {
		canvas.isDrawing = false;
		voterRegistration.sendSign();
		voterRegistration.updateImgLink();
		e.preventDefault();
	}, false);
}

// clear signature area and output canvas
voterRegistration.resetSign = function(){
	var canvas = voterRegistration.signarea;
	var context = voterRegistration.signarea.getContext('2d');
	context.fillStyle="white";
	context.fillRect(0, 0, 340, 110);
	voterRegistration.sendSign();
	voterRegistration.updateImgLink();
	return false;
}

// mirror signature stokes to output canvas
voterRegistration.sendSign = function(){
	var target = voterRegistration.canvas.getContext('2d');
	target.drawImage(voterRegistration.signarea, 780, 1510);
}

// convert output canvas to png data url
voterRegistration.updateImgLink = function(){
	if (voterRegistration.data.optin) {
		$("<img src='https://www.google-analytics.com/collect?v=1&t=event&tid=UA-72771086-1&cid=force-anonymous-client-id&ec=Form&ea=Download&ni=1'>").appendTo("body");
		voterRegistration.data.optin=false;
	}
	var dataURL = voterRegistration.canvas.toDataURL("image/png");
	$("#downloadButton").attr("href", dataURL);
	$("#downloadArea").attr("src", dataURL);
}

// render data string on output canvas
voterRegistration.insertTexts = function(context){
	context.fillStyle = "black";
	for (var text of voterRegistration.textPosition) {
		context.font = text.size+"px 'Noto Sans TC', sans-serif";
		if (text.align) {
			context.textAlign = text.align;
		} else {
			context.textAlign = "center"
		}
		if (text.position.length > 1) {
			for (var i = 0; i < text.position.length; i++) {
				context.fillText(voterRegistration.data[text.key].charAt(i), text.position[i][0], text.position[i][1]+50);
			}
		} else {
			context.fillText(voterRegistration.data[text.key], text.position[0][0], text.position[0][1]+50);
		}
	}
}

// FIXME: quick and dirty bind
voterRegistration.simpleBind = function(){
	voterRegistration.data[this.id] = $(this).val().toUpperCase();
}

// FIXME: quick and dirty bind for email
voterRegistration.emailBind = function(){
	voterRegistration.data["extra-email"] = $("#extra-email").val();
}

// MISC
$("#idcard-letters").on('input', voterRegistration.setIdCheckdigit);
$("#idcard-digits").on('input', voterRegistration.setIdCheckdigit);

$(".radio-button").each(function(){
	$(this).on('change', voterRegistration.setRadio);
});

$("#name-zh-form input").each(function(){
	$(this).on('input', voterRegistration.simpleBind);
});
$("#name-en-form input").each(function(){
	$(this).on('input', voterRegistration.simpleBind);
});
$("#address-form input").each(function(){
	$(this).on('input', voterRegistration.simpleBind);
});
$("#extra-form input.phone-control").each(function(){
	$(this).on('input', voterRegistration.simpleBind);
});
$("#extra-form input.email-control").each(function(){
	$(this).on('input', voterRegistration.emailBind);
});

$(".nextButton").on('click', voterRegistration.nextStep);
$(".checkButton").on('click', voterRegistration.generate);

$(".resetSign").on('click', voterRegistration.resetSign);

})();
