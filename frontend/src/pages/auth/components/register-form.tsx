import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { z } from 'zod';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { authService } from '@/services/auth';
import { Role } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const schema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.email('Ingresá un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  legajo: z.string().min(1, 'El legajo es obligatorio'),
  anioEnCurso: z.string().min(1, 'Seleccioná un año'),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    mode: 'onChange',
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      legajo: '',
      anioEnCurso: '',
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await authService.register({
        ...values,
        rol: Role.ALUMNO,
        anioEnCurso: Number(values.anioEnCurso),
      });
      toast.success('Cuenta creada correctamente. Ya podés iniciar sesión.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al registrarse');
    }
  }

  return (
    <div className="p-8 md:p-12 flex flex-col justify-center">
      {/* Logo mobile */}
      <div className="md:hidden flex items-center justify-center gap-2 mb-8">
        <picture>
          <img
            src="/images/utn-logo.png"
            alt="Logo de UTN FRLP"
            className="h-10 w-auto invert-0 dark:invert"
          />
        </picture>
      </div>

      <div className="mb-8 text-center md:text-left">
        <h2 className="text-3xl font-extrabold text-primary mb-2 font-display">
          Crear cuenta
        </h2>
        <p className="text-muted-foreground font-medium">
          Completá tus datos para registrarte como alumno
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="given-name"
                      placeholder="Juan"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apellido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="family-name"
                      placeholder="García"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="usuario@email.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <PasswordInput
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="legajo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Legajo</FormLabel>
                  <FormControl>
                    <Input placeholder="60000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="anioEnCurso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Año en curso</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccioná" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}° año
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full py-6"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            <UserPlus className="size-4" />
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{' '}
        <Link
          to="/login"
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
