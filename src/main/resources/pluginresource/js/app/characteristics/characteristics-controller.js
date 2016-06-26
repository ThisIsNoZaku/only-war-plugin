define(function(){
	return function($scope, $uibModal, $state, characteroptions, characterService, dice) {
        //Bring all the characteristic names into scope
        characteroptions.characteristics().then(function(result){
        	$scope.characteristicNames = result.map(function(characteristic){
        		return characteristic.name;
        	});
        });
		//Reference to the character object
    	$scope.character = characterService.character;
    	//The randomly generated values
    	$scope.generatedValues = [];
    	$scope.characteristics = characterService.character.characteristics;
    	//Random characteristic generation function. Takes an index to roll a single value or regenerates all of them.
	    $scope.generate = function(index) {
	        if (index === undefined) {
	            for (var i = 0; i < $scope.characteristicNames.length; i++) {
	            	//Generate random values between 22 and 40
	                $scope.generatedValues[i] = dice.roll(1, 10, 2) + 20;
	                //Reset all of already assigned values to 0.
	                $scope.characteristics[$scope.characteristicNames[i].toLowerCase()].rolled = 0;
	            }
	        } else {
	            $scope.generatedValues[index] = dice.roll(1, 10, 2) + 20;
	        }
	    };

	    $scope.drop = function(){
	    	$state.$current.data.complete = isComplete();
	    }

	    $scope.valueButtonClick = function(index) {
	        $scope.generate(index);
	    }

    	var suppressDialog = false;
    	//Checks if all of the characters characteristics have a value assigned.
    	var isComplete = function(){
			for(var characteristic in characterService.character.characteristics){
				if(characterService.character.characteristics[characteristic].rolled === 0){
					return false;
				}
			}
			return true;
    	}
	}
});