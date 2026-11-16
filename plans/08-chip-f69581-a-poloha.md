# 08 – Chip podmenu: barva #F69581 a ukotvení k položce

Stav: **implementováno v pracovním stromu, čeká ruční testování**
Datum: 2026-11-16
Navazuje na [07-vyraznejsi-sipky.md](07-vyraznejsi-sipky.md).

## 0. Výsledek implementace

Chipy se zobrazují pouze v mobilním menu do šířky 767 px včetně. Nad 767 px je
skryje `#site-navigation .sub-toggle { display: none; }` a na tabletu 768–1024 px
se obnoví původní hover dropdown, který theme v tomto rozsahu vypínal.

Změněné soubory:

- [`style.css`](../style.css:3013) – barvy chipu, ukotvení k položce a omezení
  chipů na `max-width: 767px`,
- [`js/navigation.js`](../js/navigation.js:80) – `matchMedia` a resetní práh
  změněny z 1024 na 767 px, aby se auto-expand aktivní větve a reset tříd
  nespouštěl na tabletu,
- `rtl.css` – beze změny,
- PHP soubory a databáze – beze změny.

Ověřeno ve zdrojovém souboru:

- zelené hodnoty `#2D911F`, `#176B10`, `#123E0E`, `#EAF7E6` a `#A9D8A1`
  už nejsou v žádném pravidle pro `.sub-toggle` (zůstala jen zelená
  `#2D911F` u `a#scroll-up`, což je záměr),
- výchozí chip má `background: #FFFFFF; border: 2px solid #F69581; color: #F69581`,
- rozbalovací chip má `background: #F69581; border-color: #F69581; color: #FFFFFF`,
- na mobilu platí `top: 0` a `transform: none` pro `.sub-toggle` a jeho
  vnořené varianty,
- od 768 px je chip skrytý a na tabletu platí `display: block` pro
  `#site-navigation.main-navigation .sub-menu`.

## 1. Požadavky

1. Chip šipky podmenu používá barvu `#F69581` místo zelené.
2. Zbalovací chip má bílé pozadí, rozbalovací je vyplněný barvou.
3. Zbalovací i rozbalovací chip zůstává ukotvený přímo u menu položky, kterou
   ovládá. Nesmí se posouvat do středu rozbaleného podmenu ani se schovávat
   pod chipy vnořených položek.
4. Chipy se používají pouze v mobilním menu do šířky 767 px včetně. Na tabletu
   768–1024 px se používá původní hover dropdown.

## 2. Příčina posunu chipu

Chip je absolutně pozicovaný vzhledem k `li`:

- [`style.css`](../style.css:3038) – `position: absolute; top: 50%;`
- [`style.css`](../style.css:3065) – `transform: translateY(-50%);`

Na mobilu je podmenu součástí toku dokumentu
([`style.css`](../style.css:3143)), takže otevřením podmenu roste výška celého
`li`. Při `top: 50%` se chip přesune doprostřed celého rozbaleného bloku, tedy
mezi řádky podmenu. Tam se překrývá s chipy vnořených položek, což odpovídá
hlášenému chování.

Na tabletu a desktopu je podmenu absolutně pozicovaný dropdown, výška `li` se
nemění, proto se problém projevuje jen v mobilním akordeonu do 767 px.

## 3. Navržené barvy

| Stav | Pozadí | Rámeček | Šipka |
| --- | --- | --- | --- |
| Zbalovací, `aria-expanded="false"` | `#FFFFFF` | `2px solid #F69581` | `#F69581` |
| Rozbalovací, `aria-expanded="true"` | `#F69581` | `#F69581` | `#FFFFFF` |
| Hover zbalovacího (jen zařízení s hoverem) | `#FDEDE9` | `#F69581` | `#F69581` |
| Hover rozbalovacího (jen zařízení s hoverem) | `#E5765C` | `#E5765C` | `#FFFFFF` |

Focus obrys se z důvodu kontrastu mění ze zelené `#77CC6D` na tmavý odstín
`#7A2E1E` s odsazením 2 px. Jde pouze o focus, ne o běžný vzhled chipu.

