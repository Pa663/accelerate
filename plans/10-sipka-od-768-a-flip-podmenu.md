# 10 – Šipka vnořených položek od 768 px a překlopení podmenu

Stav: **implementováno v pracovním stromu, čeká ruční testování**
Datum: 2026-11-16
Navazuje na [09-nechipove-chovani-znacky-a-ramovani.md](09-nechipove-chovani-znacky-a-ramovani.md).

## 0. Výsledek implementace

- V [`style.css`](../style.css:3227) je u značky doplněné `display: block`,
  takže šipka funguje už od 768 px.
- Ve [`style.css`](../style.css:3247) je blok `sub-menu-flip` pouze pro vnořené
  úrovně s `left: auto; right: 100%`.
- V [`js/navigation.js`](../js/navigation.js:192) je funkce
  `updateSubmenuFlip`, která flipuje jen vnořené položky a měří přetečení
  pravého okraje.
- Flip se volá z `pointerover`, `focusin`, `resize` a uklízí se v `reset()`.
- Ověřeno: `node --check js/navigation.js` bez chyb, CSS má vyvážené závorky
  (545/545).

## 1. Požadavky

1. Malá šipka u vnořených položek s podpoložkami se má zobrazovat konzistentně
   už od 768 px, ne až od 1025 px.
2. Pokud je menu 2. a vyšší úrovně moc vpravo a podnabídka vylézá ze stránky,
   má se překlopit na druhou stranu.

## 2. Příčina chybějící šipky na 768–1024 px

Theme má v rozsahu 768–1024 px pravidlo, které `::after` u nadřazených odkazů
skrývá:

```css
.main-navigation li.menu-item-has-children > a::after,
.main-navigation li.page_item_has_children > a::after {
	display: none;
}
```

Viz [`style.css`](../style.css:2694). Naše značka v
[`style.css`](../style.css:3227) nastavuje `content`, barvu i pozici, ale
`display` nenastavuje. Proto na 768–1024 px zůstává `display: none` z tématu
a šipka se objeví až nad 1024 px, kde skrývací pravidlo neplatí.

**Oprava:** doplnit do pravidla `::after` vlastnost `display: block;`.

## 3. Překlopení podmenu

### 3.1 CSS

Flip se týká jen vnořených úrovní (2. a níž). První úroveň zůstává
na výchozím chování. Pro vnořené podmenu se překlopí vlevo (`right: 100%`):

```css
@media (min-width: 768px) {
	#site-navigation .sub-menu li.sub-menu-flip > ul.sub-menu,
	#site-navigation .sub-menu li.sub-menu-flip > ul.children,
	#site-navigation ul.children li.sub-menu-flip > ul.sub-menu,
	#site-navigation ul.children li.sub-menu-flip > ul.children {
		left: auto;
		right: 100%;
	}
}
```

Selektory s ID přebijí výchozí `left: 100%` i `left: auto` z tématu a
z bloku v [`style.css`](../style.css:3191).

### 3.2 JavaScript

Přidat pomocnou funkci, která změří položku a šířku jejího přímého podmenu.
Pokud by podmenu přeteklo pravý okraj viewportu, přidá na `li` třídu
`sub-menu-flip`:

```js
function updateSubmenuFlip( $li ) {
	if ( ! nonChipMq.matches ) {
		$li.removeClass( 'sub-menu-flip' );
		return;
	}

	var $sub = getSubmenu( $li );

	if ( ! $sub.length ) {
		return;
	}

	var nested = $li.parent().is( 'ul.sub-menu, ul.children' );

	if ( ! nested ) {
		$li.removeClass( 'sub-menu-flip' );
		return;
	}

	var rect = $li[ 0 ].getBoundingClientRect();
	var width = $sub.outerWidth() || 200;
	var viewport = document.documentElement.clientWidth;
	var overflow = rect.right + width > viewport;

	$li.toggleClass( 'sub-menu-flip', overflow );
}
```

Volání:

- v `pointerover` handleru hned po kontrole `nonChipMq`, aby se flip
  vyhodnotil i na zařízeních s hoverem,
- na `focusin` nad položkami s podpoložkami kvůli klávesnici,
- na `resize` pro všechny položky s podpoložkami,
- v `reset()` odstranit `sub-menu-flip`, aby nezůstal na mobilu.

Šířka podmenu se bere z `outerWidth()`, s fallbackem `200px`, protože
u skrytého podmenu může být naměřená šířka nulová.

## 4. Co se nemění

- Chování chipů do 767 px.
- Nechipové otevírání z plánu 09.
- Barvy, rámování a dokumentace z plánu 09.
- PHP soubory a databáze.

## 5. Testování

1. Tablet 768 a 1024 px: vnořená položka s podpoložkami má vpravo šipku.
2. Desktop 1025 px a více: šipka zůstává.
3. Mobil 390 px: šipka se nezobrazuje, používají se chipy.
4. První úroveň se nepřeklápí, i když je položka vpravo.
5. Třetí úroveň u pravého okraje: podnabídka se otevře vlevo.
6. Vnořená položka vlevo: podmenu zůstane na výchozí straně.
7. Změna šířky okna: flip se přepočítá.
8. Klávesnicový focus: flip se vyhodnotí i bez myši.
9. RTL: chování je zrcadlené nebo alespoň čitelné.

## 6. Rollback

Vrátit `style.css` a `js/navigation.js` z předchozí verze.

## 7. Ověření před nahráním

- `node --check js/navigation.js` – bez chyb.
- CSS má vyvážené závorky.
- V `::after` pravidle je `display: block`.
- Třída `sub-menu-flip` má CSS pravidla pro první i vnořenou úroveň.
