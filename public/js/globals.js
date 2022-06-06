class Globals {
    
    static foreground="#8e631f";
    static background="#f1e6b2";
    static shadowColor="#446e74";


    static grocyLink="${config.grocy.url}"; //these values is replaced from resources/config.js by replaceFromConfig.js
    static bonPrefix="${config.bonPrefix}";
    static bonInstance="${config.bonInstance}";

    static AttributesForItems= {
        "by-?ekspressen.*": {
            "link":{
                url:"https://byexpressen.groupnet.at/lobo/#!//coreLogin/",
                label:"By-expressen"
            }
        }
    }
    static BonStripOrder= [
            "*",
            "Emballage",
            "x-Levering",
            "x- Service"
        ]
    static Statuses={
        new:{
            name:"new",
            label:"Ny",
            color:"lightgrey"
        },
        needInfo:{
            name:"needInfo",
            label:"Venter Info",
            color:"yellow"
        },
        approved:{
            name:"approved",
            label:"Godkendt",
            color:"lightgreen"
        },
        preparing:{
            name:"preparing",
            label:"Prep",
            color:"lightgreen"
        },
        done:{
            name:"done",
            label:"Klar",
            color:"lightgreen"
        },
        delivered:{
            name:"delivered",
            label:"Lev",
            color:"white"
        },
        invoiced:{
            name:"invoiced",
            label:"Faktureret",
            color:"mediumpurple"
        },
        closed:{
            name:"closed",
            label:"Afslutet",
            color:"red"
        },

        offer:{
            name:"offer",
            label:"Tilbud",
            color:"lightblue"
        },
    }
    

}