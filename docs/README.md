# AI Present Finder Documentation

This directory contains various documentation for the AI Present Finder system.

## 📐 Architecture Documentation

### C4 Diagrams

C4 architecture diagrams document the system structure at different levels of detail.

**Latest Version: [C4_v0.1.0](./C4_v0.1.0/)** ⭐

- **Context Diagram** - System boundary, users, and external systems
- **Container Diagram** - Services, message broker, and communication patterns
- **Component Diagrams** - Internal structure of each microservice

[View C4 v0.1.0 Documentation →](./C4_v0.1.0/README.md)

**Previous Versions:**

- [C4_v0.0.1](./C4_v0.0.1/) - Initial architecture (outdated)

## 📊 Other Documentation

- **BPMN/** - Business Process Model and Notation diagrams
- **class_diagram/** - Class diagrams
- **designs/** - Design artifacts
- **documentation/** - Additional documentation
- **project_premise/** - Project requirements and premises
- **sequence_diagram/** - Sequence diagrams

## 🔄 Keeping Documentation Updated

When making significant architectural changes:

1. Update the relevant C4 diagrams in the latest version directory
2. Regenerate PNG images: `java -jar plantuml.jar *.puml`
3. Update the README and CHANGELOG in the version directory
4. Consider creating a new version directory for major changes

## 🛠️ Tools

- **PlantUML** - For rendering C4 diagrams
- **Graphviz** - Required by PlantUML for graph layout
- **VS Code PlantUML Extension** - For live preview and export

See [C4_v0.1.0/README.md](./C4_v0.1.0/README.md) for detailed setup instructions.
