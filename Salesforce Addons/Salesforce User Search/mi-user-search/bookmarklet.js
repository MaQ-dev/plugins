javascript: {

    var orgId = document.cookie.match(/(^|;\s*)sid=(.+?)!/)[2];

    function askSalesforce(url, callback) {
        var session;

        if (location.hostname.indexOf("force.com") > -1) {
            console.log(document.cookie);
            var sessionRegex = document.cookie.match(/(^|;\s*)sid=(.+?);/);
            if (null != sessionRegex) {
                session = sessionRegex[2];
            }
            if (null == session) { // lightning
                session = document.cookie.match('sid=([^;]*)')[1];
            }
        }

        if (!session) {
            alert("Session not found");
            callback();
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://" + document.location.hostname + url, true);
        xhr.setRequestHeader('Authorization', "OAuth " + session);
        xhr.setRequestHeader('Accept', "application/json");

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                callback(xhr.responseText);
            }
        }
        xhr.send();
    }

    chrome.storage.sync.get('lastUserName', function (data) {
        var lUserName = data.lastUserName;
        if(lUserName == undefined) {
            lUserName = '';
        }

        swal({
            title: 'Search for user:',
            text: 'Just type part of UserName and I will find it. Or leave empty to display all users.',
            input: 'text',
            inputValue: lUserName,
            showCloseButton: true,
            confirmButtonText: 'Search',
            showCancelButton: true,
            cancelButtonText: '<span title="Advanced search functionalities">Role Search</span>',
            inputPlaceholder: 'username',
            onOpen: function () {
                var input = swal.getInput();
                input.setSelectionRange(0, input.value.length)
            }
        }).then(function (username) {
            chrome.storage.sync.set({lastUserName: username});

            askSalesforce('/services/data/v45.0/query/?q=SELECT Id, Name, LastLoginDate, Username, FederationIdentifier, Country_ISO_code__c FROM User where Profile.Name != \'Chatter Free User\' AND Country_ISO_code__c != null AND IsActive = true AND (Username LIKE %27%25' + username + '%25%27 OR Name LIKE %27%25' + username + '%25%27) ORDER BY Country_ISO_code__c ASC NULLS FIRST',
                function (responseText) {
                    var elems = JSON.parse(responseText);

                    var users = "<select style='width: 400px' id='usersList'><br/>"
                    for (i = 0; i < elems.records.length; i++) {
                        users += '<option title="[' + elems.records[i].Country_ISO_code__c + '] ' + elems.records[i].Username + '" value="' + elems.records[i].Id + '">[' + elems.records[i].Country_ISO_code__c + '] <b>' + elems.records[i].Name + '</b> - ' + elems.records[i].FederationIdentifier + ' - ' + elems.records[i].Username + '</option>';
                    }

                    users += '</select>';

                    if (elems.records.length == 0) {
                        swal({
                            type: 'error',
                            title: 'No users found! Sorry!',
                            timer: 2000
                        });
                    } else {
                        swal({
                            type: 'success',
                            title: elems.records.length + ' users found:',
                            html: users,
                            showCloseButton: true,
                            confirmButtonText: 'Log in!',
                            showCancelButton: true,
                            onOpen: function (ele) {
                                $('#usersList').select2({
                                    width: '100%',
                                    escapeMarkup: function (m) {
                                        return m;
                                    },
                                });
                                $("#usersList").change(function () {
                                    var userId = $('#usersList').val();
                                    console.log(userId);
                                    askSalesforce("/services/data/v45.0/query/?q=SELECT Id, PermissionSet.Name from PermissionSetAssignment where AssigneeId = '" + userId + "' AND PermissionSet.IsOwnedByProfile = false ORDER BY PermissionSet.Name ASC",
                                        function (responseText) {

                                            var permSets = 'Permission Sets: <br/><br/>';
                                            var obj = JSON.parse(responseText, function (key, value) {
                                                if (key == "Name") {
                                                    permSets += value + '<br/>';
                                                }
                                            });

                                            $('#userTooltip').html(permSets);
                                        });

                                });
                            },
                            cancelButtonText: '<div class="tooltip">Manage user<span id="userTooltip" class="tooltiptext">Tooltip text</span></div>'
                        }).then(function () {
                                var e = document.getElementById("usersList");
                                var strUser = e.options[e.selectedIndex].value;
                                location.replace("/servlet/servlet.su?oid=" + orgId + "&suorgadminid=" + strUser + "&retURL=%2Fconsole&targetURL=%2Fconsole");
                            },
                            function (dismiss) {
                                if (dismiss == 'cancel') {
                                    var e = document.getElementById("usersList");
                                    var strUser = e.options[e.selectedIndex].value;
                                    location.replace("/console#%2Fapex%2FUserManagement%3FpageUserId%3D" + strUser);
                                }
                            }
                        );
                    }
                })
        }, function (dismiss) {
            if (dismiss == 'cancel') {
                swal({
                    title: 'Select MI atlas role',
                    html:
                        '<select multiple id="miType" class="swal2-select">' +
                        '  <option value="MI_Atlas_Super_User">MI Atlas Super User</option>' +
                        '  <option value="MI_Atlas_Role_1">MI Atlas Role 1</option>' +
                        '  <option value="MI_Atlas_Role_2">MI Atlas Role 2</option>' +
                        '  <option value="MI_Atlas_Role_3">MI Atlas Role 3</option>' +
                        '  <option value="Mi_Atlas_Taxonomy_Guardian">Mi Atlas Taxonomy Guardian</option>' +
                        '  <option value="Mi_Atlas_Multi_Country">Mi Atlas Multi Country</option>' +
                        '  <option value="LSR_ACMO_Role">LSR ACMO Role</option>' +
                        '  <option value="MI_Atlas_GMI">MI Atlas GMI</option>' +
                        '  <option value="MI_Atlas_Local_QCR">MI Atlas Local QCR</option>' +
                        '  <option value="MI_Atlas_RIL">MI_Atlas_RIL</option>' +
                        '  <option value="MI_Atlas_Regional_QCR">MI_Atlas_Regional_QCR</option>' +
                        '</select><select id="countryList" style="width: 60%" class="swal2-select">' +
                        '<option value="" selected>All countries</option>' +
                        '<option>AE</option>\n' +
                        '<option>AL</option>\n' +
                        '<option>AM</option>\n' +
                        '<option>AR</option>\n' +
                        '<option>AT</option>\n' +
                        '<option>AU</option>\n' +
                        '<option>AZ</option>\n' +
                        '<option>BA</option>\n' +
                        '<option>BD</option>\n' +
                        '<option>BE</option>\n' +
                        '<option>BG</option>\n' +
                        '<option>BR</option>\n' +
                        '<option>CA</option>\n' +
                        '<option>CH</option>\n' +
                        '<option>CI</option>\n' +
                        '<option>CL</option>\n' +
                        '<option>CN</option>\n' +
                        '<option>CO</option>\n' +
                        '<option>CZ</option>\n' +
                        '<option>DE</option>\n' +
                        '<option>DK</option>\n' +
                        '<option>EE</option>\n' +
                        '<option>ES</option>\n' +
                        '<option>FI</option>\n' +
                        '<option>FR</option>\n' +
                        '<option>GR</option>\n' +
                        '<option>HK</option>\n' +
                        '<option>HR</option>\n' +
                        '<option>ID</option>\n' +
                        '<option>IE</option>\n' +
                        '<option>IL</option>\n' +
                        '<option>IN</option>\n' +
                        '<option>IQ</option>\n' +
                        '<option>IR</option>\n' +
                        '<option>IT</option>\n' +
                        '<option>JO</option>\n' +
                        '<option>JP</option>\n' +
                        '<option>KG</option>\n' +
                        '<option>KR</option>\n' +
                        '<option>LA</option>\n' +
                        '<option>LB</option>\n' +
                        '<option>LK</option>\n' +
                        '<option>LT</option>\n' +
                        '<option>LV</option>\n' +
                        '<option>MA</option>\n' +
                        '<option>MD</option>\n' +
                        '<option>ME</option>\n' +
                        '<option>MK</option>\n' +
                        '<option>MM</option>\n' +
                        '<option>MN</option>\n' +
                        '<option>MX</option>\n' +
                        '<option>MY</option>\n' +
                        '<option>NL</option>\n' +
                        '<option>NO</option>\n' +
                        '<option>NZ</option>\n' +
                        '<option>PE</option>\n' +
                        '<option>PH</option>\n' +
                        '<option>PL</option>\n' +
                        '<option>PT</option>\n' +
                        '<option>RO</option>\n' +
                        '<option>RS</option>\n' +
                        '<option>RU</option>\n' +
                        '<option>SA</option>\n' +
                        '<option>SE</option>\n' +
                        '<option>SI</option>\n' +
                        '<option>SG</option>\n' +
                        '<option>SK</option>\n' +
                        '<option>SY</option>\n' +
                        '<option>TH</option>\n' +
                        '<option>TM</option>\n' +
                        '<option>TN</option>\n' +
                        '<option>TR</option>\n' +
                        '<option>TW</option>\n' +
                        '<option>UA</option>\n' +
                        '<option>UK</option>\n' +
                        '<option>UY</option>\n' +
                        '<option>UZ</option>\n' +
                        '<option>VE</option>\n' +
                        '<option>VN</option>\n' +
                        '<option>ZA</option>\n' +
                        '</select>',
                    showCancelButton: true,
                    confirmButtonText: 'Search'
                }).then((result) => {
                    var count = $('#miType option:selected').length;
                    var options = "'" + $('#miType').val().toString().replace(/,/g, "','") + "'";
                    var country = $('#countryList').val();
                    askSalesforce('/services/data/v45.0/query/?q=SELECT Assignee.Id, Assignee.Name, Assignee.Username, Assignee.Email, Assignee.Country_ISO_code__c, COUNT(PermissionSetId) FROM PermissionSetAssignment WHERE PermissionSet.Name IN (' + options + ' ) AND Assignee.Profile.Name != \'Chatter Free User\' AND Assignee.Country_ISO_code__c != null and Assignee.Country_ISO_code__c LIKE %27%25' + country + '%25%27 AND Assignee.IsActive = true GROUP BY Assignee.Id, Assignee.Name,  Assignee.Username, Assignee.Email, Assignee.Country_ISO_code__c HAVING COUNT(PermissionSetId) = ' + count + ' ORDER BY Assignee.Country_ISO_code__c ASC',
                        function (responseText) {
                            var elems = JSON.parse(responseText);

                            var users = "<select style='width: 400px' id='usersList'><br/>"
                            for (i = 0; i < elems.records.length; i++) {
                                users += '<option title="' + elems.records[i].Email + '" value="' + elems.records[i].Id + '">[' + elems.records[i].Country_ISO_code__c + '] ' + elems.records[i].Name + " - " + elems.records[i].Email + '</option>';
                            }

                            users += '</select><button style="background: #33363D; top: 20px; width: 140px" class="button swal2-styled dropdown">\n' +
                                '  <span style="color: white">Actions</span>\n' +
                                '  <div class="dropdown-content">\n' +
                                '  <p class="dropdownButton" style="background: red" id="actButton1">Contact user</p>\n' +
                                '  <p class="dropdownButton" style="background: blue" id="actButton2">Manage user</p>\n' +
                                '  <p class="dropdownButton" style="background: #850000" id="actButton3">Contact all</p>\n' +
                                '  </div>\n' +
                                '</button>';

                            if (elems.records.length == 0) {
                                swal({
                                    type: 'error',
                                    title: 'No users found! Sorry!',
                                    timer: 2000
                                });
                            } else {
                                swal({
                                    type: 'success',
                                    title: elems.records.length + ' users found:',
                                    html: users,
                                    showCloseButton: false,
                                    confirmButtonText: 'Log in!',
                                    showCancelButton: false,
                                    cancelButtonText: 'Cancel',
                                    onOpen: function (ele) {
                                        $('#usersList').select2({
                                            width: '100%',
                                        });
                                        document.getElementById("usersList").focus();

                                        function openGmail() {
                                            var e = document.getElementById("usersList");
                                            var strUser = e.options[e.selectedIndex].title;
                                            window.open("https://mail.google.com/mail/?view=cm&fs=1&to=" + strUser + "&su=Mi atlas related question&body=Dear%20user,%20I%27m%20contacting%20you%20regarding%20incident%20INC00000", '_blank');
                                        }

                                        function contactEmAll() {
                                            var emails = '';
                                            $("#usersList option").each(function () {
                                                emails += $(this).attr('title') + ';';
                                            });
                                            window.open("https://mail.google.com/mail/?view=cm&fs=1&bcc=" + emails + "&su=Mi atlas IMPORTANT MESSAGE", '_blank');
                                        }

                                        function openManage() {
                                            var e = document.getElementById("usersList");
                                            var strUser = e.options[e.selectedIndex].value;
                                            swal.close();
                                            location.replace("/console#%2Fapex%2FUserManagement%3FpageUserId%3D" + strUser);
                                        }

                                        var el = document.getElementById("actButton1");
                                        el.addEventListener("click", openGmail, false);
                                        var elx = document.getElementById("actButton2");
                                        elx.addEventListener("click", openManage, false);
                                        var el3 = document.getElementById("actButton3");
                                        el3.addEventListener("click", contactEmAll, false);
                                    }
                                }).then(function () {
                                        var e = document.getElementById("usersList");
                                        var strUser = e.options[e.selectedIndex].value;
                                        location.replace("/servlet/servlet.su?oid=" + orgId + "&suorgadminid=" + strUser + "&retURL=%2Fconsole&targetURL=%2Fconsole");
                                    },
                                    function (dismiss) {
                                        if (dismiss == 'cancel') {

                                        }
                                    }
                                );
                            }
                        })
                })
            }
        })
    });
}