<script setup lang="ts">
import { ref, watch } from 'vue';
import { autoResizeDirective } from './autoResizeDirective';

interface Column {
  label: string;
  key: string;
  isBoolean?: boolean;
}

interface Row {
  [key: string]: any;
}

const emit = defineEmits<{
  (event: 'update:rows', rows: Row[]): void;
  (event: 'delete-row', index: number): void;
}>();

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

watch(rows, (newRows) => {
  emit('update:rows', newRows);
});

// Supprimer une ligne
const deleteRow = (index: number) => {
  emit('delete-row', index);
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
  directives: {
    autoResize: autoResizeDirective
  },
  rows: rows.value, getExposedRows
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
              <button @click="toggleValue(row, column.key)" :class="{ active: row[column.key] }">
                {{ row[column.key] ? 'Actif' : 'Inactif' }}
              </button>
            </div>
            <div v-else>
              <input
                v-model="row[column.key]"
                :type="column.key === 'someNumericKey' ? 'number' : 'text'"
                :style="{ width: row[column.key]?.toString().length + 1 + 'ch' }"
              />
            </div>
          </td>
          <td>
            <button @click="deleteRow(rowIndex)">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Todo List Stylesheet */
body {
  font-family: 'Arial', sans-serif;
  background-color: #f4f6f9;
  display: flex;
  justify-content: center;
  align-items: center; /* Centrer verticalement */
  height: 100vh; /* Prend toute la hauteur de la fenêtre */
  margin: 0; /* Supprime les marges par défaut du body */
  color: #333;
}

div {
  background-color: white;
  width: auto;
  max-width: auto;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  border-bottom: 3px solid #3498db;
  padding-bottom: 0.5rem;
}

table {
  width: auto;
  border-collapse: separate;
  border-spacing: 0 10px;
}

thead {
  background-color: #3498db;
  color: white;
}

th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
}

tbody tr {
  background-color: #f8f9fa;
  transition: background-color 0.3s ease;
}

tbody tr:hover {
  background-color: #e9ecef;
}

td {
  padding: 12px;
  border-bottom: 1px solid #e2e6ea;
}

input {
  display: inline-block;
  width: auto;
  min-width: 50px;
  box-sizing: content-box;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

input:focus {
  outline: none;
  border-color: #3498db;
}

button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: 600;
}

button.active {
  background-color: #2ecc71;
  color: white;
}

button:not(.active) {
  background-color: #e74c3c;
  color: white;
}

button[type='button'] {
  background-color: #3498db;
  color: white;
}

button:hover {
  opacity: 0.9;
}

</style>
