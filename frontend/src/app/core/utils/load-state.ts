import { Observable, catchError, map, of, startWith } from 'rxjs';

/** Discriminated union describing an async request in templates. */
export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; notFound: boolean };

export function toLoadState<T>(source: Observable<T>): Observable<LoadState<T>> {
  return source.pipe(
    map((data): LoadState<T> => ({ status: 'success', data })),
    startWith<LoadState<T>>({ status: 'loading' }),
    catchError((err: unknown) =>
      of<LoadState<T>>({
        status: 'error',
        notFound: typeof err === 'object' && err !== null && 'status' in err && err.status === 404,
      }),
    ),
  );
}
