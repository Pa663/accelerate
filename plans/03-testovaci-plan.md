# 03 – Testovací plán

## 1. Zařízení a prohlížeče

| Třída | Zařízení / prohlížeč | Šířka |
| --- | --- | --- |
| Malý mobil | iPhone SE, Safari | 375 px |
| Mobil | iPhone 13/15, Safari | 390–393 px |
| Mobil | Pixel, Chrome | 393–412 px |
| Skládací mobil | Galaxy Z Fold, Chrome | 280–344 px |
| Tablet na výšku | iPad mini, Safari | 768 px |
| Tablet na šířku | iPad, Safari | 1024 px |
| Velký tablet s dotykem | iPad Pro, Safari | 1366 px |
| Hybridní notebook | Surface, Chrome a Edge s dotykem | 1280–1440 px |
| Desktop | Chrome, Firefox, Safari | 1280+ px |
| Desktop | Windows High Contrast | libovolná |

Pro rychlou kontrolu použít DevTools device toolbar, pro finální ověření reálné zařízení
nebo BrowserStack.

## 2. Scénáře

| ID | Scénář | Očekávaný výsledek |
| --- | --- | --- |
| S1 | Mobil, hamburger zavřený, tap na hamburger | menu se otevře, `aria-expanded="true"` |
| S2 | Mobil, menu otevřené, tap na běžnou položku | okamžitá navigace, menu se nezasekne |
| S3 | Mobil, tap na text položky s podmenu | okamžitá navigace, žádný dvojitý tap |
| S4 | Mobil, tap na šipku položky s podmenu | podmenu se otevře, odkaz nenaviguje |
| S5 | Mobil, druhý tap na šipku | podmenu se zavře |
| S6 | Mobil, otevřené podmenu A, tap na šipku podmenu B | A se zavře, B se otevře |
| S7 | Mobil, třetí úroveň menu | otevírání a zavírání stejné jako druhá úroveň |
| S8 | Mobil, podmenu otevřené, tap mimo menu | podmenu zůstává otevřené nebo se zavírá dle zvolené varianty, nesmí vzniknout nekonzistentní stav |
| S9 | Mobil, rotace na šířku a zpět | žádné zaseknuté podmenu, stav se resetuje |
| S10 | Tablet 768–1024 px, tap na šipku a na odkaz | šipka ovládá podmenu, odkaz naviguje, bez sticky hoveru |
| S11 | iPad Pro 1366 px s dotykem | chování jako na tabletu, ne desktop hover |
| S12 | Desktop s myší | hover dropdown beze změny, šipka skrytá |
| S13 | Klávesnice: Tab na hamburger, Enter a Space | menu se otevře a zavře |
| S14 | Klávesnice: Tab do menu, Enter na šipce | podmenu se otevře, fokus zůstává v menu |
| S15 | Klávesnice: Escape | podmenu se zavře, fokus na tlačítku |
| S16 | Screen reader VoiceOver nebo TalkBack | tlačítko má smysluplný název a stav |
| S17 | Customizer s live preview | menu funguje i po překreslení navigace, toggly nejsou duplicitní |
| S18 | Stránka s fallbackem `wp_page_menu` | šipky existují a fungují |
| S19 | Vypnutý JavaScript | hlavní odkazy zůstávají dostupné a čitelné |
| S20 | RTL varianta | šipka je vlevo, odsazení zrcadlené, funkce stejná |
| S21 | Nadřazená stránka s obsahem i podmenu, příchod z výsledků hledání, otevření hamburgeru | větev je automaticky rozbalená, nadřazený odkaz je viditelný a klikatelný |
| S22 | Otevřené podmenu, tap na nadřazený text odkazu | navigace na obsah napoprvé, žádný dvojitý tap |
| S23 | Otevřené podmenu, tap na šipku, poté reload stránky | po otevření hamburgeru je větev opět rozbalená podle aktuální URL |
| S24 | Přímý odkaz na vnořenou podstránku třetí úrovně | rozbalené jsou všechny předky, ne jen přímý rodič |
| S25 | Otevřené podmenu, tap mimo a znovu otevření hamburgeru | žádný zastaralý stav z `sessionStorage`, rozbalení odpovídá aktuální stránce |
| S26 | Tlačítko zpět v prohlížeči po navigaci z podmenu | menu je zavřené, po otevření hamburgeru správná větev rozbalená |
| S27 | Uživatel ručně zavře auto-rozbalenou větev a přepne breakpoint | po návratu do mobilu se větev znovu rozbalí podle aktuální URL |
| S28 | Mobil, otevřené menu, vizuální kontrola šipky | světlý zaoblený čtverec s tmavě zeleným chevronem, snadno trefitelný prstem |
| S29 | Mobil, otevřené podmenu | chip je plně zelený, ikona otočená, stav odpovídá `aria-expanded` |
| S30 | Mobil, otevřené dlouhé menu a scroll dolů | plovoucí tlačítko zpět nahoru je skryté a nepřekrývá položky |
| S31 | Desktop a RTL | plovoucí tlačítko je kruh s dlouhou šipkou, chipy podmenu jsou čtverce, RTL zrcadlí pozici |

## 3. Regresní kontrola

- Hlavička, logo, vyhledávání a header sidebar beze změny.
- Footer menu beze změny.
- Mobilní slidy a featured slider bez ovlivnění.
- Blog, archiv, vyhledávání a stránky bez změn layoutu.
- Administrace a Customizer bez chyb v konzoli.
- Žádné nové chyby v konzoli prohlížeče.
- Žádné nové varování PHP v `debug.log`.
- PageSpeed bez zhoršení CLS v hlavičce.

## 4. Akceptační kritéria

Viz kapitola 7 v [02-navrh-reseni.md](02-navrh-reseni.md). Úkol je dokončen, pokud projdou
všechny scénáře S1–S20 na mobilu, tabletu a desktopu a v konzoli nejsou chyby.

## 5. Způsob ověření

1. Manuální test podle matice výše.
2. Kontrola DOM: `aria-expanded`, `aria-controls`, třídy `sub-menu-open` a `active`.
3. Kontrola, že `touchstart` handler už v kódu není.
4. Simulace pomalé sítě a rychlých tapů na šipku – animace se nesmí řetězit.
5. Test s vypnutým JS a s JS povoleným.
6. Test v Customizeru s live preview a selective refresh.
7. Test na reálném iOS zařízení kvůli sticky hover a `preventDefault`.