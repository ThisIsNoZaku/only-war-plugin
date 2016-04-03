define(function(){
	return function($resource, $q) {
	    var specialties = $resource("Character/Specialties.json").query();
	    var selected;

	    return {
	        specialties : function(){
	        	return specialties.$promise.then(function(result){
	        		return result.slice();
	        	});
	        },
	        selected: function(){return selected;},
	        remainingSelections: function(){return selected['optional modifiers']},
	        complete: false,
	        selectSpecialty: function(specialty) {
	            selected = Object.clone(specialty);
	            this.requiredOptionSelections = selected['optional modifiers'];
	        }
	    };
    }
});