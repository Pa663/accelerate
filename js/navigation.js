/**
 * navigation.js
 *
 * Handles the responsive navigation menu.
 *
 * @package Accelerate
 */
( function() {
	'use strict';

	var container = document.getElementById( 'site-navigation' );
	if ( ! container ) {
		return;
	}

	var menu = container.getElementsByTagName( 'ul' )[ 0 ];
	var button = container.getElementsByClassName( 'menu-toggle' )[ 0 ];

	// Hide the menu toggle when there is no menu and return early.
	if ( ! menu ) {
		if ( button ) {
			button.style.display = 'none';
		}
		return;
	}

	if ( -1 === menu.className.indexOf( 'nav-menu' ) ) {
		menu.className += ' nav-menu';
	}

	if ( ! menu.id ) {
		menu.id = 'primary-menu';
	}

	if ( button ) {
		button.setAttribute( 'aria-controls', menu.id );
	}

	// Get all the link elements within the menu.
	var links = menu.getElementsByTagName( 'a' );
	var i;
	var len;

	/**
	 * Sets or removes the .focus class on an element.
	 */
	function toggleFocus() {
		var self = this;

		// Move up through the ancestors of the current link until we hit .nav-menu.
		while ( self && -1 === self.className.indexOf( 'nav-menu' ) ) {
			// On li elements toggle the class .focus.
			if ( 'li' === self.tagName.toLowerCase() ) {
				if ( -1 !== self.className.indexOf( 'focus' ) ) {
					self.className = self.className.replace( ' focus', '' );
				} else {
					self.className += ' focus';
				}
			}

			self = self.parentElement;
		}
	}

	// Each time a menu link is focused or blurred, toggle focus.
	for ( i = 0, len = links.length; i < len; i++ ) {
		links[ i ].addEventListener( 'focus', toggleFocus, true );
		links[ i ].addEventListener( 'blur', toggleFocus, true );
	}
} )();

