# 11 – FontAwesome 4.7.0: varování glyf bbox ve WOFF2

Stav: **zdokumentováno, bez zásahu do kódu** (varianta A – ignorovat)
Datum: 2026-11-16
Navazuje na [06-implementovane-zmeny.md](06-implementovane-zmeny.md).

## 0. Rozhodnutí

Varování se záměrně neopravuje. Jde o neškodné varování Firefoxu, ne o chybu
šablony. Font se vykresluje správně. Tento dokument slouží jako vysvětlení pro
případ, že se hláška objeví znovu, a jako podklad pro případné budoucí rozhodnutí.

## 1. Přesná hláška

```text
downloadable font: glyf: Glyph bbox was incorrect; adjusting (glyph 33)
(font-family: "FontAwesome" style:normal weight:400 width:100 src index:1)
source: https://www.andreabehalova.cz/wp-content/themes/accelerate/fontawesome/fonts/fontawesome-webfont.woff2?v=4.7.0
```

## 2. Co hláška znamená

- Vypisuje ji Firefox (Gecko) při sanitizaci staženého fontu přes OTS
  (OpenType Sanitizer).
- `glyf` je tabulka TrueType s obrysy glyfů. Každý glyf má v hlavičce uložený
  bounding box.
- Hodnota v hlavičce nesouhlasí se skutečnými rozměry obrysu. OTS to detekuje,
  vypíše varování a bbox v paměti přepočítá (`adjusting`).
- `glyph 33` je interní index glyfu v souboru, ne kód ikony (Unicode). Nemusí
  tedy odpovídat ikoně, kterou na stránce vidíte. Přesné jméno glyfu lze zjistit
  nástrojem fonttools, pokud by to bylo potřeba.
- `src index:1` je index v seznamu `src` v `@font-face`; index 1 odpovídá WOFF2.

## 3. Kde je font načítán

- [`inc/functions.php`](../inc/functions.php:89) – `wp_enqueue_style` pro
  `accelerate-fontawesome` s verzí `4.7.0`.
- [`fontawesome/css/font-awesome.css`](../fontawesome/css/font-awesome.css:10) –
  `@font-face` se seznamem EOT, WOFF2, WOFF, TTF a SVG.
- [`fontawesome/css/font-awesome.min.css`](../fontawesome/css/font-awesome.min.css:4) –
  minifikovaná kopie. Šablona ji přímo nenačítá, ale je vhodné ji držet v souladu.
- [`fontawesome/fonts/fontawesome-webfont.woff2`](../fontawesome/fonts/fontawesome-webfont.woff2) –
  soubor, který prohlížeč skutečně použil.

## 4. Proč to není potřeba opravovat

- Je to varování, ne error. Konzole ho zobrazí, ale stránka funguje.
- Prohlížeč bbox sám opraví, takže ikony se vykreslí správně.
- Nemá vliv na výkon, SEO, přístupnost ani Lighthouse.
- V Chrome a Edge se hláška obvykle neobjeví; je specifická pro Firefox.
- FA 4.7.0 je poslední verze řady 4.x (2016) a upstream ji už neopravuje.
  FA 5+ má jiné názvy tříd (`fa fa-*` → `fas fa-*`), takže upgrade by rozbil
  ikony v šabloně i v obsahu.

## 5. Kdy se k tomu vrátit

Pokud bude potřeba čistá konzole (například audit, požadavek klienta nebo QA),
jsou k dispozici níže uvedené cesty. Nejsou součástí tohoto rozhodnutí a žádná
z nich není v pracovním stromu aplikovaná.

### 5.1 Ověření integrity souborů

Porovnat SHA-256 souborů v šabloně s oficiálním vydáním FA 4.7.0. Pokud se
hodnoty liší, může jít o poškozený přenos nebo rozbalení a stačí nahrát oficiální
soubory. Pokud jsou shodné, jde o vlastnost upstreamu.

### 5.2 Přegenerování fontu (skutečná oprava)

Potřeba je Python, fonttools a brotli. Princip:

```python
from fontTools.ttLib import TTFont

f = TTFont('fontawesome-webfont.ttf')
f.flavor = None
f.save('fontawesome-webfont-fixed.ttf')  # recalcBBoxes je ve výchozím stavu True
```

Poté převést TTF na WOFF a WOFF2 (`fonttools ttLib.woff2 compress` nebo
`woff2_compress`), nahrát binárky do `fontawesome/fonts/` a zvýšit `?v=` v obou
FA CSS i verzi enqueue v [`inc/functions.php`](../inc/functions.php:89).
Bez zvýšení verze prohlížeče použijí starý font z cache.

### 5.3 OTF jako první zdroj

Přidat `FontAwesome.otf` na začátek seznamu `src` s `format('opentype')`. OTF je
obvykle CFF, tedy bez tabulky `glyf`. Nevýhoda: větší soubor. Vyžaduje ověření,
že OTF v šabloně je skutečně CFF a že se ikony vykreslí stejně.

### 5.4 Co pravděpodobně nepomůže

Odebrání WOFF2 ze seznamu `src`. Bbox je ve sdílené tabulce `glyf`, takže WOFF
a TTF budou mít stejnou vadu a varování se jen přesune na jiný index.

### 5.5 Co nedělat bez testu

Upgrade na FA 5 nebo 6. Změna názvů tříd rozbije ikony v šabloně i v obsahu.

## 6. Ověření, že jde opravdu jen o varování

1. Otevřít stránku ve Firefoxu a otevřít DevTools → Console.
2. Hláška má úroveň warning (žlutá), ne error (červená).
3. Ikony se vykreslují správně, například `fa fa-long-arrow-up`
   v [`footer.php`](../footer.php:36) nebo `fa fa-angle-right`
   v [`inc/header-functions.php`](../inc/header-functions.php:117).
4. V Chrome a Edge se hláška neobjeví nebo nemá vliv na vykreslení.
5. Network → font se načte se stavem 200 a správným MIME typem.

## 7. Co se nemění

- Žádné soubory šablony se needitují.
- Nemění se `@font-face`, verze ani cache.
- Nemění se vzhled ani chování.
- Databáze ani nastavení se nemění.

## 8. Odkazy

- [06-implementovane-zmeny.md](06-implementovane-zmeny.md)
- [README.md](README.md)
