import { tap, map, switchMap, catchError, take } from "rxjs/operators";
import {
  collectionSnap2Observable,
  documentSnap2Observable
} from "./firebase-helpers";
import { of, Observable, combineLatest } from "rxjs";
import { QueryFn } from "../interfaces/ICollectionQueryBuilder";
import { QueryState } from "./QueryState";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";

export function CollectionQueryGetAllDocsSnap<T>(
  q: QueryState<FirebaseClientStateObject>,
  whereQuery?: QueryFn
): Observable<T[]> {
  q.logger.logDEBUG(">> start, CollectionQueryGetAllDocsSnap()", { q, whereQuery });
  return q.refCollection().pipe(
    map(collection => {
      if (whereQuery) {
        q.logger.logINFO("CollectionQueryGetAllDocsSnap() whereQuery", {
          whereQuery
        });
        return whereQuery(collection);
      }
      return collection;
    }),
    switchMap(collection =>
      collectionSnap2Observable(collection).pipe(
        catchError(error => {
          q.logger.logERROR(
            "CollectionQueryGetAllDocsSnap: error in switchMap(collection => ...",
            error
          );
          return of({ docs: [] as any });
        })
      )
    ),
    tap(docSnap =>
      q.logger.logINFO(
        "CollectionQueryGetAllDocsSnap() after snapshotChanges...",
        {
          "docSnap?": docSnap
        }
      )
    ),
    map(docChanges => docChanges.docs),
    map(docs => docs.map(doc => q.doc2Data<T>(doc)) as T[]),
    tap(data =>
      q.logger.logINFO(">> end, data", { data })
    )
  );
}

export function CollectionQueryGetAllDocs<T>(
  q: QueryState<FirebaseClientStateObject>,
  whereQuery?: QueryFn
): Observable<T[]> {
  q.logger.logDEBUG(">> start, CollectionQueryGetAllDocs()", { q, whereQuery });
  return q.refCollection().pipe(
    take(1),
    map(collection => {
      if (whereQuery) {
        return whereQuery(collection);
      }
      return collection;
    }),
    switchMap(async collection => {
      try {
        const res = await collection.get();
        return res.docs;
      } catch (error) {
        q.logger.logERROR(
          "error in switchMap(collection => ...",
          error
        );
        return [];
      }
    }),
    tap(docSnap =>
      q.logger.logINFO("after get()...", {
        "docSnap?": docSnap
      })
    ),
    map(docs => q.docArray2Data<T>(docs)),
    tap(data => q.logger.logINFO(">> end, data", { data }))
  );
}

export function CollectionQueryGetId<T>(
  q: QueryState<FirebaseClientStateObject>,
  id: string
): Observable<T> {
  q.logger.logDEBUG(">> start, CollectionQueryGetId()", { q, id });
  return q.refCollection().pipe(
    take(1),
    map(collection => collection.doc(id)),
    switchMap(doc => doc.get()),
    tap(docSnap =>
      q.logger.logINFO("after get()...", {
        "pathExists?": docSnap.exists
      })
    ),
    map(doc => q.doc2Data<T>(doc)),
    tap(data => q.logger.logINFO(">> end, data...", { data }))
  );
}

export function CollectionQueryGetIdSnap<T>(
  q: QueryState<FirebaseClientStateObject>,
  id: string
): Observable<T> {
  q.logger.logDEBUG(">> start, CollectionQueryGetIdSnap()", { q, id });
  return q.refCollection().pipe(
    map(collection => collection.doc(id)),
    switchMap(doc => documentSnap2Observable(doc)),
    tap(docSnap =>
      q.logger.logINFO("after snapshotChanges...", {
        "docSnapExists?": docSnap.exists
      })
    ),
    map(doc => q.doc2Data<T>(doc)),
    tap(data =>
      q.logger.logINFO(">> end. data...", { data })
    )
  );
}

export function CollectionQueryGetManyIds<T>(
  q: QueryState<FirebaseClientStateObject>,
  ids: string[]
): Observable<T[]> {
  q.logger.logDEBUG(">> start, CollectionQueryGetManyIds()", { q, ids });
  return q.refCollection().pipe(
    take(1),
    switchMap(collection =>
      combineLatest(ids.map(id => collection.doc(id).get()))
    ),
    tap(docs =>
      q.logger.logINFO("after get() many...", {
        "docSnapExists?": docs
      })
    ),
    map(docs => q.docArray2Data<T>(docs)),
    tap(data =>
      q.logger.logINFO(">> end data...", { data })
    )
  );
}

export function CollectionQueryGetManyIdsSnap<T>(
  q: QueryState<FirebaseClientStateObject>,
  ids: string[]
): Observable<T[]> {
  q.logger.logDEBUG(">> start, CollectionQueryGetManyIdsSnap()", { q, ids });
  return q.refCollection().pipe(
    switchMap(collection =>
      combineLatest(ids.map(id => documentSnap2Observable(collection.doc(id))))
    ),
    map(docs => q.docArray2Data<T>(docs)),
    tap(data =>
      q.logger.logINFO(">> end, data...", { data })
    )
  );
}