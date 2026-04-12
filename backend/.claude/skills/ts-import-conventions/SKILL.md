---
name: ts-import-conventions
description: >
  Enforces TypeScript/NestJS import conventions for this project: relative paths
  within the same module, and the `@/` alias for cross-module or shared imports.
  Use this skill whenever writing new TypeScript or NestJS code in the project,
  or when the user says things like "revisá los imports", "arreglá los imports",
  "fix imports", "check imports", "corregí los imports", or asks to review a file
  for import style. Also apply it proactively any time you write or edit a .ts file
  in this codebase — even if the user didn't explicitly mention imports.
---

# Import Conventions — TypeScript / NestJS

## The rule

There are two kinds of imports to care about: **app-internal** and **external**.

- **External** (from `node_modules`): `import { Injectable } from '@nestjs/common'`, `import { Repository } from 'typeorm'`, etc. These are untouched — never change them.
- **App-internal** (from files you wrote inside `src/`): apply the convention below.

### For app-internal imports

| Situation | Style | Example |
|-----------|-------|---------|
| Importing from the **same module folder** | Relative | `./users.service` |
| Importing from a **different module** or shared folder (`config/`, `common/`, `shared/`, etc.) | Alias `@/` | `@/common/guards/auth.guard` |
| Any path that goes up more than one level (`../../`) | Alias `@/` | always |

The alias `@/` maps to `src/` (configured in `tsconfig.json`, resolved at build time by `tsc-alias`).

### How to tell if two files are in the same module

Two files are in the same module when they share the same **immediate parent directory under `src/modules/`**. For example, `src/modules/users/users.controller.ts` and `src/modules/users/dto/create-user.dto.ts` are in the same module (`users`). But `src/modules/auth/auth.guard.ts` imported from `src/modules/users/users.service.ts` is a cross-module import — use `@/`.

Files outside `src/modules/` (like `src/config/`, `src/common/`, `src/shared/`) are always referenced via `@/` from anywhere.

---

## When writing new code

Before writing any import, ask: is this file in the same module folder as the file I'm editing?

- **Yes** → use a relative path: `./something` or `./subfolder/something`
- **No** → use the alias: `@/modules/other/something` or `@/common/guards/something`

Never use `../../../`-style paths for cross-module imports — they break if files move and are hard to read.

---

## When reviewing or fixing existing imports

Go through all `import` statements in the file(s). For each one:

1. Is it from `node_modules`? Skip it.
2. Is the imported file in the **same module folder**? If it uses `@/` or a long `../` path, convert it to a relative path.
3. Is the imported file in a **different module or shared folder**? If it uses a relative path (especially one going up with `../`), convert it to `@/`.

After fixing, briefly list what changed and why, so the user can verify at a glance.

---

## Examples

**Before (incorrect cross-module import):**
```typescript
import { AuthGuard } from '../../../common/guards/auth.guard';
import { databaseConfig } from '../../config/database.config';
```

**After (correct):**
```typescript
import { AuthGuard } from '@/common/guards/auth.guard';
import { databaseConfig } from '@/config/database.config';
```

---

**Before (incorrect same-module import):**
```typescript
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
```

**After (correct — editing `users.controller.ts` inside `src/modules/users/`):**
```typescript
import { CreateUserDto } from './dto/create-user.dto';
```
