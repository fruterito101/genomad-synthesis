# 🤝 Contributing to Genomad

¡Gracias por tu interés en contribuir a Genomad!

## 🚀 Quick Start

```bash
# Fork y clone
git clone https://github.com/TU-USERNAME/genomad.git
cd genomad

# Instalar dependencias
bun install

# Configurar ambiente
cp .env.example .env.local
# Editar .env.local con tus valores

# Iniciar desarrollo
bun run dev
```

## 📋 Workflow

### 1. Crear Branch

```bash
git checkout -b feature/mi-feature
# o
git checkout -b fix/mi-bugfix
```

### 2. Hacer Cambios

- Seguir las convenciones de código existentes
- Agregar tests si es necesario
- Actualizar documentación si aplica

### 3. Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new breeding algorithm"
git commit -m "fix: resolve wallet connection issue"
git commit -m "docs: update API documentation"
```

**Tipos:**
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Solo documentación
- `style:` Cambios de formato (no afectan lógica)
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

### 4. Push y PR

```bash
git push origin feature/mi-feature
```

Luego abre un Pull Request en GitHub.

## 🧪 Testing

```bash
# Correr todos los tests
bun run test

# Tests con watch mode
bun run test:watch

# E2E tests
bun run test:e2e

# Coverage
bun run test:coverage
```

## 📁 Estructura del Proyecto

```
src/
├── app/           # Pages y API routes
├── components/    # React components
├── lib/           # Core libraries
├── hooks/         # React hooks
└── e2e/           # E2E tests

contracts/         # Solidity contracts
docs/              # Documentación adicional
```

## 🎨 Code Style

- **TypeScript** para todo el código
- **ESLint** para linting
- **Prettier** para formateo (implícito en ESLint config)

## 🔒 Seguridad

Si encuentras una vulnerabilidad de seguridad, por favor:

1. **NO** abras un issue público
2. Envía un email a security@genomad.xyz
3. Espera confirmación antes de divulgar

## 💬 Preguntas

- Abre un [Discussion](https://github.com/fruterito101/genomad/discussions)
- O contacta al equipo en Discord

---

¡Gracias por contribuir! 🧬
