import {QueryList} from '@angular/core';
import {INPUT_KEY_RANGE_START, INPUT_KEY_RANGE_END} from '../core';
import {ListKeyManager, CanDisable} from './list-key-manager';

/**
 * This is the interface for focusable items (used by the FocusKeyManager).
 * Each item must know how to focus itself, whether or not it is currently disabled
 * and be able to supply it's label.
 */
export interface Focusable extends CanDisable {
  focus(): void;
  getFocusableLabel?(): string;
}

/**
 * Time in ms to wait after the last keypress to focus the active item.
 */
export const FOCUS_KEY_MANAGER_DEBOUNCE_INTERVAL = 200;


export class FocusKeyManager extends ListKeyManager<Focusable> {
  private _timer: number;
  private _pressedInputKeys: number[] = [];
  private _hasLabelFn: boolean;

  constructor(items: QueryList<Focusable>) {
    super(items);
    this._hasLabelFn = items && items.first && 'getFocusableLabel' in items.first;
  }

  /**
   * This method sets the active item to the item at the specified index.
   * It also adds focuses the newly active item.
   */
  setActiveItem(index: number): void {
    super.setActiveItem(index);
    this.activeItem.focus();
  }

  /**
   * Overrides the key event handling from the ListKeyManager, in order
   * to add the ability to type to focus an item.
   */
  onKeydown(event: KeyboardEvent): void {
    let keyCode = event.keyCode;

    if (this._hasLabelFn && keyCode >= INPUT_KEY_RANGE_START && keyCode <= INPUT_KEY_RANGE_END) {
      this._debounceInputEvent(keyCode);
    } else {
      this._clearTimeout();
      super.onKeydown(event);
    }
  }

  /** Debounces the input key events and focuses the proper item after the last keystroke. */
  private _debounceInputEvent(keyCode: number): void {
    this._pressedInputKeys.push(keyCode);

    this._clearTimeout();

    this._timer = setTimeout(() => {
      if (this._pressedInputKeys.length) {
        let inputString = String.fromCharCode.apply(String, this._pressedInputKeys);
        let items = this._items.toArray();

        this._pressedInputKeys.length = 0;

        for (let i = 0; i < items.length; i++) {
          // Note that fromCharCode returns uppercase letters.
          if (items[i].getFocusableLabel().toUpperCase().trim().startsWith(inputString)) {
            this.setActiveItem(i);
            break;
          }
        }
      }
    }, FOCUS_KEY_MANAGER_DEBOUNCE_INTERVAL);
  }

  /** Clears the currently-running timeout. */
  private _clearTimeout(): void {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
}
