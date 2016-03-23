var app = angular.module("OnlyWar", ["ui.router", "ngResource"])
.filter('primitive_option', function(){
    return function(inVal){
        if (typeof inVal === 'object'){
            var selections = inVal.selections;
            var options = inVal.options.join(" or ");
            return $("<button>", {
                class : "link",
                html : selections + " of " + options
            });
        }
        return inVal;
    }
})
.filter('object_option', function(){
    return function(inVal){
        var out = "";
        if (typeof inVal.selections === undefined){
            for (var name in inVal){
                if (inVal.hasOwnProperty(name)){
                    out += name + " : " + inVal[name] >= 0 ? '+' + inVal[name] : inVal[name]
                }
            }
        } else {
            out += inVal.selections + " of ";
            var options = [];
            $.each(inVal.options, function(index, option){
                var optionElements = [];
                for(var name in option){
                    if (option.hasOwnProperty(name)){
                        optionElements.push(option[name] + " x " + name);
                    }
                }
                options.push(optionElements.join(", "));
            });
            out += options.join(" or ");
        }
        return $("<button>", {
                        class : "link",
                        html : out
                    });
    }
})
.directive("neo-selection", function(){
    return {};
});

app.factory("character", function(){
    var character = {
        name: "",
        player: "",
        //The regiment of the character, contains the regiment object.
        regiment : null,
        //The specialty of the character, contains the specialty object
        specialty : null,
        description : "",
        //Characteristics of the character. Map between name and rating.
            characteristics : {
                "weapon skill" : null,
                "ballistic skill" : null,
                strength : null,
                toughness : null,
                agility : null,
                intelligence : null,
                perception : null,
                willpower : null,
                fellowship : null
            },
            //Array of skills. Each skill is an object containing the name and rank.
            //Rating 1 is known, rating 2 is trained (+10), 3 is experienced (+20), 4 is veteran (+30)
            skills : [],
            //The characters talents and traits.
            talents : [],
            wounds : {
                total : 0,
                current: 0
            },
            fatigue : 0,
            insanity : {
                points : 0,
                disorders : []
            },
            corruption : {
                points : 0,
                malignancies : [],
                mutations : []
            },
            movement : 0,
            fatePoints : {
                total : 0,
                current : 0
            },
            equipment : {
                weapons : [],
                armor : [],
                gear : []
            },
            experience : {
                available : 0,
                total : 0
            },
            aptitudes : []
        };
    var service = {
        character : character
    };
    return service;
});

app.factory("regiments", function($resource){
    var regiments = $resource("Regiment/regiments.json").query();
    var service = {
        regiments : regiments,
        selectedRegiment : null,
        requiredOptionSelections : [],
        selectRegiment : function(regiment) {
            service.selectedRegiment = regiment;
            for (var property in regiment['optional modifiers']){
                if (regiment['optional modifiers'].hasOwnProperty(property)){
                    $.each(regiment['optional modifiers'][property], function(index, value){
                        service.requiredOptionSelections.push({
                            "property" : property,
                            index : index
                        })
                    });
                };
            };
        }
    };
    return service;
});

app.factory("specialties", function($resource){
    var specialties = $resource("Character/Specialties.json").query();
    var service = {
        specialties : specialties,
        selectedSpecialty : null,
        requiredOptionSelections : []
    };

    var selectSpecialty = function(specialty) {
        service.selectedSpecialty = specialty;
        for (var property in specialty['optional modifiers']){
            if (specialty['optional modifiers'].hasOwnProperty(property)){
                $.each(specialty['optional modifiers'][property], function(index, value){
                    service.requiredOptionSelections.push({
                        "property" : property,
                        index : index
                    })
                });
            };
        };
    };
    return service;
});

app.factory("talents", function(){
    var _talents;
    $.get({
        url : "Character/talents.json",
        dataType : "json"
    }).done(function(result){
        _talents = result;
    });
    return function(){return _talents;};
});

app.factory("characteristics", function($resource){
    return $resource("Character/characteristics.json");
});

app.config(function($stateProvider, $urlRouterProvider){
    $stateProvider.state("sheet", {
        url : "/",
        templateUrl : "sheet.html",
        controller : "SheetController"
    }).state("regiment", {
        url : "/regiment",
        templateUrl : "regiment-select.html",
        controller : "RegimentSelectionController"
    })
    .state("characteristics", {
        url : "/characteristics",
        templateUrl : "characteristics.html",
        controller : "CharacteristicsController"
    }).state("specialty", {
        url : "/specialty",
        templateUrl : "specialty.html",
        controller : "SpecialtySelectController"
    });
});

app.controller("NavController",function($scope, character){
    $scope.character = character.character;
});

app.controller("SheetController",function($scope, character, characteristics){
    $scope.character = character.character;
    var characteristics = characteristics.query();
    $scope.characteristics = characteristics;
});

app.controller("RegimentSelectionController", function($scope, character, regiments, $state){
    $scope.regiments = regiments.regiments;
    $scope.character = character.character;
    $scope.selectedRegiment = regiments.selectedRegiment;

    $scope.selectRegiment = function(index){
        regiments.selectRegiment(regiments.regiments[index]);
        $scope.selectedRegiment = regiments.selectedRegiment;
    };
});

app.controller("RegimentCreationController", function($scope){

});

app.controller("CharacteristicsController", function($scope, characteristics, character){
    var characteristics = characteristics.query();
    $scope.characteristics = characteristics;
    $scope.character = character.character;
    $scope.generate = function(name){
        if (name === undefined){
            $.each(characteristics, function(index, value){
                character.character.characteristics[value] = 20 + Math.floor(Math.random() * (9) + 1) + Math.floor(Math.random() * (9) + 1);
            });
        } else {
            character.character.characteristics[name] = 20 + Math.floor(Math.random() * (9) + 1) + Math.floor(Math.random() * (9) + 1);
        }
    }
});

app.controller("SpecialtySelectController", function($scope, specialties, character){
    $scope.specialties = specialties.specialties;
    $scope.selectedSpecialty = specialties.selectedSpecialty;

    $scope.selectSpecialty= function(index){
        specialties.selectedSpecialty = specialties.specialties[index];
    };
});

app.controller("FinalizeController", function($scope){

});