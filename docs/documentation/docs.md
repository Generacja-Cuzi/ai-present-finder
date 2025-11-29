Politechnika Wrocławska

Wydział Informatyki i Telekomunikacji
Kierunek: IST

ZESPOŁOWE PRZEDSIĘWZIĘCIE INFORMATYCZNE

Ai Present Finder

Dawid Chudzicki
Marcin Dolatowski
Bartosz Gotowski
Szymon Kowaliński

Opiekun pracy: dr inż. Marcin Jodłowiec

Słowa kluczowe: prezenty, propozycje, wyszukiwanie, sztuczna inteligencja

WROCŁAW 2025

⸻

Spis treści
• DOKUMENTACJA PROJEKTOWA
• 1. Wykaz symboli, oznaczeń i akronimów (opcja)
• 2. Cel i zakres przedsięwzięcia
• interfejs webowy do wprowadzania linków do publicznych profili społecznościowych i prowadzenia chatu z użytkownikiem
• 3. Słownik pojęć (opcja)
• 4. Stan wiedzy w obszarze przedsięwzięcia (opcja)
• 5. Założenia wstępne
• 7. Projekt produktu programowego
• 8. Implementacja (opcja)
• 9. Wyniki i analiza badań / Demonstracja produktu programowego (w zależności od typu projektu)

⸻

DOKUMENTACJA PROJEKTOWA

1. Wykaz symboli, oznaczeń i akronimów (opcja)

Skrót / symbol Pełna nazwa Opis / znaczenie w projekcie
AI Artificial Intelligence (Sztuczna inteligencja) Ogólne określenie technologii wykorzystującej algorytmy uczenia maszynowego i modele językowe do analizy danych i generowania rekomendacji.
API Application Programming Interface Interfejs programistyczny umożliwiający komunikację między systemem a zewnętrznymi usługami (np. media społecznościowe, sklepy internetowe, OpenAI).
UI User Interface Warstwa interfejsu użytkownika – część aplikacji prezentująca dane i umożliwiająca interakcję.
UX User Experience Ogólne doświadczenie użytkownika w kontakcie z aplikacją (użyteczność, prostota, intuicyjność).
VPS Virtual Private Server Wirtualny serwer prywatny, na którym hostowana jest aplikacja.

⸻

2. Cel i zakres przedsięwzięcia

Wprowadzenie

Celem projektu jest opracowanie aplikacji webowej do proponowania spersonalizowanych prezentów dla osób na podstawie podanych linków do ich mediów społecznościowych, a także podanych zainteresowań i cech podczas wywiadu z chatbotem.
Na podstawie danych system generuje przykładowe propozycje prezentów, aby następnie wyszukać je w zintegrowanych serwisach sklepowych i zwrócić linki do ofert użytkownikowi.

Cel główny

Stworzyć użyteczne, szybkie i bezpieczne narzędzie wspierające proces znajdowania prezentu poprzez:
• automatyczne wydobycie i analizę cech osoby na podstawie mediów społecznościowych
• interaktywny chat z agentem AI w celu zebrania dodatkowych informacji
• generowanie trafnych propozycji prezentów na podstawie uzyskanych danych
• proponowanie ofert produktów ze sklepów internetowych

Zakres — co jest w projekcie
• interfejs webowy do wprowadzania linków do publicznych profili społecznościowych i prowadzenia chatu z użytkownikiem
• moduł parsowania i ekstrakcji jedynie publicznych, jawnych danych z podanych profili
• generowanie propozycji prezentów dla wybranej osoby
• propozycja ofert prezentów ze sklepów internetowych
• filtry wyników np. po cenie, kategorii

Zakres — co nie jest w projekcie
• automatyczne dokonywanie zakupów ani płatności
• zbieranie prywatnych danych wymagających logowania
• integracja OAuth z zewnętrznymi kontami
• generowanie treści graficznych produktów

⸻

3. Słownik pojęć (opcja)

