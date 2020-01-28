

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function getUrlParam(parameter, defaultvalue){
    var urlparameter = defaultvalue;
    if(window.location.href.indexOf(parameter) > -1){
        urlparameter = getUrlVars()[parameter];
        }
    return urlparameter;
}



var what = getUrlParam('type','ae');

var inputs = document.getElementsByClassName('fieldWidth');

if(what == 'ae') {
	inputs[0].value = 'Daily IRT report for EEMEA/RE time zone';
	inputs[1].value = 'No unregistered AE have been found.';
}
if(what == 'tm') {
	inputs[0].value = 'Translation monitoring';
	inputs[1].value = 'No unprocessed translation files have been found.';
}
