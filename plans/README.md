# Accelerate – responzivní menu: poznatky a návrh

Dokumentace k analýze a konzervativní opravě responzivního menu WordPress šablony Accelerate.
Cílem není přepis šablony, ale cílené odstranění dvojího tapu u položek s podmenu a souvisejících
problémů na mobilu a tabletu.

## Stav dokumentace

- Fáze: **implementováno, čeká ruční testování na serveru**
- Datum: 2026-11-16
- Verze: **9.6.0** – sloučení upstream Accelerate 1.6.0 při zachování
  vlastní responzivní navigace; nálezy a opravy viz
  [13-verifikace-9.6.0.md](13-verifikace-9.6.0.md)
- Rozsah: `header.php`, `js/navigation.js`, `style.css`, `rtl.css`,
  `functions.php`, `inc/functions.php`, `readme.txt`, `languages/accelerate.pot`
- Poslední úprava: barvy, ukotvení a omezení chipu na mobil do 767 px podle
  [08-chip-f69581-a-poloha.md](08-chip-f69581-a-poloha.md), nechipové chování
  nad 767 px, značky a rámování podle
  [09-nechipove-chovani-znacky-a-ramovani.md](09-nechipove-chovani-znacky-a-ramovani.md)
  a šipka od 768 px s flipem podmenu podle
  [10-sipka-od-768-a-flip-podmenu.md](10-sipka-od-768-a-flip-podmenu.md),
  mění se `style.css` a `js/navigation.js`
- Dokumentace bez zásahu do kódu: varování FontAwesome `glyf` bbox ve WOFF2
  vysvětluje [11-fontawesome-woff2-glyf-bbox.md](11-fontawesome-woff2-glyf-bbox.md);
  jde o neškodné varování Firefoxu, varianta A – ignorovat.
- Dokumentace bez zásahu do kódu: `[Violation] Added non-passive event listener`
  u `touchstart` na slideru vysvětluje
  [12-non-passive-touchstart.md](12-non-passive-touchstart.md); jde o výkonnostní
  hint Chromu z Cycle2 swipe pluginu, varianta A – ignorovat.
- Mimo rozsah: přepis šablony, změna HTML struktury celého webu, výměna jQuery, redesign hlavičky
- Balíček pro server a seznam změn: [06-implementovane-zmeny.md](06-implementovane-zmeny.md)

## Struktura dokumentů

| Dokument | Účel |
| --- | --- |
| [01-analyza-soucasneho-stavu.md](01-analyza-soucasneho-stavu.md) | Zmapování aktuálního chování menu, nálezy s odkazy na řádky, root cause dvojího tapu |
| [02-navrh-reseni.md](02-navrh-reseni.md) | Porovnání variant, doporučené řešení, konkrétní změny po souborech, rizika |
| [03-testovaci-plan.md](03-testovaci-plan.md) | Testovací matice zařízení, scénáře, akceptační kritéria |
| [04-implementacni-postup.md](04-implementacni-postup.md) | Pořadí prací pro code mode, rozdělení změn, kontrola regresí |
| [05-manualni-testovani.md](05-manualni-testovani.md) | Ruční nasazení na server, test ve Firefoxu a Edge s DevTools, iPhone a iPad, rollback |
| [06-implementovane-zmeny.md](06-implementovane-zmeny.md) | Seznam změněných souborů k nahrání, popis implementace, ověření a rollback |
| [07-vyraznejsi-sipky.md](07-vyraznejsi-sipky.md) | Návrh výraznějšího chipu pro šipky podmenu, tap target 44 px, RTL a testování |
| [08-chip-f69581-a-poloha.md](08-chip-f69581-a-poloha.md) | Barva chipu `#F69581`, bílé/plné pozadí podle stavu a ukotvení chipu k položce na mobilu |
| [09-nechipove-chovani-znacky-a-ramovani.md](09-nechipove-chovani-znacky-a-ramovani.md) | Nechipové chování nad 767 px, značky vnořených podpoložek `#F69581` a jemné rámování podmenu |
| [10-sipka-od-768-a-flip-podmenu.md](10-sipka-od-768-a-flip-podmenu.md) | Šipka vnořených položek už od 768 px a překlopení podmenu u pravého okraje |
| [11-fontawesome-woff2-glyf-bbox.md](11-fontawesome-woff2-glyf-bbox.md) | Vysvětlení varování `glyf: Glyph bbox was incorrect` u FontAwesome 4.7.0 a rozhodnutí jej neopravovat |
| [12-non-passive-touchstart.md](12-non-passive-touchstart.md) | Vysvětlení `[Violation] Added non-passive event listener` u `touchstart` na slideru a rozhodnutí jej neopravovat |
| [13-verifikace-9.6.0.md](13-verifikace-9.6.0.md) | Ověření sloučení upstream 1.6.0, nálezy, opravy a testovací checklist pro verzi 9.6.0 |

## Shrnutí problému

Hamburger menu na mobilu přepíná třídy `main-navigation` / `main-small-navigation`
v [`js/navigation.js`](../js/navigation.js:32). Současně existují **dva nezávislé mechanismy**
otevírání podmenu:

1. `touchstart` handler, který na první tap volá `preventDefault()` a přidá třídu `focus`
   ([`js/navigation.js`](../js/navigation.js:86)),
2. klik na injektovaný `span.sub-toggle`, který volá `slideToggle`
   ([`js/navigation.js`](../js/navigation.js:71)).

Ve sbaleném mobilním menu první mechanismus nic nezobrazí, protože jeho CSS je vázané na
`.main-navigation`, ale kontejner má po rozbalení třídu `main-small-navigation`
([`style.css`](../style.css:974)). První tap se tedy „spotřebuje" a navigace proběhne až tapem
druhým. To je přesně popsaný symptom.

## Doporučení v jedné větě

Zachovat stávající markup i breakpointy, ale **zrušit `preventDefault` na tapu odkazu**,
zavést jeden delegovaný `click` handler nad jediným ovládacím prvkem podmenu (button s `aria-expanded`),
CSS sjednotit pro `main-navigation` i `main-small-navigation` a po načtení stránky
**automaticky rozbalit aktivní větev** podle WordPress tříd, aby obsah i podmenu byly
dostupné bez dvojkliku a bez hledání šipky.

Varianta D v [02-navrh-reseni.md](02-navrh-reseni.md) řeší i kombinaci „položka má vlastní
obsah a současně podmenu": nadřazený odkaz zůstává nad rozbaleným podmenu viditelný
a klikatelný, text vždy naviguje jedním tapem a šipka pouze rozbaluje. Držení otevřeného
hamburgeru přes `sessionStorage` je záměrně odmítnuto, místo toho se stav větve
rekonstruuje ze serverových tříd WordPressu.

Kompatibilita: změny nepoužívají syntaxi PHP 8, takže běží na PHP 7.4.33; používaná
WordPress API jsou stabilní napříč 6.x i 7.x a šablona zůstává klasickou PHP šablonou.

## Navazující krok

Po odsouhlasení varianty v [02-navrh-reseni.md](02-navrh-reseni.md) provést kroky z
[04-implementacni-postup.md](04-implementacni-postup.md) v režimu Code.