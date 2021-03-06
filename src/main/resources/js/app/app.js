require(["angular", "bootstrap", "ui-router", "angular-resource", "angular-ui", "dragdrop", "angular-filter", "cookies",
        "app/modifier-controller", "app/characteristics/characteristics-controller", "app/specialty/starting-powers-controller", "app/nav/selection-modal", "app/sheet/sheet-controller", "app/nav/confirmation-modal", "app/finalize/FinalizePageController", "app/sheet/characteristic-tooltip-controller", "app/sheet/armor-tooltip-controller", "app/regiments/RegimentCreationController", "app/regiments/RegimentCreationElementController",
        "app/services/selection", "app/services/modifier-service", "app/services/character", "app/services/CharacterOptionsService", "app/services/regiments", "app/services/specialties", "app/services/dice", "app/services/characteristic-tooltip-service", "app/services/armor-tooltip-service", "app/services/RegimentOptionService", "app/services/option-selection", "app/services/tutorials", "app/services/PlaceholderReplacement",
        "app/filters/OptionalSelectionModalOptionDisplayFilter", "app/filters/OptionSummaryDisplayFilter", "app/filters/ItemSummaryFilter",
        "app/types/serializers/RegimentSerializer", "app/types/serializers/CharacterSerializer", "app/types/serializers/SpecialtySerializer", "app/types/serializers/CharacterExporter"
    ],
    function (angular, bootstrap, uirouter, resource, angularui, dragdrop, angularFilter, cookies,
              modifierControllerFactory, characteristicsController, startingPowersController, selectionModalController, sheetController, confirmationController, finalizeController, characteristicTooltipController, armorTooltipController, regimentCreationController, regimentCreationElementController,
              selectionService, modifierService, characterService, characterOptions, regimentsProvider, specialtyProvider, diceService, characteristicTooltipService, armorTooltipService, regimentOptions, optionSelection, tutorials, placeholderReplacement,
              OptionSelectionModalOptionDisplayFilter, OptionSummaryDisplayFilter, ItemSummaryFilter,
              RegimentSerializer, CharacterSerializer, SpecialtySerializer, CharacterExporter) {
        var app = angular.module("OnlyWar", ["ui.router", "ngResource", "ui.bootstrap", "ngDragDrop", "angular.filter"]);

        app.config(function ($stateProvider) {
            $stateProvider.state("default", {
                url: "",
                onEnter: function ($state) {
                    $state.go("sheet");
                }
            }).state("sheet", {
                url: "/",
                templateUrl: "templates/sheet.html",
                controller: sheetController,
            }).state("regiment", {
                url: "/regiment",
                templateUrl: "templates/regiment-specialty-page.html",
                controller: modifierControllerFactory("regiments"),
                data: {
                    complete: false
                }
            }).state("characteristics", {
                url: "/characteristics",
                templateUrl: "templates/characteristics.html",
                controller: function ($scope, $uibModal, $state, characterService, dice) {
                    return new characteristicsController($scope, $uibModal, $state, characterService, dice);
                },
                data: {
                    complete: false
                }
            }).state("specialty", {
                url: "/specialty",
                templateUrl: "templates/regiment-specialty-page.html",
                controller: modifierControllerFactory("specialties"),
                data: {
                    complete: false
                }
            }).state("finalize", {
                url: "/finalize",
                templateUrl: "templates/finalize.html",
                controller: function ($q, $scope, characterService, characterOptions, dice) {
                    return new finalizeController.FinalizePageController($q, $scope, characterService, characterOptions, dice);
                },
                data: {
                    complete: false
                }
            }).state("createRegiment", {
                url: "/regiment/create",
                templateUrl: "templates/regiment-creation.html",
                controller: regimentCreationController.RegimentCreationController
            }).state("modal", {
                abstract: true
            }).state("modal.tutorial", {
                onEnter: function ($state, $uibModal) {
                    $uibModal.open({
                        templateUrl: "templates/tutorial.html"
                    }).closed.then(function(){
                        "use strict";
                        $state.go($state.previous.name);
                    })
                }
            }).state("modal.selection", {
                abstract: true
            }).state("modal.selection.modifier", {
                onEnter: function ($state, $uibModal, $stateParams, optionselection, selection) {
                    var modal = $uibModal.open({
                        templateUrl: "templates/selection-modal.html",
                        controller: selectionModalController
                    });
                    modal.result.then(function (result) {
                        optionselection.selected = selection.selected;
                        optionselection.applySelection();
                        $stateParams['on-completion-callback']();
                        $state.go($state.previous.name);
                    }, function (error) {
                        $state.go($state.previous.name);
                    });
                },
                params: {
                    "on-completion-callback": {
                        value: function () {
                        }
                    }
                }
            }).state("createRegiment.kitModifier", {
                onEnter: function ($state, $uibModal, $stateParams, selection) {
                    var modal = $uibModal.open({
                        templateUrl: "templates/selection-modal.html",
                        controller: selectionModalController
                    });
                    modal.result.then(function (result) {
                        $stateParams['on-completion-callback']();
                        $state.go($state.previous.name);
                    }, function (error) {
                        $state.go($state.previous.name);
                    });
                },
                params: {
                    "on-completion-callback": {
                        value: function () {
                        }
                    }
                }
            }).state("createRegiment.setSpecialization", {
                onEnter: function ($state, $uibModal, $stateParams, selection) {
                    var modal = $uibModal.open({
                        templateUrl: "templates/set-specialization-modal.html",
                        controller: selectionModalController
                    });
                    modal.result.then(function (result) {
                        $stateParams['on-completion-callback']();
                        $state.go($state.previous.name);
                    }, function (error) {
                        $state.go($state.previous.name);
                    });
                },
                params: {
                    "on-completion-callback": {
                        value: function () {
                        }
                    }
                }
            });
        });

        //Register services
        app.factory("selection", selectionService);
        app.factory("optionselection", optionSelection);
        app.factory("characterService", characterService);
        app.factory("characterOptions", function ($resource, $q, $log) {
            return $resource("Character/Character.json").get().$promise.then(result=> {
                "use strict";
                return new characterOptions.CharacterOptionsService(result, $log);
            })
        });
        app.factory("dice", diceService);
        app.factory("characteristicTooltipService", characteristicTooltipService);
        app.factory("armorTooltipService", armorTooltipService);
        app.factory("regimentOptions", function ($resource, $q, placeholders) {
            return $q.all({
                regimentOptions: $resource("Regiment/Regiment-Creation.json").get().$promise,
                placeholders: placeholders
            }).then(result=> {
                return new regimentOptions.RegimentOptionService(result.regimentOptions, result.placeholders);
            })
        });
        app.factory("cookies", function () {
            return cookies
        });
        app.factory("tutorials", tutorials);
        app.service("regiments", function ($resource, placeholders) {
            return $resource("Regiment/Regiments.json").query().$promise.then(regiments=> {
                return new regimentsProvider.RegimentService(regiments, placeholders);
            });
        });
        app.factory("specialties", function ($resource, $q, characterOptions, placeholders) {
            return $q.all({characterOptions: characterOptions, placeholder: placeholders}).then(result=> {
                "use strict";
                return new specialtyProvider.SpecialtyService($resource, $q, result.characterOptions, result.placeholders);
            });
        });
        app.factory("placeholders", function (characterOptions) {
            return characterOptions.then(characterOptions=> {
                return new placeholderReplacement.PlaceholderReplacement(characterOptions);
            })
        });

        //Register additional controllers not used by the main pages below
        app.controller("SelectionModalController", selectionModalController);
        app.controller("ConfirmationController", confirmationController);
        app.controller("CharacteristicToolTipController", characteristicTooltipController);
        app.controller("StartingPowersController", startingPowersController);
        app.controller("ArmorTooltipController", armorTooltipController);
        app.controller("RegimentCreationController", regimentCreationController);
        app.controller("regimentCreationElementController", regimentCreationElementController.RegimentCreationElementController);

        app.run(function ($rootScope, $state, $uibModal) {
            var suppressDialog = false;
            $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
                $state.previous = fromState;
                $state.previousParams = fromParams;
            });
            $rootScope.$on("$stateChangeError", function (event) {
                console.log(event);
            });
            $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
                //If transitioning from a top level state to a different toplevel state, the current state is not finished and not suppressing warning dialog
                if (toState !== fromState && $state.topLevelStates.indexOf(toState.name) !== -1 && $state.topLevelStates.indexOf(fromState.name) !== -1 && fromState.data && !fromState.data.complete && !suppressDialog) {
                    var resultHandler = function (result) {
                        if (result) {
                            suppressDialog = true;
                            $state.go(toState);
                        }
                    };
                    e.preventDefault();
                    confirm = $uibModal.open({
                        controller: "ConfirmationController",
                        templateUrl: "templates/confirm-navigation-modal.html"
                    }).result.then(resultHandler);
                }
                suppressDialog = false;
            });
            $("modal-container").on("hidden.bs.modal", function (e) {

            });
            $state.topLevelStates = ["regiment", "sheet", "characteristics", "specialty", "finalize"];
        });

        //Filter for formatting a clickable summary for a selection.
        app.filter('option_summary', function () {
            return OptionSummaryDisplayFilter.filter;
        })
        //Filter for formatting an selectable option in a modal.
        app.filter('modal_option', function () {
            return OptionSelectionModalOptionDisplayFilter.filter;
        });
        app.filter('item_summary', function () {
            return ItemSummaryFilter.ItemSummamryFilter;
        });

        app.directive("regimentCreationElement", function () {
            return {
                templateUrl: "templates/RegimentCreationElementDisplay.html",
                restrict: 'E',
                scope: {
                    "element": "="
                },
                require: "",
                controller: regimentCreationElementController.RegimentCreationElementController
            }
        });

        angular.bootstrap(document, ['OnlyWar']);

        window.character = function (value) {
            var characterService = angular.element(document.body).injector().get("characterService");
            var requiredSerializers = new Map();
            var placeholders = angular.element(document.body).injector().get("placeholders");
            var $q = angular.element(document.body).injector().get("$q");
            requiredSerializers.set("Regiment", new RegimentSerializer.RegimentSerializer(placeholders));
            requiredSerializers.set("Specialty", new SpecialtySerializer.SpecialtySerializer(placeholders));
            var serializer = new CharacterSerializer.CharacterSerializer(requiredSerializers, placeholders, $q);
            if (value) {
                serializer.deserialize(value).then(function (result) {
                    characterService.character = result;
                    angular.element(document.body).injector().get("$state").reload();
                });
            } else {
                return serializer.serialize("", characterService.character);
            }
        };

        window.export = function () {
            var characterExporter = new CharacterExporter.CharacterExporter();
            var characterService = angular.element(document.body).injector().get("characterService");
            return characterExporter.export(characterService.character);
        }

        return app;
    }
);