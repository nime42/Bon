function init() {
  initMap("map", document.globals.homePosition, 13);
  let icon = '<i class="fa fa-home map-icon">';
  let popup = `<div>${document.globals.homeName}</div>`;
  document.querySelector("#home-icon").title = document.globals.homeName;
  let homeMarker = createIconMarker(document.globals.homePosition, icon, popup);
  addMarker(homeMarker);

  document.globals = { ...document.globals, ...getTemplates() };
}


function searchBons(searchParams,callback) {
  let url="../api/searchBons/";

  url+="?"+Object.keys(searchParams).map(k=>(k+"="+searchParams[k])).join("&");
  $.get(url,callback);   
}

function getTemplates() {
  let sectionTemplate = copyElem(document.querySelector("#section-template"));
  let rowTemplate = copyElem(sectionTemplate.querySelector("#row-template"));
  document.querySelector("#section-template").remove();
  sectionTemplate.querySelector("#row-template").remove();
  return { sectionTemplate, rowTemplate };
}

function getCateringFeatures(callback) {
  let searchParams = { includeOrders: true };
  let [year, month, day] = splitDate(new Date());
  searchParams["afterDate"] = `${year}-${month}-${day}`;
  searchBons(searchParams, (bons) => {
    let onlyCatering = bons.filter((b) => b.price_category === "Catering");
    let features = createFeatures(onlyCatering, {isHistoric:false});
    callback(features);
  });
}

function getHistoricFeatures(callback) {
  let searchParams = { includeOrders: true };
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  let [year, month, day] = splitDate(yesterday);
  searchParams["beforeDate"] = `${year}-${month}-${day}`;

  searchBons(searchParams, (bons) => {
    let onlyCatering = bons.filter((b) => b.price_category === "Catering");
    let features = createFeatures(onlyCatering, { isHistoric: true });
    callback(features);
  });
}

function showHistoricFeatures(show) {
  if (show) {
    let showFeatures = (features) => {
      features.forEach((f) => {
        if (f.marker !== undefined) {
          addMarker(f.marker);
        }
      });
    };
    if (document.globals.historicFeatures === undefined) {
      getHistoricFeatures((features) => {
        document.globals.historicFeatures = features;
        showFeatures(document.globals.historicFeatures);
      });
    } else {
      showFeatures(document.globals.historicFeatures);
    }
  } else {
    document.globals.historicFeatures?.forEach((f) => {
      if (f.marker) {
        removeMarker(f.marker);
      }
    });
  }
}

function createFeatures(bons,options) {
  let res = [];
  let mapIndex=1;
  bons.forEach((b, i) => {
    let [year, month, day, hour, minute] = splitDate(new Date(b.delivery_date));
    let f = {
      featureId: i,
      bon: b,
      date: `${year}-${month}-${day}`,
      time: `${hour}:${minute}`,
      isDeliveredByByExpressen:
        b.orders.find((e) => {
          return e.name.match(/By-ekspressen/i);
        }) != undefined,
    };

    if (b.delivery_address.lat !== null) {
      f.mapIndex=mapIndex++;
      f.position = [b.delivery_address.lat, b.delivery_address.lon];
      f.marker=createBonMarker(f,options);
      f.marker.on("click", (p) => {
        console.log("popupopen");
      });
      addMarker(f.marker);
    }
    res.push(f);
  });
  return res;
}

function createBonMarker(bonFeature, options) {
  let bicycleIcon = bonFeature.isDeliveredByByExpressen ? "fa fa-bicycle" : undefined;
  let b=bonFeature.bon;
  let address = `${b.delivery_address.street_name} ${b.delivery_address.street_nr}, ${b.delivery_address.zip_code}  ${b.delivery_address.city}`;
  let popup = address;

  let mapIndex,color;

  if(options.isHistoric) {
    mapIndex="";
    color="lightgrey";
  } else {
    mapIndex=bonFeature.mapIndex;
    color="red";
  }

  let m=createNumberedMarker(bonFeature.position, mapIndex, "<div id='bon-popup-handle' style='width:300px'></div>", color, bicycleIcon);
  m.bindTooltip(`#${b.id}`);
  m.on("click", (p) => {
    setTimeout(()=>{
      let div=document.querySelector("#bon-popup-handle");
      div.innerHTML="";
      bs=new BonStrip(div,false,{hideIngredientList:true,hideGotoMap:true});
      bs.initFromBon(b,b.orders);
      console.log("popupopen",div);
    }, 300)

  });

  return m;
}


