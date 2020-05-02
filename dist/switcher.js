var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { reaction, observable, action } from 'mobx';
/**
 * mobx extension
 * effectSwitcher is used in condition:
 *  1. want delay bind effect
 *  2. dynamic controll bind effect
 */
export class EffectSwitcher {
    constructor(name) {
        this.workUnits = new Map();
        this._disposes = new Map();
        this._idx = 0;
        this._debug = false;
        this._innerDisposes = new Set();
        this._trigger = undefined;
        this.name = name;
    }
    setTrigger(isOn) {
        if (this._debug) {
            console.dir(`${this.name}switcher---${isOn ? 'open' : 'close'}`);
        }
        this._trigger = isOn;
    }
    setDebug(debug) {
        this._debug = debug;
    }
    collectWorkUnit(unit, isCheck = false) {
        if (!isCheck) {
            const name = this._getName(unit);
            this.workUnits.set(name, unit);
            this._innerDisposes.add(reaction(() => {
                return this._trigger;
            }, (isOn) => {
                if (isOn) {
                    this._doActive(unit);
                }
                else {
                    this._doDispose(name);
                }
            }));
            return true;
        }
        let name;
        try {
            name = this._doActive(unit);
            if (name) {
                this.workUnits.set(name, unit);
            }
            return true;
        }
        catch (e) {
            console.error(e);
            return false;
        }
        finally {
            if (name) {
                this._doDispose(name);
                this._innerDisposes.add(reaction(() => {
                    return this._trigger;
                }, (isOn) => {
                    if (isOn) {
                        this._doActive(unit);
                    }
                    else {
                        this._doDispose(name);
                    }
                }));
            }
        }
    }
    clear() {
        this._idx = 0;
        this._disposes.forEach((d) => d());
        this._innerDisposes.forEach((d) => d());
        this._disposes.clear();
        this.workUnits.clear();
        this._innerDisposes.clear();
    }
    _getName(unit) {
        let name;
        if (unit.opts && unit.opts.name) {
            name = unit.opts.name;
        }
        else {
            this._idx++;
            name = `${this._idx}`;
        }
        return name;
    }
    _doActive(unit) {
        const name = this._getName(unit);
        if (this._disposes.get(name)) {
            if (this._debug) {
                console.error(`${this.name}-switcher，effectName = ${name}, duplicate bind!`);
            }
            return name;
        }
        if (this._debug) {
            console.dir(`${this.name}-switcher---work unit：${name} is active！`);
        }
        const dispose = reaction(unit.collect, unit.effect, unit.opts);
        this._disposes.set(name, dispose);
        return name;
    }
    _doDispose(n) {
        if (!n)
            return;
        const dispose = this._disposes.get(n);
        if (dispose) {
            dispose();
            this._disposes.delete(n);
            if (this._debug) {
                console.dir(`${this.name}-switcher---work-unit${n}is dispose！`);
            }
        }
    }
}
__decorate([
    observable
], EffectSwitcher.prototype, "_trigger", void 0);
__decorate([
    action.bound
], EffectSwitcher.prototype, "setTrigger", null);