Pojęcie Opis / Definicja
AI Present Finder Nazwa projektu — aplikacja webowa wykorzystująca sztuczną inteligencję do proponowania spersonalizowanych prezentów na podstawie danych z mediów społecznościowych i rozmowy z użytkownikiem.
Użytkownik Osoba korzystająca z aplikacji w celu znalezienia pomysłu na prezent dla innej osoby.
Osoba obdarowywana Profil tej osoby jest analizowany przez system.
Chatbot / Agent AI LLM prowadzący rozmowę z użytkownikiem, zadający pytania o preferencje, okazję i budżet.
API Interfejs umożliwiający komunikację między aplikacjami.
Profil społecznościowy Publicznie dostępna strona użytkownika.
Ekstrakcja danych Pobieranie i analiza publicznych informacji z profili.
Propozycja prezentu Sugerowany pomysł na prezent.
Propozycja oferty produktu Link do oferty produktu z internetowego sklepu.
Filtrowanie wyników Zawężanie rekomendacji według preferencji.
Frontend Warstwa interfejsu użytkownika.
Backend Logika serwera — integracje API, przetwarzanie danych.
Dane publiczne Ogólnodostępne informacje w Internecie.

⸻

4. Stan wiedzy w obszarze przedsięwzięcia (opcja)

Analiza konkurencyjnych rozwiązań:
• <https://dreamgift.ai/>
• <https://giftassistant.io/>
• <https://giftruly.com/>
• <https://www.intelli.gift>

Rozwiązanie Źródła danych Interakcja Dokładność Integracja e-commerce
AI Present Finder Media społecznościowe + chatbot Szczegółowy wywiad (ok. 20 pytań) Wysoka OLX, Amazon, eBay, Allegro Sandbox
DreamGift Tylko rozmowa ok. 6 pytań Niska/ogólna Amazon
GiftAssistant 3 pola tekstowe brak konwersacji Niska (4 propozycje) Amazon
Giftruly formularz kilka pól wyboru bardzo podstawowe (3 propozycje) Amazon
IntelliGift kilka pól tekstowych szerokie, nieprecyzyjne dane średnia (ok. 10 propozycji) Amazon

⸻

5. Założenia wstępne

Założenia technologiczne
• Frontend: React
• Backend: NestJS
• Baza danych: PostgreSQL
• Integracje:
• API social media
• API e-commerce: OLX, Amazon, eBay, Allegro Sandbox
• OpenAI API
• Hosting: VPS, HTTPS

Założenia projektowe
• przetwarzane są tylko dane publiczne
• brak płatności i transakcji
• dane nie są przechowywane po sesji
• projekt ma charakter edukacyjno-prototypowy

⸻

6. Specyfikacja wymagań

Wymagania funkcjonalne
• możliwość podania linków do profili społecznościowych
• pobranie publicznych danych z profili
• konwersacja z chatbotem
• analiza połączonych danych
• generowanie 5–10 propozycji prezentów
• pobieranie ofert produktów
• filtrowanie i sortowanie wyników
• brak trwałego przechowywania danych

Wymagania niefunkcjonalne
• działa w przeglądarce bez instalacji
• czas generowania: maks. 10 s
• komunikacja HTTPS
• rozszerzalna architektura
• obsługa popularnych przeglądarek
• obsługa błędów API

⸻

7. Projekt produktu programowego

Architektura
• backend = mikroserwisy + RabbitMQ
• komunikacja frontend ↔ backend = REST API
• aktualizacje dla użytkownika = SSE (Server-Sent Events)

Wzorce projektowe
• Asynchronous Request-Reply
• CQRS
• Event-driven architecture
• Strategy
• Dependency Injection
• Adapter
• DTO

(Planowane: Diagram C4, BPMN, model bazy danych)

⸻

8. Implementacja (opcja)

Opis nietrywialnych elementów algorytmicznych — do uzupełnienia.

⸻

9. Wyniki i analiza badań / Demonstracja produktu programowego

Opis realizacji typowych zadań — do uzupełnienia.
