import { IReactionPublic, IReactionOptions, reaction, IReactionDisposer, observable, action } from 'mobx';

export interface IEffectWorkUnit<T> {
    collect: (r: IReactionPublic) => T;
    effect: (arg: T, r: IReactionPublic) => void;
    opts?: IReactionOptions;
}

export interface IEffectSwitcher<T> {
    name: string;
    setTrigger: (isOn: boolean) => void; 
    collectWorkUnit: (unit: IEffectWorkUnit<T>) => boolean; // collect effect
    clear: () => void;
    setDebug: (isDebug: boolean) => void;
}

/**
 * mobx extension
 * effectSwitcher is used in condition:
 *  1. delay bind effect
 *  2. dynamic controll bind effect
 */
export class EffectSwitcher implements IEffectSwitcher<any> {
    public name: string;

    protected workUnits: Map<string, IEffectWorkUnit<any>> = new Map();

    private _disposes: Map<string, IReactionDisposer> = new Map();

    private _idx = 0;

    private _debug = false;

    private _innerDisposes: Set<IReactionDisposer> = new Set();

    @observable
    private _trigger: boolean | undefined = undefined;

    constructor(name: string) {
        this.name = name;
    }

    @action.bound
    public setTrigger(isOn: boolean) {
        if (this._debug) {
            console.dir(`${this.name}-switcher---${isOn ? 'open' : 'close'}`);
        }
        this._trigger = isOn;
    }

    public setDebug(debug: boolean) {
        this._debug = debug;
    }

    public collectWorkUnit(unit: IEffectWorkUnit<any>, isCheck = false) {
        if (!isCheck) {
            const name = this._getName(unit);
            this.workUnits.set(name, unit);
            this._innerDisposes.add(
                reaction(
                    () => {
                        return this._trigger;
                    },
                    (isOn) => {
                        if (isOn) {
                            this._doActive(unit);
                        } else {
                            this._doDispose(name);
                        }
                    },
                ),
            );
            return true;
        }
        let name: string | undefined;
        try {
            name = this._doActive(unit);
            if (name) {
                this.workUnits.set(name, unit);
            }
            return true;
        } catch (e) {
            console.error(e);
            return false;
        } finally {
            if (name) {
                this._doDispose(name);
                this._innerDisposes.add(
                    reaction(
                        () => {
                            return this._trigger;
                        },
                        (isOn) => {
                            if (isOn) {
                                this._doActive(unit);
                            } else {
                                this._doDispose(name);
                            }
                        },
                    ),
                );
            }
        }
    }

    public clear() {
        this._idx = 0;
        this._disposes.forEach((d) => d());
        this._innerDisposes.forEach((d) => d());
        this._disposes.clear();
        this.workUnits.clear();
        this._innerDisposes.clear();
    }

    private _getName(unit: IEffectWorkUnit<any>) {
        let name: string | undefined;
        if (unit.opts && unit.opts.name) {
            name = unit.opts.name;
        } else {
            this._idx++;
            name = `${this._idx}`;
        }
        return name;
    }

    private _doActive(unit: IEffectWorkUnit<any>): string {
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

    private _doDispose(n: string | undefined) {
        if (!n) return;
        const dispose = this._disposes.get(n);
        if (dispose) {
            dispose();
            this._disposes.delete(n);
            if (this._debug) {
                console.dir(`${this.name}-switcher---work-unit:${n}is dispose！`);
            }
        }
    }
}
