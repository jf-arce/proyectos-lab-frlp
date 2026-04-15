import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { z } from 'zod';
import { toast } from 'sonner';
import { FlaskConical, GraduationCap, Landmark, UserPlus } from 'lucide-react';
import { authService } from '@/services/auth';
import { Role } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export function RegisterPage() {
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Blobs atmosféricos de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-card rounded-xl shadow-[0_32px_64px_-12px_rgba(0,36,75,0.08)] overflow-hidden z-10">
        {/* ── Panel de branding ── */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="register-grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#register-grid)" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <Landmark className="size-8" strokeWidth={1.5} />
              <span className="text-xl font-extrabold tracking-tighter uppercase font-display">
                UTN FRLP
              </span>
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight mb-6 font-display">
              Comenzá tu experiencia en los laboratorios
            </h1>
            <p className="text-primary-foreground/70 text-lg font-medium max-w-sm leading-relaxed">
              Registrate para explorar proyectos de investigación y postularte a
              los que se ajusten a tu perfil.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-sm font-medium">
              <GraduationCap
                className="size-5 text-primary-foreground/60"
                strokeWidth={1.5}
              />
              <span>Solo para alumnos de UTN FRLP</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium">
              <FlaskConical
                className="size-5 text-primary-foreground/60"
                strokeWidth={1.5}
              />
              <span>Accedé a proyectos de laboratorio</span>
            </div>
            <div className="pt-6 border-t border-white/10">
              <p className="text-xs text-primary-foreground/40 font-medium tracking-wide uppercase">
                Universidad Tecnológica Nacional
              </p>
            </div>
          </div>
        </div>

        {/* ── Panel de formulario ── */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          {/* Logo mobile */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <Landmark className="size-6 text-primary" strokeWidth={1.5} />
            <span className="text-lg font-extrabold tracking-tighter text-primary font-display">
              UTN FRLP
            </span>
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
                      <Input
                        type="password"
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
                {form.formState.isSubmitting
                  ? 'Creando cuenta...'
                  : 'Crear cuenta'}
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
      </div>
    </div>
  );
}
