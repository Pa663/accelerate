# 13 – Verifikace verze 9.6.0 (sloučení upstream 1.6.0)

Stav: **statické ověření hotové, ruční testování na serveru čeká.**
Datum: 2026-11-16.
Rozsah: `style.css`, `functions.php`, `inc/functions.php`, `js/navigation.js`,
`readme.txt`, `languages/accelerate.pot`, `plans/*`.

## 1. Cíl

Ověřit, že ruční sloučení upstream distribuce Accelerate 1.6.0 nezavedlo
regrese do vlastní responzivní navigace, doplnit chybějící chybové stavy
a dokumentaci v `js/navigation.js` a zdokumentovat změny ve verzi 9.6.0.

## 2. Metoda

1. Statická kontrola hlaviček, enqueue a verzování.
2. Kontrola DOM kontraktu mezi `header.php`, `js/navigation.js`,
   `style.css` a `rtl.css`.
3. Kontrola upstream oprav 1.6.0 po souborech.
4. `node --check js/navigation.js`.
5. `php -l inc/functions.php` a `php -l functions.php`.
6. Cílené hledání `touchstart`, `accelerateMenuL10n`, `wp_localize_script`.
7. Ruční testovací matice (čeká na server).

## 3. Nálezy

### 3.1 Kritický nález: chybějící lokalizace

`js/navigation.js` čte `window.accelerateMenuL10n`, ale při ručním sloučení
1.6.0 zmizel `wp_localize_script` z `inc/functions.php`. Skript nespadl,
protože má anglický fallback, ale překlady a dokumentovaný kontrakt byly
porušené.

**Oprava:** registrace obnovena v [`inc/functions.php`](../inc/functions.php:75)
s řetězci `Open submenu` a `Close submenu`; POT doplněn.

### 3.2 Chybové stavy `js/navigation.js`

Původní skript měl správné rané návraty pro chybějící kontejner, menu
a tlačítko. Chyběly však obrany pro:

- chybějící nebo nefunkční jQuery,
- chybějící, částečný nebo neobjektový `accelerateMenuL10n`,
- prázdné `$li` / `$sub` v pomocných funkcích,
- `Escape`, který kradl fokus i bez otevřeného podmenu,
- `className` u inline SVG (`SVGAnimatedString`),
- duplicitní ID podmenu při opakované inicializaci.

**Oprava:** doplněny guardy, normalizace l10n, bezpečné `hasClass` /
`toggleClass`, rostoucí čítač ID a podmíněný `Escape`.

### 3.3 Dokumentace `js/navigation.js`

Doplněn souborový blok s:

- zodpovědnostmi a breakpointy 767/768 px,
- DOM kontraktem (`#site-navigation`, `.menu-toggle`, `ul.nav-menu`,
  `li.menu-item-has-children`),
- stavovým modelem (`aria-expanded`, `.active`, `.sub-menu-open`,
  `.sub-menu-flip`, `body.accelerate-menu-open`),
- závislostmi a chybovým chováním,
- známými omezeními.

Doplněn JSDoc u `getNav`, `closeAll`, `closeTabletBranch`, `reset`
a pomocných funkcí `hasClass` a `toggleClass`.

### 3.4 Robustnost verze šablony

`ACCELERATE_THEME_VERSION` se nyní načítá přes
`wp_get_theme( get_template() )` s fallbackem `9.6.0`, takže cache busting
funguje i v child theme nebo po přejmenování složky.

### 3.5 Legacy soubory

`js/html5shiv*` a nepoužité `fontawesome/css/*` zůstávají v repu kvůli
zpětné kompatibilitě child theme a pluginů, ale nejsou enqueued. Rozhodnutí
je zaznamenané v `readme.txt`.

## 4. Upstream 1.6.0 – kontrola

| Oblast | Stav |
| --- | --- |
| Hlavička `style.css` (9.6.0, WP 7.1, WP 5.8, PHP 7.4) | OK |
| Cache busting přes verzi šablony | OK |
| Prázdný `html5shiv` handle | OK |
| Elementor widget args | OK |
| Tag widget / PHP 8 | OK (`empty()` guard) |
| Image Service widget bez stránek | OK (`return` při prázdném poli) |
| Recent Work bez featured image | OK (`recent-work-no-image`) |
| CTA widget bez odkazu/obrázku | OK (`empty()` guardy) |
| Custom background ve full-width | OK (`style.css:649`) |
| Search block a WooCommerce buttony | OK (`style.css`, `style-editor-block.css`) |
| Block editor typography | OK (`accelerate_block_editor_dynamic_css`) |
| Theme review notice cleanup | OK (batch `get_users`) |

## 5. Statické kontroly

| Kontrola | Výsledek |
| --- | --- |
| `node --check js/navigation.js` | prošlo |
| `php -l inc/functions.php` | prošlo |
| `php -l functions.php` | prošlo |
| `touchstart` v `js/navigation.js` | pouze v dokumentačním komentáři, žádný handler |
| `accelerateMenuL10n` v PHP | `inc/functions.php:77` |
| `wp_localize_script` v PHP | `inc/functions.php:75` |
| `Version: 9.6.0` v `style.css` | řádek 7 |
| `Version 9.6.0` v `readme.txt` | řádky 11 a 64 |

## 6. Ruční testovací checklist

Použít existující matici z [03-testovaci-plan.md](03-testovaci-plan.md)
a [05-manualni-testovani.md](05-manualni-testovani.md). Minimálně:

- S1–S7: hamburger, tap na text, tap na šipku, akordeon, třetí úroveň.
- S8–S12: klik mimo, rotace, tablet, iPad Pro, desktop.
- S13–S17: klávesnice, `Escape`, screen reader, Customizer.
- S18–S20: fallback `wp_page_menu`, vypnutý JS, RTL.
- S21–S27: auto-expand aktuální větve, reload, přímý odkaz, breakpoint.
- S28–S31: chipy, otevřený stav, scroll-up, RTL.
- A1–A11, B1–B4, C1–C4, D1–D8.

## 7. Známá omezení

- Hamburger zůstává po navigaci zavřený; větev se obnoví při dalším otevření.
- Auto-expand se týká jen aktuální větve.
- Mobil je akordeon, tablet/desktop dropdown.
- Child theme musí změny převzít, pokud přebíjí `navigation.js` nebo `header.php`.

## 8. Rollback

1. Nahrát zpět `style.css`, `functions.php`, `inc/functions.php`,
   `js/navigation.js`, `readme.txt` a `languages/accelerate.pot`.
2. Vyčistit page cache, CDN a OPcache.
3. Ověřit, že v HTML je `accelerateMenuL10n` a `navigation.js?ver=9.6.0`.
4. Databáze ani nastavení se nemění.

## 9. Zápis výsledků

| Prostředí | Datum | Výsledek | Poznámka |
| --- | --- | --- | --- |
| Firefox RDM 390 px | | | |
| Edge DevTools 390 px | | | |
| iPhone Safari | | | |
| iPad Safari | | | |
| Firefox desktop | | | |
| Edge desktop | | | |
| Klávesnice + VoiceOver | | | |
| RTL | | | |
