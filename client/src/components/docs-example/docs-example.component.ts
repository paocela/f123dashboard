import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  inject
} from '@angular/core';

import packageJson from '../../../package.json';
import { IconDirective } from '@coreui/icons-angular';
import { RouterLink } from '@angular/router';
import { NavComponent, NavItemComponent, NavLinkDirective } from '@coreui/angular';

@Component({
    selector: 'app-docs-example',
    templateUrl: './docs-example.component.html',
    styleUrls: ['./docs-example.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NavComponent, NavItemComponent, NavLinkDirective, RouterLink, IconDirective],
    host: { class: 'example' }
})
export class DocsExampleComponent implements AfterViewInit {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input() fragment?: string;

  private _href = 'https://coreui.io/angular/docs/';

  get href(): string {
    return this._href;
  }

  @Input()
  set href(value: string) {
    const docsUrl = packageJson?.config?.coreui_library_docs_url ?? 'https://coreui.io/angular/';
    this._href = `${docsUrl}${value}`;
  }

  ngAfterViewInit(): void {
    this.changeDetectorRef.markForCheck();
  }
}
