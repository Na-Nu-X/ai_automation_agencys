import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AutomationSolution } from '../../../core/models/api.models';
import { formatEur } from '../../../core/utils/format';
import { IconComponent } from '../icon/icon.component';

const MAX_VISIBLE_TECH = 4;

@Component({
  selector: 'app-solution-card',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solution-card.component.html',
  styleUrl: './solution-card.component.scss',
})
export class SolutionCardComponent {
  readonly solution = input.required<AutomationSolution>();

  protected readonly visibleTech = computed(() => this.solution().tech_stack.slice(0, MAX_VISIBLE_TECH));
  protected readonly hiddenTechCount = computed(() =>
    Math.max(0, this.solution().tech_stack.length - MAX_VISIBLE_TECH),
  );
  protected readonly price = computed(() => {
    const value = this.solution().starting_price_eur;
    return value ? formatEur(value) : null;
  });
}
