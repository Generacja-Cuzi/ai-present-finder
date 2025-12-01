# nowe todo

1. [x] przepisz wstęp żeby brzmiał mniej jak AI
2. [ ] Analiza konkurencji, Prace związane z tematem - zrobić rzeczywiście sensowne porównanie

# TODO: Jak przekształcić raport w „state of the art” paper

## 1) Reframe i nowość

- [x] Jasno zdefiniować contribution w 3 punktach (np. multi-source + chat + reranking z uzasadnieniem; realtime SSE; procedura ewaluacji human-in-the-loop).
- [ ] Usunąć/skrótowo zepchnąć implementacyjne detale stacku do aneksu; w sekcji metoda podać tylko elementy niezbędne do replikacji pipeline’u.
- [ ] Dodać jedną mocną figurę pipeline’u (architektura + przepływ sygnałów + reranking feedback loop).

## 2) Related work na poziomie SOTA

- [x] Zastąpić tabelę „DreamGift/Giftruly...” przeglądem faktycznych metod (LLM reranking, conversational recommenders, multi-source scraping) z cytowaniami.
- [x] Podkreślić różnice vs. istniejące prace: użycie social-data OSINT + live fetch + uzasadnienia AI + SSE.

## 3) Dane i metryki

- [x] Opisać zbiór danych (liczba sesji, liczba listingów, profil odbiorców, ograniczenia) i źródła stronniczości (dominacja OLX).
- [x] Ustalić i zdefiniować metryki: czas do 1. wyniku, MRR/NDCG po rerankingu, diversity, coverage, satysfakcja, trafność TOP-k.
- [x] Podać przedziały ufności dla kluczowych liczb; zaznaczyć małą próbę i plan na powiększenie.

## 4) Eksperymenty i ablacjе

- [ ] Porównać z baseline’ami: (a) brak rerankingu, (b) single-source (OLX-only), (c) single LLM vs. lightweight model.
- [ ] Ablacje progów rerankingu (cutoff 4/5/6/7) i wpływ na MRR/coverage/czas.
- [ ] Analiza wrażliwości na budżet i na liczbę pytań w wywiadzie (czy 6 pytań vs 12 zmienia trafność).
- [ ] Pokaż wpływ opóźnień providerów na TTFB i końcowy czas; wykres latency breakdown.

## 5) Badanie użytkowników

- [x] Zaprojektować formalną ewaluację z min. 30–50 uczestnikami, jasno opisać protokół, ankiety, kryteria włączenia.
- [x] Raportować satysfakcję + trafność + zaufanie do uzasadnień AI; zebrać przykłady pozytywne i negatywne.
- [x] Ująć ograniczenia (mała próba, jedno źródło, brak kontroli nad API) i plany replikacji.

## 6) Transparentność i prywatność

- [x] Dodać sekcję o zgodności z RODO: podstawa prawna, retencja, mechanizm usuwania danych, informacja w UI.
- [x] Wyjaśnić, które dane są publiczne, jakie są limity profilowania, i jak użytkownik może wycofać zgodę.

## 7) Prezentacja wyników

- [ ] Wyciąć ściany tabel (transkrypcja, PM2, koszty) do aneksu; w głównym tekście tylko kluczowe liczby i 1–2 ilustracje.
- [ ] Wstawić wykresy: (a) MRR/NDCG vs. progi rerankingu, (b) czas do pierwszego wyniku vs. źródło, (c) diversity/coverage.
- [ ] Zastąpić Top-10 z OLX zbiorem mieszanym lub pokazać wprost bias w osobnej figurze.

## 8) Styl i struktura

- [x] Abstrakt: 120–150 słów, problem–metoda–wyniki (z liczbami)–wniosek, bez listy technologii.
- [x] Wstęp: 2–3 liczby motywacyjne, a nie lista procentów; jasne pytania badawcze.
- [x] Metoda: krótko, bez implementacyjnego “SSE + PM2”; z naciskiem na decyzje projektowe i ograniczenia.
- [x] Wnioski: syntetyzują wyniki vs. cele, nie recyklują statystyk rynkowych.

## 9) Replikowalność

- [x] Opisać konfigurację modeli (wersje, temperatury, limity tokenów) i prompt do rerankingu w aneksie.
- [ ] Dostarczyć skrypt do odtworzenia eksperymentów offline (syntetyczny log + reranking).
- [x] Wylistować wymagane zasoby obliczeniowe i koszty, ale w dodatku.

## 10) Checklist wdrożenia zmian

- [ ] Skrócić główny tekst do 6–7 stron przez przeniesienie tabel/longtable do aneksu.
- [ ] Dodać nowe wykresy (latency, MRR/NDCG, diversity).
- [ ] Dopracować bibliography: dodać prace o conversational recommenders, LLM reranking, SSE/streaming UX.
- [ ] Przejść korektę językową i usunąć kolokwializmy; zachować ton akademicki.

## 11) Integracja researchu (do wplecenia do main.tex)

- [x] Related work: w sekcji „Prace związane” skrót o CRS/LLM (ChatGPT user study, CARE hybryda, reranking różnorodności).
- [x] Metodyka/ablacje: opis baseline’ów i cutoffów MRR/NDCG/coverage/diversity w planie ewaluacji.
- [ ] User study: opisać plan badania 30–50 uczestników z satysfakcją/trafnością, CI; oprzeć się na „ChatGPT as CRS” + protokół z pliku „Protokoły badań...”.
- [x] Streaming UX: akapit o wpływie SSE na postrzeganie latencji (cel TTFB < 5 s).
- [x] RODO: sekcja Etyka z podstawą prawną, LIA/DPIA, retencją, opt-out, Model Card.
- [ ] Replikowalność: w aneksie/metodyce podać konfigurację modeli (temperatura, max tokens, wersje, hardware) zgodnie z plikiem „Raportowanie konfiguracji modeli LLM”.
