import type {
  QueryFunctionContext,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/vue-query";

import type { MaybeRef } from "@vueuse/core";

type IgnoreMaybeRef = "onError" | "onMutate" | "onSettled" | "onSuccess";

export type SetMaybeRef<T extends object> = {
  [KeyType in keyof T]: KeyType extends IgnoreMaybeRef
    ? T[KeyType]
    : MaybeRef<T[KeyType]>;
};

export type MutationConfig<Data, Error, Variables = void, Context = unknown> = {
  /** Function fires if mutation encounters error */
  onError?: UseMutationOptions<Data, Error, Variables, Context>["onError"];
  /**
   * Function fires before mutation function and is passed same variables mutation function would receive.
   * Value returned from this function will be passed to both onError and onSettled functions in event of a mutation failure.
   */
  onMutate?: UseMutationOptions<Data, Error, Variables, Context>["onMutate"];
  /** Function fires when mutation is either successfully fetched or encounters error */
  onSettled?: UseMutationOptions<Data, Error, Variables, Context>["onSettled"];
  /** Function fires when mutation is successful and will be passed the mutation's result */
  onSuccess?: UseMutationOptions<Data, Error, Variables, Context>["onSuccess"];
};
