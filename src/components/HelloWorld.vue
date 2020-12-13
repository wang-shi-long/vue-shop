<template>
  <div class="app">
    <index>
      <template v-slot="$props">
        {{ $props }}
      </template>
    </index>
  </div>
</template>

<script>
import index from "../pages/index";
export default {
  components: {
    index,
  },
};
</script>

<style>
</style>