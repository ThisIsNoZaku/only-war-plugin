define(function() {
	return function(){
		return {
			//The object the option object exists within. Will be modified by the selection.
			target: null,
			//The service for the target, keeps track of all the selections remaining to be made.
			associatedService: null,
			//The selection object being chosen from
			selectionObject: null,
			//Decompose this option if valid selections made
			choose: function(selectedIndices) {
				var selectionObject = this.selectionObject;
				if (selectedIndices.length !== selectionObject.selections) {
					throw "Chose " + selectedIndices.length + " but " + selectionObject.selections + " allowed."
				}
				var associatedService = this.associatedService;
				var target = this.target;
				$.each(selectedIndices, function(index, selectedIndex) {
					var chosen = selectionObject.options[selectedIndex];

					for (var sub = 0; sub < chosen.length; sub++) {
						var fixedModifier = target['fixed modifiers'];
						var properties;
						if (Array.isArray(chosen[sub]["property"])) {
							properties = chosen[sub]["property"];
						} else {
							properties = [chosen[sub]["property"]];
						};

						for (var p = 0; p < properties.length; p++) {
							if (fixedModifier[properties[p]] === undefined) {
								switch (properties[p]) {
									case 'character kit':
									case 'other weapons':
									case 'armor':
									case 'other gear':
										fixedModifier[properties[p]] = {};
										break;
								};
							}
							fixedModifier = fixedModifier[properties[p]];
						};
						if (typeof chosen[sub].value === 'object') {
							for (var prop in chosen[sub].value) {
								if (chosen[sub].value.hasOwnProperty(prop)) {
									fixedModifier[prop] = chosen[sub].value[prop];
								}
							}
						} else {
							fixedModifier.push(chosen[sub].value);
						};
					}
				})
				associatedService.remainingSelections().splice(associatedService.remainingSelections().indexOf(selectionObject), 1);
				this.associatedService.dirty = true;
			}

		}
	}
});