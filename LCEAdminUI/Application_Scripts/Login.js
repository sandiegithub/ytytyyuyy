/// <reference path="~/js/angular.js" />
/// <reference path="~/Content/toastr.min.css" />
/// <reference path="~/js/angular.min.js" />
/// <reference path="Common.js" />


var LogInApp = angular.module("LogInApp", []);

LogInApp.controller("LoginController", function ($scope) {


    $scope.Login = function () {

        $.ajax({
            type: 'POST',
            url: HOME_CHECKLOGIN_URL,
            data: JSON.stringify({ 'userDetails': $scope.UserDetails }),
            contentType: "application/json;charset=utf-8",

            success: function (response) {
                if (response != null) {
                    window.location.href = HOME_ORDERSEARCH_URL;
                }

                else {

                    window.location.href = HOME_LOGIN_URL;
                }

            },
            error: function (response) {
                toasterOptions();
                toastr.error("Something went wrong, please try again");
            }
        });
    }

});