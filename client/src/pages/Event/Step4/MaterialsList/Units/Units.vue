<template>
  <div>
    Unités:
    <ul>
      <li v-for="unit in data.units" :key="unit.id">{{ unit.id }}</li>
    </ul>
  </div>
</template>

<script>

// Il faudra griser les unités marquées comme étant `is_available` à `false` / `is_broken` à `true`.
// MAIS il faut prendre en compte le fait que si celles-ci étaient déjà save dans l'event
// à l'arrivée sur la page, on ne devrait pas être bloquée pour les envoyer à nouveau.
// (Si edit => On doit pouvoir re-sauver les données, même si is_available à false).
//
// A noter aussi que quand l'unité est is_broken, on devrait pouvoir "forcer" sa sélection et passer
// outre le fait que ce soit grisé.

export default {
  name: 'MaterialsListUnits',
  props: {
    data: Object,
  },
};
</script>
