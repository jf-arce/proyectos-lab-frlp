# Swagger / OpenAPI

La UI de Swagger está disponible en `http://localhost:<PORT>/api/docs` cuando el servidor corre en modo desarrollo.

La configuración central está en `src/main.ts` y no debe modificarse para agregar endpoints — solo se usan decoradores en cada módulo.

## Decorar un módulo nuevo

### Controller

```typescript
import { ApiTags } from '@nestjs/swagger';

@ApiTags('nombre-del-recurso')
@Controller('nombre-del-recurso')
export class NombreController {}
```

### DTO

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateNombreDto {
  @ApiProperty({ example: 'valor de ejemplo' })
  campo: string;
}
```

### Endpoints con JWT

```typescript
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('nombre-del-recurso')
@Controller('nombre-del-recurso')
export class NombreController {}
```

### Entity (respuesta directa)

En este proyecto las entidades se devuelven directamente desde los controllers.
Agregar `@ApiProperty()` a cada campo para que Swagger genere el schema de respuesta.
Si en algún módulo se necesita ocultar campos sensibles o transformar la respuesta, crear un DTO de respuesta separado.

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Nombre {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'valor de ejemplo' })
  @Column()
  campo: string;
}
```

Y en el controller anotar el tipo de retorno:

```typescript
@Get(':id')
@ApiResponse({ status: 200, type: Nombre })
findOne(@Param('id') id: string) { ... }
```

## Decoradores más usados

| Decorador | Dónde | Qué hace |
|---|---|---|
| `@ApiTags('x')` | Controller | Agrupa los endpoints bajo la etiqueta `x` |
| `@ApiProperty()` | DTO (campo) | Expone el campo en el schema de OpenAPI |
| `@ApiPropertyOptional()` | DTO (campo opcional) | Igual que el anterior pero marca el campo como opcional |
| `@ApiBearerAuth()` | Controller | Indica que los endpoints requieren JWT |
| `@ApiResponse({ status, description })` | Endpoint | Documenta una respuesta posible |
| `@ApiOperation({ summary })` | Endpoint | Agrega descripción al endpoint |
