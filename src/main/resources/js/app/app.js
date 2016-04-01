require.config({
    baseUrl: "js/",
    "paths": {
        "angular": "libs/angular/angular",
        "angular-resource": "libs/angular-resource/angular-resource",
        "ui-router": "libs/angular-ui-router/release/angular-ui-router",
        "dragdrop": "libs/angular-dragdrop/src/angular-dragdrop",
        "jquery": "libs/jquery/dist/jquery.min",
        "jquery-ui": "libs/jquery-ui/jquery-ui",
        "mootools-core": "libs/mootools/dist/mootools-core",
        "angular-ui" : "app/ui-bootstrap-tpls-1.2.5",
    },
    shim : {
    	"jquery" : {
    		exports : "$"
    	},
    	"angular" : {
    		exports : "angular"
    	},
    	"ui-router" : {
    		deps : ['angular']
    	},
    	"angular-resource" : {
    		deps : ["angular"]
    	},
    	"jquery-ui" : {
    		deps : ["jquery"]
    	},
    	"dragdrop" : {
    		deps : ['angular', 'jquery-ui']
    	},
    	"angular-ui" : {
    		deps : ['angular']
    	},
    	"mootools-core" : {
    	}
    }
});

define(["angular", "ui-router", "angular-resource", "angular-ui", "dragdrop",
"app/regiments/regiment-select-controller", "app/characteristics/characteristics-controller", "app/specialty/specialty-controller", "app/services/selection-modal", "app/sheet/sheet-controller",
"app/services/selection", "app/services/regiments","app/services/specialties", "app/services/character", "app/services/characteristics"],
	function(angular, uirouter, resource, angularui, dragdrop,
	regimentController, characteristicsController, specialtyController, selectionModalController, sheetController,
	selectionService, regimentService, specialtyService, characterService, characteristicsService) {
    var app = angular.module("OnlyWar", ["ui.router", "ngResource", "ui.bootstrap", "ngDragDrop"]);

	//Register services
    app.factory("regiments", regimentService)
    app.factory("selection", selectionService);
    app.factory("specialties", specialtyService);
    app.factory("character", characterService);
    app.factory("characteristics", characteristicsService)

	//Register additional controllers not used by the main pages below
	app.controller("SelectionModalController", selectionModalController);
	app.controller("SheetController", sheetController);

    app.config(function($stateProvider){
        $stateProvider.state("sheet", {
        	url: "/",
            templateUrl: "templates/sheet.html",
            controller : sheetController
		}).state("regiment", {
			url: "/regiment",
			templateUrl: "templates/regiment-select.html",
			controller : regimentController
		}).state("characteristics", {
			url: "/characteristics",
			templateUrl: "templates/characteristics.html",
			controller : characteristicsController
		}).state("specialty", {
			url: "/specialty",
			templateUrl: "templates/specialty.html",
			controller : specialtyController
		}).state("finalize", {
			url: "/finalize",
			templateUrl: "templates/finalize.html"
		});
    });

    //Filter for formatting a clickable summary for a selection.
    app.filter('option_summary', function() {
            return function(inVal) {
                if (typeof inVal.selections === 'number' && Array.isArray(inVal.options)) {
                    var out = "Choose " + inVal.selections + " from ";
                    var options = [];
                    $.each(inVal.options, function(index, option) {
                        var optionElements = [];
                        for (var op = 0; op < option.length; op++) {
                            switch (option[op].property) {
                                case 'characteristics':
                                    {
                                        break;
                                    }
                                case 'talents':
                                case 'skills':
                                    optionElements.push(option[op].value);
                                    break;
                            }
                            if (Array.isArray(option[op].property)) {
                                for (var name in option[op].value) {
                                    if (option[op].value.hasOwnProperty(name) && name.substring(1) !== "$") {
                                        optionElements.push(option[op].value[name] + " x " + name);
                                    }
                                }

                            }
                        }
                        options.push(optionElements.join(", "))
                    });
                    out += options.join(" or ");
                    return out;
                } else {
                    return inVal;
                }
            };
        })
        //Filter for formatting an selectable option in a modal.
    app.filter('modal_option', function() {
        function filter(inVal) {
            var elements = [];
            $.each(inVal, function(index, element) {
                if (!Array.isArray(element.property)) {
                    switch (element.property) {
                        case "skills":
                        case "talents":
                            elements.push(element.value);
                            break;
                    }
                }
            });
            return elements.join(", ");
        }
        return filter;
    });

    angular.bootstrap(document, ['OnlyWar']);
    return app;
});