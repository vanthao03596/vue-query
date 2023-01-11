<script setup lang="ts">
import { mutationKey } from "@/plugins/vagmi/composables/accounts/useConnect";
import { useMutation } from "@tanstack/vue-query";

const connect = ({connector, chainId}) => {
  return mutate({
      chainId: chainId,
      connector: connector,
    });
};
const mutationFn = (args: any) => {
  const { connector, chainId } = args;
  if (!connector) throw new Error("connector is required");
  return new Promise((res, reject) => {
    setTimeout(() => {
      res()
    }, 1000)
  });
};

const {
  data,
  error, 
  isError,
  isIdle,
  isLoading,
  isSuccess,
  mutate,
  mutateAsync,
  reset,
  status,
  variables,
} = useMutation(
  mutationKey({
    connector: "hello",
    chainId: "11",
  }),
  mutationFn,
  {
    onError: () => {},
    onMutate: () => {},
    onSettled: () => {},
    onSuccess: () => {},
  }
);
</script>

<template>
  <div class="about">
    <button @click="connect({connector: 'test', chainId: 'haha'})">Test</button>
    {{ isLoading }}
    <div>
      {{ variables  }}
    </div>
    <h1>This is an about page</h1>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
