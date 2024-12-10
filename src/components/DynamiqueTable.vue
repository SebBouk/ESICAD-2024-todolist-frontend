<script setup lang="ts">
import { ref } from 'vue';

interface Column {
  label: string;
  key: string;
  isBoolean?: boolean;
}

interface Row {
  [key: string]: any;
}

// Définir les props pour rendre le tableau dynamique
const props = defineProps({
  title: { type: String, default: 'Tableau Dynamique' },
  columns: { type: Array as () => Column[], required: true },
  initialData: { type: Array as () => Row[], default: () => [] }
});

// Données locales basées sur les `props`
const rows = ref<Row[]>(
  props.initialData.map((row) => {
    const convertedRow: Row = { ...row };
    props.columns.forEach((col) => {
        if (col.isBoolean && typeof row[col.key] === 'number') {
        convertedRow[col.key] = !!row[col.key]; // Convertit 0/1 en false/true
      }
    });
    return convertedRow;
  })
);

// Ajouter une nouvelle ligne
const addRow = () => {
  const newRow: Row = {};
  props.columns.forEach((col) => {
    if (col.isBoolean) {
      newRow[col.key] = false; // Initialise les booléens à false
    } else {
      newRow[col.key] = ''; // Initialise les autres colonnes avec des valeurs vides
    }
  });
  rows.value.push(newRow);
};
// Supprimer une ligne
const deleteRow = (index: number) => {
  rows.value.splice(index, 1);
};

// Basculer une valeur booléenne
const toggleValue = (row: Row, key: string) => {
  row[key] = !row[key];
};

// Exposer les données pour que le parent puisse y accéder
const getExposedRows = () => {
  return rows.value.map((row) => {
    const convertedRow: Row = { ...row };
    props.columns.forEach((col) => {
      if (col.isBoolean) {
        convertedRow[col.key] = row[col.key] ? 1 : 0; // Convertit true/false en 1/0
      }
    });
    return convertedRow;
  });
};

// Exposer les données
defineExpose({
  get rows() {
    return getExposedRows(); // This will always return the current state
  }
});
</script>

<template>
    <div>
      <h1>{{ title }}</h1>
      <table>
        <thead>
          <tr>
            <!-- Affiche les colonnes -->
            <th v-for="(column, index) in columns" :key="index">{{ column.label }}</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <!-- Affiche les lignes -->
          <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
            <td v-for="(column, colIndex) in columns" :key="colIndex">
              <div v-if="column.isBoolean">
                <button 
                  @click="toggleValue(row, column.key)" 
                  :class="{ active: row[column.key] }">
                  {{ row[column.key] ? 'Actif' : 'Inactif' }}
                </button>
              </div>
              <div v-else>
                <input v-model="row[column.key]" />
              </div>
            </td>
            <td>
              <button @click="deleteRow(rowIndex)">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
      <button @click="addRow">Ajouter une ligne</button>
    </div>
  </template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
button {
  margin: 5px;
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 3px;
}
button:hover {
  background-color: #0056b3;
}
</style>
