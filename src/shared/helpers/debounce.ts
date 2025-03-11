type DebounceCallback<T extends unknown[]> = (...args: T) => void;

  export function debounce<T extends unknown[]>(
    callback: DebounceCallback<T>,
    wait: number
  ): (...args: T) => void {
    let timerId: ReturnType<typeof setTimeout>;
    return (...args: T) => {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        callback(...args);
      }, wait);
    };
  }