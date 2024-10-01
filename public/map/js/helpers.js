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

function updateBon(bonId,patches,callback) {
  let url="../api/bons/"+bonId;
  $.ajax({
    type: "PATCH",
    url: url,
    data: JSON.stringify(patches),
    success:callback,
    error: ()=>alert("kunne ikke opdatere Bon"),
    dataType: "json",
    contentType: "application/json"
  });
}

function getTemplates() {
  let sectionTemplate = copyElem(document.querySelector("#section-template"));
  let rowTemplate = copyElem(sectionTemplate.querySelector("#row-template"));
  document.querySelector("#section-template").remove();
  sectionTemplate.querySelector("#row-template").remove();
  return { sectionTemplate, rowTemplate };
}

const priceCategoriesFilter=["Catering","Store"];

function getCateringFeatures(callback) {
  let searchParams = { includeOrders: true };
  let [year, month, day] = splitDate(new Date());
  searchParams["afterDate"] = `${year}-${month}-${day}`;
  searchBons(searchParams, (bons) => {
    let onlyCatering = bons.filter((b) => priceCategoriesFilter.includes(b.price_category) && !b.customer_collects);
    let features = createFeatures(onlyCatering, {isHistoric:false});
    callback(features);
  });
}

function getTimeAndDistanceMatrix(places,callback) {
  let url="../api/geo/timeAndDistanceMatrix";

  $.ajax({
    type: "POST",
    url: url,
    data: JSON.stringify(places),
    success: function(data,status,xhr) {callback(true,data);},
    error:function(data,status,xhr) {callback(false,data,status,xhr)},
    contentType: "application/json"
  });

}

function getDistanceAndTime(from,to) {
  let fromIndex=document.globals.distanceMatrix.destinations.findIndex(d=>d.id==from);
  let toIndex=document.globals.distanceMatrix.destinations.findIndex(d=>d.id==to);
  if(fromIndex<0 || toIndex<0) {
    return undefined;
  }
  let duration=document.globals.distanceMatrix.durations[fromIndex][toIndex];
  let distance=document.globals.distanceMatrix.distances[fromIndex][toIndex];

  return {distance,duration};



}

function getHistoricFeatures(callback) {
  let searchParams = { includeOrders: true };
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  let [year, month, day] = splitDate(yesterday);
  searchParams["beforeDate"] = `${year}-${month}-${day}`;

  searchBons(searchParams, (bons) => {
    let onlyCatering = bons.filter((b) => priceCategoriesFilter.includes(b.price_category));
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
      if(div===null) {
        return;
      }
      div.innerHTML="";
      bs=new BonStrip(div,false,{hideIngredientList:true,hideGotoMap:true});
      bs.initFromBon(b,b.orders);
      console.log("popupopen",div);
      toggleRoute(bonFeature);
    }, 300)

  });

  return m;
}


