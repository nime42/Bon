class BonRepository {
    getBons(year,month,callback) {
        let url="bons";
        if(year!==undefined && month!==undefined) {
            url+="?year="+year+"&month="+(month+"").padStart(2,"0");
        }
        $.get(url,callback);
    }
    saveBon(bon,callback) {
        let url;
        let type;
        if(bon.id!="") {
            url="bons/"+bon.id;
            type="PUT";
        } else {
            url="bons";
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
        let url="bons/"+id;
        $.ajax({
            type: "DELETE",
            url: url,
            success: callback,
          });
    }

    getCustomers(email,callback) {
        let url="customers?email="+email;
        $.get(url,callback);
    }


    getItems(callback) {
        let url="items/";
        $.get(url,callback);
    }

    getItemsPrices(callback) {
        let url="items_prices/";
        $.get(url,callback);
    }

    getOrders(bonId,callback) {
        let url="orders/"+bonId;
        $.get(url,callback);
    } 

    getItemsAndPrices(callback) {
        this.getItems(items=>{
            this.getItemsPrices(prices=>{
                callback(items);
            })
        })
    }

    updateDB(callback) {
        let url="updateDB/";
        $.get(url,callback);
    }

    searchBons(searchParams,callback) {
        let url="searchBons/";

        url+="?"+Object.keys(searchParams).map(k=>(k+"="+searchParams[k])).join("&");
        $.get(url,callback);   
    }

    updateBonStatus(id,status,callback) {
        let url="bonStatus/"+id;
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
        let url="orders/"+id;
        $.ajax({
            type: "PUT",
            url: url,
            data: JSON.stringify(orders),
            success: callback,
            dataType: "json",
            contentType: "application/json"
          });
    }


}
