# 12 – Non-passive `touchstart` u slideru (Cycle2 swipe)

Stav: **zdokumentováno, bez zásahu do kódu** (varianta A – ignorovat)
Datum: 2026-11-16
Navazuje na [06-implementovane-zmeny.md](06-implementovane-zmeny.md).

## 0. Rozhodnutí

Upozornění se záměrně neopravuje. Jde o výkonnostní hint Chromu, ne o chybu
šablony. Swipe na slideru i scroll stránky fungují správně. Tento dokument
slouží jako vysvětlení pro případ, že se hláška objeví znovu, a jako podklad pro
případné budoucí rozhodnutí.

## 1. Přesná hláška

```text
[Violation] Added non-passive event listener to a scroll-blocking 'touchstart' event.
Consider marking event handler as 'passive' to make the page more responsive.
See https://www.chromestatus.com/feature/5745543795965952
```

Hláška se objevuje v konzoli Chromu a Edge (Chromium) na titulní stránce, pokud
je aktivní slider. Ve Firefoxu se tento typ upozornění nevypisuje.

## 2. Co hláška znamená

- Prohlížeč rozlišuje posluchače událostí na pasivní a nepasivní. Nepasivní
  posluchač `touchstart` nebo `touchmove` může zavolat `preventDefault()`,
  a proto musí prohlížeč před začátkem scrollu počkat, až handler doběhne.
- Označení `{ passive: true }` říká prohlížeči, že handler `preventDefault()`
  volat nebude. Prohlížeč pak může scrollovat okamžitě a handler spustit
  souběžně.
- `[Violation]` je úroveň upozornění v DevTools, ne error. Stránka funguje,
  jen se může o zlomek sekundy zpozdit začátek scrollu; znát to může hlavně
  na mobilu.
- Nejde o chybu v PHP ani v HTML. Jde o způsob, jakým plugin registruje
  události v JavaScriptu.

## 3. Kde posluchač vzniká

- [`inc/functions.php`](../inc/functions.php:62) – registrace
  `jquery-cycle2-swipe` s cestou k minifikovanému souboru.
- [`inc/functions.php`](../inc/functions.php:67) – plugin se načítá jen na
  titulní stránce a jen když je slider aktivní
  (`accelerate_activate_slider`).
- [`inc/functions.php`](../inc/functions.php:69) – vlastní enqueue pluginu.
- [`js/jquery.cycle2.swipe.js`](../js/jquery.cycle2.swipe.js:19) – `touchstart`
  přes jQuery `.bind()`. jQuery volá nativní `addEventListener` bez objektu
  options, takže posluchač vzniká jako nepasivní.
- [`js/jquery.cycle2.swipe.js`](../js/jquery.cycle2.swipe.js:40) – při
  horizontálním posunu nad 10 px volá `event.preventDefault()`, aby při swipu
  neposouval stránku.
- [`js/jquery.cycle2.swipe.js`](../js/jquery.cycle2.swipe.js:44) – `touchmove`
  handler, který se váže uvnitř `touchstart`.
- [`js/jquery.cycle2.swipe.min.js`](../js/jquery.cycle2.swipe.min.js:2) –
  minifikovaná kopie, kterou šablona skutečně načítá. Případná úprava musí
  proběhnout zde, nebo se enqueue musí přepnout na neminifikovaný soubor.
- [`inc/header-functions.php`](../inc/header-functions.php:63) – markup slideru
  `#featured-slider`, kontejner `.slider-cycle` na řádku 64, pager
  `#controllers` na řádku 114 a šipky `.slide-prev` / `.slide-next` na
  řádcích 117 a 118.
- [`header.php`](../header.php:137) – podmínka, která slider na titulní stránce
  vykreslí.

Souvislost s responzivním menu: `touch-action: manipulation` na
[`style.css`](../style.css:3066) patří tlačítku podmenu, ne slideru. Slider
vlastní `touch-action` nemá.

## 4. Proč to není potřeba opravovat

- Je to `[Violation]`, tedy hint pro vývojáře, ne error. Běžný návštěvník ho
  nevidí a stránka funguje.
- Plugin `preventDefault()` potřebuje: při horizontálním swipu potlačuje scroll
  stránky, aby se slider posunul. Kdyby byl posluchač pasivní, `preventDefault()`
  by nefungoval a Chrome by navíc hlásil
  `Unable to preventDefault inside passive event listener`.
