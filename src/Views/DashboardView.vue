<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Column } from './models/Column';
import { useRoute } from 'vue-router';
import { Categories } from './models/Categories';
import DynamicTable from '../components/DynamicTable.vue';

const categorie = ref<Categories[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const route = useRoute();
const tableRef = ref<InstanceType<typeof DynamicTable> | null>(null);
    
const columns = ref<Column[]>([
  { label: 'Nom', key: 'NomCategorie', isClickable: true }
]);


const fetchCategorie = async () => {
  loading.value = true;
  errorMessage.value = null;
  const IdUser = route.params.IdUser;
  try {
    const response = await fetch(`/api/user/utilisateur/getCategorie/${IdUser}`);
    console.log('Response status:', response.status);
    if (!response.ok) {
      console.error('Fetch failed:', await response.text());
      throw new Error('Erreur lors de la récupération des données');
    }
    categorie.value = await response.json();
    console.log('Categorie récupérées:', categorie.value);
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value = 'Impossible de charger les categories.';
  } finally {
    loading.value = false;
  }
};

const handleCellClick = ( row, column ) => {
  if (column.key === 'NomCategorie') {
    console.log('Categorie:', row);
  }
};
onMounted(async () => {
  await fetchCategorie();
  console.log('Categories après fetchCategorie:', categorie.value);
});

</script>

<template>
    <div>
        <h1>Dashboard</h1>
        <p>Bienvenue sur le dashboard de l'application.</p>
    </div>


    <DynamicTable
        title="Liste des categories"
          :columns="columns"
          :initialData="categorie"
          ref="tableRef"
          @cell-click="handleCellClick"
    />

    <div v-if="loading" class="loading-message">Chargement...</div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
</template>