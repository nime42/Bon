class BonRepository {
    getBons(year,month,callback) {
        let url="api/bons";
        if(year!==undefined && month!==undefined) {
            url+="?year="+year+"&month="+(month+"").padStart(2,"0");
        }
        $.get(url,callback);
    }
    saveBon(bon,callback) {
        let url;
        let type;
        if(bon.id!="") {
            url="api/bons/"+bon.id;
            type="PUT";
        } else {
            url="api/bons";
            type="POST";
        }

        $.ajax({
            type: type,
            url: url,
            data: JSON.stringify(bon),
            success: callback,
            dataType: "json",
            contentType: "application/json"
          });
    }
    deleteBon(id,callback) {
        let url="api/bons/"+id;
        $.ajax({
            type: "DELETE",
            url: url,
            success: callback,
          });
    }

    getBonSummary(id,callback) {
        let url="api/bonSummary";
        if(id) {
            url+="/"+id;
        }
        $.get(url,callback);
    }

    getCustomers(email,callback) {
        let url="api/customers?email="+email;
        $.get(url,callback);
    }


    getItems(callback) {
        let url="api/items/";
        $.get(url,callback);
    }

    getItemsPrices(callback) {
        let url="api/items_prices/";
        $.get(url,callback);
    }

    getOrders(bonId,callback) {
        let url="api/orders/"+bonId;
        $.get(url,callback);
    } 

    getItemsAndPrices(callback) {
        this.getItems(items=>{
            this.getItemsPrices(prices=>{
                callback(items);
            })
        })
    }

    getIZettleProducts(callback) {
        let url="api/iZettleProducts";
        $.get(url,callback);
    }


    updateIZettleProduct(id,grocy_id,quantity,connectable) {
        let url="api/izettleProduct/"+id;
        $.ajax({
            type: "PUT",
            url: url,
            data: JSON.stringify({grocy_id:grocy_id,quantity:quantity,connectable:connectable}),
            dataType: "json",
            contentType: "application/json"
          });
    }




    updateDB(callback) {
        let url="api/updateDB/";
        $.get(url,callback);
    }

    searchBons(searchParams,callback) {
        let url="api/searchBons/";

        url+="?"+Object.keys(searchParams).map(k=>(k+"="+searchParams[k])).join("&");
        $.get(url,callback);   
    }

    updateBonStatus(id,status,callback) {
        let url="api/bonStatus/"+id;
        $.ajax({
            type: "PUT",
            url: url,
            data: JSON.stringify({status:status}),
            success: callback,
            dataType: "json",
            contentType: "application/json"
          });
    }


    updateOrders(id,orders,callback) {
        let url="api/orders/"+id;
        $.ajax({
            type: "PUT",
            url: url,
            data: JSON.stringify(orders),
            success: callback,
            dataType: "json",
            contentType: "application/json"
          });
    }

    consumeBon(id,callback) {
        let url="api/consumeBon/"+id;
        $.ajax({
            type: "PUT",
            url: url,
            success: callback,
            dataType: "json",
            contentType: "application/json"
          });
    }

    sendBonMail(id,to,message,callback) {
        let url="api/sendBonMail/";
        let body={
            message:message,
            bonId:id,
            email:to
        }
        $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(body),
            success: function(data,status,xhr) {callback(true,data);},
            error:function(data,status,xhr) {callback(false,data,status,xhr)},
            contentType: "application/json"
          });
    }

    getBonMails(bonId,callback) {
        let url="api/bonMails/"+bonId;
        $.get(url,callback);
    } 

    getUnseenBonIdMails(callback) {
        let url="api/unseenBonIdMails/";
        $.get(url,callback);
    } 


    getAllUnseenBonIdMails(callback) {
        let url="api/allUnseenBonIdMails/";
        $.get(url,callback);
    } 


    getAllBonWithMails(callback) {
        let url="api/allBonWithMails/";
        $.get(url,callback);
    }     


    getBonsForWeek(monday,callback) {
        let url="api/getBonsForWeek?monday="+monday.toISOString();
        $.get(url,callback);
    }

    checkBonStock(callback) {
        let url="api/checkStock";

        $.ajax({
            type: "GET",
            url: url,
            success: function(data,status,xhr) {callback(true,data);},
            error:function(data,status,xhr) {callback(false,data,status,xhr)},
            contentType: "application/json"
          });

    }

    getMessages(callback) {
        let url="api/messages/";
        $.get(url,callback);
    }


    addMessage(messageName,callback) {
        let url="api/messages/";
        $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify({name:messageName}),
            success: function(data,status,xhr) {callback(true,data);},
            error:function(data,status,xhr) {callback(false,data,status,xhr)},
            dataType: "json",
            contentType: "application/json"
          });
    }

    updateMessage(id,message,callback) {
        let url="api/messages/"+id;
        $.ajax({
            type: "PUT",
            url: url,
            data: JSON.stringify(message),
            complete: callback,
            dataType: "json",
            contentType: "application/json"
          });
    }

    delMessage(id,message,callback) {
        let url="api/messages/"+id;
        $.ajax({
            type: "DELETE",
            url: url,
            data: JSON.stringify(message),
            complete: callback,
            dataType: "json",
            contentType: "application/json"
          });
    }


}
