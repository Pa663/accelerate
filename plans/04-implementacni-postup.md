# 04 – Implementační postup

Pořadí kroků pro režim Code. Každý krok obsahuje kontrolu, po které lze bezpečně pokračovat.
Aktivuje se po odsouhlasení varianty v [02-navrh-reseni.md](02-navrh-reseni.md).

## Krok 1 – Příprava a bezpečná větev

1. Založit větev `fix/responsive-menu-tap`.
2. Ověřit výchozí stav podle [03-testovaci-plan.md](03-testovaci-plan.md), zejména S3 a S4
   reprodukovat jako důkaz chyby.
3. Poznamenat si výchozí vzhled menu screenshotem na 375 px, 768 px a 1024 px.

## Krok 2 – PHP hlavička

Soubor [`header.php`](../header.php:110):

1. Změnit `<nav role="navigation">` na `<nav>`.
2. Nahradit `h3.menu-toggle` za `button.menu-toggle` s `type="button"`,
   `aria-expanded="false"` a `aria-controls="primary-menu"`.
3. Doplnit volby `wp_nav_menu`: `container => false`, `menu_id => 'primary-menu'`,
   `menu_class => 'nav-menu'`.
4. Doplnit `menu_class => 'nav-menu'` do `wp_page_menu`.

Kontrola: HTML obsahuje právě jeden `ul.nav-menu`, hamburger je fokusovatelný.

## Krok 3 – Lokalizace a cache busting

Soubor [`inc/functions.php`](../inc/functions.php:67):

1. Přidat `wp_localize_script` s klíči `expand` a `collapse`.
2. Nahradit `false` v `wp_enqueue_script` za `filemtime()` souboru.
3. Volitelně stejný princip pro `accelerate-custom` a hlavní stylesheet.

Kontrola: v HTML je objekt `accelerateMenuL10n` a skript má verzi v query stringu.

## Krok 4 – JS logika

Soubor [`js/navigation.js`](../js/navigation.js:1):

1. Odstranit celý IIFE blok s `touchstart` a `preventDefault`
   ([`js/navigation.js`](../js/navigation.js:86)).
2. Zachovat nebo mírně upravit vanilla část pro hamburger; doplnit `aria-expanded`
   a bezpečnější class swap.
3. Nahradit `span.sub-toggle` za `button.sub-toggle` s `aria-expanded`,
   `aria-controls` a `screen-reader-text`; atribut `aria-controls` generovat z `id`
   podmenu.
4. Zavést delegovaný click handler s `preventDefault`, `stopPropagation`,
   akordeonem sourozenců a animací 200 ms.
5. Přidat funkci `autoExpandCurrentBranch()`, která podle tříd `current-menu-item`,
   `current-menu-ancestor`, `current-menu-parent`, `current_page_item`,
   `current_page_ancestor` a `current_page_parent` rozbalí aktivní větev bez animace.
   Volat ji po injektáži tlačítek, po otevření hamburgeru a po resetu breakpointu.
6. Přidat `Escape`, reset při změně breakpointu a guard proti dvojí inicializaci.
7. Odstranit práci s neexistující třídou `fa-caret-right`.

Kontrola: v souboru není `touchstart` ani `preventDefault` na odkazu; po příchodu na
nadřazenou stránku je po otevření hamburgeru větev rozbalená; konzole bez chyb.

## Krok 5 – CSS

Soubor [`style.css`](../style.css:1), ideálně jako nový komentovaný blok na konci souboru
plus cílené úpravy existujících pravidel:

1. Přidat dotykový režim `@media (max-width: 1024px), (hover: none)` pro `.sub-toggle`,
   odsazení odkazu, velikost 44 px a rotaci ikony.
2. Sjednotit skrývání podmenu pro `main-navigation` i `main-small-navigation`
   v `max-width: 767px`.
3. Vypnout hover dropdown na `hover: none`.
4. Obalit hover pravidla `@media (hover: hover)`, aby nevznikl sticky hover
   ([`style.css`](../style.css:780), [`style.css`](../style.css:2686)).
5. Normalizovat `button.menu-toggle` (`width: 100%`, `border: 0`, `font: inherit`).
6. Doplnit `:focus-visible` styly.
7. Volitelně F2: zajistit, aby skrytá podmenu nebyla fokusovatelná
   ([`style.css`](../style.css:793)).

Kontrola: vzhled na 375, 768, 1024 a 1366 px odpovídá výchozím screenshotům.

## Krok 6 – RTL parita

Soubor [`rtl.css`](../rtl.css:430):

1. Zrcadlit pozici a odsazení `.sub-toggle`.
2. Ověřit override bloky z `style.css` v RTL režimu.

Kontrola: scénář S20 projde.

## Krok 7 – Ověření

1. Projít scénáře S1–S20 z [03-testovaci-plan.md](03-testovaci-plan.md).
2. Zkontrolovat DOM atributy a třídy.
3. Zkontrolovat konzoli a `debug.log`.
4. Ověřit Customizer live preview a fallback `wp_page_menu`.

## Krok 8 – Dokumentace a commit

1. Doplnit výsledky testů do `plans/03-testovaci-plan.md` nebo do nového
   `plans/05-vysledky-verifikace.md`.
2. Uvést v changelogu změnu `h3.menu-toggle` na `button` a nutnost bumpnout cache.
3. Rozdělit commit:
   - `fix(menu): single tap navigation and accessible submenu toggle` – JS a PHP,
   - `fix(menu): touch and hover responsive styles` – CSS a RTL.
4. Uvést rollback postup: revert obou commitů.

## Poznámky pro implementaci

- Nemazat existující CSS bloky, jen přidávat override; snižuje riziko pro child themes.
- Nepřidávat nové knihovny ani build kroky.
- Zachovat prefix `accelerate` a textdomain `accelerate`.
- Všechny nové řetězce projít přes `__()` a `esc_html_e()`.
- Nepoužívat `!important`, pokud to není nutné pro přebití inline stylu z jQuery.
- Po změně breakpointu vždy volat reset, aby nezůstaly inline `display` hodnoty.
- Ověřit, že `aria-controls` odkazuje na existující `id` i u podmenu bez vlastního ID.