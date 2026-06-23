import { Directive, input, computed, booleanAttribute } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { Ripple } from 'primeng/ripple';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';
export type ButtonShape = 'default' | 'circle' | 'pill';
export type ButtonVariant = 'ghost' | 'outline' | 'link' | 'default';

@Directive({
  selector: 'button[btn], a[btn]',
  standalone: true,
  hostDirectives: [
    {
      directive: ButtonDirective,
      inputs: ['loading', 'severity', 'raised']
    },
    { directive: Ripple }
  ],
  host: {
    '[class.button]': 'true',

    '[attr.disabled]': 'disabled() ? true : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',

    '[class.p-button-text]': 'isGhost()',
    '[class.p-button-outlined]': 'isOutlined()',
    '[class.p-button-rounded]': 'isRounded()',
    '[class.p-button-sm]': 'isSm()',
    '[class.p-button-lg]': 'isLg()',
    '[class.p-button-icon-only]': 'isIcon()',

    '[class.button--pill]': 'isPill()',
    '[class.button--underlined]': 'underlined()',
    '[class.button--auto-height]': 'autoHeight()'
  }
})
export class Button {
  variant = input<ButtonVariant>('default');
  size = input<ButtonSize>('md');
  shape = input<ButtonShape>('default');

  underlined = input<boolean, unknown>(false, { transform: booleanAttribute });
  autoHeight = input<boolean, unknown>(false, { transform: booleanAttribute });
  disabled = input<boolean, unknown>(false, { transform: booleanAttribute });


  protected isGhost = computed(() => ['ghost', 'link'].includes(this.variant()));
  protected isOutlined = computed(() => this.variant() === 'outline');
  protected isRounded = computed(() => ['circle', 'pill'].includes(this.shape()));
  protected isPill = computed(() => this.shape() === 'pill');
  protected isSm = computed(() => this.size() === 'sm');
  protected isLg = computed(() => this.size() === 'lg');
  protected isIcon = computed(() => this.size() === 'icon');
}
