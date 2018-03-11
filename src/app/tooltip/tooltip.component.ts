import {ChangeDetectorRef, Component, Inject} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TOOLTIP_CONTENT, TOOLTIP_POSITION, TOOLTIP_COLOR } from "./tooltip.tokens";

export type TooltipPosition = 'bottom' | 'left' | 'right' | 'top';

@Component({
  selector: 'mx-tooltip',
  template: `
    <div #tooltip class="mx-tooltip mx-tooltip--{{ color + '-' + position }} mx-tooltip--{{ position }}"
         [@fadeInOut]="'in'"
         [innerHtml]="content">
    </div>
  `,
  styleUrls: [ './tooltip.component.scss' ],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition('void => *', [
        style({ opacity: 0 }),
        animate('0.6s cubic-bezier(.87,-.41,.19,1.44)'),
      ]),
      transition('* => void', [animate('0.6s ease-out', style({ opacity: 0 }))]),
    ]),
  ],
})
export class TooltipComponent {

  constructor(private cdr: ChangeDetectorRef,
              @Inject(TOOLTIP_CONTENT) public content: string | string[],
              @Inject(TOOLTIP_POSITION) public position: TooltipPosition,
              @Inject(TOOLTIP_COLOR) public color: string) { }

 public setPosition(position: TooltipPosition) {
    this.position = position;
    this.cdr.detectChanges();
  }
}
