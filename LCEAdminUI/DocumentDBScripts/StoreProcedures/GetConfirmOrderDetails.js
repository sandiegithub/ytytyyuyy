function GetConfirmOrderDetails(orderDetailsInput) {
    var context = getContext();
    var response = context.getResponse();
    var collection = context.getCollection();
    var collectionLink = collection.getSelfLink();
    var logIds;

    var noresults = [];
    var storeNumberint = 0;

    var lefttrim = "";
    storeNumberint = orderDetailsInput.StoreNumber;
    var topLogIdsQuery = 'SELECT top 15 VALUE  o.LogId ';
    topLogIdsQuery += 'FROM OrderHistory o ';
    topLogIdsQuery += 'WHERE o.ServiceName =  "WSLCEMobile_ConfirmOrder" ';
    topLogIdsQuery += 'AND o.ServiceLogType = "DEBUGLOG" ';

    if (orderDetailsInput.OrderNumber != 'NULL') {
        topLogIdsQuery += 'AND ( @OrderNumber = "NULL" OR (is_defined(o.Response.AppOrderNumber) AND o.Response.AppOrderNumber  = @OrderNumber)) ';
    }
    else if (orderDetailsInput.PhoneNumber != 'NULL') {
        topLogIdsQuery += 'AND ( @PhoneNumber= "NULL"  OR  (is_defined(o.Request.PhoneNumber) AND udf.ExtractPhoneNumber(o.Request.PhoneNumber) = @PhoneNumber )) ';
    }
    else if (orderDetailsInput.EmailId != 'NULL') {
        topLogIdsQuery += 'AND ( @EmailId = "NULL" OR (is_defined(o.Request.EmailAddress) AND o.Request.EmailAddress  = @EmailId)) ';
    }
    else if (orderDetailsInput.FirstName != 'NULL') {
        topLogIdsQuery += 'AND ( @FirstName = "NULL" OR   (is_defined(o.Request.FirstName) AND  CONTAINS( LOWER(o.Request.FirstName) , @FirstName)))  ';
    }
    else if (orderDetailsInput.LastName != 'NULL') {
        topLogIdsQuery += 'AND ( @LastName= "NULL" OR   (is_defined(o.Request.LastName) AND  CONTAINS( LOWER(o.Request.LastName) , @LastName))) ';
    }

    else if (!isNaN(storeNumberint)) {


        topLogIdsQuery += 'AND ( o.Request.FranchiseStoreId =' + storeNumberint + ' ) ';


    }
    else {

        if (orderDetailsInput.StoreNumber.indexOf("*") != -1) {
            var searchtype = orderDetailsInput.StoreNumber.split("*");
            if (searchtype.length > 3) {

                topLogIdsQuery += 'AND  o.Request.FranchiseStoreId<>""  AND (  CONTAINS(o.Request.FranchiseStoreId , ' + searchtype[1] + ')) ';
            }
            if (searchtype.length == 2) {
                if (searchtype[0] != "") {
                    lefttrim = '"' + searchtype[0].trim() + '"';
                    topLogIdsQuery += 'AND  o.Request.FranchiseStoreId<>"" AND (      LEFT(udf.ExtractStoreNumber(o.Request.FranchiseStoreId), ' + searchtype[0].length + ') =  ' + lefttrim + ' ) ';
                }
                else {

                    lefttrim = '"' + searchtype[1].trim() + '"';

                    topLogIdsQuery += 'AND  o.Request.FranchiseStoreId<>""  AND (    RIGHT(udf.ExtractStoreNumber(o.Request.FranchiseStoreId) , ' + searchtype[1].length + ') =  ' + lefttrim + '   ) ';

                }

            }


        }
        else {

            topLogIdsQuery += 'AND (  CONTAINS(o.Request.FranchiseStoreId , @StoreNumber)) ';
        }



    }





    var logIdsQuery = {
        query: topLogIdsQuery,
        parameters: [{ name: "@OrderNumber", value: orderDetailsInput.OrderNumber },
                     { name: "@PhoneNumber", value: orderDetailsInput.PhoneNumber },
                     { name: "@EmailId", value: orderDetailsInput.EmailId },
                     { name: "@FirstName", value: orderDetailsInput.FirstName },
                     { name: "@LastName", value: orderDetailsInput.LastName },
                       { name: "@StoreNumber", value: orderDetailsInput.StoreNumber }]
    };

    var isAccepted = collection.queryDocuments(
       collectionLink, logIdsQuery, {},
        function (err, documents, options) {

            if (err) throw err;

            if (documents.length > 0) {

                logIds = documents;

                getOrderDetailsByLogIds(logIds);
            }
            else {
                noresults;

            }


        }



);



    //==============
    var getOrderDetailsByLogIds = function (logIds) {


        var temp = "";


        for (var logIdindex = 0 ; logIdindex < logIds.length ; logIdindex++) {

            temp = temp + "'" + logIds[logIdindex] + "',";
            //if (temp != "")
            //    temp = temp +"'"+ logIds[logIdindex] + "',";
            //else
            //    temp = logIds[logIdindex] + "',";
        }

        temp = temp.substring(0, temp.length - 1);

        var orderDetailssQueryObject;

        var orderDetailsQuery = "SELECT * ";
        orderDetailsQuery += "FROM c ";
        orderDetailsQuery += "WHERE c.LogId IN (" + temp + ")  ";
        orderDetailsQuery += "AND c.ServiceName = 'WSLCEMobile_ConfirmOrder' ";
        orderDetailsQuery += "AND (c.ServiceLogType = 'DEBUGLOG' OR (c.ServiceLogType='CVLOG' AND is_defined(c.Response.ticketdata)))  ";

        orderDetailssQueryObject = { query: orderDetailsQuery, parameters: [] };


        //if (temp.indexOf(",") != -1) {
        //    orderDetailssQueryObject = { query: "SELECT * FROM c WHERE contains(@LogIds, c.LogId)  AND c.ServiceName = 'WSLCEMobile_ConfirmOrder' AND (c.ServiceLogType = 'DEBUGLOG' OR (c.ServiceLogType='CVLOG' AND is_defined(c.Response.ticketdata)))", parameters: [{ name: "@LogIds", value: temp }] };
        //}
        //else {
        //    orderDetailssQueryObject = { query: "SELECT * FROM c WHERE c.LogId IN (@LogIds)  AND c.ServiceName = 'WSLCEMobile_ConfirmOrder' AND (c.ServiceLogType = 'DEBUGLOG' OR (c.ServiceLogType='CVLOG' AND is_defined(c.Response.ticketdata)))", parameters: [{ name: "@LogIds", value: temp }] };

        //}

        var isAccepted = collection.queryDocuments(
           collectionLink, orderDetailssQueryObject, {},
            function (err, documents1, options) {
                if (err) throw err;


                var preparedOrderDetails = [];

                for (var logIdidx = 0; logIdidx < logIds.length; logIdidx++) {

                    var filteredorderDetails = getFilteredOrderDetails(logIds[logIdidx], documents1);
                    var preparedOrderDetail = getpreparedOrderDetails(filteredorderDetails);
                    if (preparedOrderDetail != null) {
                        preparedOrderDetails.push(preparedOrderDetail);
                    }




                }


                response.setBody(response.getBody() + JSON.stringify(preparedOrderDetails));


            });


        function getFilteredOrderDetails(logId, docuemnts2) {
            var filteredDocuments = [];


            for (var docuemntDataidx = 0 ; docuemntDataidx < docuemnts2.length; docuemntDataidx++) {

                if (docuemnts2[docuemntDataidx].LogId == logId) {

                    filteredDocuments.push(docuemnts2[docuemntDataidx]);
                }
            }

            return filteredDocuments;
        }


        //--------------------------------------------------------------
        function getpreparedOrderDetails(filteredOrderDetails) {
            var docuemntData = {};


            if (filteredOrderDetails.length > 2) {

                for (var documentresidx = 0; documentresidx < filteredOrderDetails.length ; documentresidx++) {



                    if (filteredOrderDetails[documentresidx].ServiceLogType == "DEBUGLOG" && !!filteredOrderDetails[documentresidx].Request) {

                        docuemntData.StoreId = filteredOrderDetails[documentresidx].Request.FranchiseStoreId;
                        var FirstName = filteredOrderDetails[documentresidx].Request.FirstName;
                        var LastName = filteredOrderDetails[documentresidx].Request.LastName;
                        docuemntData.Name = FirstName + " " + LastName;
                        docuemntData.Source = filteredOrderDetails[documentresidx].Request.OrderType;
                        docuemntData.CCLast4Digits = filteredOrderDetails[documentresidx].Request.LastFour;

                    }
                    if (filteredOrderDetails[documentresidx].ServiceLogType == "DEBUGLOG" && !!filteredOrderDetails[documentresidx].Response) {

                        docuemntData.CaesarVisionNumber = filteredOrderDetails[documentresidx].Response.CVOrderNumber;
                        docuemntData.AppOrderNumber = filteredOrderDetails[documentresidx].Response.AppOrderNumber;
                        docuemntData.Result = filteredOrderDetails[documentresidx].Response.ResponseMessage;


                    }
                    if (filteredOrderDetails[documentresidx].ServiceLogType == "CVLOG" && !!filteredOrderDetails[documentresidx].Response) {
                        var arrItemName = [];
                        for (var ticketindex = 0; ticketindex < filteredOrderDetails[documentresidx].Response.ticket.length; ticketindex++) {
                            if (!!docuemntData.ListOutOrderItems) {
                                if (filteredOrderDetails[documentresidx].Response.ticket[ticketindex].itemname != null) {
                                    docuemntData.ListOutOrderItems = docuemntData.ListOutOrderItems + ", " + filteredOrderDetails[documentresidx].Response.ticket[ticketindex].itemname;
                                }
                            }
                            else {
                                if (filteredOrderDetails[documentresidx].Response.ticket[ticketindex].itemname != null) {
                                    docuemntData.ListOutOrderItems = filteredOrderDetails[documentresidx].Response.ticket[ticketindex].itemname;
                                }
                            }
                        }
                        docuemntData.OrderTotal = filteredOrderDetails[documentresidx].Response.ticketdata.total;
                        docuemntData.DiscountApplied = filteredOrderDetails[documentresidx].Response.ticketdata.specialdiscount;
                        docuemntData.DateTimeOfOrder = filteredOrderDetails[documentresidx].Response.ticketdata.storereceiveddate;
                        docuemntData.OrderPickUpTime = filteredOrderDetails[documentresidx].Response.ticketdata.storescheddate;



                    }

                }
            }
            else {
                docuemntData = null;
            }
            return docuemntData;
        }



        if (!isAccepted) {
            throw new Error('The OrderDetails query was not accepted by the server.');
        }
    }

}