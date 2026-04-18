import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User, UserRole } from './modules/users/entities/user.entity';
import { Alumno } from './modules/alumno/entities/alumno.entity';
import { Laboratorio } from './modules/laboratorio/entities/laboratorio.entity';
import { ResponsableLaboratorio } from './modules/responsable-laboratorio/entities/responsable-laboratorio.entity';
import { Skill } from './modules/skills/entities/skill.entity';
import { Proyecto } from './modules/proyectos/entities/proyecto.entity';
import { ProyectoEstado } from './modules/proyectos/enums/proyectos-estados.enum';
import { Postulacion } from './modules/postulaciones/entities/postulacion.entity';

dotenv.config();

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    User,
    Alumno,
    Laboratorio,
    ResponsableLaboratorio,
    Skill,
    Proyecto,
    Postulacion,
  ],
  synchronize: false,
});

async function seed() {
  await ds.initialize();
  console.log('Conectado a la base de datos.');

  // ── Skills ──────────────────────────────────────────────────────────────
  const skillRepo = ds.getRepository(Skill);
  const skillNames = [
    'Python',
    'MATLAB',
    'C++',
    'Java',
    'IoT',
    'ROS',
    'OpenCV',
    'SQL',
    'TensorFlow',
    'Geodesia',
  ];
  const skills: Skill[] = [];
  for (const nombre of skillNames) {
    let skill = await skillRepo.findOne({ where: { nombre } });
    if (!skill) {
      skill = skillRepo.create({
        nombre,
        esPredefinida: true,
        categoria: null,
        creadaPorAlumnoId: null,
      });
      skill = await skillRepo.save(skill);
    }
    skills.push(skill);
  }
  const byName = (n: string) => skills.find((s) => s.nombre === n)!;
  console.log(`Skills: ${skills.length} creadas/existentes.`);

  // ── Laboratorios ────────────────────────────────────────────────────────
  const labRepo = ds.getRepository(Laboratorio);
  const labsData = [
    {
      nombre: 'LIDIC',
      descripcion:
        'Laboratorio de Investigación y Desarrollo en Informática y Ciencias de la Computación',
      emailContacto: 'lidic@frlp.utn.edu.ar',
    },
    {
      nombre: 'LABEN',
      descripcion: 'Laboratorio de Ensayos y Materiales',
      emailContacto: 'laben@frlp.utn.edu.ar',
    },
    {
      nombre: 'Centro de Bioingeniería',
      descripcion:
        'Centro de investigación en sistemas biomédicos y robótica quirúrgica',
      emailContacto: 'bioingenieria@frlp.utn.edu.ar',
    },
    {
      nombre: 'Grupo de Geotecnia',
      descripcion:
        'Grupo de investigación en mecánica de suelos y geotecnia aplicada',
      emailContacto: null,
    },
  ];
  const labs: Laboratorio[] = [];
  for (const d of labsData) {
    let lab = await labRepo.findOne({ where: { nombre: d.nombre } });
    if (!lab) {
      lab = labRepo.create(d);
      lab = await labRepo.save(lab);
    }
    labs.push(lab);
  }
  const labByName = (n: string) => labs.find((l) => l.nombre === n)!;
  console.log(`Laboratorios: ${labs.length} creados/existentes.`);

  // ── Usuarios y perfiles ─────────────────────────────────────────────────
  const userRepo = ds.getRepository(User);
  const respRepo = ds.getRepository(ResponsableLaboratorio);
  const alumnoRepo = ds.getRepository(Alumno);
  const hashedPassword = await bcrypt.hash('password123', 10);

  const responsablesData = [
    {
      email: 'resp.lidic@frlp.utn.edu.ar',
      nombre: 'Carlos',
      apellido: 'Mendoza',
      lab: 'LIDIC',
    },
    {
      email: 'resp.laben@frlp.utn.edu.ar',
      nombre: 'Ana',
      apellido: 'Ferreyra',
      lab: 'LABEN',
    },
    {
      email: 'resp.bio@frlp.utn.edu.ar',
      nombre: 'Martín',
      apellido: 'Suárez',
      lab: 'Centro de Bioingeniería',
    },
    {
      email: 'resp.geo@frlp.utn.edu.ar',
      nombre: 'Laura',
      apellido: 'Vázquez',
      lab: 'Grupo de Geotecnia',
    },
  ];
  for (const d of responsablesData) {
    let user = await userRepo.findOne({ where: { email: d.email } });
    if (!user) {
      user = userRepo.create({
        email: d.email,
        password: hashedPassword,
        rol: UserRole.RESPONSABLE_LABORATORIO,
      });
      user = await userRepo.save(user);
      const resp = respRepo.create({
        usuario: user,
        nombre: d.nombre,
        apellido: d.apellido,
        laboratorio: labByName(d.lab),
      });
      await respRepo.save(resp);
    }
  }
  console.log('Responsables de laboratorio creados/existentes.');

  // Alumno de prueba
  const alumnoEmail = 'alumno@frlp.utn.edu.ar';
  let alumnoUser = await userRepo.findOne({ where: { email: alumnoEmail } });
  if (!alumnoUser) {
    alumnoUser = userRepo.create({
      email: alumnoEmail,
      password: hashedPassword,
      rol: UserRole.ALUMNO,
    });
    alumnoUser = await userRepo.save(alumnoUser);
    const alumno = alumnoRepo.create({
      usuario: alumnoUser,
      legajo: 'UTN-001',
      nombre: 'Juan',
      apellido: 'García',
      anioEnCurso: 3,
      bio: null,
      cvUrl: null,
      cvArchivoPath: null,
      skills: [byName('Python'), byName('Java')],
    });
    await alumnoRepo.save(alumno);
  }
  console.log('Alumno de prueba creado/existente.');

  // ── Proyectos ───────────────────────────────────────────────────────────
  const proyectoRepo = ds.getRepository(Proyecto);
  const proyectosData = [
    {
      titulo: 'Sistema de Recomendación con Machine Learning',
      descripcion:
        'Desarrollo de un motor de sugerencias para conectar alumnos con proyectos de laboratorio usando técnicas de ML y análisis de habilidades.',
      laboratorio: 'LIDIC',
      skills: ['Python', 'TensorFlow', 'SQL'],
    },
    {
      titulo: 'Plataforma IoT para Monitoreo Ambiental',
      descripcion:
        'Diseño e implementación de una red de sensores distribuidos para monitoreo de temperatura, humedad y calidad del aire en tiempo real.',
      laboratorio: 'LIDIC',
      skills: ['Python', 'IoT', 'SQL'],
    },
    {
      titulo: 'Sensores de Fibra Óptica en Estructuras Civiles',
      descripcion:
        'Monitoreo estructural en tiempo real usando redes de sensores distribuidos de baja potencia para detectar deformaciones y estrés.',
      laboratorio: 'LABEN',
      skills: ['MATLAB', 'IoT'],
    },
    {
      titulo: 'Análisis de Fatiga en Materiales Compuestos',
      descripcion:
        'Estudio experimental y computacional del comportamiento a fatiga de materiales compuestos usados en estructuras aeronáuticas.',
      laboratorio: 'LABEN',
      skills: ['MATLAB', 'Python'],
    },
    {
      titulo: 'Control Automático de Brazo Robótico Quirúrgico',
      descripcion:
        'Diseño de controladores PID y fuzzy para manipuladores con restricciones de seguridad crítica en entornos biomédicos.',
      laboratorio: 'Centro de Bioingeniería',
      skills: ['C++', 'ROS', 'OpenCV'],
    },
    {
      titulo: 'Procesamiento de Imágenes Médicas con IA',
      descripcion:
        'Segmentación automática de tumores en imágenes de resonancia magnética usando redes neuronales convolucionales.',
      laboratorio: 'Centro de Bioingeniería',
      skills: ['Python', 'TensorFlow', 'OpenCV'],
    },
    {
      titulo: 'Análisis de Estabilidad en Taludes Críticos',
      descripcion:
        'Modelado geotécnico con métodos numéricos para evaluar riesgo de falla en taludes naturales y artificiales.',
      laboratorio: 'Grupo de Geotecnia',
      skills: ['Python', 'Geodesia', 'MATLAB'],
    },
  ];

  for (const d of proyectosData) {
    const existing = await proyectoRepo.findOne({
      where: { titulo: d.titulo },
    });
    if (!existing) {
      const proyecto = proyectoRepo.create({
        titulo: d.titulo,
        descripcion: d.descripcion,
        estado: ProyectoEstado.ACTIVO,
        laboratorio: labByName(d.laboratorio),
        skills: d.skills.map(byName),
      });
      await proyectoRepo.save(proyecto);
    }
  }
  console.log('Proyectos creados/existentes.');

  await ds.destroy();
  console.log('\n✓ Seed completado.');
  console.log('\nCredenciales de prueba:');
  console.log('  Alumno:       alumno@frlp.utn.edu.ar / password123');
  console.log('  Responsable:  resp.lidic@frlp.utn.edu.ar / password123');
}

seed().catch((err) => {
  console.error('Error en el seed:', err);
  process.exit(1);
});
