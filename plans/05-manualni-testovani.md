# 05 – Ruční testování a nasazení na server

Tento dokument je praktický scénář pro prostředí bez lokálního vývoje: změněné soubory
se nahrají na server a testuje se v desktopovém prohlížeči s emulací mobilu a následně
na skutečném iPhonu a iPadu.

## 1. Co se bude nahrávat

Změny se týkají pouze těchto souborů aktivní šablony:

| Pořadí | Soubor | Co obsahuje |
| --- | --- | --- |
| 1 | [`header.php`](../header.php) | `button.menu-toggle`, `menu_class`, `menu_id`, odstraněné `role` |
| 2 | [`js/navigation.js`](../js/navigation.js) | nová logika podmenu, ARIA, auto-expand, bez touchstart |
| 3 | [`inc/functions.php`](../inc/functions.php) | lokalizace `accelerateMenuL10n`, verze skriptu |
| 4 | [`style.css`](../style.css) | dotykový režim, opravy hoveru, normalizace tlačítka |
| 5 | [`rtl.css`](../rtl.css) | zrcadlení šipky pro RTL |

Nic dalšího se nenahrává. Nemění se databáze, nastavení WordPressu ani pluginy.

**Pozor na child theme:** pokud je aktivní child theme, musí se soubory nahrát do něj,
nebo ověřit, že child theme tyto soubory sám nepřebíjí. Aktivní šablonu zjistíte ve
vzhledu nebo příkazem `wp theme list` na serveru.

## 2. Záloha a příprava

1. Stáhnout současné verze všech pěti souborů do složky
   `zaloha-menu-2026-11-16/` nebo zazipovat celou šablonu.
2. Poznamenat si verzi WordPressu, PHP a aktivní šablonu.
3. V administraci zkontrolovat, že je zapnutá volba nového responzivního menu
   (`Customize > New Responsive Menu`). Očekávaná třída na `body` je
   `better-responsive-menu`.
4. Připravit testovací menu s těmito položkami:
   - běžná stránka bez podmenu,
   - nadřazená stránka, která má vlastní obsah a současně děti,
   - dítě druhé úrovně s dalším podmenu, tedy třetí úroveň,
   - dítě bez dalšího podmenu.
5. Poznamenat si URL nadřazené stránky a URL vnořené stránky třetí úrovně.

## 3. Nasazení

Doporučený postup, aby se předešlo kombinaci starého a nového souboru:

1. Nahrát všech pět souborů najednou nebo v jedné dávce, ve stejném pořadí jako v tabulce.
2. Pokud hosting používá page cache, CDN nebo plugin cache, vyčistit ji.
3. Otevřít web v anonymním okně.
4. Ověřit v HTML, že se opravdu nahrála nová verze:
   - zdrojový kód obsahuje `accelerateMenuL10n`,
   - hamburger je `<button` a ne `<h3`,
   - `navigation.js` má v URL verzi odpovídající času souboru.
5. Otevřít konzoli a potvrdit, že nejsou chyby.

**Když se nová verze neprojeví:** nejčastěji page cache, CDN, service worker nebo
`opcache` na serveru. Zkontrolovat zdrojový kód, ne jen vzhled, a vyčistit cache.
Teprve potom řešit kód.

## 4. Rychlý test na desktopu

### 4.1 Firefox

1. Otevřít web, stisknout `Ctrl+Shift+M` pro responzivní režim.
2. Nastavit šířku 390 px a zapnout simulaci dotyku. Bez zapnutého dotyku se původní
   chyba nemusí vůbec projevit.
3. Projít sadu A níže.
4. Zopakovat pro šířky 768 px, 1024 px a 1366 px.

### 4.2 Edge nebo Chrome

1. Otevřít DevTools (`F12`), zapnout Device Toolbar (`Ctrl+Shift+M`).
2. Vybrat preset iPhone 12 Pro nebo vlastní 390×844, DPR 3, touch zapnutý.
3. Projít sadu A.
4. Zopakovat 768 px, 1024 px a 1366 px.

### 4.3 Sada A – mobil do 767 px

| # | Krok | Očekávání |
| --- | --- | --- |
| A1 | Kliknout na hamburger | menu se otevře, `aria-expanded="true"` |
| A2 | Kliknout na běžnou položku | okamžitá navigace |
| A3 | Vrátit se, otevřít hamburger, kliknout na text nadřazené položky | navigace napoprvé, žádný druhý klik |
| A4 | Vrátit se, otevřít hamburger, kliknout na šipku nadřazené položky | podmenu se otevře, odkaz nenaviguje |
| A5 | Kliknout na šipku znovu | podmenu se zavře |
| A6 | Otevřít podmenu A, potom šipku podmenu B | A se zavře, B se otevře |
| A7 | Otevřít třetí úroveň | chová se stejně jako druhá |
| A8 | S otevřeným podmenu kliknout na text nadřazeného odkazu | navigace na obsah, podmenu bylo viditelné nad odkazem |
| A9 | Na nadřazené stránce otevřít hamburger | větev je automaticky rozbalená |
| A10 | Přejít přímo na vnořenou stránku třetí úrovně a otevřít hamburger | rozbalení všech předků |
| A11 | Otočit emulaci na šířku a zpět | žádné zaseknuté podmenu |

