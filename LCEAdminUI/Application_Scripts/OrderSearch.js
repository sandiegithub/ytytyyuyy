/// <reference path="~/js/angular.js" />
/// <reference path="~/Content/toastr.min.css" />
/// <reference path="~/js/angular.min.js" />
/// <reference path="Common.js" />
function toasterOptions() {
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-center",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "show",
        "hideMethod": "hide"
    };
}

var indexMainApp = angular.module("indexMainApp", []);

indexMainApp.controller("indexController", function ($scope, $filter, $window) {

    $scope.orderSearchRequest = {};
    $scope.orderSearchRequest.SelectDate = "Today";
    $scope.orderSearchRequest.UserDetailSearchCategory = "First Name";
    $scope.orderSearchRequest.SelectedStore = "Show All Store Orders";
    $scope.numberOfOrdersFound = ' ';

    $scope.OrderSearch = function () {

        if ($scope.orderSearchRequest.UserDetailSearchCategory == "Phone Number") {

            $scope.orderSearchRequest.UserDetailSearchData = $scope.orderSearchRequest.UserDetailSearchData.match(/\d/g).join("");
        }

        $.ajax({
            type: 'POST',
            url: $window.HOME_GETSEARCHRESULTS_URL,
            data: JSON.stringify({ 'orderSearchRequest': $scope.orderSearchRequest }),
            contentType: "application/json;charset=utf-8",

            success: function (response) {
                $window.console.log("response" + response);
                if (response != null) {
                    $scope.searchDetailsList = response;
                    if ($scope.searchDetailsList.length == 0) {
                        $scope.numberOfOrdersFound = $window.RESOURCE_NO_ORDERSFOUND;
                    }
                    else if ($scope.searchDetailsList.length <= 15) {

                        $scope.numberOfOrdersFound = $scope.searchDetailsList.length + "  " + $window.RESOURCE_ORDERSFOUND;
                    }
                    else {
                        $scope.numberOfOrdersFound = $window.RESOURCE_MORE_ORDERSFOUND;
                    }
                    $scope.$apply();
                }
                else {
                    $scope.numberOfOrdersFound = $window.RESOURCE_NO_ORDERSFOUND;
                   
                    $scope.searchDetailsList = null;
                    $scope.$apply();
                }
            },
            error: function (response) {
                $window.console.log("response" + $window.RESOURCE_NO_ORDERSFOUND);
                $scope.numberOfOrdersFound = $window.RESOURCE_NO_ORDERSFOUND;
                $scope.searchDetailsList = null;
                $scope.$apply();
                toasterOptions();
                toastr.error("No Orders Found.");
            }
        });
    };

    $scope.BindStores = function () {

        $.ajax({

            type: 'POST',
            url: $window.HOME_GETSTORES_URL,
            contentType: "application/json;charset=utf-8",

            success: function (response) {
                if (response != null) {
                    $scope.storeInformationList = response;
                    $scope.$apply();
                }
            },
            error: function (response) {
                toasterOptions();
                toastr.error("Something went wrong, please try again");
            }
        });
    };
    $scope.BindStores();

    $scope.SelectDeselectAll = function () {
        var selectedCheckBoxCount = 0;
        var selectDeselectAll = true;

        angular.forEach($scope.searchDetailsList, function (searchDetails) {
            if (searchDetails.SelectDeselectAll == true) {
                selectedCheckBoxCount++;
            }
        });

        if (selectedCheckBoxCount == $scope.searchDetailsList.length) {
            selectDeselectAll = false;
        }
        else {
            selectDeselectAll = true;
        }

        angular.forEach($scope.searchDetailsList, function (searchDetails) {
            searchDetails.SelectDeselectAll = selectDeselectAll;
        });
    }

    $scope.onCategoryChange = function () {

        $scope.orderSearchRequest.UserDetailSearchData = '';

    }

    $scope.onDateChange = function () {
        //Today
        if ($scope.orderSearchRequest.SelectDate == "Today") {
            var todayDate = new Date();
            $scope.orderSearchRequest.StartDate = $filter('date')(todayDate, 'MM-dd-yyyy');
            $scope.orderSearchRequest.EndDate = $filter('date')(todayDate, 'MM-dd-yyyy');
            $scope.shouldBeDisabled = true;
        }
            //Current Week
        else if ($scope.orderSearchRequest.SelectDate == "Current Week") {
            var date = new Date();
            var prviousdate = new Date();
            date.setDate(date.getDate());
            var currentDay = parseInt(date.getDay());
            date.setDate(date.getDate() - currentDay);

            var EndDate = new Date();
            var Todate = new Date();
            var EndDay = 6 - currentDay;
            Todate.setDate(Todate.getDate() + EndDay);

            $scope.orderSearchRequest.StartDate = $filter('date')(date, 'MM-dd-yyyy');
            $scope.orderSearchRequest.EndDate = $filter('date')(Todate, 'MM-dd-yyyy');
            $scope.shouldBeDisabled = true;
        }
            //Past Week
        else if ($scope.orderSearchRequest.SelectDate == "Past Week") {
            var date = new Date();
            var prviousdate = new Date();
            prviousdate.setDate(prviousdate.getDate());
            var currentDay = parseInt(prviousdate.getDay());
            var currentWeek = new Date();
            var currentDay = 7 + parseInt(prviousdate.getDay());
            prviousdate.setDate(date.getDate() - currentDay);
            currentWeek.setDate(date.getDate() - currentDay);

            var Todate = new Date(currentWeek);
            Todate.setDate(currentWeek.getDate() + 6);

            $scope.orderSearchRequest.StartDate = $filter('date')(currentWeek, 'MM-dd-yyyy');
            $scope.orderSearchRequest.EndDate = $filter('date')(Todate, 'MM-dd-yyyy');
            $scope.shouldBeDisabled = true;
        }
            //Last 48 Hours
        else if ($scope.orderSearchRequest.SelectDate == "Last 48 Hours") {
            var fromDate = new Date();
            var toDate = new Date();
            toDate.setDate(toDate.getDate() - 1);
            fromDate.setDate(fromDate.getDate() - 2);
            $scope.orderSearchRequest.StartDate = $filter('date')(fromDate, 'MM-dd-yyyy');
            $scope.orderSearchRequest.EndDate = $filter('date')(toDate, 'MM-dd-yyyy');
            $scope.shouldBeDisabled = true;
        }
            //Current Month
        else if ($scope.orderSearchRequest.SelectDate == "Current Month") {
            var date = new Date();
            var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            var lastDayWithSlashes = firstDay;
            $scope.orderSearchRequest.StartDate = $filter('date')(firstDay, 'MM-dd-yyyy');
            $scope.orderSearchRequest.EndDate = $filter('date')(lastDay, 'MM-dd-yyyy');
            $scope.shouldBeDisabled = true;
        }

            // Past Month
        else if ($scope.orderSearchRequest.SelectDate == "Past Month") {
            var date = new Date();
            var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            firstDay.setMonth(firstDay.getMonth() - 1);
            lastDay.setMonth(lastDay.getMonth() - 1);
            $scope.orderSearchRequest.StartDate = $filter('date')(firstDay, 'MM-dd-yyyy');
            $scope.orderSearchRequest.EndDate = $filter('date')(lastDay, 'MM-dd-yyyy');
            $scope.shouldBeDisabled = true;
        }
            //Custom Time Frame
        else if ($scope.orderSearchRequest.SelectDate == "Custom Time Frame") {
            $scope.orderSearchRequest.EndDate = "";
            $scope.orderSearchRequest.StartDate = "";
            $scope.shouldBeDisabled = false;
        }
    };
    $scope.onDateChange();
});

