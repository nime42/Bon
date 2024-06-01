class IngredientList {
  content = `
  <div style="background:${Globals.background}; padding:15px">
    <table style="margin-bottom:0">
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
    <tr style="padding:0">
      <td style="padding:0">
      <label style="font-style: italic;font-weight: normal;font-size: small;">*) Underopskrift (Udvidet:<input type="checkbox" id="expand-nested">) </label>
      <span > Tilføj shoppinglist  
      <!--<input type="text" name="shopping-list" list="shopping-lists"><datalist id="shopping-lists"/>-->
      <select name="shopping-list" id="shopping-list" style="height: auto;">

      <input type="button" id="add-to-shopping-list" class="button-primary" value="Tilføj">
      </span>
      
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

  show(bonId,orders) {
    let p = MessageBox.popup("Henter Ingredienser...");
    this.myDiv.querySelector("#expand-nested").checked = false;

    this.myRepo.getGrocyProductsForOrders(bonId,
      orders,
      (status, ordersWithProducts) => {
        if (status) {
          this.ingredients=ordersWithProducts.map(o=>({quantity:o.quantity,ingredients:o.ingredients}));
          this.showIngredients(this.ingredients,false);
          this.ingredientList.show(this.myDiv);
          this.myDiv.querySelector("#expand-nested").onchange=(e)=>{
            let expand=e.target.checked;
             this.showIngredients(this.ingredients,expand);
          }
        }
        p.hide();
      }
    );

    let shoppingListElem=this.myDiv.querySelector("#shopping-list")
    this.myRepo.getShoppingLists((status,shoppingLists)=>{
      if(status) {
        shoppingLists.forEach(l=> {
          let option=document.createElement("option");
          option.value=l.id;
          option.text=l.name;
          shoppingListElem.append(option)

        })

      }

    })

    let addToShoppingListElem=this.myDiv.querySelector("#add-to-shopping-list");
    addToShoppingListElem.onclick=()=>{
      let shoppingListId=shoppingListElem.value;
      let products=this.getIngredients(this.ingredients,true).map(e=>({
        product_id:e.product_id,
        amount:e.stock_amount,
        name:e.name
      }));
      let p = MessageBox.popup("Oppdater inköbsliste...");
      this.myRepo.addToShoppingList(products,shoppingListId,(status)=>{
        p.hide();
        if(!status) {
          alert("Det gick inte att oppdatere");
        }

      })
    }

  }


  getIngredients(ingredients,expandNested) {
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
            product_id:p.product_id,
            purchase_amount:0,
            stock_amount:0,
            purchase_unit:p.purchase_unit,
            stock_unit:p.stock_unit,
            variable_amount:"",
            in_stock:Number(p.in_stock),
            count_variable_amount:{
              with_variable_amount:0,
              without_variable_amount:0
            }
            
          }
        }
        unique[p.name].purchase_amount+=i.quantity*p.purchase_amount;
        unique[p.name].stock_amount+=i.quantity*p.stock_amount;
        unique[p.name].variable_amount=this.handleVariableAmount(i.quantity,unique[p.name].variable_amount,p.variable_amount);
        //Count how often there is a variable_amount value or not (see function createRow below)
        if(p.variable_amount!="") {
          unique[p.name].count_variable_amount.with_variable_amount++;
        } else {
          unique[p.name].count_variable_amount.without_variable_amount++;
        } 
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
              stock_unit: n.stock_unit,
              in_stock:Number(n.numberInStock)

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
      e.in_stock=parseFloat(e.in_stock.toFixed(3));
      e.in_stock_unit=e.in_stock<=1?e.stock_unit.name:e.stock_unit.name_plural;
    
      e.purchase_unit=e.purchase_amount<=1?e.purchase_unit.name:e.purchase_unit.name_plural;
      e.stock_unit=e.stock_amount<=1?e.stock_unit.name:e.stock_unit.name_plural;
      

    })
    return uniqueProducts;
  }



  showIngredients(ingredients,expandNested) {
    let uniqueProducts=this.getIngredients(ingredients,expandNested);

    let body = this.myDiv.querySelector("#ingredients");
    body.innerHTML = "";
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

    if(product.count_variable_amount && product.count_variable_amount.with_variable_amount>0 && product.count_variable_amount.without_variable_amount>0) {
      //If the same product have had both variable_amount and not. We can't count with the variable_amount
      //since it is missing from some of the products
      product.variable_amount=undefined;
    }

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

    let background="";
    if(product.in_stock<product.stock_amount) {
      background="red"
    }

    let cols = `
        <td style="padding:5px; font-style: italic;">${product.name}</td>
        <td style="padding:5px;font-style: italic;">${purchase_amount} (${product.stock_amount} ${product.stock_unit})</td>
        <td style="padding:5px;font-style: italic;background:${background}">${product.in_stock} ${product.in_stock_unit}</td>

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