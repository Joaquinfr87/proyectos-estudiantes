<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Joaquinfr87/proyectos-estudiantes/main/public/og-image.png">
  <img src="https://raw.githubusercontent.com/Joaquinfr87/proyectos-estudiantes/main/public/og-image.png" alt="ProyectosUPDS Banner" width="100%">
</picture>

# ProyectosUPDS

Plataforma para que estudiantes de la **UPDS** (Universidad Privada Domingo Savio) compartan sus proyectos web con la comunidad.

Creada por [Joaquin Felipez Rojas](https://github.com/Joaquinfr87) para la materia de **Programación IV**.

---

## ✨ Funcionalidades

- Registro e inicio de sesión con email y contraseña
- Publicar proyectos con descripción, imágenes, stack tecnológico y enlaces (GitHub + demo)
- Catálogo de proyectos con búsqueda, filtros por tecnología/autor y paginación
- Perfiles de usuario públicos con avatar y lista de proyectos
- Dashboard personal para gestionar tus proyectos (CRUD completo)
- Carga de imágenes para proyectos y avatar
- Diseño responsive con modo oscuro

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnologías |
|-----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Lenguaje** | TypeScript, React 19 |
| **Estilos** | Tailwind CSS v4, shadcn/ui |
| **Iconos** | Lucide React |
| **Autenticación** | Supabase Auth |
| **Base de datos** | Supabase (PostgreSQL + RLS) |
| **Almacenamiento** | Supabase Storage |
| **Notificaciones** | Sonner |
| **Paquete** | pnpm |

---

## 🚀 Empezar

### Requisitos

- Node.js 20+
- pnpm
- Cuenta en [Supabase](https://supabase.com)

### Instalación

```bash
git clone https://github.com/Joaquinfr87/proyectos-estudiantes.git
cd proyectos-estudiantes
pnpm install
```

### Configuración

1. Crea un archivo `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu-key-anon-publica
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> `NEXT_PUBLIC_SITE_URL` es importante para las redes sociales — se usa en las etiquetas OG (Open Graph) para que la vista previa de los enlaces muestre la imagen correcta. En producción debe apuntar a tu dominio real.

2. Ejecuta el schema SQL (`supabase/schema.sql`) en tu proyecto de Supabase.

3. Inicia el servidor de desarrollo:

```bash
pnpm dev
```

### Scripts disponibles

| Comando | Descripción |
|---------|------------|
| `pnpm dev` | Inicia servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Inicia servidor de producción |
| `pnpm lint` | Ejecuta ESLint |

---

## 📁 Estructura del proyecto

```
├── app/                  # App Router (páginas y layouts)
│   ├── dashboard/        # Dashboard del usuario
│   ├── login/            # Inicio de sesión
│   ├── profile/          # Perfil propio y público
│   ├── projects/         # Catálogo, detalle, crear/editar
│   └── register/         # Registro
├── components/           # Componentes reutilizables
│   ├── ui/               # Componentes shadcn/ui
│   └── ...               # Componentes de la app
├── lib/                  # Utilidades, types, server actions
│   ├── actions/          # Server actions (auth, profile, projects)
│   └── supabase/         # Clientes de Supabase
├── public/               # Assets estáticos
│   └── favicons/         # Favicons multi-tamaño
└── supabase/             # Schema SQL y rollback
```

---

## 🗄️ Base de datos (Supabase)

### Tablas

- **profiles** — información de usuarios (id, full_name, avatar_url, github_username, bio)
- **projects** — proyectos publicados (title, description, github_url, live_url, tech_stack, image_urls)

RLS habilitado: los proyectos y perfiles son visibles para todos, pero solo el dueño puede editar/eliminar.

---

## 📄 Licencia

Este proyecto es de uso educativo para la materia de Programación IV — UPDS.
