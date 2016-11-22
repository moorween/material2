import {
  ComponentFactoryResolver,
  Injectable,
  ApplicationRef,
  Injector,
  NgZone,
  Provider,
} from '@angular/core';
import {OverlayState} from './overlay-state';
import {DomPortalHost} from '../portal/dom-portal-host';
import {OverlayRef} from './overlay-ref';
import {OverlayPositionBuilder} from './position/overlay-position-builder';
import {VIEWPORT_RULER_PROVIDER} from './position/viewport-ruler';
import {OverlayContainer, OVERLAY_CONTAINER_PROVIDER} from './overlay-container';
import {SCROLL_DISPATCHER_PROVIDER} from './scroll/scroll-dispatcher';
import {DISABLE_BODY_SCROLL_PROVIDER} from './disable-body-scroll';


/** Next overlay unique ID. */
let nextUniqueId = 0;

/** The default state for newly created overlays. */
let defaultState = new OverlayState();


/**
 * Service to create Overlays. Overlays are dynamically added pieces of floating UI, meant to be
 * used as a low-level building building block for other components. Dialogs, tooltips, menus,
 * selects, etc. can all be built using overlays. The service should primarily be used by authors
 * of re-usable components rather than developers building end-user applications.
 *
 * An overlay *is* a PortalHost, so any kind of Portal can be loaded into one.
 */
 @Injectable()
export class Overlay {
  constructor(private _overlayContainer: OverlayContainer,
              private _componentFactoryResolver: ComponentFactoryResolver,
              private _positionBuilder: OverlayPositionBuilder,
              private _appRef: ApplicationRef,
              private _injector: Injector,
              private _ngZone: NgZone) {}

  /**
   * Creates an overlay.
   * @param state State to apply to the overlay.
   * @returns Reference to the created overlay.
   */
  create(state: OverlayState = defaultState): OverlayRef {
    return this._createOverlayRef(this._createPaneElement(), state);
  }

  /**
   * Returns a position builder that can be used, via fluent API,
   * to construct and configure a position strategy.
   */
  position(): OverlayPositionBuilder {
    return this._positionBuilder;
  }

  /**
   * Creates the DOM element for an overlay and appends it to the overlay container.
   * @returns Newly-created pane element
   */
  private _createPaneElement(): HTMLElement {
    let pane = document.createElement('div');
    pane.id = `cdk-overlay-${nextUniqueId++}`;
    pane.classList.add('cdk-overlay-pane');

    this._overlayContainer.getContainerElement().appendChild(pane);

    return pane;
  }

  /**
   * Create a DomPortalHost into which the overlay content can be loaded.
   * @param pane The DOM element to turn into a portal host.
   * @returns A portal host for the given DOM element.
   */
  private _createPortalHost(pane: HTMLElement): DomPortalHost {
    return new DomPortalHost(pane, this._componentFactoryResolver, this._appRef, this._injector);
  }

  /**
   * Creates an OverlayRef for an overlay in the given DOM element.
   * @param pane DOM element for the overlay
   * @param state
   */
  private _createOverlayRef(pane: HTMLElement, state: OverlayState): OverlayRef {
    return new OverlayRef(this._createPortalHost(pane), pane, state, this._ngZone);
  }
}

/** Providers for Overlay and its related injectables. */
export const OVERLAY_PROVIDERS: Provider[] = [
  Overlay,
  OverlayPositionBuilder,
  VIEWPORT_RULER_PROVIDER,
  SCROLL_DISPATCHER_PROVIDER,
  OVERLAY_CONTAINER_PROVIDER,
  DISABLE_BODY_SCROLL_PROVIDER,
];
