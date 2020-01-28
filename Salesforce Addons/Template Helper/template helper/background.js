var sessionId;
var templateCountry;
var domain;
var currentUrl;

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

var submitBtn = document.getElementById("submitBtn");
if (submitBtn != null) {
    submitBtn.addEventListener("click", function () {
        getSOQL();
    }, false);

}


function getSOQL() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tab = tabs[0];
        currentUrl = new URL(tab.url)
        console.log(currentUrl);
        var domain = currentUrl.hostname;

        getCookies( domain, "sid");
    })
}


function getCookies(domain, name)
{
    chrome.cookies.get({"url": 'https://' + domain, "name": name}, function(cookie) {
        sessionId = cookie.value;

        askSalesforce(sessionId, "/services/data/v47.0/tooling/executeAnonymous/?anonymousBody=Case c = new Case(Subject = 'DEV Testing Subject', Status = 'Open', Adverse_event__c = true, Country_code_CC__c = 'UK', Contact_name_case__c = 'DEV Testing Contact Name', Related_employee__c = 'DEV Testing Related Employee', Brand__c = 'a020Q000001RYd7')%3B insert c%3B Case_Brand__c cb = new Case_Brand__c(Case__c = c.Id, Affiliate_Product__c = 'a020Q000001RYd7')%3B insert cb%3B MI_Response_MIS__c mir = new MI_Response_MIS__c(Cases_Owner__c = 'DEV Testing Case Owner', Cases_Owner_Title__c = 'DEV Testing Cases Owner Title', Contact_Name__c = 'DEV Testing Contact Name', Main_Brands_With_Subjects__c = 'DEV Testing Main Brands with Subjects', No_Cover_Letter__c = false, Response_channel__c = 'Email', Subject__c = 'DEV Testing Case Subject')%3B insert mir%3B MI_Case_Response_MIS__c cr = new MI_Case_Response_MIS__c(Case__c = c.Id, Brands__c = 'DEV Testing Products list', MI_Response__c = mir.Id)%3B insert cr%3B",
            function(responseText) {
                chrome.extension.getBackgroundPage().console.log(responseText);
                console.log(responseText);

                refreshTemplate(sessionId, "/services/data/v45.0/query/?q=SELECT ID FROM MI_Response_MIS__c order by lastmodifieddate desc limit 1",
                    function(responseText) {
                        chrome.extension.getBackgroundPage().console.log(responseText);
                        console.log(responseText);

                        var json = JSON.parse(responseText);
                        openLink(currentUrl.href, json.records[0].Id);

                    });

            });
    });
}

function askSalesforce(sessId, urlX, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tab = tabs[0];
        var url = new URL(tab.url)
        var domain = url.hostname;

        var subject = document.getElementById('subject').value;
        var ae = document.getElementById("Adverse_Event").checked;
        var contactName = document.getElementById("contactName").value;
        var relatedEmployee = document.getElementById("relatedEmployee").value;
        var product = document.getElementById("product").value;

        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://" +domain + urlX, true);
        xhr.setRequestHeader('Authorization', "OAuth " + sessId);
        xhr.setRequestHeader('Accept', "application/json");

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                callback(xhr.responseText);
                console.log(JSON.parse(xhr.responseText));
            }
        }
        xhr.send();
    })




}

function refreshTemplate(sessId, urlX, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tab = tabs[0];
        var url = new URL(tab.url)
        var domain = url.hostname;

        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://" +domain + urlX, true);
        xhr.setRequestHeader('Authorization', "OAuth " + sessId);
        xhr.setRequestHeader('Accept', "application/json");

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                callback(xhr.responseText);
                console.log(JSON.parse(xhr.responseText));
            }
        }
        xhr.send();
    })

}

function openLink(link, id) {
//    chrome.windows.create({url: "jsonPreview.html?body=", type: "popup", left: 100, top: 100});
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tab = tabs[0];
        var url = new URL(tab.url)
        var domain = url.hostname
        chrome.tabs.update({url: link + '&recipient_type_id=0030Q00000Ob6BM&related_to_id=' + id});
    })

}