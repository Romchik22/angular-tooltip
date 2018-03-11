import { InjectionToken } from '@angular/core';

export const TOOLTIP_CONTENT = new InjectionToken<String | String[]>('TOOLTIP_CONTENT');
export const TOOLTIP_COLOR = new InjectionToken<String>('TOOLTIP_COLOR');
export const TOOLTIP_POSITION = new InjectionToken<String>('TOOLTIP_POSITION');
