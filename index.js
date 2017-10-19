(function() {
    'use strict';
    var set_proxy = require("./set_proxy");
    // var $ = function (selector) {
    //     return document.querySelector(selector);
    // }
    
    // document.addEventListener('DOMContentLoaded', function(){
    //     process.stdout.write('restore binded');    
    //     $('#set_setting').addEventListener('click', function(event) {
    //         process.stdout.write('restore clicked');        
    //     });
    // });
    
    // document.addEventListener('DOMcontentLoaded', function(){
    //     process.stdout.write('restore binded');
    //     $('#restore').addEventListener('click', function(event) {
    //         process.stdout.write('restore clicked');
            
    //     });
    // });
    function setClickEvent (selector, cb) {
        document
        .querySelector(selector)
        .addEventListener('click', function() {
            cb();
        }, false);
    }

    setClickEvent('#set_setting', function () {
        set_proxy.startSettingProcess(8080);        
    });

    setClickEvent('#restore', function () {
        set_proxy.stopProxy();
    });
    console.log('parse to the end');
})();