jQuery( function( $ ) {
	'use strict';

	var l10n = window.accelerateMenuL10n || {
		expand: 'Open submenu',
		collapse: 'Close submenu'
	};

	var mq = window.matchMedia ? window.matchMedia( '(max-width: 767px)' ) : {
		matches: window.innerWidth <= 767,
		addListener: function() {},
		removeListener: function() {}
	};

	// Non-chip widths have no usable CSS hover on touch input, so the dropdown
	// is opened from pointer events instead of :hover alone.
	var nonChipMq = window.matchMedia ? window.matchMedia( '(min-width: 768px)' ) : {
		matches: 768 <= window.innerWidth
	};

	var hoverMq = window.matchMedia ? window.matchMedia( '(hover: hover)' ) : {
		matches: true
	};

	var lastPointerType = '';

	function getNav() {
		return $( '#site-navigation' );
	}

	/**
	 * Opens or closes a single submenu and keeps ARIA state in sync.
	 */
	function setState( $btn, open, animate ) {
		var $li = $btn.parent();
		var $sub = $li.children( 'ul.sub-menu, ul.children' ).first();

		if ( ! $sub.length ) {
			return;
		}

		$btn.attr( 'aria-expanded', open ? 'true' : 'false' )
			.toggleClass( 'active', open )
			.find( '.screen-reader-text' )
			.text( open ? l10n.collapse : l10n.expand );

		function cleanupDescendants() {
			$li.find( '.sub-toggle' ).not( $btn )
				.attr( 'aria-expanded', 'false' )
				.removeClass( 'active' );
			$li.find( '.sub-menu-open' ).not( $li ).removeClass( 'sub-menu-open' );
			$li.find( 'ul.sub-menu, ul.children' ).not( $sub ).removeAttr( 'style' );
		}

		if ( animate ) {
			if ( open ) {
				$sub.stop( true, true ).slideDown( 200 );
				$li.addClass( 'sub-menu-open' );
			} else {
				$li.removeClass( 'sub-menu-open' );
				$sub.stop( true, true ).slideUp( 200, cleanupDescendants );
			}
		} else {
			$li.toggleClass( 'sub-menu-open', open );
			$sub.stop( true, true )[ open ? 'show' : 'hide' ]();

			if ( ! open ) {
				cleanupDescendants();
			}
		}
	}

	function closeAll( animate ) {
		getNav().find( '.sub-toggle[aria-expanded="true"]' ).each( function() {
			setState( $( this ), false, animate );
		} );
	}

	/**
	 * Returns the direct submenu of a menu item.
	 */
	function getSubmenu( $li ) {
		return $li.children( 'ul.sub-menu, ul.children' ).first();
	}

	/**
	 * Tablet replacement for CSS hover: opens the branch without navigating.
	 */
	function openTabletBranch( $li ) {
		var $sub = getSubmenu( $li );

		if ( ! $sub.length || $li.hasClass( 'sub-menu-open' ) ) {
			return;
		}

		$li.siblings( '.sub-menu-open' ).each( function() {
			closeTabletBranch( $( this ) );
		} );

		var $btn = $li.children( '.sub-toggle' ).first();

		if ( $btn.length ) {
			setState( $btn, true, false );
		} else {
			$li.addClass( 'sub-menu-open' );
			$sub.stop( true, true ).show();
		}
	}

	function closeTabletBranch( $li ) {
		var $btn = $li.children( '.sub-toggle' ).first();

		if ( $btn.length ) {
			setState( $btn, false, false );
		}

		$li.removeClass( 'sub-menu-open' );
		getSubmenu( $li ).stop( true, true ).hide();
	}

	/**
	 * Flips a nested submenu to the left when it would overflow the viewport.
	 */
	function updateSubmenuFlip( $li ) {
		var nested = $li.parent().is( 'ul.sub-menu, ul.children' );

		if ( ! nonChipMq.matches || ! nested ) {
			$li.removeClass( 'sub-menu-flip' );
			return;
		}

		var $sub = getSubmenu( $li );

		if ( ! $sub.length ) {
			return;
		}

		var rect = $li[ 0 ].getBoundingClientRect();
		var width = $sub.outerWidth() || 200;
		var viewport = document.documentElement.clientWidth;

		$li.toggleClass( 'sub-menu-flip', rect.right + width > viewport );
	}

	/**
	 * Expands the branch that belongs to the current page.
	 *
	 * WordPress adds current-menu-ancestor and related classes on the server,
	 * so the state survives reloads without using sessionStorage.
	 */
	function autoExpandCurrentBranch() {
		if ( ! mq.matches ) {
			return;
		}

		getNav().find(
			'li.current-menu-item, li.current_page_item,' +
			' li.current-menu-ancestor, li.current-menu-parent,' +
			' li.current_page_ancestor, li.current_page_parent'
		).each( function() {
			var $li = $( this );
			var $btn = $li.children( '.sub-toggle' );

			if ( $btn.length && $li.children( 'ul.sub-menu, ul.children' ).length ) {
				setState( $btn, true, false );
			}
		} );
	}

	/**
	 * Adds an accessible toggle button to every item with children.
	 */
	function initNav() {
		var $nav = getNav();

		if ( ! $nav.length ) {
			return;
		}

		$nav.find( '.menu-item-has-children, .page_item_has_children' ).each( function( index ) {
			var $li = $( this );
			var $sub = $li.children( 'ul.sub-menu, ul.children' ).first();
			var $link = $li.children( 'a' ).first();

			if ( ! $sub.length || ! $link.length || $li.children( '.sub-toggle' ).length ) {
				return;
			}

			if ( ! $sub.attr( 'id' ) ) {
				$sub.attr( 'id', 'accelerate-sub-menu-' + index );
			}

			var $button = $( '<button>', {
				type: 'button',
				'class': 'sub-toggle',
				'aria-haspopup': 'true',
				'aria-expanded': 'false',
				'aria-controls': $sub.attr( 'id' )
			} );

			$button.append( $( '<i>', {
				'class': 'fa fa-chevron-down',
				'aria-hidden': 'true'
			} ) );

			$button.append( $( '<span>', {
				'class': 'screen-reader-text'
			} ).text( l10n.expand ) );

			$link.after( $button );
		} );

		$nav.find( '.menu-toggle' ).attr( 'aria-expanded', 'false' );

		autoExpandCurrentBranch();
	}

	// Remembers the pointer type because some browsers omit it on click.
	$( document ).on( 'pointerdown', function( event ) {
		var original = event.originalEvent || {};

		lastPointerType = original.pointerType || '';
	} );

	// Non-chip widths: pen or mouse hover opens the dropdown without a click.
	// Contact (buttons) and touch are ignored here, they are handled by click.
	$( document ).on( 'pointerover', '#site-navigation li.menu-item-has-children, #site-navigation li.page_item_has_children', function( event ) {
		if ( ! nonChipMq.matches ) {
			return;
		}

		updateSubmenuFlip( $( this ) );

		var original = event.originalEvent || {};

		if ( hoverMq.matches && 'pen' !== original.pointerType ) {
			return;
		}

		if ( 'touch' === original.pointerType || original.buttons ) {
			return;
		}

		if ( original.relatedTarget && this.contains( original.relatedTarget ) ) {
			return;
		}

		openTabletBranch( $( this ) );
	} );

	$( document ).on( 'pointerout', '#site-navigation li.menu-item-has-children, #site-navigation li.page_item_has_children', function( event ) {
		if ( ! nonChipMq.matches ) {
			return;
		}

		var original = event.originalEvent || {};

		if ( hoverMq.matches && 'pen' !== original.pointerType ) {
			return;
		}

		// Touch and pen keep the branch open until another item or outside
		// tap closes it, otherwise a tap would open and immediately close it.
		if ( 'touch' === original.pointerType || 'pen' === original.pointerType ) {
			return;
		}

		if ( original.relatedTarget && this.contains( original.relatedTarget ) ) {
			return;
		}

		closeTabletBranch( $( this ) );
	} );

	// Keyboard focus can flip a nested submenu too.
	$( document ).on( 'focusin', '#site-navigation li.menu-item-has-children, #site-navigation li.page_item_has_children', function() {
		if ( nonChipMq.matches ) {
			updateSubmenuFlip( $( this ) );
		}
	} );

	// A viewport change can move a submenu over the right edge.
	$( window ).on( 'resize', function() {
		if ( ! nonChipMq.matches ) {
			return;
		}

		getNav().find( 'li.menu-item-has-children, li.page_item_has_children' ).each( function() {
			updateSubmenuFlip( $( this ) );
		} );
	} );

	// Non-chip touch: the first tap opens the branch instead of navigating.
	// A second tap on an already open parent link follows the link.
	$( document ).on( 'click', '#site-navigation li.menu-item-has-children > a, #site-navigation li.page_item_has_children > a', function( event ) {
		if ( ! nonChipMq.matches ) {
			return;
		}

		var original = event.originalEvent || {};
		var pointerType = original.pointerType || lastPointerType;
		var touchLike = 'touch' === pointerType || 'pen' === pointerType || ! hoverMq.matches;
		var $li = $( this ).parent();

		// Keyboard activation (detail 0) always follows the link.
		if ( 0 === original.detail || ! touchLike || $li.hasClass( 'sub-menu-open' ) ) {
			return;
		}

		event.preventDefault();
		openTabletBranch( $li );
	} );

	// Toggle a submenu. The parent link is never intercepted.
	$( document ).on( 'click', '#site-navigation .sub-toggle', function( event ) {
		event.preventDefault();
		event.stopPropagation();

		var $btn = $( this );
		var open = 'true' !== $btn.attr( 'aria-expanded' );

		// Accordion behaviour on the same level.
		$btn.parent().siblings( '.sub-menu-open' ).each( function() {
			var $siblingBtn = $( this ).children( '.sub-toggle' );

			if ( $siblingBtn.length ) {
				setState( $siblingBtn, false, true );
			}
		} );

		setState( $btn, open, true );
	} );

	// Hamburger toggle.
	$( document ).on( 'click', '#site-navigation .menu-toggle', function() {
		var $nav = getNav();
		var $toggle = $( this );
		var isSmall = $nav.hasClass( 'main-small-navigation' );

		$toggle.attr( 'aria-expanded', isSmall ? 'false' : 'true' );
		$nav.toggleClass( 'main-small-navigation', ! isSmall );
		$nav.toggleClass( 'main-navigation', isSmall );

		if ( isSmall ) {
			closeAll( false );
			$( 'body' ).removeClass( 'accelerate-menu-open' );
		} else {
			autoExpandCurrentBranch();
			$( 'body' ).addClass( 'accelerate-menu-open' );
		}
	} );

	// Escape closes open submenus and returns focus to the parent link.
	$( document ).on( 'keydown', function( event ) {
		var key = event.key || event.keyCode;

		if ( 'Escape' === key || 'Esc' === key || 27 === key ) {
			var $open = getNav().find( '.sub-toggle[aria-expanded="true"]' ).last();

			closeAll( true );

			if ( $open.length ) {
				$open.parent().children( 'a' ).first().trigger( 'focus' );
			}
		}
	} );

	// A click outside the navigation closes open submenus.
	$( document ).on( 'click', function( event ) {
		if ( ! $( event.target ).closest( '#site-navigation' ).length ) {
			closeAll( true );
		}
	} );

	function reset() {
		closeAll( false );

		getNav().find( '.sub-toggle' ).attr( 'aria-expanded', 'false' ).removeClass( 'active' );
		getNav().find( '.sub-menu-open' ).removeClass( 'sub-menu-open' );
		getNav().find( '.sub-menu-flip' ).removeClass( 'sub-menu-flip' );
		getNav().find( 'ul.sub-menu, ul.children' ).removeAttr( 'style' );

		// Leaving the mobile width must not leave the menu in the collapsed state.
		if ( window.innerWidth > 767 ) {
			getNav().removeClass( 'main-small-navigation' ).addClass( 'main-navigation' );
			getNav().find( '.menu-toggle' ).attr( 'aria-expanded', 'false' );
			$( 'body' ).removeClass( 'accelerate-menu-open' );
		}

		if ( mq.matches ) {
			autoExpandCurrentBranch();
		} else {
			$( 'body' ).removeClass( 'accelerate-menu-open' );
		}
	}

	if ( mq.addEventListener ) {
		mq.addEventListener( 'change', reset );
	} else if ( mq.addListener ) {
		mq.addListener( reset );
	}

	window.addEventListener( 'orientationchange', reset );

	// Re-initialise after a Customizer selective refresh of the menu.
	$( document ).on( 'customize-preview-menu-refreshed', initNav );

	initNav();
} );