## 4. Změny po souborech

### 4.1 `style.css` – základní vzhled chipu

V bloku `RESPONSIVE MENU FIX` ([`style.css`](../style.css:3032)) upravit
výchozí stav:

```css
background: #FFFFFF;
border: 2px solid #F69581;
border-radius: 8px;
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
color: #F69581;
```

Rozbalovací stav ([`style.css`](../style.css:3090)):

```css
#site-navigation .sub-toggle.active,
#site-navigation .sub-toggle[aria-expanded="true"] {
	background: #F69581;
	border-color: #F69581;
	color: #FFFFFF;
}
```

### 4.2 `style.css` – odstranění zelených výjimek pro aktuální položku

Zelené přebíjení aktuální položky už není potřeba, protože zbalovací chip je
bílý s růžovým rámečkem a na zeleném řádku je dostatečně viditelný. Odstranit:

- blok `#site-navigation > ul > li.current-menu-* > .sub-toggle`
  ([`style.css`](../style.css:3097)),
- blok `#site-navigation li.current-menu-item > .sub-toggle`
  v mobilní části ([`style.css`](../style.css:3160)).

Rozbalovací chip tak zůstane plný `#F69581` i na aktuální položce.

### 4.3 `style.css` – hover

Pravidla v `@media (hover: hover)` ([`style.css`](../style.css:3183)) nahradit:

```css
@media (hover: hover) {
	#site-navigation .sub-toggle:hover,
	#site-navigation li.menu-item-has-children:hover > .sub-toggle,
	#site-navigation li.page_item_has_children:hover > .sub-toggle {
		background: #FDEDE9;
		border-color: #F69581;
		color: #F69581;
	}

	#site-navigation .sub-toggle:hover.active,
	#site-navigation li.menu-item-has-children:hover > .sub-toggle.active,
	#site-navigation li.page_item_has_children:hover > .sub-toggle.active {
		background: #E5765C;
		border-color: #E5765C;
		color: #FFFFFF;
	}
}
```

### 4.4 `style.css` – ukotvení chipu k položce na mobilu

Na konci bloku `RESPONSIVE MENU FIX` přidat cílený blok. Chip se zarovná na
horní hranu `li`, takže zůstane u řádku nadřazené položky, i když se podmenu
rozbaluje pod ním:

```css
@media (max-width: 767px) {
	#site-navigation .sub-toggle,
	#site-navigation .sub-menu .sub-toggle,
	#site-navigation .sub-menu .sub-toggle.active {
		top: 0;
		bottom: auto;
		width: 40px;
		min-width: 40px;
		height: 40px;
		min-height: 40px;
		font-size: 16px;
		transform: none;
		-webkit-transform: none;
	}
}
```

Zdůvodnění rozměru: na mobilu má otevřené menu třídu `main-small-navigation`
a jeho odkaz má `padding: 10px 20px` s `line-height: 20px`, tedy řádek vysoký
přibližně 40 px ([`style.css`](../style.css:943)). Chip 40×40 px proto sedí
přesně do řádku a nepřesahuje do sousední položky. Tap target zůstává na celé
výšce řádku.

Otočení šipky zůstává na potomkovi `.fa`, takže `transform: none` na tlačítku
nic neruší (viz [`style.css`](../style.css:3069)).

### 4.5 `style.css` – focus

Rozdělit společné pravidlo focusu ([`style.css`](../style.css:3013)) a pro
chip použít kontrastnější obrys:

```css
#site-navigation .sub-toggle:focus-visible {
	outline: 2px solid #7A2E1E;
	outline-offset: 2px;
}
```

### 4.6 `rtl.css`

RTL blok řeší pouze vodorovné zrcadlení (`left`/`right`). Nové svislé
ukotvení z `style.css` platí i v RTL, protože `rtl.css` `top` ani `transform`
nepřebíjí. Změna v `rtl.css` tedy není nutná.

### 4.7 `js/navigation.js` – mobilní breakpoint

