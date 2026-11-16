# 09 – Nechipové chování, značky vnořených podpoložek a rámování

Stav: **implementováno v pracovním stromu, čeká ruční testování**
Datum: 2026-11-16
Navazuje na [08-chip-f69581-a-poloha.md](08-chip-f69581-a-poloha.md).

## 0. Výsledek implementace

Změněné soubory:

- [`style.css`](../style.css:3031) – rozšíření `hover: none` bloku na
  `min-width: 768px`, rozšíření nechipového bloku na `min-width: 768px`,
  značka `fa-angle-right` barvou `#F69581` a rámování `#EFEFEF`,
- [`js/navigation.js`](../js/navigation.js:88) – `tabletMq` nahrazeno
  `nonChipMq` s `min-width: 768px`, pointer handlery omezené na zařízení bez
  hoveru nebo na pero,
- `rtl.css`, PHP soubory a databáze – beze změny.

Ověřeno:

- `node --check js/navigation.js` – bez chyb,
- CSS má vyvážené závorky (543/543),
- v `js/navigation.js` už není `tabletMq`.

## 1. Požadavky

1. Sjednotit nechipové chování pro všechna zařízení nad 767 px, včetně šířek
   1025 px a více, která nemají hover. Podmenu se má otevírat perem, myší nebo
   prvním tapem prstem, ne až navigací.
2. Vnořené položky hlavního menu (2. úroveň a níž), které mají vlastní
   podpoložky, dostanou v nechipovém režimu vpravo malou značku. Barva značky
   je `#F69581`.
3. Podpoložky menu budou vždy orámované velmi jemnou, velmi světle šedou linkou.

## 2. Současný stav a příčiny

- Chipy se zobrazují jen do 767 px ([`style.css`](../style.css:3037)).
- Tabletové CSS je omezené na 768–1024 px ([`style.css`](../style.css:3192)).
  Nad 1024 px se sice používá základní hover dropdown, ale zařízení bez hoveru
  nemá jak podmenu otevřít, protože JS logika je vázaná na `tabletMq`
  s rozsahem 768–1024 px ([`js/navigation.js`](../js/navigation.js:88)).
- Značky podpoložek v nechipovém režimu dnes nejsou. Theme má jen skrytí
  `::after` na tabletu ([`style.css`](../style.css:2694)) a žádný funkční
  ukazatel pro vnořené rodiče.
- Rámování podmenu je dnes nekonzistentní: theme používá `#F8F8F8`
  ([`style.css`](../style.css:804), [`style.css`](../style.css:837)),
  mobilní blok rámování ruší ([`style.css`](../style.css:3138)).

## 3. Navržené řešení

### 3.1 JS – nechipové chování nad 767 px

V [`js/navigation.js`](../js/navigation.js:88) nahradit `tabletMq` za
`nonChipMq` s dotazem `(min-width: 768px)` a fallbackem
`window.innerWidth >= 768`. Všechny tři handlery (`pointerover`, `pointerout`,
`click`) budou používat `nonChipMq`.

Aby JS nezasahoval do přirozeného CSS hoveru na myši, budou pointer handlery
aktivní jen tehdy, když zařízení nemá hover, nebo jde o pero:

```js
if ( hoverMq.matches && 'pen' !== original.pointerType ) {
	return;
}
```

Tím se chování sjednotí:

- 768–1024 px s hoverem: CSS hover dropdown, bez JS zásahu.
- 768–1024 px bez hoveru: první tap otevře podmenu, druhý naviguje.
- 1025 px a více s hoverem: CSS hover dropdown jako na desktopu.
- 1025 px a více bez hoveru: první tap/pointer otevře podmenu, druhý naviguje.
- Do 767 px: beze změny, používají se chipy.

### 3.2 CSS – nechipové otevírání nad 767 px

Tabletový blok [`style.css`](../style.css:3192) rozšířit z rozsahu
`(min-width: 768px) and (max-width: 1024px)` na `(min-width: 768px)`. Tím
budou pravidla pro `li.sub-menu-open > ul` s `left: auto` a vnořené
`left: 100%` platit i nad 1024 px.

