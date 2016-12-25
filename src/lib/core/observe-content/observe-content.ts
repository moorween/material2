import {
  Directive,
  ElementRef,
  NgModule,
  ModuleWithProviders,
  Output,
  Input,
  EventEmitter,
  OnDestroy,
  AfterContentInit
} from '@angular/core';

import {debounce} from '../util/debounce';

/**
 * Directive that triggers a callback whenever the content of
 * its associated element has changed.
 */
@Directive({
  selector: '[cdkObserveContent]'
})
export class ObserveContent implements AfterContentInit, OnDestroy {
  private _observer: MutationObserver;

  /** Collects any MutationRecords that haven't been emitted yet. */
  private _pendingRecords: MutationRecord[] = [];

  /** Event emitted for each change in the element's content. */
  @Output('cdkObserveContent') event = new EventEmitter<MutationRecord[]>();

  /** Debounce interval for emitting the changes. */
  @Input() debounce: number;

  constructor(private _elementRef: ElementRef) {}

  ngAfterContentInit() {
    let callback: MutationCallback;

    // If a debounce interval is specified, keep track of the mutations and debounce the emit.
    if (this.debounce > 0) {
      let debouncedEmit = debounce((mutations: MutationRecord[]) => {
        this.event.emit(this._pendingRecords);
        this._pendingRecords = [];
      }, this.debounce);

      callback = (mutations: MutationRecord[]) => {
        this._pendingRecords.push.apply(this._pendingRecords, mutations);
        debouncedEmit();
      };
    } else {
      callback = (mutations: MutationRecord[]) => this.event.emit(mutations);
    }

    this._observer = new MutationObserver(callback);

    this._observer.observe(this._elementRef.nativeElement, {
      characterData: true,
      childList: true,
      subtree: true
    });
  }

  ngOnDestroy() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }
}

@NgModule({
  exports: [ObserveContent],
  declarations: [ObserveContent]
})
export class ObserveContentModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ObserveContentModule,
      providers: []
    };
  }
}