- jQuery volbu `passive` v `.bind()` ani `.on()` nepodporuje. „Přidat passive"
  tedy není jednoduchá změna jednoho atributu, ale přepis registrace událostí
  na nativní `addEventListener`.
- Plugin se načítá jen na titulní stránce a jen při aktivním slideru. Jinde
  hláška nevzniká.
- Zpoždění scrollu je zlomek sekundy a týká se jen dotykových zařízení se
  sliderem. Nemá vliv na SEO, přístupnost ani Lighthouse skóre.
- Hláška nemusí pocházet ze šablony. Pokud je na stránce aktivní plugin třetí
  strany nebo WordPress core, šablona to neovlivní. Zdroj se ověří ve stack
  trace ve DevTools.

## 5. Kdy se k tomu vrátit

Pokud bude potřeba čistá konzole (audit, požadavek klienta, QA), jsou k dispozici
níže uvedené cesty. Nejsou součástí tohoto rozhodnutí a žádná z nich není
v pracovním stromu aplikovaná.

### 5.1 Vypnutí swipe pluginu (varianta B)

Odebrat `wp_enqueue_script( 'jquery-cycle2-swipe' )` na
[`inc/functions.php`](../inc/functions.php:69). Slider zůstane funkční přes
šipky `.slide-prev` / `.slide-next` a pager `#controllers`, jen ztratí swipe
gesto. Nejjednodušší a nejbezpečnější cesta, pokud swipe není potřeba.

### 5.2 Pasivní rewrite (varianta C)

Cílem je, aby swipe zůstal a scroll nebyl blokovaný:

1. Přidat `touch-action: pan-y` na `#featured-slider .slider-cycle`
   v [`style.css`](../style.css:1016). Prohlížeč pak sám povolí svislý scroll
   a horizontální gesto předá stránce.
2. Registrovat `touchstart` a `touchmove` nativním
   `addEventListener( ..., { passive: true } )` místo jQuery `.bind()`.
3. Odebrat `preventDefault()` z `touchmove` a spoléhat na `touch-action`.
4. Upravit minifikovanou kopii
   [`js/jquery.cycle2.swipe.min.js`](../js/jquery.cycle2.swipe.min.js:2), nebo
   přepnout enqueue na neminifikovaný soubor a upravit
   [`js/jquery.cycle2.swipe.js`](../js/jquery.cycle2.swipe.js:19).
5. Otestovat na iOS Safari a Android Chrome, že swipe listuje a svislý scroll
   stránky není blokovaný.

### 5.3 Vlastní swipe skript (varianta D)

Nahradit plugin malým vlastním skriptem s nativními pasivními posluchači.
Čistší výsledek, ale více práce a testování; plugin obsahuje i prahové hodnoty
pro rozlišení swipu a tapu.

### 5.4 Co pravděpodobně nepomůže

Označit pasivně jen `touchstart` a `touchmove` nechat nepasivní. Hláška se
přesune z `touchstart` na `touchmove`, protože problémovým je právě ten handler
s `preventDefault()`.

### 5.5 Co nedělat bez testu

Vypnout swipe a zároveň odebrat šipky nebo pager. Uživatelé bez dotykového
gesta by pak slider nemohli ovládat.

## 6. Ověření, že jde opravdu jen o hint

1. Otevřít titulní stránku v Chromu nebo Edge a otevřít DevTools → Console.
2. Hláška má úroveň `[Violation]`, ne error.
3. Rozbalit záznam a zkontrolovat stack trace: pokud míří do
   `jquery.cycle2.swipe.min.js`, jde o tento plugin. Pokud do jiného souboru,
   zdroj je jinde a šablona to neovlivní.
4. Ověřit, že slider je na stránce aktivní: v konzoli
   `document.querySelectorAll('#featured-slider').length` je větší než nula.
5. Na mobilu nebo v režimu dotyku ověřit, že swipe listuje a svislý scroll
   stránky funguje.
6. V Network zkontrolovat, že `jquery.cycle2.swipe.min.js` se načítá se stavem
   200 a že se nenačítá na jiných stránkách než na titulní.

## 7. Co se nemění

- Žádné soubory šablony se needitují.
- Nemění se enqueue ani verze skriptů.
- Nemění se vzhled ani chování slideru.
- Databáze ani nastavení se nemění.

## 8. Odkazy

- [06-implementovane-zmeny.md](06-implementovane-zmeny.md)
- [11-fontawesome-woff2-glyf-bbox.md](11-fontawesome-woff2-glyf-bbox.md)
- [README.md](README.md)
