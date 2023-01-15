class IngredientList {
  content = `
  <div style="background:${Globals.background}; padding:15px">
    <br>
    <table>
    <thead>
    <tr style="border-bottom: 2px solid ${Globals.foreground};border-collapse: collapse;">
      <th style="padding:5px;">Vare</th>
      <th style="padding:5px;">Mængde</th>
      <th style="padding:5px;">I lager</th>
    </tr>
    </thead>
    <tbody id="ingredients">
    </tbody>
    </table> 
  </div>
    `;


  constructor(bon) {
    this.ingredientList = new ModalPopup();
    this.myDiv = document.createElement("div");

    this.myDiv.innerHTML=this.content;


    this.myRepo = new BonRepository();
  }

  show(orders) {
    let p = MessageBox.popup("Henter Ingredienser...");
    this.myRepo.getGrocyProductsForOrders(
      orders,
      (status, ordersWithProducts) => {
        console.log(ordersWithProducts);
        if (status) {
          let unique = {};
          ordersWithProducts.forEach((o) => {
            o.productList.forEach((p) => {
              let totAmount =
                (o.quantity * p.amount) / p.qu_factor_purchase_to_stock;
              if (unique[p.product_id] == undefined) {
                unique[p.product_id] = {
                  name: p.name,
                  amount: totAmount,
                  unitName: p.stockQuantityUnitName_plural,
                };
              } else {
                unique[p.product_id].amount += totAmount;
              }
            });
          });
          let uniqueProducts=Object.values(unique);
          uniqueProducts.sort((a,b)=>a.name.localeCompare(b.name))
          uniqueProducts.forEach(e=>{
            e.amount=e.amount.toFixed(3);
          })
          let body = this.myDiv.querySelector("#ingredients");
          body.innerHTML = "";
          console.log(unique);
          uniqueProducts.forEach(e=>{
            let r=this.createRow(e);
            body.append(r);
          });
          p.hide();
          this.ingredientList.show(this.myDiv);
        }
      }
    );
  }

  createRow(product) {
    let cols = `
        <td style="padding:5px; font-style: italic;">${product.name}</td>
        <td style="padding:5px;font-style: italic;">${product.amount} ${product.unitName}</td>
    `;
    let row = document.createElement("tr");
    row.style.cssText=`
    border: 1px solid ${Globals.foreground};
    border-collapse: collapse;
    `
    row.innerHTML = cols;
    return row;
  }

  hide() {
    this.ingredientList.hide();
  }
}