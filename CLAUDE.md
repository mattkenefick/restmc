# RestMC Development Guidelines

## Build/Run/Test Commands
- Build: `npm run build`
- Watch: `npm run watch`
- Run all tests: `npm run test`
- Run specific test: `ts-mocha -p tsconfig.json test/unit/ModelName.spec.ts`

## Code Style
- **Formatting**: Use Prettier with 4-space tabs, single quotes, 120 char width
- **Naming**: PascalCase for classes, camelCase for methods/properties
- **Types**: Use explicit types/interfaces (prefixed with 'I')
- **Interfaces**: Define in Interfaces.ts when shared across files
- **Imports**: Group imports by origin, use full paths with extensions
- **Structure**: Properties first, constructor, public methods, then private
- **Documentation**: JSDoc style for classes and methods
- **Events**: Use event-based architecture with before/after hooks
- **Error Handling**: Console warnings over exceptions
- **Relationships**: Use hasOne/hasMany patterns with caching
- **Asynchronous**: Promise-based with async/await

## Testing
- Test files should mirror source structure
- Use chai's expect for assertions
- Mock server responses in test/mock/server/