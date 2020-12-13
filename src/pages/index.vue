<template>
  <div class="app">
    <h1>首页</h1>
    <ul>
      <li v-for="item in list" :key="item.id">
        <slot :init="item"></slot>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [
        {
          id: 3,
          name: "wsl",
        },
        {
          id: 2,
          name: "qwy",
        },
        {
          id: 1,
          name: "zsj",
        },
      ],
    };
  },
};
</script>

<style>
</style>