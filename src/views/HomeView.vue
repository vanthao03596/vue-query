<script setup lang="ts">
import { useConnect } from "@/plugins/vagmi/composables/accounts";
const { connect, connectors, error, isLoading, pendingConnector, variables } =
  useConnect({
    onMutate: (e) => {
      console.log(e);
    },
  });
</script>

<template>
  <main>
    <div>
      <button
        v-for="connector in connectors"
        :key="connector.id"
        @click="connect({ connector })"
      >
        <div>{{ connector.ready }}</div>
        {{ connector.name }}
        {{
          isLoading && connector.id === pendingConnector?.id
            ? " (connecting)"
            : ""
        }}
      </button>
    </div>

    <div v-if="error">
      {{ error.message }}
    </div>
  </main>
</template>
