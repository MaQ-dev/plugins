var sessionId;
var domain;
var currentUrl;
var ids = [];
var caseNumbers = [];

getSOQL();

var submitBtn = document.getElementById("refresh");
if (submitBtn != null) {
    submitBtn.addEventListener("click", function () {
        window.location.reload();
    }, false);

}



function getSOQL() {

    setTimeout(function(){

        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            var tab = tabs[0];
            console.log(tab);
            currentUrl = new URL(tab.url)
            //console.log(currentUrl);
            var domain = currentUrl.hostname;
             if (domain.indexOf("force.com") > -1) {
                 getCookies(domain, "sid");
             }
        });

        initSearch();


    }, 1500);
}

function initSearch() {
    var LightTableFilter = (function (Arr) {
        var _input;

        function _onInputEvent(e) {
            _input = e.target;
            var tables = document.getElementsByClassName(_input.getAttribute('data-table'));
            Arr.forEach.call(tables, function (table) {
                Arr.forEach.call(table.tBodies, function (tbody) {
                    Arr.forEach.call(tbody.rows, _filter);
                });
            });
        }

        function _filter(row) {
            var text = row.cells[0].textContent.toLowerCase(), val = _input.value.toLowerCase();
            row.style.display = text.indexOf(val) === -1 ? 'none' : 'table-row';
        }

        return {
            init: function () {
                var inputs = document.getElementsByClassName('light-table-filter');
                Arr.forEach.call(inputs, function (input) {
                    input.oninput = _onInputEvent;
                });
            }
        };
    })(Array.prototype);

    LightTableFilter.init();
    document.getElementById('CaseNumberSearch').style.display = 'inline';
}

function getCookies(domain, name)
{
    chrome.cookies.get({"url": 'https://' + domain, "name": name}, function(cookie) {
        sessionId = cookie.value;

        askSalesforce(sessionId, "/services/data/v45.0/query/?q=SELECT ID, Country_code_CC__c, CaseNumber, Subject, LastModifiedDate, LastModifiedBy.Name FROM Case WHERE IsDeleted = false and Is_Deleted__c = false order by lastmodifieddate desc limit 150",
            function(responseText) {
            
                console.log(responseText);
                var casesBodies = '<table class="table tableClass order-table table-hover">\n' +
                    '  <tr>\n' +
                    '    <th>CaseNumber</th>\n' +
                    '    <th>Subject</th>\n' +
                    '    <th>Who</th>\n' +
                    '    <th>When</th>\n' +
                    '    <th>Soft</th>\n' +
                    '    <th>Hard</th>\n' +
                    '  </tr>';



                var json = JSON.parse(responseText);

                for(i = 0; i < json.records.length; i++) {
                    ids.push(json.records[i].Id);
                    caseNumbers.push(json.records[i].CaseNumber);

                    var caseSubject = json.records[i].Subject;
                    var caseSubjectShort = json.records[i].Subject;
                    if(null == caseSubject) {
                        caseSubjectShort = '';
                    } else {
                        if (caseSubject.length > 20) {
                            caseSubjectShort = caseSubject.slice(0, 20) + '...';
                        }
                    }

                    var who = json.records[i].LastModifiedBy.Name;
                    var whoShort = json.records[i].LastModifiedBy.Name;
                    if(null == who) {
                        whoShort = '';
                    } else {
                        if (who.length > 17) {
                            whoShort = who.slice(0, 17) + '...';
                        }
                    }

                    var when = json.records[i].LastModifiedDate;
                    var whenShort = json.records[i].LastModifiedDate.slice(0, 10).replace('T', ', ');

                    casesBodies += "<tr><td><span title='Country Code: " + json.records[i].Country_code_CC__c + "' style='cursor: pointer' id='link" + json.records[i].Id + "'>" + json.records[i].CaseNumber + "</span></td><td title='" + caseSubject + "'>" + caseSubjectShort + "</td><td title='" + who + "'>" + whoShort + "</td><td title='" + when + "'>" + whenShort + "</td><td>" + "<button class='buttonSoft' id='soft" + json.records[i].Id + "'>Delete</button></td><td><button class='buttonHard' id='hard" + json.records[i].Id + "'>Delete!</button></td></tr>";
                }
                casesBodies += '</table>'
                document.getElementById('cases').outerHTML = casesBodies;
            });

        console.log(ids);
      //  alert('done');
    });
}

function askSalesforce(sessId, urlX, callback) {
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
                //console.log(JSON.parse(xhr.responseText));
            }
            if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                for(i = 0; i<ids.length; i++) {
                    let idiczek = ids[i];
                    let numerek = caseNumbers[i];
                    var soft = document.getElementById("soft" + ids[i]);
                    var hard = document.getElementById("hard" + ids[i]);
                    var link = document.getElementById("link" + ids[i]);
                    console.log(soft);
                    if (link != null) {
                        link.addEventListener("click", function () {
                            openLink('/console#/apex/CC_CaseView?id=' + idiczek);
                            window.close();
                        }, false);
                    }
                    if (soft != null) {
                        soft.addEventListener("click", function () {
                            openLink('/console#/apex/CC_CaseDelete?id=' + idiczek);
                            window.close();
                        }, false);
                    }
                    if (hard != null) {
                        hard.addEventListener("click", function () {
                            if(confirm('Do you want to remove Case ' + numerek + ' from Salesforce completely?')) {
                                askSalesforce(sessionId, "/services/data/v47.0/tooling/executeAnonymous/?anonymousBody=delete [SELECT ID from Case WHERE CaseNumber = '" + numerek + "'];",
                                    function(responseText) {
                                        console.log(responseText);
                                        alert('Case ' + numerek + ' removed! :)');
                                        window.location.reload();

                                    });
                            }
                        }, false);
                    }
                }
            }
        }
        xhr.send();
    })
}
function openLink(link) {
//    chrome.windows.create({url: "jsonPreview.html?body=", type: "popup", left: 100, top: 100});
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tab = tabs[0];
        var url = new URL(tab.url)
        var domain = url.hostname
        chrome.tabs.update({url: 'https://' + domain + link});
    })

}


