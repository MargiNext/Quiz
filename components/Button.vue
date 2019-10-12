<template>
  <button>
    <slot/>
  </button>
</template>

<style scoped lang="scss">
button {
    position: absolute;
    left: 48%;
    right: 5.87%;
    top: 36.45%;
    bottom: 50.37%;

    background: #FFFFFF;
    border: 2px solid #35A9EA;
    box-sizing: border-box;
    transform: matrix(-1, 0, 0, 1, 0, 0);
}
</style>