Blok [`style.css`](../style.css:3031) s `(hover: none)` rozšířit na
`(min-width: 768px) and (hover: none)`, aby se na dotykových zařízeních nad
1024 px nezobrazoval zelený hover podklad.

### 3.3 CSS – značka vnořených podpoložek

Přidat blok pouze pro nechipový režim:

```css
@media (min-width: 768px) {
	#site-navigation .sub-menu li.menu-item-has-children > a,
	#site-navigation .sub-menu li.page_item_has_children > a,
	#site-navigation ul.children li.menu-item-has-children > a,
	#site-navigation ul.children li.page_item_has_children > a {
		position: relative;
		padding-right: 28px;
	}

	#site-navigation .sub-menu li.menu-item-has-children > a::after,
	#site-navigation .sub-menu li.page_item_has_children > a::after,
	#site-navigation ul.children li.menu-item-has-children > a::after,
	#site-navigation ul.children li.page_item_has_children > a::after {
		content: "\f105";
		font-family: FontAwesome;
		font-size: 10px;
		line-height: 1;
		color: #F69581;
		position: absolute;
		top: 50%;
		right: 10px;
		transform: translateY(-50%);
		pointer-events: none;
	}
}
```

- Jde o `fa-angle-right`, tedy malou šipku vpravo, která naznačuje další
  úroveň podmenu.
- Značka je jen na 2. úrovni a níž, protože selektory vyžadují `.sub-menu`
  nebo `ul.children`.
- Na mobilu do 767 px se blok neuplatní, tam roli ovládání plní chip.

### 3.4 CSS – jemné rámování podpoložek

Přidat konzistentní rámování pro všechny podpoložky hlavního menu:

```css
#site-navigation .sub-menu,
#site-navigation ul.children {
	border: 1px solid #EFEFEF;
}

#site-navigation .sub-menu > li,
#site-navigation ul.children > li {
	border-bottom: 1px solid #EFEFEF;
}

#site-navigation .sub-menu > li:last-child,
#site-navigation ul.children > li:last-child {
	border-bottom: 0;
}
```

- `#EFEFEF` je velmi světlá šedá, jemná, ale stále čitelná.
- Pravidla mají ID selektor, takže přebijí mobilní `border: 0`
  ([`style.css`](../style.css:3138)) i původní `#F8F8F8`.
- Rámování platí ve všech režimech, tedy i na mobilu a tabletu.

## 4. Co se nemění

- Chování chipů do 767 px zůstává.
- Barvy chipu `#F69581` a jeho stavy zůstávají.
- Žádná změna PHP, databáze ani uloženého menu.
- Plovoucí tlačítko `#scroll-up` zůstává zelené a kruhové.

## 5. Testování

1. Mobil 390 px: chipy fungují jako dosud, značky se nezobrazují.
2. Tablet 768 px s myší: podmenu se otevře hoverem, bez zásahu JS.
3. Tablet 768 px s dotykem: první tap otevře podmenu, druhý naviguje.
4. Tablet 1024 px: stejné chování jako 768 px.
5. Dotykový notebook 1025 px a více bez hoveru: první tap otevře podmenu,
   druhý naviguje.
6. Desktop 1025 px a více s myší: hover dropdown beze změny.
7. Vnořené položky 2. úrovně s podpoložkami: vpravo je malá šipka `#F69581`.
8. Top-level položky hlavního menu značku nemají.
9. Podmenu má jemný rám `#EFEFEF` a spodní linku mezi položkami.
10. Poslední podpoložka nemá spodní linku.
11. RTL: rámování sedí, značka je zrcadlená nebo alespoň čitelná.
12. Klávesnice: focus a Enter fungují beze změny.

## 6. Rollback

Vrátit `style.css` a `js/navigation.js` z předchozí verze. PHP soubory,
`rtl.css` ani databáze se nemění.

## 7. Ověření před nahráním

- `node --check js/navigation.js` – bez chyb.
- V `js/navigation.js` už není `tabletMq` s horní hranicí 1024 px.
- V `style.css` je tabletový blok rozšířený na `min-width: 768px`.
- Značka používá `#F69581` a rámování `#EFEFEF`.
