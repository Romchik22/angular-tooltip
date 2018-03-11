import { Directive, HostListener, Input, ViewContainerRef, Injector, ComponentRef, ElementRef } from '@angular/core';
import {
  HorizontalConnectionPos,
  OriginConnectionPosition, Overlay, OverlayConfig, OverlayConnectionPosition,
  OverlayRef, VerticalConnectionPos
} from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';

import { TooltipComponent, TooltipPosition } from './tooltip.component';
import { TOOLTIP_COLOR, TOOLTIP_CONTENT, TOOLTIP_POSITION } from "./tooltip.tokens";

interface TooltipConfig {
  panelClass?: string;
  hasBackdrop?: boolean;
  backdropClass?: string;
}

const DEFAULT_CONFIG: TooltipConfig  = {
  hasBackdrop: false,
  backdropClass: '',
  panelClass: '',
};

@Directive({
  selector: '[mxTooltip]',
})
export class TooltipDirective {
  private _tooltipComponent: TooltipComponent;
  private _overlayRef;
  private _visible = false;

  @Input() content: string | string[];
  @Input() tooltipDisabled: boolean;
  @Input() color = 'secondary'; //todo add type
  @Input() position: TooltipPosition = 'right';

  constructor(private viewContainerRef: ViewContainerRef,
              private injector: Injector,
              private overlay: Overlay,
              private element: ElementRef) { }

  @HostListener('focusin')
  @HostListener('mouseenter')
  onMouseEnter() {
    this.show();
  }

  @HostListener('focusout')
  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hide();
  }

  show() {
    if (this.tooltipDisabled || this._visible || !this.content) {
      return;
    }
    this._overlayRef = this.open();
    this._visible = true;
  }

  hide() {
    if (!this._visible) {
      return;
    }
    this._visible = false;
    this._overlayRef.dispose();
  }

  open(config: TooltipConfig = {}) {
    // Override default configuration
    const dialogConfig = { ...DEFAULT_CONFIG, ...config };

    // Returns an OverlayRef which is a PortalHost
    const overlayRef = this.createOverlay(dialogConfig);

    // Instantiate remote control

    this._tooltipComponent = this.attachDialogContainer(overlayRef);
    return overlayRef;
  }

  private createOverlay(config: TooltipConfig) {
    const overlayConfig = this.getOverlayConfig(config);
    return this.overlay.create(overlayConfig);
  }

  private attachDialogContainer(overlayRef: OverlayRef) {
    const injector = this.createInjector();

    const containerPortal = new ComponentPortal(TooltipComponent, this.viewContainerRef, injector);
    const containerRef: ComponentRef<TooltipComponent> = overlayRef.attach(containerPortal);

    return containerRef.instance;
  }

  private createInjector(): PortalInjector {
    const injectionTokens = new WeakMap();

    injectionTokens.set(TOOLTIP_CONTENT, this.content);
    injectionTokens.set(TOOLTIP_COLOR, this.color);
    injectionTokens.set(TOOLTIP_POSITION, this.position);

    return new PortalInjector(this.injector, injectionTokens);
  }

  private getOverlayConfig(config: TooltipConfig): OverlayConfig {
    const origin = this._getOrigin();
    const overlay = this._getOverlayPosition();

    const positionStrategy = this.overlay.position()
      .connectedTo(this.element, origin.main, overlay.main)
      .withFallbackPosition(origin.fallback, overlay.fallback);

    positionStrategy.onPositionChange.pipe().subscribe(change => {
      if (this.position === 'right' && change.connectionPair.originX === 'start') {
        this.position = 'left';
        this._tooltipComponent.setPosition(this.position);
      } else if (this.position === 'top' && change.connectionPair.originY === 'bottom') {
          this.position = 'bottom';
          this._tooltipComponent.setPosition(this.position);
      } else if (this.position === 'bottom' && change.connectionPair.originY === 'top') {
        this.position = 'top';
        this._tooltipComponent.setPosition(this.position);
      } else if (this.position === 'left' && change.connectionPair.originX === 'end') {
        this.position = 'right';
        this._tooltipComponent.setPosition(this.position);
      } else {}
    });


    const overlayConfig = new OverlayConfig(<OverlayConfig>{
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass,
      panelClass: config.panelClass,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy
    });

    return overlayConfig;
  }

  /**
   * Returns the origin position and a fallback position based on the user's position preference.
   * The fallback position is the inverse of the origin (e.g. `'bottom' -> 'top'`).
   */
  _getOrigin(): {main: OriginConnectionPosition, fallback: OriginConnectionPosition} {
    let position: OriginConnectionPosition;

    if (this.position == 'top' || this.position == 'bottom') {
      position = {originX: 'center', originY: this.position == 'top' ? 'top' : 'bottom'};
    } else if (this.position == 'left') {
      position = {originX: 'start', originY: 'center'};
    } else if (this.position == 'right') {
      position = {originX: 'end', originY: 'center'};
    } else {
     // throw getMatTooltipInvalidPositionError(this.position); //todo
    }

    const {x, y} = this._invertPosition(position.originX, position.originY);

    return {
      main: position,
      fallback: {originX: x, originY: y}
    };
  }

  /** Returns the overlay position and a fallback position based on the user's preference */
  _getOverlayPosition(): {main: OverlayConnectionPosition, fallback: OverlayConnectionPosition} {
    let position: OverlayConnectionPosition;

    if (this.position == 'top') {
      position = {overlayX: 'center', overlayY: 'bottom'};
    } else if (this.position == 'bottom') {
      position = {overlayX: 'center', overlayY: 'top'};
    } else if (this.position == 'left') {
      position = {overlayX: 'end', overlayY: 'center'};
    } else if (this.position == 'right') {
      position = {overlayX: 'start', overlayY: 'center'};
    } else {
      // throw getMatTooltipInvalidPositionError(this.position); //todo
    }

    const {x, y} = this._invertPosition(position.overlayX, position.overlayY);

    return {
      main: position,
      fallback: {overlayX: x, overlayY: y}
    };
  }

  /** Inverts an overlay position. */ //todo binary inversion
  private _invertPosition(x: HorizontalConnectionPos, y: VerticalConnectionPos) {
    if (this.position === 'top' || this.position === 'bottom') {
      if (y === 'top') {
        y = 'bottom';
      } else if (y === 'bottom') {
        y = 'top';
      }
    } else {
      if (x === 'end') {
        x = 'start';
      } else if (x === 'start') {
        x = 'end';
      }
    }

    return {x, y};
  }

}
