# 06 – Implementované změny a balíček pro server

Stav: **implementováno v pracovním stromu, čeká ruční testování na serveru.**
Datum: 2026-11-16.
Poslední doplnění: výraznější chipy šipek a odlišení plovoucího tlačítka
`#scroll-up`, viz [07-vyraznejsi-sipky.md](07-vyraznejsi-sipky.md).
Barvy chipu `#F69581`, ukotvení k menu položce a omezení chipů na mobil
do 767 px řeší [08-chip-f69581-a-poloha.md](08-chip-f69581-a-poloha.md).
Nechipové chování nad 767 px, značky vnořených podpoložek a jemné rámování
řeší [09-nechipove-chovani-znacky-a-ramovani.md](09-nechipove-chovani-znacky-a-ramovani.md).
Šipku vnořených položek od 768 px a překlopení podmenu u pravého okraje řeší
[10-sipka-od-768-a-flip-podmenu.md](10-sipka-od-768-a-flip-podmenu.md);
mění se `style.css` a `js/navigation.js`.

## 1. Soubory k nahrání

Nahrajte těchto pět souborů z kořene šablony:

| # | Soubor | Stav |
| --- | --- | --- |
| 1 | [`header.php`](../header.php) | upraveno |
| 2 | [`js/navigation.js`](../js/navigation.js) | přepsáno |
| 3 | [`inc/functions.php`](../inc/functions.php) | upraveno |
| 4 | [`style.css`](../style.css) | doplněn blok na konci |
| 5 | [`rtl.css`](../rtl.css) | doplněn blok na konci |

Poznámka: `rtl.css` není v této šabloně nikde enqueued. Úprava je připravená pro případ,
že jej načítá child theme nebo plugin. Pokud RTL nepoužíváte, stačí nahrát první čtyři soubory.

Poslední úprava z [07-vyraznejsi-sipky.md](07-vyraznejsi-sipky.md) mění
`style.css`, `rtl.css` a `js/navigation.js`. Úpravy z
[08-chip-f69581-a-poloha.md](08-chip-f69581-a-poloha.md) a
[09-nechipove-chovani-znacky-a-ramovani.md](09-nechipove-chovani-znacky-a-ramovani.md)
mění `style.css` a `js/navigation.js` (chip jen do 767 px, nechipové chování
nad 767 px, značky a rámování podmenu).
`header.php` a `inc/functions.php` zůstávají z předchozího balíčku.

## 2. Co se změnilo

### 2.1 `header.php`

- `h3.menu-toggle` nahrazeno za `button.menu-toggle` s `type="button"`,
  `aria-expanded="false"` a `aria-controls="primary-menu"`.
- Odstraněno redundantní `role="navigation"` z `<nav>`.
- `wp_nav_menu` dostal `container => false`, `menu_id => 'primary-menu'`,
  `menu_class => 'nav-menu'`.
- Fallback `wp_page_menu` generuje přímo `<ul id="primary-menu" class="nav-menu">`.

### 2.2 `js/navigation.js`

- Odstraněn celý `touchstart` handler s `preventDefault()` na odkazu. To byla příčina
  dvojitého tapu.
- Jeden delegovaný `click` handler pro `.sub-toggle`; `preventDefault` se volá pouze
  na tlačítku šipky, nikdy na odkazu.
- Tlačítko šipky je nyní `button` s `aria-haspopup`, `aria-expanded`, `aria-controls`
  a skrytým textem pro čtečky.
- Akordeon: otevřením jednoho podmenu se zavřou sourozenci na stejné úrovni.
- Animace zkrácena na 200 ms, `stop(true, true)` brání frontě animací.
- Automatické rozbalení aktivní větve podle tříd `current-menu-item`,
  `current-menu-ancestor`, `current-menu-parent`, `current_page_item`,
  `current_page_ancestor` a `current_page_parent`.
- Reset stavu při změně breakpointu a při `orientationchange`.
- `Escape` zavře podmenu a vrátí fokus na nadřazený odkaz.
- Klik mimo navigaci zavře otevřená podmenu.
- Ochrana proti dvojí inicializaci a reakce na `customize-preview-menu-refreshed`.
- Opraveno lepení třídy `nav-menu` bez mezery.

### 2.3 `inc/functions.php`

- `style.css` a `navigation.js` mají verzi z `filemtime()` s fallbackem na verzi šablony.
  Tím se po nahrání na server vynutí nová cache.
- Přidán `wp_localize_script` s objektem `accelerateMenuL10n` pro překlad
  `Open submenu` a `Close submenu`.

### 2.4 `style.css`

Na konci souboru je nový blok `RESPONSIVE MENU FIX`:

- `.sub-toggle` je v dotykovém režimu `button` s tap targetem 48×44 px.
- Nadřazený odkaz má `padding-right: 56px`, aby se text nepřekrýval se šipkou.
- Podmenu se v dotykovém režimu skrývá a zobrazuje podle třídy `sub-menu-open`.
- Na mobilu je podmenu statické v toku dokumentu, nikoli absolutně pozicované.
- Na tabletu zůstává dropdown, ale s `left: auto` pro otevřený stav.
- Hover dropdown je vypnutý na `hover: none`, takže iPad Pro a hybridní notebooky
  používají šipku, ne sticky hover.
