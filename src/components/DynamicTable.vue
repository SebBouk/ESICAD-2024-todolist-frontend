<script setup lang="ts">
import { ref, watch } from 'vue';
import { autoResizeDirective } from './autoResizeDirective';

interface Column {
  label: string;
  key: string;
  isBoolean?: boolean;
  isDate?: boolean;
  isClickable?: boolean;
  isEditable?: boolean;
  options?: { value: string | number; label: string }[];
  activeLabel?: string;
  inactiveLabel?: string;
  formatter?: (row: any) => string;
}

interface Row {
  [key: string]: any;
  isEditing?: boolean;
}

const emit = defineEmits<{
  (event: 'update:rows', rows: Row[]): void;
  (event: 'delete-row', index: number): void;
  (event: 'save-row', row: Row, index: number): void;
  (event: 'cell-click', row: Row, column: Column): void;
}>();

const props = defineProps({
  title: { type: String, default: 'Tableau Dynamique' },
  columns: { type: Array as () => Column[], required: true },
  initialData: { type: Array as () => Row[], default: () => [] }
});

const convertToLocalISODate = (dateString: string): string => {
  if (!dateString) return '';
  const localDate = new Date(dateString);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().split('T')[0];
};

const convertToISODate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};

const rows = ref<Row[]>(
  props.initialData.map((row) => {
    const convertedRow: Row = { ...row, isEditing: false };
    props.columns.forEach((col) => {
      if (col.isBoolean && typeof row[col.key] === 'number') {
        convertedRow[col.key] = !!row[col.key];
      }
      if (col.isDate && row[col.key]) {
        convertedRow[col.key] = convertToLocalISODate(row[col.key]);
      }
    });
    return convertedRow;
  })
);

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const enableEditing = (index: number) => {
  // Create a backup of the current row data
  const rowBackup = { ...rows.value[index] };
  rows.value[index].backup = rowBackup;
  rows.value[index].isEditing = true;
};

const cancelEditing = (index: number) => {
  // Restore from backup if exists
  if (rows.value[index].backup) {
    const { ...originalData } = rows.value[index].backup;
    rows.value[index] = { ...originalData, isEditing: false };
  } else {
    rows.value[index].isEditing = false;
  }
};

const handleCellClick = (row: Row, column: Column) => {
  if (column.isClickable) {
    emit('cell-click', row, column);
  }
};
const saveRow = (index: number) => {
  const row = rows.value[index];
  row.isEditing = false;
  delete row.backup;
  emit('save-row', row, index);
};

const deleteRow = (index: number) => {
  emit('delete-row', index);
  rows.value.splice(index, 1);
};

const toggleValue = (row: Row, key: string) => {
  row[key] = !row[key];
};

watch(rows, (newRows) => {
  const formattedRows = newRows.map((row) => {
    const updatedRow: Row = { ...row };
    props.columns.forEach((col) => {
      if (col.isDate && updatedRow[col.key]) {
        updatedRow[col.key] = convertToISODate(updatedRow[col.key]);
      }
    });
    return updatedRow;
  });

  emit('update:rows', formattedRows);
});

const getExposedRows = () => {
  return rows.value.map((row) => {
    const convertedRow: Row = { ...row };
    props.columns.forEach((col) => {
      if (col.isBoolean) {
        convertedRow[col.key] = row[col.key] ? 1 : 0;
      }
      if (col.isDate && row[col.key]) {
        convertedRow[col.key] = convertToISODate(row[col.key]);
      }
    });
    return convertedRow;
  });
};

defineExpose({
  directives: {
    autoResize: autoResizeDirective
  },
  rows: rows.value,
  getExposedRows
});
</script>

<template>
  <div class="w-full">
    <div class="w-full">
      <h1
        class="text-2xl md:text-3xl text-center text-gray-800 font-bold mb-8 pb-2 border-b-3 border-blue-500"
      >
        {{ title }}
      </h1>

      <div class="overflow-x-auto">
        <table class="w-full min-w-full divide-y divide-gray-200">
          <thead class="bg-blue-500">
            <tr>
              <th
                v-for="(column, index) in columns"
                :key="index"
                class="px-4 py-3 text-left text-sm font-semibold text-white"
              >
                {{ column.label }}
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-white">Actions</th>
            </tr>
          </thead>

          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(row, rowIndex) in rows"
              :key="rowIndex"
              class="hover:bg-gray-50 transition-colors duration-200"
            >
              <td
                v-for="(column, colIndex) in columns"
                :key="colIndex"
                class="px-4 py-3"
                :class="{ 'cursor-pointer hover:text-blue-600': column.isClickable }"
                @click="column.isClickable && handleCellClick(row, column)"
              >
                <div v-if="row.isEditing">
                  <div v-if="column.isDate">
                    <input
                      type="date"
                      v-model="row[column.key]"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                  </div>
                  <div v-else-if="column.isBoolean">
                    <button
                      @click="toggleValue(row, column.key)"
                      :class="[
                        'px-4 py-2 rounded-md font-semibold transition-colors duration-200',
                        row[column.key]
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      ]"
                    >
                      {{
                        row[column.key]
                          ? column.activeLabel || 'Actif'
                          : column.inactiveLabel || 'Inactif'
                      }}
                    </button>
                  </div>
                  <div v-else-if="column.options">
                    <select
                      v-model="row[column.key]"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    >
                      <option
                        v-for="option in column.options"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </option>
                    </select>
                  </div>
                  <div v-else>
                    <input
                      v-model="row[column.key]"
                      :type="column.key === 'someNumericKey' ? 'number' : 'text'"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                  </div>
                </div>
                <div v-else>
                  <span v-if="column.isBoolean">
                    {{
                      row[column.key]
                        ? column.activeLabel || 'Actif'
                        : column.inactiveLabel || 'Inactif'
                    }}
                  </span>
                  <span v-else-if="column.isDate">
                    {{ formatDate(row[column.key]) }}
                  </span>
                  <span v-else>
                    <!-- Apply formatter if it exists -->
                    {{ column.formatter ? column.formatter(row) : row[column.key] }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex space-x-2">
                  <div v-if="row.isEditing && columns.some(col => col.isEditable !== false)">
                    <button
                      @click="saveRow(rowIndex)"
                      class="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 mr-2"
                    >
                      Sauvegarder
                    </button>
                    <button
                      @click="cancelEditing(rowIndex)"
                      class="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
                    >
                      Annuler
                    </button>
                  </div>
                  <div v-else>
                    <button v-if="columns.some(col => col.isEditable !== false)"
                      @click="enableEditing(rowIndex)"
                      class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 mr-2"
                    >
                      Modifier
                    </button>
                    <button
                      @click="deleteRow(rowIndex)"
                      class="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
