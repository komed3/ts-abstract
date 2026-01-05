/**
 * Collection Types
 * Collection and deep helpers (arrays, tuples, records).
 * 
 * @module types/collection
 */

/**
 * Element type for arrays/tuples
 * @example
 * type Arr = number[];
 * type Elem = ElementOf<Arr>; // number
 */
export type ElementOf< T > = T extends readonly ( infer E )[] ? E : never;

/**
 * Flatten one level of array
 * @example
 * type Nested = ( number | string )[];
 * type FlatArr = Flat<Nested>; // (number | string)[]
 */
export type Flat< T extends readonly any[] > = T extends readonly ( infer E )[]
    ? ( E extends readonly any[] ? E[ number ] : E )[]
    : never;

/**
 * Deep partial (recursive)
 * @example
 * type User = { id: number; profile: { name: string; address: { city: string; zip: number } } };
 * type PartialUser = DeepPartial<User>;
 * // { id?: number; profile?: { name?: string; address?: { city?: string; zip?: number } } }
 */
export type DeepPartial< T > = {
    [ P in keyof T ]?: T[ P ] extends Array< infer U >
        ? DeepPartial< U >[]
        : T[ P ] extends ReadonlyArray< infer U >
        ? ReadonlyArray< DeepPartial< U > >
        : T[ P ] extends object
            ? DeepPartial< T[ P ] >
            : T[ P ];
};

/**
 * Deep required (recursive)
 * @example
 * type User = { id?: number; profile?: { name?: string; address?: { city?: string; zip?: number } } };
 * type RequiredUser = DeepRequired<User>;
 * // { id: number; profile: { name: string; address: { city: string; zip: number } } }
 */
export type DeepRequired< T > = {
    [ P in keyof T ]-?: T[ P ] extends Array< infer U >
        ? DeepRequired< U >[]
        : T[ P ] extends ReadonlyArray< infer U >
        ? ReadonlyArray< DeepRequired< U > >
        : T[ P ] extends object
            ? DeepRequired< T[ P ] >
            : T[ P ];
};

/**
 * Deep readonly (recursive)
 * @example
 * type User = { id: number; profile: { name: string; address: { city: string; zip: number } } };
 * type ReadonlyUser = DeepReadonly<User>;
 * // { readonly id: number; readonly profile: { readonly name: string; readonly address: { readonly city: string; readonly zip: number } } }
 */
export type DeepReadonly< T > = T extends Function ? T
    : T extends Array< infer U > ? ReadonlyArray< DeepReadonly< U > >
    : T extends object ? { readonly [ K in keyof T ]: DeepReadonly< T[ K ] > }
    : T;

/**
 * Deep mutable (remove readonly and optional recursively)
 * @example
 * type User = { readonly id?: number; profile?: { readonly name?: string; address?: { readonly city?: string; readonly zip?: number } } };
 * type MutableUser = DeepMutable<User>;
 * // { id: number; profile: { name: string; address: { city: string; zip: number } } }
 */
export type DeepMutable< T > = T extends Function ? T
    : T extends Array< infer U > ? Array< DeepMutable< U > >
    : T extends object ? { -readonly [ K in keyof T ]-?: DeepMutable< T[ K ] > }
    : T;

type Join< K, P > = K extends string | number ? P extends string | number
    ? `${ K & ( string | number ) }.${ P & ( string | number ) }`
    : never : never;

type Prev = [ never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

/**
 * Build all nested paths for an object up to a reasonable recursion depth
 * @example
 * type User = { id: number; profile: { name: string; address: { city: string; zip: number } } };
 * type UserPaths = Paths<User>;
 * // "id" | "profile" | "profile.name" | "profile.address" | "profile.address.city" | "profile.address.zip"
 */
export type Paths< T, D extends number = 5 > = [ D ] extends [ never ] ? never : T extends object ? {
    [ K in keyof T ]-?: K extends string | number ? T[ K ] extends object
        ? K | Join< K, Paths< T[ K ], Prev[ D ] > >
        : K : never
}[ keyof T ] : '';

/**
 * Get a nested value by path (dot notation)
 * @example
 * type User = { id: number; profile: { name: string; address: { city: string; zip: number } } };
 * type CityType = PathValue<User, "profile.address.city">; // number
 */
export type PathValue< T, P extends string > = P extends `${ infer K }.${ infer Rest }`
    ? K extends keyof T ? PathValue< T[ K ], Rest > : never
    : P extends keyof T ? T[ P ] : never;


/**
 * Deep Intersection (recursive)
 * @example
 * type Nested = { level_1: { level_2: { } } };
 * type MetaData = { metadata?: string };
 * type DeepIntersected = DeepIntersection<Nested, MetaData>;
 * // { level_1: { level_2: { metadata: '' } } }
}
 * @remarks
 * In case of property conflict, the Target type(T) will not get its properties overwritten by the aDditionnal type(D)
 */
export type DeepIntersection< T, D > = {
  [ P in keyof T ]: T[ P ] extends Array< infer U >
        ? DeepIntersection< U, D>[]
        : T[ P ] extends ReadonlyArray< infer U >
        ? ReadonlyArray< DeepIntersection< U, D > >
        : T[ P ] extends object
            ? DeepIntersection< T[ P ], D >
            : T[ P ];
} & {
  [ P in keyof D ]: P extends keyof T ? 
    never : 
    D[ P ]
};