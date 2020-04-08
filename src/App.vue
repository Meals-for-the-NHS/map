<template>
<div id="app">
  <router-view/>
</div>
</template>

<style lang="scss">

body {
  font-family: sans-serif;
  margin: 0;
  padding: 0;
}

a {
  &:hover {
    cursor: pointer;
  }
}

.link {
  &:hover {
    cursor: pointer !important;
  }
}
h2 {
  tt {
    font-size: 30px;
    font-weight: bold;
 }
}

th, td {
  padding: 5px;
}

hr {
  margin: 5px;
}

</style>
