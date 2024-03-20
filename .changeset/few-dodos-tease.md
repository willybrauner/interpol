---
"@wbe/interpol": patch
---

Remove ease string with capitalize first letter

Remove this ease string:

```ts
"Power1" | "Power2" | "Power3" | "Power4" | "Expo" | "Linear"
``` 

Prefer using these one:

```ts
"power1" | "power2" | "power3" | "power4" | "expo" | "linear"
```