`matchMedia` dotaz v [`js/navigation.js`](../js/navigation.js:80) změnit
z `(max-width: 1024px), (hover: none)` na `(max-width: 767px)` a stejně tak
fallback `window.innerWidth <= 767`. V `reset()` změnit práh
z `window.innerWidth > 1024` na `> 767` ([`js/navigation.js`](../js/navigation.js:280)).
Díky tomu se auto-expand aktivní větve ani reset tříd nespouští na tabletu.

### 4.8 `style.css` – chipy jen do 767 px a tablet hover

Původní médium `@media (max-width: 1024px), (hover: none)`, které obaluje
vzhled a otevírání chipu, změnit na `@media (max-width: 767px)`. Nad 767 px
chip skrýt:

```css
@media (min-width: 768px) {
	#site-navigation .sub-toggle {
		display: none;
	}
}
```

Na tabletu theme podmenu vypínal (`display: none`), takže bez chipu by nešlo
otevřít. Obnovit hover dropdown:

```css
@media (min-width: 768px) and (max-width: 1024px) {
	#site-navigation.main-navigation .sub-menu,
	#site-navigation.main-navigation ul li:hover > ul.sub-menu,
	#site-navigation.main-navigation ul.menu-main-menu-container ul li:hover > ul.sub-menu {
		display: block;
	}
}
```

Podmenu zůstává mimo obraz pomocí `left: -99999px` z tématu a zobrazí se při
hoveru nebo focusu.

## 5. Co se nemění

- Žádná změna PHP, databáze, uloženého menu ani `aria` logiky.
- Breakpointy 767 px a 1024 px zůstávají, ale chip je nově vázaný jen na 767 px.
- Chování otevírání na mobilu zůstává; na tabletu se vrací původní hover dropdown.
- Plovoucí tlačítko `#scroll-up` zůstává zelené a kruhové, čímž se od růžových
  chipů dál vizuálně odlišuje.
- Šířka odsazení odkazu `padding-right: 64px` zůstává, protože 40px chip se do
  něj pohodlně vejde.

## 6. Testování

1. Mobil 390 px: zbalovací chip má bílé pozadí a růžový rámeček i šipku.
2. Mobil: tap na chip – podmenu se rozbalí, chip je plný `#F69581` s bílou šipkou.
3. Mobil: otevřené dlouhé podmenu – chip zůstává na řádku nadřazené položky,
   nesesouvá se doprostřed a nepřekrývá chipy vnořených položek.
4. Mobil: otevření několika podmenu pod sebou – každý chip zůstává u svého řádku.
5. Mobil: uzavření podmenu – chip se vrátí do zbalovacího stavu bez posunu.
6. Mobil: automaticky rozbalená aktuální větev – chip je plný růžový a správně ukotvený.
7. Mobil: dlouhý název položky se zalamuje – chip zůstává nahoře u řádku a text
   se s ním nepřekrývá.
8. Tablet 768 px a 1024 px: chipy nejsou vidět a podmenu se otevírá hoverem myši.
9. Desktop: chipy nejsou vidět, menu funguje beze změny.
10. Mobilní šířka na zařízení s hoverem: hover je světle růžový, rozbalovací
    hover tmavší růžový, žádný zelený stav.
11. Klávesnice: focus je viditelný tmavě červenohnědý, Enter a Space fungují.
12. RTL: chip je vlevo, svislé ukotvení funguje stejně.

## 7. Rollback

Vrátit `style.css` a `js/navigation.js` z předchozí verze. `rtl.css`, PHP soubory
ani databáze se touto úpravou nemění.

## 8. Ověření před nahráním

- Zkontrolovat, že v `style.css` už není zelená `#2D911F`, `#176B10`, `#123E0E`,
  `#EAF7E6` ani `#A9D8A1` v pravidlech pro `.sub-toggle`.
- Zkontrolovat, že na mobilu platí `top: 0` a `transform: none` pro `.sub-toggle`.
- Zkontrolovat, že nad 767 px platí `#site-navigation .sub-toggle { display: none; }`.
- `node --check js/navigation.js` – bez chyb.
- V `js/navigation.js` už není breakpoint 1024 pro `mq` ani pro `reset`.
