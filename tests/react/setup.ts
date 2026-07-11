import { vi } from "vitest";

/** from https://vitest.dev/guide/browser/#limitations

> Browser Mode uses the browser's native ESM support to serve modules.
> The module namespace object is sealed and can't be reconfigured,
> unlike in Node.js tests where Vitest can patch the Module Runner.
> This means you can't call `vi.spyOn` on an imported object:
>
> ```
> import { vi } from 'vitest'
> import * as module from './module.js'
>
> vi.spyOn(module, 'method') // ❌ throws an error
> ```
>
> To bypass this limitation,
> Vitest supports `{ spy: true }` option in `vi.mock('./module.js')`.
> This will automatically spy on every export in the module
> without replacing them with fake ones.
>
> ```
> import { vi } from 'vitest'
> import * as module from './module.js'
>
> vi.mock('./module.js', { spy: true })
>
> vi.mocked(module.method).mockImplementation(() => {
>   // ...
> })
> ```

 * In Vitest, calls to `vi.mock` must typically be made in every test file where the mocked module is imported.
 * To avoid repeating `vi.mock("your-module", { spy: true })` across all tests,
 * it is simpler to place it once here in this global setup file.
 */

vi.mock("react-router", { spy: true });
