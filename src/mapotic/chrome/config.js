const config = {
    collections: [{
        name: "swimming",
        color: "9BAECC",
        sources: [{
            map: "https://www.mapotic.com/sauny"
        }, {
            map: "https://www.mapotic.com/swimplaces"
        }]
    }, {
        name: "skiing",
        color: "B4DADE",
        sources: [{
            map: "https://www.mapotic.com/winter-holidays-in-the-alps",
            categories: ["Ski center", "Glacier"]
        }]
    }, {
        name: "nature",
        color: "B7DBB2",
        sources: [{
            map: "https://www.mapotic.com/chranena-uzemi"
        }, {
            map: "https://www.mapotic.com/vodopady-ceske-republiky"
        }]
    }, {
        name: "culture",
        color: "E0C084",
        sources: [{
            map: "https://www.mapotic.com/praha-galerie"
        }, {
            map: "https://www.mapotic.com/festivals-europe"
        }, {
            map: "https://www.mapotic.com/kde-jsme-potkali-svjana-nepomuckeho"
        }, {
            map: "https://www.mapotic.com/ppp-patrame-po-pomukovi"
        }, {
            map: "https://www.mapotic.com/vozejkmap",
            categories: ["Kultura"]
        }]
    }, {
        name: "drinking",
        color: "F7A3BE",
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
        color: "ECF0A5",
        sources: [{
            map: "https://www.mapotic.com/smarty-drink"
        }]
    }]
};

export default config;