function populateSideBar() {
  let features = document.globals.features;
  let currentDate = undefined;
  let currentSection = undefined;

  let bonsDiv = document.querySelector("#bons");
  let today=new Date();

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
        toggleRoute(f);
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


  let distDuration=getDistanceAndTime("home",feature.bon.id);
  if(distDuration!==undefined) {
    let duration=formatSeconds(distDuration.duration);
    let distance=Math.round((distDuration.distance/1000.0) * 100)/100;
    rowTemplate.querySelector(".distance-duration").innerHTML=`${duration} (${distance} km)`
  }



  let updateButton=rowTemplate.querySelector(".update-button");
  let pickupTimeElement=rowTemplate.querySelector(".pickup-time");

  const UPDATE="Updater";
  const SUGGEST="Foreslå";

  if (feature.bon.pickup_time !== null) {
    let pickupTime = new Date(feature.bon.pickup_time);
    pickupTimeElement.value=pickupTime.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
    updateButton.innerHTML=UPDATE;
  } else {
    updateButton.innerHTML=SUGGEST;
    updateButton.disabled=false;
  }


  pickupTimeElement.onchange=()=>{
    updateButton.disabled=false;
    if(pickupTimeElement.value==="") {
      updateButton.innerHTML=SUGGEST;
    } else {
      updateButton.innerHTML=UPDATE;
    }
  }

  const updatePickup=()=>{
    let time=pickupTimeElement.value;
    let newPickupTime;
    if(time!=="") {
      newPickupTime=new Date(feature.date+"T"+time);
      let deliverydate=new Date(feature.bon.delivery_date);
      if(newPickupTime>deliverydate) {
        newPickupTime.setDate(newPickupTime.getDate() - 1);
      }
    } else {
      newPickupTime=null;
    }
    updateBon(feature.bon.id,{pickup_time:newPickupTime},()=>{updateButton.disabled=true;feature.bon.pickup_time=newPickupTime});

  }


  const suggest=()=>{
    let seconds=0;
    if(feature.isDeliveredByByExpressen) {
      seconds=document.globals.byExpressenPickupMinutes*60;
    } else {
      let distDuration=getDistanceAndTime("home",feature.bon.id);
      if(distDuration!==undefined) {
        seconds=distDuration.duration - (distDuration.duration % 60); 
        seconds=document.globals.prePickupMinutes*60+document.globals.durationFactor*seconds+document.globals.postPickupMinutes*60;
      }
    }
    if(seconds>0) {
      let newPickupTime=new Date(feature.bon.delivery_date)
      newPickupTime.setTime(newPickupTime.getTime()-seconds*1000);
      pickupTimeElement.value=newPickupTime.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
    } 
  }


  updateButton.onclick=()=>{
    if(updateButton.innerHTML==UPDATE) {
      updatePickup();
    } else {
      suggest();
      updateButton.innerHTML=UPDATE;
    }
  }

  if(feature.bon.pickup_time===null) {
    suggest();
    updatePickup();
  }



}



function formatSeconds(seconds) {
  let d=new Date();
  d.setHours(0);d.setMinutes(0);d.setSeconds(0);
  d.setTime(d.getTime()+seconds*1000);
  return `${d.getHours()>0?d.getHours()+ " tim ":""}${d.getMinutes()} min`



}


function narrowUnnarrow(elem) {
  let displayVal,narrow;
  if (elem.classList.contains("fa-chevron-left")) {
    elem.classList.remove("fa-chevron-left");
    elem.classList.add("fa-chevron-right");
    displayVal = "none";
    narrow=true;
  } else {
    elem.classList.remove("fa-chevron-right");
    elem.classList.add("fa-chevron-left");
    displayVal = "";
    narrow=false;
  }

  document
    .querySelector("#bons")
    .querySelectorAll(".hideable")
    .forEach((e) => {
      e.style.display = displayVal;
    });

  if(narrow) {
    document.querySelector("#sidebar").style.width="200px";
  }  else {
    document.querySelector("#sidebar").style.width="300px";
  }
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

function foldUnfoldAll(elem) {
  let folded;

  if (elem.classList.contains("fa-chevron-up")) {
    elem.classList.remove("fa-chevron-up");
    elem.classList.add("fa-chevron-down");
    folded = true;
  } else {
    elem.classList.remove("fa-chevron-down");
    elem.classList.add("fa-chevron-up");
    folded=false;
  }

  let all=document.querySelectorAll(".fold-unfold");

  all.forEach(e=>{
    let isFolded=e.classList.contains("fa-chevron-down")?true:false;
    if(isFolded!==folded) {
      e.onclick();
    }
  })

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


function hideUnhideAll(elem) {
  let checked=elem.checked;
  let all=document.querySelectorAll(".hide-unhide");
  all.forEach(e=>{
    if(e.checked!==checked) {
      e.checked=checked;
      e.onchange();
    }
  })
  console.log(all);
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