- Ikona se otáčí podle `aria-expanded` přes třídu `active`.
- Doplněny `:focus-visible` obrysy a normalizace `button.menu-toggle`.

### 2.5 `rtl.css`

- Zrcadlená pozice šipky (`left` místo `right`) a odsazení odkazu (`padding-left`).
- Zrcadlené otevírání vnořeného podmenu (`right: 100%`).

## 3. Co se záměrně nezměnilo

- Barvy, fonty, rozměry a vzhled menu.
- Breakpointy 767 px a 1024 px.
- Class swap `main-navigation` / `main-small-navigation`.
- Uložené menu, nastavení Customizeru a databáze.
- Žádné nové knihovny, build kroky ani pluginy.

## 4. Ověření před nahráním

- JavaScript prošel `node --check js/navigation.js`.
- PHP lint nebyl lokálně spuštěn, protože na vývojovém počítači není nainstalované PHP.
  Před nahráním doporučuji na serveru nebo v CI spustit `php -l header.php`
  a `php -l inc/functions.php`.
- V `js/navigation.js` už není `touchstart`.
- V `header.php` už není `h3.menu-toggle` ani `role="navigation"`.

## 5. Ověření po nahrání

Ve zdrojovém kódu stránky zkontrolujte:

1. `<button type="button" class="menu-toggle"` je přítomné.
2. `<ul id="primary-menu" class="nav-menu">` je přítomné.
3. `accelerateMenuL10n` je přítomné.
4. `navigation.js?ver=` obsahuje číselnou verzi, ne `ver=false`.
5. V konzoli nejsou chyby.
6. `document.querySelectorAll('#site-navigation .sub-toggle').length` je větší než nula.

## 6. Rychlý test podle priority

1. Mobil 390 px, Firefox RDM s dotykem: tap na text položky s podmenu naviguje napoprvé.
2. Mobil: tap na šipku otevře podmenu, druhý tap zavře.
3. Mobil: otevřené podmenu, tap na nadřazený text naviguje.
4. Mobil: příchod na nadřazenou stránku, otevření hamburgeru, větev je rozbalená.
5. Tablet 768 a 1024 px: šipka funguje na první tap, žádný sticky hover.
6. iPhone Safari: stejné kroky jako 1 až 4.
7. iPad Safari na výšku i na šířku: stejné kroky jako 5.
8. Desktop Firefox a Edge: hover dropdown beze změny, šipka skrytá.

Podrobný scénář je v [05-manualni-testovani.md](05-manualni-testovani.md).

## 7. Rollback

1. Nahrát zpět původní `header.php`, `js/navigation.js`, `inc/functions.php`,
   `style.css` a případně `rtl.css`.
2. Vyčistit page cache, CDN a případně OPcache.
3. Ověřit, že zdrojový kód obsahuje původní `h3.menu-toggle`.
4. Databáze ani nastavení se nemění.

## 8. Známá omezení

- Po navigaci zůstává hamburger zavřený. To je záměr, obsah nesmí být překrytý.
  Rozbalení správné větve se obnoví při otevření hamburgeru.
- Automatické rozbalení se týká pouze aktuální větve, ne všech dříve otevřených podmenu.
- Na mobilu se podmenu chová jako akordeon, na tabletu jako dropdown.
- Pokud child theme přebíjí `header.php` nebo `navigation.js`, musí se změny aplikovat
  v child theme.
- Pokud hosting drží starý `?ver=`, je potřeba vyčistit cache, ne měnit kód.

## 9. FontAwesome varování glyf bbox

Konzole Firefoxu může u FontAwesome 4.7.0 hlásit
`glyf: Glyph bbox was incorrect; adjusting (glyph 33)`. Není to regrese těchto
úprav ani chyba šablony; jde o vlastnost binárky FA 4.7.0. Rozhodnutí je
varování neopravovat, viz [11-fontawesome-woff2-glyf-bbox.md](11-fontawesome-woff2-glyf-bbox.md).

## 10. Non-passive touchstart u slideru

Konzole Chromu a Edge může na titulní stránce s aktivním sliderem hlásit
`[Violation] Added non-passive event listener to a scroll-blocking 'touchstart' event`.
Zdroj je Cycle2 swipe plugin, který se načítá z
[`inc/functions.php`](../inc/functions.php:69) a váže `touchstart` přes jQuery
`.bind()` na [`js/jquery.cycle2.swipe.js`](../js/jquery.cycle2.swipe.js:19).
Není to regrese těchto úprav ani chyba šablony; jde o výkonnostní hint, který
vzniká proto, že plugin potřebuje `preventDefault()` při horizontálním swipu.
Rozhodnutí je hlášku neopravovat, viz
[12-non-passive-touchstart.md](12-non-passive-touchstart.md).