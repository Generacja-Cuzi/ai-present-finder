# Fiszka Projektowa — AI Present Finder

1. Tytuł projektu

   AI Present Finder – Aplikacja webowa znajdująca dopasowane prezenty, wykorzystująca analizę mediów społecznościowych i konwersacyjną sztuczną inteligencję

2. Akronim

   AIPF

3. Zespół

Szymon Kowaliński, Bartosz Gotowski, Dawid Chudzicki, Marcin Dolatowski

4. Opiekun zespołu

   dr inż. Marcin Jodłowiec

⸻

5. Syntetyczny Opis Projektu

Aplikacja ma wspomóc dobieranie prezentów dla konkretnych osób, na przykład znajomych lub rodziny. Jej celem jest zredukowanie potrzebnego czasu, wymaganego na taki proces i jednocześnie ma umożliwić znalezienie lepszego i bardziej dopasowanego prezentu dla konkretnego obdarowanego.

Wiele ludzi ma problem z wymyślaniem spersonalizowanych prezentów i aplikacja ma za zadanie ich w tym procesie wspomóc, redukując stres, bolączki i frustrację wynikającą z braku pomysłów.

Główne funkcjonalności aplikacji obejmują:

Inteligentna analiza mediów społecznościowych
• Automatyczne zbieranie i analizowanie treści z wybranych platform społecznościowych
• Ekstrakcja kluczowych słów i tematów z postów, zdjęć i filmów
• Identyfikacja zainteresowań, hobby i preferencji osoby obdarowywanej

Konwersacyjny asystent AI
• Inteligentny chatbot prowadzący rozmowę
• Strukturyzowany wywiad
• Wykrywanie nieodpowiednich treści i flagowanie problematycznych próśb

Inteligentne rekomendacje prezentów
• Generowanie propozycji prezentów na podstawie zebranych danych
• Integracja z platformami e-commerce (OLX, Allegro, Amazon, eBay)
• Zwracanie konkretnych odnośników do ofert
• Filtrowanie i ranking rekomendacji

⸻

6. Technologie

Język programowania
• Typescript

Backend
• NestJS, Mikroserwisy, CQRS, Event-driven architecture
• Vercel AI SDK
• RabbitMQ
• REST
• PostgreSQL

Frontend
• ReactJS, Vite, TanStack Router, TanStack Query
• Tailwind CSS, Shadcn, Server-Sent Events (SSE)

DevOps
• Docker, Docker Compose, Coolify, Github Actions

Narzędzia
• Git, Github, Github Projects, Discord, Figma

Modelowanie
• UML, PlantUML, BPMN, C4

⸻

7. Roadmapa Projektu

1️⃣ Wstępne Planowanie
• Precyzowanie koncepcji
• Zarys planowanych funkcjonalności
• Wybór technologii
• Wstępny diagram BPMN
• Context model w modelu C4
• Diagram domenowy
• Wstępny podział na mikroserwisy
• Diagram sekwencji z przepływem eventów
• Utworzenie pierwszego backlogu

⸻

2️⃣ Iteracja Proof of Concept (POC)
• Ustawienie środowiska deweloperskiego
• Postawienie kolejki RabbitMQ
• Utworzenie templatek mikroserwisów
• Zakodowanie kontraktów komunikacji między mikroserwisami
• Implementacja POC chatu
• Implementacja POC stalking mikroserwisu
• Implementacja POC gift mikroserwisu
• Implementacja prostego UI
• Sporządzenie fiszki projektu i wstępnej dokumentacji
• Sporządzenie finalnych mockupów UI/UX MVP projektu
• Rozplanowanie nowego podziału na mikroserwisy
• Projekt bazy danych

⸻

3️⃣ Iteracja Minimal Viable Product (MVP)
• Restrukturyzacja architektury backendu
• Wdrożenie bazy danych
• Implementacja pełnego MVP frontendu
• Implementacja persystancji sesji chatu i wyszukiwań
• Implementacja wyszukiwań w wielu serwisach
• Implementacja filtrowania i rerankingu prezentów
• Dalsza praca nad dokumentacją
• Nowy diagram sekwencji
• Wdrożenie MVP aplikacji

⸻

4️⃣ Finalna iteracja
• Implementacja autoryzacji i uwierzytelniania
• Implementacja pełnej historii wyszukiwań
• Testowanie i poprawianie błędów
• Doskonalenie jakości wyników mikroserwisów
• Pełna dokumentacja techniczna
• Poster, abstract, prezentacja
• Pełne wdrożenie produkcyjne

⸻

8. Kluczowe Ryzyka

1. Ograniczenia API mediów społecznościowych
   • Wpływ: DUŻY
   • Szansa: DUŻA
   • Mitygacja: fallbacki, alternatywne źródła danych, monitorowanie API, rozbudowany wywiad

1. Ograniczenia platform e-commerce
   • Wpływ: DUŻY
   • Szansa: DUŻA
   • Mitygacja: integracja z innymi platformami lub sandbox

1. Jakość rekomendacji
   • Wpływ: ŚREDNI
   • Szansa: ŚREDNIA
   • Mitygacja: uczenie na podstawie feedbacku, A/B testing algorytmów
