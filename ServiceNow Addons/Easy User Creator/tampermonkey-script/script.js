// ==UserScript==
// @name         Create User from Ticket
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  This script is written to allow easy creation of users in MI atlas based on Service Now ticket
// @author       Wieslaw Mosakowski
// @match        https://roche.service-now.com/*
// @match        https://miatlas--miwmdev.my.salesforce.com/*
// @require http://code.jquery.com/jquery-3.4.1.min.js

// ==/UserScript==

$(document).ready(function() {

    var question = $('.question_textarea_input');
    var where = 'https://miatlas--miwmdev.my.salesforce.com/';

    if(document.URL.includes('005') && !document.URL.includes('e?')) {
        var confirmation = confirm('Do you want to add new PERMISSIONS for that user?');
        if(confirmation) {
            var newURL = document.URL.replace(where, where + "apex/UserManagement?pageUserId=").replace("?noredirect=1&isUserEntityOverride=1", "");
            window.location.replace(newURL);
        }
    }

    if(document.URL.includes('sc_task.do') && undefined != question[0].innerHTML) {
        var splitQuestion = question[0].innerHTML.split('\n');
        var email = splitQuestion[0].split(': ')[1];
        var alias = email.split('@')[0];
        var firstName = alias.split('.')[0];
        var lastName = alias.split('.')[1];
        var fNameCapitalize = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        var lNameCapitalize = lastName.charAt(0).toUpperCase() + lastName.slice(1);
        var country = splitQuestion[1].split(': ')[1];
        var jobFunction = splitQuestion[2].split(': ')[1];

        var modifyUser = confirm('Do you want to create new user based on following data?\n\n' + question[0].innerHTML );
        if(modifyUser) {
            window.open(where
                + '005/e?ManageUsers&user_license_id=100b00000005x0s&UserPermissions_10=1&name_firstName='
                + fNameCapitalize + '&name_lastName='
                + lNameCapitalize + '&Alias='
                + alias.slice(0, 8) + '&Email='
                + email + '&Username=' + alias
                + '@master.roche.com&CommunityNickname='
                + alias + '&00Nb0000009h98p='
                + jobFunction +'&00Nb0000001uUNy=PK',
                '_blank');
        }
    }

});

(function() {
    'use strict';



})();