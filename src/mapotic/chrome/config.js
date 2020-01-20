const config = {
    collections: [{
        name: "swimming",
        color: "ED57F9",
        sources: [{
            map: "https://www.mapotic.com/sauny"
        }, {
            map: "https://www.mapotic.com/swimplaces"
        }]
    }, {
        name: "skiing",
        sources: [{
            map: "https://www.mapotic.com/winter-holidays-in-the-alps",
            categories: ["Ski center", "Glacier"]
        }]
    }, {
        name: "nature",
        sources: [{
            map: "https://www.mapotic.com/chranena-uzemi"
        }, {
            map: "https://www.mapotic.com/vodopady-ceske-republiky"
        }]
    }, {
        name: "culture",
        sources: [{
            color: "E6F95C",
            map: "https://www.mapotic.com/praha-galerie"
        }, {
            map: "https://www.mapotic.com/festivals-europe"
        }]
    }, {
        name: "drinking",
        sources: [{
            map: "https://www.mapotic.com/wineofczechia",
            categories: ["Vinařství", "Na skleníčku Pro láhev", "Nevinářství", "Vše pro vino"]
        }, {
            map: "https://www.mapotic.com/tankova-plzen"
        }, {
            map: "https://www.mapotic.com/vinarumcz-mapa-domacich-vinaru"
        }]
    }, {
        name: "shopping",
        sources: [{
            map: "https://www.mapotic.com/smarty-drink"
        }]
    }]
};

export default config;