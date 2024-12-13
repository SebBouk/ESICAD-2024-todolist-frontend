<script setup lang="ts">
import { Taches } from '@/models/Taches';
import { onMounted, ref } from 'vue';
import DynamicForm, { FormField } from '../components/DynamicForm.vue';
import DynamicTable from '../components/DynamicTable.vue';
import { useToast } from 'vue-toastification';
import NavComponent from '@/components/NavComponent.vue';

const toast = useToast();

interface Column {
  label: string;
  key: string;
  isBoolean?: boolean;
}

const columns = ref<Column[]>([
  { label: 'ID', key: 'IdTache' },
  { label: 'Nom', key: 'NomTache' },
  { label: 'Echeance', key: 'EcheanceTache' },
  { label: 'Creation', key: 'datecreaTache' },
  { label: 'Mise a jour', key: 'datemajTache' },
  { label: 'Etat', key: 'EtatTache', isBoolean: true }
]);

const tableRef = ref<InstanceType<typeof DynamicTable> | null>(null);
const tache = ref<Taches[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);

onMounted(async () => {
  await fetchTaches();
  console.log('Taches après fetchTaches:', tache.value);
});

const fetchTaches = async () => {
  loading.value = true;
  errorMessage.value = null;
  try {
    const response = await fetch('/api/admin/tache/get');
    console.log('Response status:', response.status);
    if (!response.ok) {
      console.error('Fetch failed:', await response.text());
      throw new Error('Erreur lors de la récupération des données');
    }
    tache.value = await response.json();
    console.log('Taches récupérées:', tache.value);
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value = 'Impossible de charger les taches.';
  } finally {
    loading.value = false;
  }
};

const saveData = async () => {
  if (!tableRef.value) {
    console.error('Référence au tableau introuvable !');
    return;
  }

  const updatedRows = tableRef.value.getExposedRows();
  console.log('Rows après préparation:', updatedRows);
  loading.value = true;
  errorMessage.value = null;

  try {
    const response = await fetch('/api/admin/tache/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedRows)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la sauvegarde des données');
    }

    toast.success('Données sauvegardées avec succès !');
    await fetchTaches(); // Refresh data after successful save
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value =
      error instanceof Error ? error.message : 'Échec de la sauvegarde des données.';
  } finally {
    loading.value = false;
  }
  console.log('Contenu du tableRef:', tableRef.value);
  console.log('Méthodes disponibles:', Object.keys(tableRef.value || {}));
};

const addTaches = async (formData: any) => {
  try {
    const response = await fetch('/api/admin/tache/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData) // Utiliser newUser.value pour accéder aux données
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur côté serveur :', errorData);
      throw new Error(errorData.error || "Erreur lors de l'ajout de la tache");
    }

    const addedTache = await response.json();
    tache.value.push(addedTache);
    toast.success('Tache ajouté avec succès');
    closeModal();
    fetchTaches();
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value = error instanceof Error ? error.message : "Impossible d'ajouter la tache.";
  }
};

const deleteTache = async (IdTache: number) => {
  try {
    const response = await fetch(`/api/admin/tache/delete/${IdTache}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erreur lors de la suppression de l'utilisateur");
    }

    // Remove the user from the local list
    tache.value = tache.value.filter((tache) => tache.IdTache !== IdTache);

    toast.success('Tache supprimé avec succès');
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value =
      error instanceof Error ? error.message : 'Impossible de supprimer la tache.';
  }
};

const updateRows = (newRows: any[]) => {
  tache.value = [...newRows];
};

const isModalOpen = ref(false);

function openModal() {
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

const tacheFields: FormField[] = [
  {
    type: 'text',
    name: 'NomTache',
    label: 'Nom',
    required: true
  },
  {
    type: 'date',
    name: 'Echeance',
    label: 'Echeance',
    required: true
  },
  {
    type: 'text',
    name: 'IdTache',
    label: 'N°',
    required: false,
    placeholder: 'Attribué automatiquement'
  }
];
</script>
<template>
  <template>
    <NavComponent />
    <div class="user-management-container">
      <div class="user-management-content">
        <h1>Gestion des taches</h1>

        <div v-if="loading" class="loading-message">Chargement...</div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="dynamic-table-wrapper" v-if="!loading && !errorMessage">
          <DynamicTable
            title="Liste des taches"
            :columns="columns"
            :initialData="tache"
            ref="tableRef"
            @update:rows="updateRows"
            @delete-row="(index) => deleteTache(tache[index].IdTache)"
          />
        </div>

        <div class="action-buttons">
          <button @click="saveData" class="BT" :disabled="loading">Sauvegarder</button>
          <button v-if="!isModalOpen" @click="openModal" class="BT">Ajouter une Tache</button>
        </div>
      </div>

      <div v-if="isModalOpen" class="modal-overlay">
        <div class="modal-content">
          <h1>Ajouter une nouvelle tache</h1>
          <DynamicForm
            :fields="tacheFields"
            submit-label="Enregistrer la tache"
            @submit="addTaches"
            @cancel="closeModal"
          />
        </div>
      </div>
    </div>
  </template>
</template>
