<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Column } from '../models/Column';
import { useRoute, useRouter } from 'vue-router';
import { Categories } from '../models/Categories';
import DynamicTable from '../components/DynamicTable.vue';
import { Listes } from '@/models/Listes';
import { useToast } from 'vue-toastification';
import { Taches } from '@/models/Taches';
import DynamicForm, { FormField } from '@/components/DynamicForm.vue';

const toast = useToast();
const categorie = ref<Categories[]>([]);
const liste = ref<Listes[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const route = useRoute();
const tableRef = ref<InstanceType<typeof DynamicTable> | null>(null);
const selectedCategorie = ref<Categories | null>(null);
const selectedListe = ref<Listes | null>(null);
const tache = ref<Taches[]>([]);
  const router = useRouter();
    
const columns = ref<Column[]>([
  { label: 'Nom', key: 'NomCategorie', isClickable: true, isEditable: false, isDelete:false }
]);

const columnsListe = ref<Column[]>([
  { label: 'Nom', key: 'NomListe', isClickable: true, isEditable : false, isDelete : false }
]);

const columnsTache = ref<Column[]>([
  { label: 'ID', key: 'IdTache' },
  { label: 'Nom', key: 'NomTache' },
  { label: 'Echeance', key: 'EcheanceTache', isDate: true },
  {
    label: 'Etat',
    key: 'EtatTache',
    isBoolean: true,
    activeLabel: 'Terminé',
    inactiveLabel: 'En cours'
  },
]);

const logout = () => {
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  
  router.push('/');
};


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

const handleCellClick = async ( row : any, column :any ) => {
  if (column.key === 'NomCategorie') {
    console.log('Categorie:', row);
    selectedCategorie.value = row;
    await fetchListes(row.IdCategorie);
  }
};

const handleCellClickListe = async ( row : any, column :any ) => {
  if (column.key === 'NomListe') {
    console.log('Liste:', row);
    selectedListe.value = row;
    await fetchTaches(row.IdListe);
  }
};

const fetchListes = async (IdCategorie : number) => {
  loading.value = true;
  errorMessage.value = null;
  try {
    const response = await fetch(`/api/user/utilisateur/getListes/${IdCategorie}`);
    console.log('Response status:', response.status);
    if (!response.ok) {
      console.error('Fetch failed:', await response.text());
      throw new Error('Erreur lors de la récupération des données');
    }
    const data = await response.json();
    liste.value = data.map((item: any) => ({
      ...item,
      NomCategorie: categorie.value.find(
        (cat) => cat.IdCategorie === item.IdCategorie
      )?.NomCategorie || '',
    }));
    console.log('Listes récupérées:', liste.value);
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value = 'Impossible de charger les listes.';
  } finally {
    loading.value = false;
  }
};

const fetchTaches = async (IdListe : number) => {
  loading.value = true;
  errorMessage.value = null;
  try {
    const response = await fetch(`/api/user/utilisateur/getTaches/${IdListe}`);
    console.log('Response status:', response.status);
    if (!response.ok) {
      console.error('Fetch failed:', await response.text());
      throw new Error('Erreur lors de la récupération des données');
    }
    const data = await response.json();
    tache.value = data.map((item: any) => ({
      ...item,
      NomListe: liste.value.find(
        (cat) => cat.IdListe === item.IdListe
      )?.NomListe || '',
    }));
    console.log('Listes récupérées:', tache.value);
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value = 'Impossible de charger les listes.';
  } finally {
    loading.value = false;
  }
};

const deleteTache = async (IdTache: number) => {
  try {
    const response = await fetch(`/api/user/utilisateur/tache/delete/${IdTache}`, {
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

const addTaches = async (formData: any) => {
  try {
    console.log('Données du formulaire :', formData);
    const response = await fetch('/api/user/utilisateur/tache/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur côté serveur :', errorData);
      throw new Error(errorData.error || "Erreur lors de l'ajout de la tache");
    }

    const addedTache = await response.json();
    tache.value.push(addedTache);
    closeModal();
    toast.success('Tache ajouté avec succès');
    fetchTaches(addedTache.IdListe); // Rafraîchir les données après l'ajout);
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value = error instanceof Error ? error.message : "Impossible d'ajouter la tache.";
  }
};

const handleRowSave = async (row: any) => {
  loading.value = true;
  errorMessage.value = null;

  try {
    const response = await fetch('/api/user/utilisateur/tache/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([row]) // Envoyer la ligne dans un tableau comme attendu par votre API
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la sauvegarde de la ligne');
    }

    toast.success('Tâche mise à jour avec succès !');
    await fetchTaches(row.IdListe); // Rafraîchir toutes les données après la sauvegarde
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value =
      error instanceof Error ? error.message : 'Échec de la sauvegarde de la tâche.';
    toast.error(errorMessage.value);
  } finally {
    loading.value = false;
  }
};

const updateRows = (newRows: any[]) => {
  tache.value = [...newRows];
};

const tacheFields = computed((): FormField[] => [
  {
    type: 'text',
    name: 'NomTache',
    label: 'Nom',
    required: true
  },
  {
    type: 'date',
    name: 'EcheanceTache',
    label: 'Echeance',
    required: true
  },
  {
    type: 'select',
    name: 'IdListe',
    label: 'Liste',
    required: true,
    options: selectedCategorie.value ? 
      liste.value
        .filter(list => list.IdCategorie === selectedCategorie.value?.IdCategorie)
        .map(list => ({
          value: list.IdListe,
          label: list.NomListe
    })) : []
  }
]);

const isModalOpen = ref(false);

function openModal() {
  if (!selectedCategorie.value) {
    toast.error('Veuillez sélectionner une catégorie avant d\'ajouter une tâche');
    return;
  }
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

onMounted(async () => {
  await fetchCategorie();

  console.log('Categories après fetchCategorie:', categorie.value, 'Listes après fetchListes:', liste.value);
});

</script>

<template>
    <div>
        <h1>Dashboard</h1>
        <p>Bienvenue sur le dashboard de l'application.
          </p><button
          @click="logout"
          class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 w-full md:w-auto"
        >
          Déconnexion
        </button>
    </div>

<div v-if="!loading && !errorMessage && categorie.length > 0">
    <DynamicTable
        title="Liste des categories"
          :columns="columns"
          :initialData="categorie"
          ref="tableRef"
          @cell-click="handleCellClick"
    />
</div>
<div class="dynamic-table-wrapper mt-4" v-if="!loading && !errorMessage && selectedCategorie">
        <DynamicTable
          title="Liste des listes"
          :columns="columnsListe"
          :initialData="liste"
          ref="tableRef"
          @cell-click="handleCellClickListe"
        />
        </div>
    <div v-if="loading" class="loading-message">Chargement...</div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-if="!loading && !errorMessage && categorie.length === 0">
      Aucune catégorie trouvée
    </div>

    <div class="dynamic-table-wrapper mt-4" v-if="!loading && !errorMessage && selectedListe">
        <DynamicTable
          title="Liste des taches"
          :columns="columnsTache"
          :initialData="tache"
          ref="tableRef"
          @update:rows="updateRows"
          @delete-row="(index) => deleteTache(tache[index].IdTache)"
          @save-row="(row) => handleRowSave(row)"
        />
      </div>
      <div class="action-buttons">
        <button v-if="!isModalOpen" @click="openModal" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-full md:w-auto" :disabled="!selectedCategorie">Ajouter une Tache</button>
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
</template>
