var sessionId;
var templateCountry;
var domain;

getTemplateCountry();

function getTemplateCountry() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var tab = tabs[0];

        function display_h1 (results){
           templateCountry = results[0].slice(-2);
           document.getElementById('country').textContent = 'Template Country: ' + templateCountry;
        }

        chrome.tabs.executeScript(tab.id, {
            code: 'document.getElementsByClassName(\'pageDescription\')[0].textContent'
        }, display_h1);

    });
}

function getCookies(domain, name) {
    chrome.cookies.get({"url": 'https://' + domain, "name": name}, function (cookie) {
        sessionId = cookie.value;

        apiRequestCreateCase(sessionId, "/services/data/v39.0/sobjects/Case/",
            function (responseText) {
                chrome.extension.getBackgroundPage().console.log(responseText);
                console.log(responseText);
            });
    });
}

function apiRequestCreateCase(sessId, urlX, callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var tab = tabs[0];
        var url = new URL(tab.url)
        var domain = url.hostname;

        var subject = document.getElementById('subject').value;
        var ae = document.getElementById("Adverse_Event").checked;
        var contactName = document.getElementById("contactName").value;
        var relatedEmployee = document.getElementById("relatedEmployee").value;
        var product = document.getElementById("product").value;

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://" + domain + urlX, true);
        xhr.setRequestHeader('Authorization', "OAuth " + sessId);
        xhr.setRequestHeader('Content-Type', "application/json");

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                console.log(JSON.parse(xhr.responseText));
                chrome.extension.getBackgroundPage().console.log(xhr.responseText);
                var caseId = xhr.responseText.id;
                apiRequestCreateMIS(caseId, sessionId, "/services/data/v39.0/sobjects/MI_Response_MIS__c/",
                    function (responseText) {
                        var xhr = new XMLHttpRequest();
                        xhr.open("POST", "https://" + domain + urlX, true);
                        xhr.setRequestHeader('Authorization', "OAuth " + sessId);
                        xhr.setRequestHeader('Content-Type', "application/json");

                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4) {
                                console.log(JSON.parse(xhr.responseText));
                            }
                            }


                });


            }
        }
        xhr.send(JSON.stringify(
            {
                "Subject": subject,
                "Status": "Open",
                "Adverse_event__c" : ae,
                "Country_code_CC__c" : templateCountry,
                "Contact_name_case__c" : contactName,
                "Related_employee__c" : relatedEmployee,
                "Brand__c" : product

            }));
    })
}

function apiRequestCreateMIS(caseId, sessId, urlX, callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {

        var xhrX = new XMLHttpRequest();
        xhrX.open("POST", "https://" + domain + urlX, true);
        xhrX.setRequestHeader('Authorization', "OAuth " + sessId);
        xhrX.setRequestHeader('Content-Type', "application/json");

        xhrX.onreadystatechange = function () {
            if (xhrX.readyState == 4) {
                console.log(JSON.parse(xhrX.responseText));
                chrome.extension.getBackgroundPage().console.log(xhrX.responseText);
                var misResponseId = xhrX.responseText.id;

                var xhr = new XMLHttpRequest();
                xhr.open("POST", "https://" + domain + urlX, true);
                xhr.setRequestHeader('Authorization', "OAuth " + sessId);
                xhr.setRequestHeader('Content-Type', "application/json");

                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        console.log(JSON.parse(xhr.responseText));
                        apiRequestCreateMISCase(caseId, misResponseId, sessionId, "/services/data/v39.0/sobjects/MI_Case_Response_MIS__c/",
                            function (responseText) {
                                console.log(JSON.parse(xhr.responseText));
                            });
                    }
                    }



            }
        }

        xhrX.send(JSON.stringify(
            {
                "Cases_Owner_Title__c": "Medical Information Manager",
                "Cases_Owner__c": "Wieslaw Mosakowski",
                "Contact_Name__c" : "Example Contact"

            }));

    })
}

function apiRequestCreateMISCase(caseId, misId, sessId, urlX, callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {

        var xhrR = new XMLHttpRequest();
        xhrR.open("POST", "https://" + domain + urlX, true);
        xhrR.setRequestHeader('Authorization', "OAuth " + sessId);
        xhrR.setRequestHeader('Content-Type', "application/json");

        xhrR.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                console.log(JSON.parse(xhr.responseText));
                chrome.extension.getBackgroundPage().console.log(xhr.responseText);
                var misResponseId = xhr.responseText.id;

                var xhr = new XMLHttpRequest();
                xhr.open("POST", "https://" + domain + urlX, true);
                xhr.setRequestHeader('Authorization', "OAuth " + sessId);
                xhr.setRequestHeader('Content-Type', "application/json");

                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        console.log(JSON.parse(xhr.responseText));
                    } else {
                        console.log('e;se');
                    }
                }

                xhr.send(JSON.stringify(
                    {
                        "Case__c": caseId,
                        "MI_Response__c" : misId
                    }));


            }
        }

        xhrR.send(JSON.stringify(
            {
                "Cases_Owner_Title__c": "Medical Information Manager",
                "Cases_Owner__c": "Wieslaw Mosakowski",
                "Contact_Name__c" : "Example Contact"

            }));

    })
}


function openLink(link) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var tab = tabs[0];
        var url = new URL(tab.url)
        var domain = url.hostname
        chrome.tabs.update({url: 'https://' + domain + link});
    })

}

function createCase() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var tab = tabs[0];
        var url = new URL(tab.url)
        domain = url.hostname;

        getCookies(domain, "sid");
    })
}

var submitBtn = document.getElementById("submitBtn");
if (submitBtn != null) {
    submitBtn.addEventListener("click", function () {
        createCase();
    }, false);

}
