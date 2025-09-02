# C4 Architecture Diagrams

Projekt zawiera diagramy architektury systemu w notacji **C4**, renderowane przy pomocy **PlantUML** i biblioteki **C4-PlantUML**.

---

## 📦 Wymagania

- **Java 8+** – wymagane do uruchomienia PlantUML
- **Graphviz** – do renderowania grafów
  - Linux: `sudo apt install graphviz`
  - macOS: `brew install graphviz`
  - Windows: pobierz z [graphviz.org/download](https://graphviz.org/download/) i dodaj do zmiennej PATH
- **Visual Studio Code** z rozszerzeniem [PlantUML (jebbs.plantuml)](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)

Opcjonalnie:

- **PlantUML** – pobierz plik `plantuml.jar` z [plantuml.com/download](https://plantuml.com/download)

---

## 🚀 Generowanie diagramów

Plik diagramu to `diagram.puml`.

### 1. Renderowanie z użyciem VS Code

1. Otwórz projekt w **Visual Studio Code**.
2. Zainstaluj rozszerzenie **PlantUML**.
3. Upewnij się, że Graphviz jest zainstalowany w systemie.
4. Otwórz plik `diagram.puml` i wciśnij `Alt+D`, aby wyświetlić podgląd diagramu.
5. Możesz także kliknąć prawym przyciskiem na plik i wybrać **PlantUML: Export Current Diagram** → PNG / SVG.

---

### 2. Renderowanie z linii poleceń

```bash
# Generowanie PNG
java -jar plantuml.jar diagram.puml

# Generowanie SVG
java -jar plantuml.jar -tsvg diagram.puml
```
