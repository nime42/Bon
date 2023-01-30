class IngredientList {
  content = `
  <div style="background:${Globals.background}; padding:15px">
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
    <tfoot>
    <tr>
      <td>
      <label style="font-style: italic;font-weight: normal;font-size: small;">*) Underopskrift (Udvidet:<input type="checkbox" id="expand-nested">) </label>
      </td>
    </tr>
  </tfoot>
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
        if (status) {
          let ingredients=ordersWithProducts.map(o=>({quantity:o.quantity,ingredients:o.ingredients}));
          this.showIngredients(ingredients,false);
          this.ingredientList.show(this.myDiv);
          this.myDiv.querySelector("#expand-nested").onchange=(e)=>{
            let expand=e.target.checked;
             this.showIngredients(ingredients,expand);
          }
        }
        p.hide();
      }
    );
  }

  showIngredients(ingredients,expandNested) {
    if(expandNested) {
      let nestedIngredients=this.getNestedIngredients(ingredients);
      ingredients=ingredients.concat(nestedIngredients);
    }
    let unique={};
    ingredients.forEach(i=>{
      i.ingredients.products.forEach(p=>{
        if(!unique[p.name]) {
          unique[p.name]={
            name:p.name,
            purchase_amount:0,
            stock_amount:0,
            purchase_unit:p.purchase_unit,
            stock_unit:p.stock_unit,
            variable_amount:""
          }
        }
        unique[p.name].purchase_amount+=i.quantity*p.purchase_amount;
        unique[p.name].stock_amount+=i.quantity*p.stock_amount;
        unique[p.name].variable_amount=this.handleVariableAmount(i.quantity,unique[p.name].variable_amount,p.variable_amount);
      })
      if (!expandNested) {
        i.ingredients.nestedRecipies.forEach(n => {
          let name = n.name + "*"
          if (!unique[name]) {
            unique[name] = {
              name: name,
              purchase_amount: 0,
              stock_amount: 0,
              purchase_unit: n.purchase_unit,
              stock_unit: n.stock_unit
            }
          }
          unique[name].purchase_amount += i.quantity * n.servings;
          unique[name].stock_amount += i.quantity * n.servings;
        })
      }

    })

    let uniqueProducts=Object.values(unique);
    //uniqueProducts.sort((a,b)=>a.name.localeCompare(b.name))
    uniqueProducts.forEach(e=>{
      e.purchase_amount=parseFloat(e.purchase_amount.toFixed(3));
      e.stock_amount=parseFloat(e.stock_amount.toFixed(3));
      e.purchase_unit=e.purchase_amount<=1?e.purchase_unit.name:e.purchase_unit.name_plural;
      e.stock_unit=e.stock_amount<=1?e.stock_unit.name:e.stock_unit.name_plural;
    })


    let body = this.myDiv.querySelector("#ingredients");
    body.innerHTML = "";
    console.log(unique);
    uniqueProducts.forEach(e=>{
      let r=this.createRow(e);
      body.append(r);
    });
  }

  handleVariableAmount(quantity,totalVariableAmount,variableAmount) {
    if(variableAmount=="") {
      return totalVariableAmount;
    }

    let val=variableAmount.match(/\d+(?:\.\d+)?/);
    if(val!=null) {
      val=Number(val[0]);
    }

    let totalVal=totalVariableAmount.match(/\d+(?:\.\d+)?/);
    if(totalVal!=null) {
      totalVal=Number(totalVal[0]);
    }
    if(totalVal==null) {
      variableAmount=variableAmount.replace(val,val*quantity);
      return variableAmount;
    }
    totalVariableAmount=totalVariableAmount.replace(totalVal,totalVal+(val*quantity));
    return totalVariableAmount;

  }

  getNestedIngredients(ingredients) {
    let res=[];
    ingredients.forEach(i=>{
      if(i.ingredients.nestedRecipies.length>0) {
        let nested=this.expandNestedRecipies(i.quantity,i.ingredients.nestedRecipies);
        res=res.concat(nested);
      }
    })
    return res;

  }

  expandNestedRecipies(quantity,nested) {
    console.log(quantity,nested);
    let res=[]
    nested.forEach(n=>{
      if(n.recipy.nestedRecipies.length>0) {
        let nested=this.expandNestedRecipies(quantity*n.servings,n.recipy.nestedRecipies);
        res=res.concat(nested);
      }
      res.push({
        quantity:quantity*n.servings,
        ingredients:n.recipy
      })
    })
    return res;
  }


  createRow(product) {
    let purchase_amount=`${product.purchase_amount} ${product.purchase_unit}`;
    if(product.variable_amount!=undefined && product.variable_amount!="") {
      if(Helper.isNumeric(product.variable_amount)) {
        //if its numeric see for example "Bröd Rug", then add unit also.
        purchase_amount=`${product.variable_amount} ${product.purchase_unit}`;
      } else {
        //it could be for example "3 skiver"
        purchase_amount=product.variable_amount;
      }
    }


    let cols = `
        <td style="padding:5px; font-style: italic;">${product.name}</td>
        <td style="padding:5px;font-style: italic;">${purchase_amount} (${product.stock_amount} ${product.stock_unit})</td>
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