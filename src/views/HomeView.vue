<script setup lang="ts">
import { useConnect } from "@/plugins/vagmi/composables/accounts";

import Account from "@/components/Account.vue";

const { connect, connectors, error, isLoading, pendingConnector } =
  useConnect();
</script>

<template>
  <main>
    <div>
      <Account />
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