### 4.4 Sada B – tablet 768 až 1024 px

| # | Krok | Očekávání |
| --- | --- | --- |
| B1 | Kliknout na šipku u položky s podmenu | podmenu se otevře, stránka nenaviguje |
| B2 | Kliknout na text položky | navigace napoprvé |
| B3 | Přejet myší přes položku | žádné neočekávané vyskakování ani sticky stav |
| B4 | Otevřít a zavřít podmenu opakovaně | stav vždy odpovídá `aria-expanded` |

### 4.5 Sada C – desktop nad 1025 px s myší

| # | Krok | Očekávání |
| --- | --- | --- |
| C1 | Najet myší na položku s podmenu | dropdown se chová jako dřív |
| C2 | Kliknout na položku | navigace |
| C3 | Zkontrolovat, že šipka není vidět | `.sub-toggle` skrytý |
| C4 | Projít menu klávesnicí Tab | pořadí a fokus viditelné |

## 5. Test na iPhonu

1. Otevřít web v Safari, ideálně v anonymním okně.
2. Otevřít hamburger a projít body A1 až A11.
3. Ověřit, že první tap na text nadřazené položky naviguje a nezůstane viset hover.
4. Zavřít a znovu otevřít Safari, ověřit, že se stav neobnovuje z paměti.
5. Zapnout VoiceOver a ověřit, že šipka má čitelný název a stav:
   `Settings > Accessibility > VoiceOver > VoiceOver`, potom rotor na tlačítka.
6. Otočit telefon na šířku a zpět, ověřit stav menu.

## 6. Test na iPadu

1. Otevřít web v Safari na výšku i na šířku.
2. Projít sadu A a sadu B.
3. Ověřit, že na iPadu nevzniká sticky hover a že šipka funguje na první tap.
4. U iPadu Pro na šířku ověřit, že se chová jako dotykové zařízení, ne jako desktop.

## 7. Co je očekávané chování, ne chyba

- Po navigaci se stránka načte a hamburger je zavřený. To je záměr, menu nemá překrývat obsah.
- Po otevření hamburgeru na stránce, která v menu figuruje jako nadřazená, je její větev
  rozbalená automaticky.
- Po ručním zavření větve zůstane zavřená do dalšího otevření hamburgeru nebo změny
  breakpointu.
- Na desktopu s myší se šipka nezobrazuje, používá se hover.

## 8. Když test selže

Zaznamenat:

1. zařízení, OS, prohlížeč a verzi,
2. šířku viewportu a zda byl zapnutý touch emulation,
3. URL stránky a přesný krok,
4. obsah konzole,
5. zdrojový kód navigace, zejména zda je tam `button.sub-toggle` a `accelerateMenuL10n`,
6. screenshot nebo krátké video.

Nejčastější příčiny:

| Projev | Pravděpodobná příčina |
| --- | --- |
| Staré chování i po nahrání | page cache, CDN, service worker, starý `?ver=` |
| Hamburger je stále `h3` | nenahraný nebo přepsaný `header.php`, child theme |
| Šipka chybí | starý `navigation.js`, chyba v konzoli, vypnuté nové menu |
| Dvojitý tap přetrvává | v JS zůstal `touchstart` handler, tedy starý soubor |
| Rozbitý vzhled tlačítka | chybí normalizace `button.menu-toggle` v `style.css` |
| Nezavíratelné podmenu | v CSS zůstalo `display: block` pro `current-menu-ancestor` |

## 9. Rollback

1. Nahrát zpět pět souborů ze zálohy.
2. Vyčistit page cache a CDN.
3. Ověřit, že zdrojový kód obsahuje původní `h3.menu-toggle`.
4. Databáze ani nastavení se nemění, není potřeba další krok.

## 10. Zápis výsledků

Do tabulky níže doplnit datum, zařízení a výsledek. Pro každou sadu stačí jedno potvrzení,
ale u chyb uvést konkrétní číslo kroku.

| Sada | Prostředí | Datum | Výsledek | Poznámka |
| --- | --- | --- | --- | --- |
| A | Firefox RDM 390 px | | | |
| A | Edge DevTools 390 px | | | |
| A | iPhone Safari | | | |
| B | Firefox RDM 768 px | | | |
| B | Edge DevTools 1024 px | | | |
| B | iPad Safari | | | |
| C | Firefox desktop | | | |
| C | Edge desktop | | | |
| A11y | VoiceOver iPhone | | | |
| A11y | klávesnice desktop | | | |