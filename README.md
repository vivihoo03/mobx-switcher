## Effect switcher

### Aim
 *  1. delay bind effects (reaction)
 *  2. dynamic controll bind or dispose effects (reaction)

### How

* process is split to two part, collect `work unit` and switcher trigger control

### Quick start
``` npm install mobx-switcher   ```
    or 
    ```yarn add mobx-switcher ```

### Example
``` 
import { observable } from 'mobx';
import { EffectSwitcher } from 'mobx-switcher';

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

// control effects-switcher---open
// control effects-switcher---work unit：my love is active！！
// I love xfk
// control effects-switcher---close
// control effects-switcher---work-uni：change my love is dispose！

```

