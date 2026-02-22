---
"@wbe/interpol": minor
---

Access to some global properties via `engine` object:

before:

```ts
import { InterpolOptions } from "@wbe/interpol"

InterpolOptions.ticker.add(() => {})
```

after:

```ts
import { engine } from "@wbe/interpol"

engine.ticker.add(() => {})
```
