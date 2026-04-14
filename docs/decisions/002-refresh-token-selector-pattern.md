# 002 — Refresh token: selector pattern para lookup eficiente

## Problema actual

`AuthService.refresh()` y `AuthService.logout()` cargan **todos** los refresh tokens de la tabla y hacen `bcrypt.compare` en un loop hasta encontrar el match:

```ts
// auth.service.ts — refresh()
const candidates = await this.refreshTokenRepository.find({ relations: ['user'] });
for (const candidate of candidates) {
  if (candidate.expiresAt > now) {
    const isMatch = await compare(refreshTokenPlain, candidate.tokenHash);
    if (isMatch) { ... }
  }
}
```

Bcrypt es intencionalmente lento (10 salt rounds ≈ ~100ms por comparación). Con N usuarios activos, el peor caso es O(N) × 100ms por cada refresh. No es crítico con pocos usuarios, pero es un problema de diseño que conviene corregir antes de que crezca la tabla.

## Solución: selector pattern

Dividir el token en dos partes al generarlo:

```
token = selector (16 chars, índice) + verifier (48 chars, se hashea)
```

- `selector`: se guarda en texto plano en DB con un índice único. Permite hacer un `WHERE selector = ?` — lookup O(1).
- `verifier`: se hashea con bcrypt y se guarda como `verifier_hash`. Es la parte secreta que prueba posesión del token.

El token que se entrega al cliente es `selector + verifier` concatenados (64 chars hex).

---

## Cambios necesarios

### 1. Migración: nueva estructura de la tabla `refresh_token`

```sql
ALTER TABLE refresh_token
  ADD COLUMN selector VARCHAR(16) NOT NULL DEFAULT '',
  ADD COLUMN verifier_hash VARCHAR NOT NULL DEFAULT '',
  DROP COLUMN token_hash;

CREATE UNIQUE INDEX idx_refresh_token_selector ON refresh_token (selector);
```

O bien, crear la entidad nueva y generar la migración con TypeORM:

```ts
// refresh-token.entity.ts
@Entity('refresh_token')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  user: User;

  @Column({ unique: true })
  selector: string;          // primeros 16 chars del token, índice único

  @Column({ name: 'verifier_hash' })
  verifierHash: string;      // bcrypt del resto

  @Column({ name: 'expira_en', type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

### 2. Generación del token (`generateAndStoreRefreshToken`)

```ts
private async generateAndStoreRefreshToken(userId: string): Promise<string> {
  const rawBytes = randomBytes(32).toString('hex'); // 64 chars hex
  const selector = rawBytes.slice(0, 16);
  const verifier = rawBytes.slice(16);
  const verifierHash = await hash(verifier, BCRYPT_SALT_ROUNDS);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_DAYS', 7));

  await this.refreshTokenRepository.save(
    this.refreshTokenRepository.create({
      user: { id: userId },
      selector,
      verifierHash,
      expiresAt,
    }),
  );

  return rawBytes; // selector + verifier concatenados — esto es lo que recibe el cliente
}
```

### 3. Lookup en `refresh()` y `logout()`

```ts
// Extraer selector y verifier del token recibido
const selector = refreshTokenPlain.slice(0, 16);
const verifier = refreshTokenPlain.slice(16);

// Un solo query por índice
const candidate = await this.refreshTokenRepository.findOne({
  where: { selector },
  relations: ['user'],
});

if (!candidate || candidate.expiresAt <= new Date()) {
  throw new UnauthorizedException('Refresh token inválido o expirado');
}

const isMatch = await compare(verifier, candidate.verifierHash);
if (!isMatch) {
  throw new UnauthorizedException('Refresh token inválido o expirado');
}

// continuar con la lógica...
```

---

## Resultado

| | Antes | Después |
|---|---|---|
| Queries por refresh | 1 (trae todo) | 1 (por selector, indexado) |
| bcrypt.compare calls | O(N) | O(1) |
| Seguridad | igual | igual (el verifier sigue siendo secreto) |

---

## Referencias

- [Paragraph Security — split token pattern](https://paragonie.com/blog/2017/02/split-tokens-token-based-authentication-protocols-without-side-channels)
