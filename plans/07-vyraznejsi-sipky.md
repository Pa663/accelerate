# 07 – Výraznější šipky podmenu a odlišení plovoucího tlačítka

Stav: **implementováno, čeká ruční testování**
Datum: 2026-11-16
Navazuje na [06-implementovane-zmeny.md](06-implementovane-zmeny.md).

## 1. Problém

Současné tlačítko šipky podmenu je funkčně správné, ale vizuálně slabé:

- průhledné pozadí a tmavě šedá ikona splývá s bílým řádkem,
- ikona `fa-caret-down` je vyplněný trojúhelník o velikosti 16 px,
- tlačítko je sice 48×44 px, ale protože nemá pozadí ani ohraničení, uživatel
  nemá jistotu, kam přesně má tapnout,
- na zeleném řádku aktuální položky je ikona bílá a ještě méně výrazná.

Současně existuje plovoucí tlačítko `#scroll-up` (zpět nahoru) v pravém dolním rohu
([`footer.php`](../footer.php:36), [`style.css`](../style.css:2101)). To je také zelené,
poloprůhledné a má dlouhou šipku. Pokud by nové chipy podmenu byly také zelené a bez
ohraničení, mohly by s ním vizuálně splývat. Navíc při otevřeném dlouhém mobilním menu
může plovoucí tlačítko překrývat spodní položky menu.

Cílem je proto:

1. udělat šipku podmenu zřetelným, snadno trefitelným prvkem uvnitř řádku,
2. tvarově, barevně a ikonou ji odlišit od plovoucího tlačítka zpět nahoru,
3. skrýt plovoucí tlačítko, dokud je mobilní menu otevřené.

## 2. Navržené odlišení

| Prvek | Tvar | Ikona | Barvy | Umístění |
| --- | --- | --- | --- | --- |
| Šipka podmenu | zaoblený čtverec 44×44 px, radius 8 px | `fa-chevron-down` | světle zelené pozadí, tmavě zelená ikona | uvnitř řádku vpravo |
| Plovoucí zpět nahoru | kruh 48×48 px | `fa-long-arrow-up` | tmavě zelené pozadí, bílá ikona, stín | fixně vpravo dole |

Rozdíly jsou záměrné:

- jiný tvar: čtverec versus kruh,
- jiná ikona: dolů orientovaný chevron versus dlouhá šipka nahoru,
- jiná barva: světlý chip versus tmavý plný kruh,
- jiné chování: chip je součást řádku, plovoucí tlačítko je fixní.

## 3. Změny po souborech

### 3.1 `js/navigation.js`

**Ikona šipky** – na řádku, kde se vytváří tlačítko
([`js/navigation.js`](../js/navigation.js:194)), změnit třídu:

```diff
- 'class': 'fa fa-caret-down',
+ 'class': 'fa fa-chevron-down',
```

`fa-chevron-down` je v použité FontAwesome 4.7 dostupná
([`fontawesome/css/font-awesome.css`](../fontawesome/css/font-awesome.css:533)).

**Stav otevřeného menu pro skrytí plovoucího tlačítka** – v handleru hamburgeru
přidávat a odebírat třídu na `body`:

```js
if ( isSmall ) {
	closeAll( false );
	$( 'body' ).removeClass( 'accelerate-menu-open' );
} else {
	autoExpandCurrentBranch();
	$( 'body' ).addClass( 'accelerate-menu-open' );
}
```

V reset funkci při přechodu na desktop třídu odstranit:

```js
if ( ! mq.matches ) {
	$( 'body' ).removeClass( 'accelerate-menu-open' );
}
```

Třída se používá pouze pro CSS a nemění žádné uložené nastavení.

### 3.2 `style.css` – chip šipky podmenu

V bloku `RESPONSIVE MENU FIX`
([`style.css`](../style.css:3032)) upravit pravidla pro `.sub-toggle`:

```css
#site-navigation .sub-toggle,
#site-navigation .sub-menu .sub-toggle {
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	top: 50%;
	right: 8px;
	bottom: auto;
	width: 44px;
	height: 44px;
	min-width: 44px;
	min-height: 44px;
	margin: 0;
	padding: 0;
	background: #EAF7E6;
	border: 1px solid #A9D8A1;
	border-radius: 8px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
	color: #176B10;
	font-family: inherit;
	font-size: 18px;
	font-weight: 400;
	line-height: 1;
	text-align: center;
	text-decoration: none;
	cursor: pointer;
	z-index: 2;
	touch-action: manipulation;
	-webkit-tap-highlight-color: transparent;
	-webkit-appearance: none;
	appearance: none;
	transform: translateY(-50%);
	transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

#site-navigation .sub-toggle .fa {
	pointer-events: none;
	transition: transform 0.2s ease;
	transform: rotate(0deg);
}

#site-navigation .sub-toggle.active .fa,
#site-navigation .sub-toggle[aria-expanded="true"] .fa {
	transform: rotate(180deg);
}

#site-navigation .sub-menu .sub-toggle,
#site-navigation .sub-menu .sub-toggle.active {
	transform: translateY(-50%);
}

#site-navigation .menu-item-has-children > a,
#site-navigation .page_item_has_children > a {
	padding-right: 64px;
}

#site-navigation .sub-toggle.active,
#site-navigation .sub-toggle[aria-expanded="true"] {
	background: #2D911F;
	border-color: #2D911F;
	color: #FFFFFF;
}
```

Dále nahradit dosavadní pravidla pro aktuální položku:

```css
#site-navigation > ul > li.current-menu-ancestor > .sub-toggle,
#site-navigation > ul > li.current-menu-item > .sub-toggle,
#site-navigation > ul > li.current_page_ancestor > .sub-toggle,
#site-navigation > ul > li.current_page_item > .sub-toggle {
	background: #FFFFFF;
	border-color: #FFFFFF;
	color: #176B10;
}

#site-navigation > ul > li.current-menu-ancestor > .sub-toggle.active,
#site-navigation > ul > li.current-menu-item > .sub-toggle.active,
#site-navigation > ul > li.current_page_ancestor > .sub-toggle.active,
#site-navigation > ul > li.current_page_item > .sub-toggle.active {
	background: #123E0E;
	border-color: #123E0E;
	color: #FFFFFF;
}
```

V mobilním bloku nahradit bílou barvu ikony stejným chipem:

```css
#site-navigation li.current-menu-item > .sub-toggle,
#site-navigation li.current_page_item > .sub-toggle,
#site-navigation .sub-menu li.current-menu-item > .sub-toggle,
#site-navigation .sub-menu li.current_page_item > .sub-toggle,
#site-navigation ul.children li.current-menu-item > .sub-toggle,
#site-navigation ul.children li.current_page_item > .sub-toggle {
	background: #FFFFFF;
	border-color: #FFFFFF;
	color: #176B10;
}

#site-navigation li.current-menu-item > .sub-toggle.active,
#site-navigation li.current_page_item > .sub-toggle.active,
#site-navigation .sub-menu li.current-menu-item > .sub-toggle.active,
#site-navigation .sub-menu li.current_page_item > .sub-toggle.active,
#site-navigation ul.children li.current-menu-item > .sub-toggle.active,
#site-navigation ul.children li.current_page_item > .sub-toggle.active {
	background: #123E0E;
	border-color: #123E0E;
	color: #FFFFFF;
}
```

Hover řešit pouze na zařízeních s hoverem, aby na iOS nezůstával sticky stav:

```css
@media (hover: hover) {
	#site-navigation .sub-toggle:hover,
	#site-navigation li.menu-item-has-children:hover > .sub-toggle,
	#site-navigation li.page_item_has_children:hover > .sub-toggle {
		background: #FFFFFF;
		border-color: #FFFFFF;
		color: #176B10;
	}

	#site-navigation .sub-toggle:hover.active,
	#site-navigation li.menu-item-has-children:hover > .sub-toggle.active,
	#site-navigation li.page_item_has_children:hover > .sub-toggle.active {
		background: #123E0E;
		border-color: #123E0E;
		color: #FFFFFF;
	}
}
```

### 3.3 `style.css` – plovoucí tlačítko zpět nahoru

Na konec bloku `RESPONSIVE MENU FIX` doplnit odlišení a skrytí při otevřeném menu:

```css
a#scroll-up {
	right: 20px;
	bottom: calc(20px + env(safe-area-inset-bottom, 0px));
	width: 48px;
	height: 48px;
	padding: 0;
	border-radius: 50%;
	background-color: #2D911F;
	opacity: 0.9;
	filter: none;
	text-align: center;
	line-height: 48px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
	z-index: 999;
}

a#scroll-up i {
	font-size: 18px;
	line-height: 48px;
}

a#scroll-up:hover {
	background-color: #1F7A16;
	opacity: 1;
}

@media (max-width: 767px) {
	body.accelerate-menu-open #scroll-up {
		visibility: hidden;
		pointer-events: none;
	}
}
```

Použití `visibility` místo `display` je záměrné: jQuery při `fadeIn()` nastavuje inline
`display`, takže `display: none` v CSS by se musel přebíjet `!important`. `visibility`
inline nastavená není, takže se skrytí projeví spolehlivě a po zavření menu se tlačítko
vrátí podle aktuální pozice stránky.

### 3.4 `rtl.css`

V RTL bloku upravit zrcadlení chipu i plovoucího tlačítka:

```css
#site-navigation .sub-toggle,
#site-navigation .sub-menu .sub-toggle {
	right: auto;
	left: 8px;
}

#site-navigation .menu-item-has-children > a,
#site-navigation .page_item_has_children > a {
	padding-right: 0;
	padding-left: 64px;
}

a#scroll-up {
	right: auto;
	left: 20px;
}
```

## 4. Přístupnost a použitelnost

- Tap target 44×44 px splňuje doporučení pro dotyk.
- Ikona má 18 px a tmavě zelenou barvu na světlém pozadí, kontrast je výrazně vyšší
  než u průhledného tlačítka.
- Stav je čitelný nejen barvou, ale i otočením ikony a `aria-expanded`.
- Focus zůstává viditelný přes `:focus-visible`.
- Plovoucí tlačítko je odlišeno tvarem, ikonou i barvou, takže si ho uživatel
  nesplete se šipkou podmenu.
- Při otevřeném mobilním menu plovoucí tlačítko nezakrývá spodní položky.
- Na mobilu a tabletu se zvětší odsazení odkazu z 56 na 64 px, aby se text
  nepřekrýval s chipem.

## 5. Co se nemění

- Žádná změna PHP, databáze ani uloženého menu.
- Žádná změna chování otevírání, zavírání ani auto-expandu.
- Žádná změna ostatních barev menu.
- Plovoucí tlačítko si ponechává stávající funkci a skrývání podle scroll pozice.

## 6. Testování

1. Mobil 390 px: šipka je zřetelně vidět, tap na ni otevře podmenu.
2. Mobil: otevřený stav má plnou zelenou a otočenou ikonu.
3. Mobil: aktuální položka má bílý chip, otevřený stav tmavě zelený.
4. Mobil: otevřené dlouhé menu – plovoucí tlačítko zpět nahoru není vidět.
5. Mobil: zavření menu – plovoucí tlačítko se vrátí, pokud je stránka odscrollovaná.
6. Tablet 768 a 1024 px: chip je uvnitř řádku, text se nepřekrývá.
7. iPad Pro na šířku: chip je vidět i v dotykovém režimu.
8. Desktop: chipy nejsou vidět, plovoucí tlačítko je kruhové a výrazné.
9. RTL: chip je vlevo, plovoucí tlačítko vlevo dole, odsazení zrcadlené.
10. Klávesnice: focus je viditelný, Enter a Space fungují.
11. Dlouhý název položky se zalamuje a chip zůstává vpravo.

## 7. Ověření před nahráním

Ověřeno po implementaci:

- `php -l header.php` – bez chyb
- `php -l inc/functions.php` – bez chyb
- `node --check js/navigation.js` – bez chyb

V CSS se změnila pouze pravidla v bloku `RESPONSIVE MENU FIX` a cílené pravidlo
`a#scroll-up`.

## 8. Rollback

Vrátit `style.css`, `rtl.css` a `js/navigation.js` z předchozí verze.
PHP soubory se této úpravy netýkají.