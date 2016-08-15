import {Item, ItemType} from "./Item";
/**
 * Created by Damien on 7/9/2016.
 */
export class Weapon extends Item {
    private _class:string;
    private _range:string;
    private _rateOfFire:string;
    private _damage:string;
    private _penetration:string;
    private _clip:string;
    private _reload:string;
    private _special:Array<string>;
    private _isMainWeapon:boolean;

    constructor(name:string, availability:string, weaponClass:string, range:string, rateOfFire:string, damage:string,
                penetration:string, clip:string, reload:string, special:Array<string>, weight?:number, isMainWeapon?:boolean, upgrades?:Array<string>, craftsmanship?:string) {
        super(name, ItemType.Weapon, availability, weight, upgrades, craftsmanship);
        this._class = weaponClass;
        this._range = range;
        this._rateOfFire = rateOfFire;
        this._damage = damage;
        this._penetration = penetration;
        this._clip = clip;
        this._reload = reload;
        this._special = special;
        this._isMainWeapon = isMainWeapon;
    }

    get isMainWeapon():boolean {
        if (this._isMainWeapon) {
            return this._isMainWeapon;
        }
        return false;
    }

    get class():string {
        return this._class;
    }

    get range():string {
        return this._range;
    }

    get rateOfFire():string {
        return this._rateOfFire;
    }

    get damage():string {
        return this._damage;
    }

    get penetration():string {
        return this._penetration;
    }

    get clip():string {
        return this._clip;
    }

    get reload():string {
        return this._reload;
    }

    get special():Array<string> {
        return this._special;
    }


}