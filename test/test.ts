import { observable } from 'mobx';
import { EffectSwitcher } from '../src/switcher';

const obsStore = observable.map({
    name: 'ken'
})
const switcher = new EffectSwitcher('control effects');
switcher.setDebug(true);

switcher.collectWorkUnit({
    collect: () => obsStore.get('name'),
    effect: (year) => {
        const good = `I love ${year}`;
        console.dir(good);
    },
    opts: {
        name: 'change my love'
    }
}, false);

switcher.setTrigger(true);

obsStore.set(name, 'xfk');

switcher.setTrigger(false);

obsStore.set(name, 'ken');
