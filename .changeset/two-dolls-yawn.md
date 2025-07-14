---
"@wbe/interpol": minor
---

Rename seek method to progress

**Breaking change**

In order to fit to the [GSAP API](<https://gsap.com/docs/v3/GSAP/Tween/progress()>), Interpol & Timeline `seek` method has been renamed `progress`.
`progress` is now a getter and setter:

```ts
// Set progress to a specific value
itp.progress(progressValue): void

// Get current progress value
itp.progress(): number
```
