//alert('sss');

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

var input = getUrlVars()["body"];
document.getElementById('jsonCode').textContent = decodeURI(input);
//alert(decodeURI(input));


//get json data
var data = '{"name": "json-view","version": "1.0.0"}';

//get target html element
var target = '.root';

jsonView.format(decodeURI(input), target);
