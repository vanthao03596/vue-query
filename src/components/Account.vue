<script setup lang="ts">
import { useAccount } from "@/plugins/vagmi/composables/accounts/useAccount";
import { useDisconnect } from "@/plugins/vagmi/composables/accounts/useDisconnect";

const { account } = useAccount();
const { disconnect } = useDisconnect();
</script>

<template>
  <div v-if="account.isConnecting">
      Connecting
    </div>
  <div v-if="account.isConnected">
    
    <div>{{ account.address }}</div>
    <button @click="disconnect()">
      Disconnect from {{ account.connector?.name }}
    </button>
  </div>
</template>
