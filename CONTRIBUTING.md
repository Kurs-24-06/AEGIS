# Contributing to AEGIS

First off, thank you for considering contributing to AEGIS! It's people like you that make AEGIS such a great tool. We welcome contributions from everyone, whether it's a bug report, feature suggestion, documentation improvement, or code contribution.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Issues](#issues)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [AEGIS@CoC.com](mailto:merlin.hellbach@icloud.com).

## Getting Started

### Issues

- **Bug Reports**: When reporting a bug, please include as much detail as possible:
  - Steps to reproduce the issue
  - Expected behavior
  - Actual behavior
  - Screenshots or error messages
  - Environment details (OS, browser, etc.)

- **Feature Requests**: For feature requests, please explain:
  - What problem the feature would solve
  - How it would benefit the AEGIS project
  - Any implementation ideas you might have

- **Security Issues**: For security issues, please do NOT open a GitHub issue. Email [security@example.com](mailto:security@example.com) directly.

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass (`make test`)
6. Commit your changes (see [Commit Guidelines](#commit-guidelines))
7. Push to your branch (`git push origin feature/your-feature-name`)
8. Open a Pull Request

Please make sure your PR:
- Has a clear title and description
- Links to any relevant issues
- Includes tests for new functionality
- Updates documentation as needed

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/wastedminds1/aegis.git
   cd aegis
   ```

2. Install dependencies:
   ```bash
   make setup
   ```

3. Start the development environment:
   ```bash
   make dev
   ```

## Coding Standards

### General

- Keep code clean, readable, and maintainable
- Follow the principle of least surprise
- Write self-documenting code with clear variable and function names
- Keep functions small and focused on a single task

### Frontend (Angular)

- Follow the [Angular Style Guide](https://angular.io/guide/styleguide)
- Structure components using smart/presentational component pattern
- Use NgRx for state management following recommended practices
- Ensure components are properly typed with TypeScript

### Backend (Golang)

- Follow [Effective Go](https://golang.org/doc/effective_go) guidelines
- Use `gofmt` for code formatting
- Ensure packages are properly documented
- Follow standard Go project layout

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types include:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding missing tests
- `chore`: Changes to build process or auxiliary tools

Examples:
```
feat(simulation): add new attack scenario for SQL injection
fix(frontend): correct visualization of attack paths
docs(api): update authentication documentation
```

## Testing

- Write tests for all new features and bug fixes
- Ensure all tests pass before submitting a PR
- Frontend: Use Karma and Jasmine for unit tests, Cypress for E2E tests
- Backend: Use Go's built-in testing package
- Aim for high test coverage, especially for critical functionality

To run tests:
```bash
# Run all tests
make test

# Run frontend tests only
make test-frontend

# Run backend tests only
make test-backend

# Run E2E tests
make test-e2e
```

## Documentation

- Update documentation for any changes to APIs, components, or workflows
- Document complex algorithms or business rules with comments
- Ensure README and other markdown files are kept up to date
- Use JSDoc/GoDoc style comments for public APIs

## Community

- Join our [Discord server](https://discord.gg/example) for discussions
- Participate in issue discussions
- Help review pull requests
- Share your experience using AEGIS

## Recognition

Contributors will be acknowledged in our [CONTRIBUTORS.md](CONTRIBUTORS.md) file. We appreciate all forms of contribution, from code to documentation to community support!

---

Thank you for contributing to AEGIS!