function populateSideBar() {
  let features = document.globals.features;
  let currentDate = undefined;
  let currentSection = undefined;

  let bonsDiv = document.querySelector("#bons");
  bonsDiv.innerHTML = "";

  features.forEach((f) => {
    if (f.date !== currentDate) {
      currentSection = copyElem(document.globals.sectionTemplate);
      currentSection.querySelector(".delivery-date").innerHTML = f.date;
      bonsDiv.appendChild(currentSection);
      currentDate = f.date;
    }
    let currentRow = copyElem(document.globals.rowTemplate);
    currentRow.querySelector(".goto-map").setAttribute("id","bon-id-"+f.bon.id);
    currentSection.appendChild(currentRow);
    if(f.mapIndex) {
      currentRow.querySelector(".map-index").innerHTML=f.mapIndex;
      currentRow.querySelector(".goto-map").onclick = () => {
        goToPos(f.position);
        blinkMarker(f.marker);
      };
    } else {
      currentRow.querySelector(".map-index").innerHTML="?";
    }

    populateRow(currentRow,f);
  });
}



function populateRow(rowTemplate,feature) {
  rowTemplate.querySelector(".bon-id").innerHTML = "#" + feature.bon.id;
  rowTemplate.querySelector(".delivery-time").innerHTML=feature.time;
  rowTemplate.querySelector(".delivery-address").innerHTML=`${feature.bon.delivery_address.street_name} ${feature.bon.delivery_address.street_nr}, ${feature.bon.delivery_address.zip_code}  ${feature.bon.delivery_address.city}`;
  rowTemplate.querySelector(".byexpress-delivery").style.display=feature.isDeliveredByByExpressen?"":"none";
}


function narrowUnnarrow(elem) {
  let displayVal;
  if (elem.classList.contains("fa-chevron-left")) {
    elem.classList.remove("fa-chevron-left");
    elem.classList.add("fa-chevron-right");
    displayVal = "none";
  } else {
    elem.classList.remove("fa-chevron-right");
    elem.classList.add("fa-chevron-left");
    displayVal = "";
  }

  document
    .querySelector("#bons")
    .querySelectorAll(".hideable")
    .forEach((e) => {
      e.style.display = displayVal;
    });
}

function foldUnfold(elem) {
  let displayVal;
  if (elem.classList.contains("fa-chevron-up")) {
    elem.classList.remove("fa-chevron-up");
    elem.classList.add("fa-chevron-down");
    displayVal = "none";
  } else {
    elem.classList.remove("fa-chevron-down");
    elem.classList.add("fa-chevron-up");
    displayVal = "";
  }

  elem.parentNode.parentNode.querySelectorAll("li").forEach((e) => {
    e.style.display = displayVal;
  });
}

function hideUnhide(elem) {
  let show = elem.checked;
  let date=elem.parentElement.querySelector(".delivery-date").innerHTML;
  document.globals.features.filter(f=>(f.date==date)).forEach(e=>{
    if(e.marker) {
      if(show) {
        addMarker(e.marker)
        e.hidden=false;
      } else {
        removeMarker(e.marker);
        e.hidden=true;

      }
    }
  })
}

function splitDate(date) {
  let yearStr = date.getFullYear() + "";
  let monthStr = (date.getMonth() + 1 + "").padStart(2, "0");
  let dayStr = (date.getDate() + "").padStart(2, "0");
  let hourStr = (date.getHours() + "").padStart(2, "0");
  let minuteStr = (date.getMinutes() + "").padStart(2, "0");
  return [yearStr, monthStr, dayStr, hourStr, minuteStr];
}

function copyElem(elem) {
  let copy = document.createElement(elem.tagName);
  copy.innerHTML = elem.innerHTML;
  return copy;
}

function gotoBonId(bonId) {
  let message=`Kan ikke finde adressen (kontrollere, at bon #${bonId} har priskategorien "Catering" og en korrekt leveringsadresse)`

    const gotoFeature=(f)=>{
        goToPos(feature.position);
        blinkMarker(feature.marker);

    }
    let feature=document.globals.features.find(e=>(e.bon.id==bonId));
    if(feature) { 
      if(feature.position!==undefined) {
        gotoFeature(feature);
      } else {
        alert("Kan ikke finde adressen");
      }
      return;
    }


    getHistoricFeatures(features=>{
        document.globals.historicFeatures = features;
        feature=document.globals.historicFeatures.find(e=>(e.bon.id==bonId));
        showHistoricFeatures(false);
        if(feature) { 
          if(feature.position!==undefined) {
            gotoFeature(feature);
            addMarker(feature.marker);
          } else {
            alert("Kan ikke finde adressen");
          }
        } else {
          alert(`Kan ikke finde bon #${bonId} (check at den har priskategorien "Catering")`);
        }

    })

  }