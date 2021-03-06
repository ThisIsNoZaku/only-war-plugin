import {Characteristic} from "../types/character/Characteristic";
import {SkillDescription} from "../types/character/Skill";
import {Talent} from "../types/character/Talent";
import {Trait} from "../types/character/Trait";
import {Item} from "../types/character/items/Item";
import {SelectableModifier} from "../types/character/CharacterModifier";
import {PlaceholderReplacement, ItemPlaceholder, SkillPlaceholder, TalentPlaceholder} from "./PlaceholderReplacement";
import {Specialty, SpecialtyType} from "../types/character/Specialty";
import {Weapon} from "../types/character/items/Weapon";
import {CharacterService} from "./CharacterService";
/**
 * Created by Damien on 7/12/2016.
 */
export class SpecialtyService {
    private _specialties;
    private _angular;

    constructor($resource, $q, characterOptions, placeholders:PlaceholderReplacement) {
        this._specialties = $q.all({
            specialties: $resource("Character/Specialties.json").query().$promise,
            placeholders: placeholders
        }).then(function (result) {
            return result.specialties.map(specialty => {
                var characteristics = new Map<Characteristic, number>();
                for (var characteristicName in specialty['fixed modifiers'].characteristics) {
                    characteristics.set(Characteristic.characteristics.get(characteristicName), specialty['fixed modifiers'].characteristics[characteristicName]);
                }
                var aptitudes = specialty['fixed modifiers'].aptitudes;
                var characterSkills = new Map<SkillDescription, number>();
                var skillContainer = specialty['fixed modifiers'].skills
                if (skillContainer) {
                    for (var skillPlaceholder of skillContainer) {
                        characterSkills.set(result.placeholders.replace(skillPlaceholder, "skill"), skillPlaceholder.rating);
                    }
                }
                var characterTalents = new Array<Talent>();
                if (specialty['fixed modifiers'].talents) {
                    for (var talentPlaceholder of specialty['fixed modifiers'].talents) {
                        var talent:Talent = result.placeholders.replace(talentPlaceholder, "talent");
                        characterTalents.push(talent);
                    }
                }

                var characterTraits = new Array<Trait>();
                if (specialty['fixed modifiers'].traits) {
                    for (var traitPlaceholder of specialty['fixed modifiers'].traits) {
                        var trait:Trait = result.placeholders.replace(traitPlaceholder, "trait");
                        characterTraits.push(trait);
                    }
                }

                var kit:Map<Item, number> = new Map<Item, number>();
                if (specialty['fixed modifiers']['character kit']) {
                    for (var itemDescription of specialty['fixed modifiers']['character kit']) {
                        var item = result.placeholders.replace(itemDescription.item, "item");
                        kit.set(item, itemDescription.count);
                    }
                }
                var wounds:number = specialty['fixed modifiers'].wounds;
                var bonusXp:number = specialty['fixed modifiers']['starting power experience'];
                var psyrating:number = specialty['fixed modifiers']['psy rating'];
                var optionalModifiers = Array<SelectableModifier>();
                if (specialty['optional modifiers']) {
                    for (var optional of specialty['optional modifiers']) {
                        optionalModifiers.push(new SelectableModifier(optional.numSelectionsNeeded, optional.options.map(optionGroup=> {
                            optionGroup.description = optionGroup.map(o=> {
                                switch (o.property) {
                                    case "talent":
                                        return o.value.name + (o.value.specialization ? " (" + o.value.specialization + ")" : "");
                                    case "skill":
                                        let rating = "+" + (o.value.rating - 1) * 10;
                                        return o.value.name + (o.value.specialization ? " (" + o.value.specialization + ")" : "") + rating;
                                    case "item":
                                    {
                                        //Special handling for the regimental favored heavy weapon
                                        return o.value.item.name + " x " + o.value.count;
                                    }
                                }
                            }).join(" or ");
                            return optionGroup.map(option=> {
                                switch (option.property) {
                                    case "item":
                                        //Wrap in functions to allow for type guards.
                                        if (option.name === "Regimental Favored Heavy Weapon") {
                                            option = new Proxy(option, {
                                                get: function (target, property) {
                                                    if (property === "value") {
                                                        if (target.target && target.target.regiment) {
                                                            return target.target.regiment.favoredWeapons.get("heavy");
                                                        } else {
                                                            return [
                                                                {
                                                                    item: result.placeholders.replace(option.value.item, option.property),
                                                                    count: option.value.count
                                                                }
                                                            ];
                                                        }
                                                    } else {
                                                        return target[property];
                                                    }
                                                }
                                            });
                                        } else {
                                            option.value = function (value):value is ItemPlaceholder {
                                                return <any>{
                                                    item: result.placeholders.replace(value.item, option.property),
                                                    count: value.count
                                                };
                                            }(option.value);
                                        }
                                        break;
                                    case "skill":
                                        option.value = function (value):value is SkillPlaceholder {
                                            let result:any = {
                                                skill: placeholders.replace(value, option.property),
                                                rank: value.rank
                                            }
                                            return result;
                                        }(option.value);
                                        break;
                                    case "talent":
                                        option.value = function (value):value is TalentPlaceholder {
                                            return result.placeholders.replace(value, option.property);
                                        }(option.value);
                                        break;
                                    case "characteristic":
                                        break;
                                    default:
                                        debugger;
                                        throw "Handling placeholders of type " + option.property + " not supported."
                                }
                                return option;
                            });

                        }), optional['selection time']));
                    }
                }
                var type:SpecialtyType;
                switch (specialty.type) {
                    case "guardsman":
                        type = SpecialtyType.Guardsman;
                        break;
                    case "specialist":
                        type = SpecialtyType.Specialist;
                        break;
                    default:
                        throw "Type must be 'guardsman' or 'specialist', was " + specialty.type;
                }
                return new Specialty(specialty.name, characteristics, type, characterSkills, characterTalents, specialty['fixed modifiers'].aptitudes || [],
                    characterTraits, kit, wounds, bonusXp, psyrating, specialty["depends-on"], optionalModifiers);
            });
        });
    }

    get specialties() {
        return this._specialties;
    }
}