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
  { label: 'Nom', key: 'NomCategorie', isClickable: true, isEditable: false, isDelete: false }
]);

const columnsListe = ref<Column[]>([
  { label: 'Nom', key: 'NomListe', isClickable: true, isEditable: false, isDelete: false }
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
  }
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

const handleCellClick = async (row: any, column: any) => {
  if (column.key === 'NomCategorie') {
    console.log('Categorie:', row);
    selectedCategorie.value = row;
    await fetchListes(row.IdCategorie);
  }
};

const handleCellClickListe = async (row: any, column: any) => {
  if (column.key === 'NomListe') {
    console.log('Liste:', row);
    selectedListe.value = row;
    await fetchTaches(row.IdListe);
  }
};

const fetchListes = async (IdCategorie: number) => {
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
      NomCategorie:
        categorie.value.find((cat) => cat.IdCategorie === item.IdCategorie)?.NomCategorie || ''
    }));
    console.log('Listes récupérées:', liste.value);
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value = 'Impossible de charger les listes.';
  } finally {
    loading.value = false;
  }
};

const fetchTaches = async (IdListe: number) => {
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
      NomListe: liste.value.find((cat) => cat.IdListe === item.IdListe)?.NomListe || ''
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
    options: selectedCategorie.value
      ? liste.value
          .filter((list) => list.IdCategorie === selectedCategorie.value?.IdCategorie)
          .map((list) => ({
            value: list.IdListe,
            label: list.NomListe
          }))
      : []
  }
]);

const isModalOpen = ref(false);

function openModal() {
  if (!selectedCategorie.value) {
    toast.error("Veuillez sélectionner une catégorie avant d'ajouter une tâche");
    return;
  }
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

onMounted(async () => {
  await fetchCategorie();

  console.log(
    'Categories après fetchCategorie:',
    categorie.value,
    'Listes après fetchListes:',
    liste.value
  );
});

function closeTache() {
  selectedListe.value = null;
}

function closeListe() {
  selectedCategorie.value = null;
}

const tachesEnCours = computed(() => {
  return tache.value.filter((t) => Number(t.EtatTache) === 0); // Filtre où EtatTache est "En cours" (false)
});

const tachesTerminée = computed(() => {
  return tache.value.filter((t) => Number(t.EtatTache) === 1); // Filtre où EtatTache est "Terminées" (true)
});

const showCompletedTasks = ref(false);

</script>

<template>
  <div class="user-management-container">
    <div class="user-management-content">
      <button
        @click="logout"
        class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 w-full md:w-auto"
      >
        Déconnexion
      </button>
      <h1>Dashboard</h1>
      <p>Bienvenue sur le dashboard de l'application.</p>
      <div class="dynamic-table-wrapper" v-if="!loading && !errorMessage && categorie.length > 0">
        <DynamicTable
          title="Liste des categories"
          :columns="columns"
          :initialData="categorie"
          ref="tableRef"
          @cell-click="handleCellClick"
        />
      </div>
    </div>

    <div>
      <div class="modal-overlay" v-if="!loading && !errorMessage && selectedCategorie">
        <div class="modal-content">
          <DynamicTable
            title="Liste des listes"
            :columns="columnsListe"
            :initialData="liste"
            ref="tableRef"
            @cell-click="handleCellClickListe"
          />
          <div class="action-buttons">
            <button
              @click="closeListe"
              class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-full md:w-auto"
            >
              Retour
            </button>
          </div>
          <div class="action-buttons">
            <button
              v-if="!isModalOpen"
              @click="openModal"
              class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-full md:w-auto"
              :disabled="!selectedCategorie"
            >
              Ajouter une Tache
            </button>
          </div>
        </div>
      </div>
      <div v-if="loading" class="loading-message">Chargement...</div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div v-if="!loading && !errorMessage && categorie.length === 0">Aucune catégorie trouvée</div>

      <div class="modal-overlay" v-if="!loading && !errorMessage && selectedListe">
        <div class="modal-content">
          <DynamicTable
            title="Liste des taches en cours"
            :columns="columnsTache"
            :initialData="tachesEnCours"
            ref="tableRef"
            @update:rows="updateRows"
            @delete-row="(index) => deleteTache(tache[index].IdTache)"
            @save-row="(row) => handleRowSave(row)"
          />
          <div>
            <label>
              <input type="checkbox" v-model="showCompletedTasks"/>
              Afficher les tâches terminées
            </label>
          </div>

          <div v-if = "showCompletedTasks">
            <DynamicTable
              title="Liste des taches terminées"
              :columns="columnsTache"
              :initialData="tachesTerminée"
              ref="tableRef"
              @update:rows="updateRows"
              @delete-row="(index) => deleteTache(tache[index].IdTache)"
              @save-row="(row) => handleRowSave(row)"
            />
          </div>
          <div class="action-buttons">
            <button
              @click="closeTache"
              class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-full md:w-auto"
            >
              Retour
            </button>
          </div>
          <div class="action-buttons">
            <button
              v-if="!isModalOpen"
              @click="openModal"
              class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-full md:w-auto"
              :disabled="!selectedCategorie"
            >
              Ajouter une Tache
            </button>
          </div>
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
  </div>
</template>
<style scoped>
.user-management-container {
  font-family: 'Arial', sans-serif;
  background-color: #f4f6f9;
  display: flex;
  justify-content: center;
  padding: 2rem;
  line-height: 1.6;
  color: #333;
}

.user-management-content {
  background-color: white;
  width: 100%;
  max-width: auto;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

/* Heading Styles */
h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  border-bottom: 3px solid #3498db;
  padding-bottom: 0.5rem;
}

/* Dynamic Table Wrapper */
.dynamic-table-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  overflow-x: hidden; /* Empêche la barre de défilement horizontale */
  width: 100%;
}
table {
  width: 100%; /* Le tableau s'étend sur toute la largeur */
  table-layout: fixed; /* Empêche les colonnes de se redimensionner automatiquement */
}

thead th,
tbody td {
  word-wrap: break-word; /* Assure que les longs mots ou valeurs se cassent si nécessaire */
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #e2e6ea;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.BT {
  display: inline-block;
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.BT:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

.BT:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

/* Loading and Error Messages */
.loading-message {
  color: #3498db;
  font-size: 1.2em;
  text-align: center;
  margin-bottom: 1em;
}

.error-message {
  color: #e74c3c;
  font-size: 1.2em;
  text-align: center;
  margin-bottom: 1em;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content form {
  display: flex;
  flex-direction: column;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.checkbox-group {
  flex-direction: row;
  gap: 1rem;
  align-items: center;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.modal-actions button {
  flex-grow: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-actions button[type='submit'] {
  background-color: #2ecc71;
  color: white;
}

.modal-actions .cancel-button {
  background-color: #e74c3c;
  color: white;
}

/* Responsive Adjustments */
@media screen and (max-width: 600px) {
  .user-management-container {
    padding: 1rem;
  }

  .user-management-content {
    padding: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .BT {
    width: 100%;
  }

  .modal-content {
    width: 90%;
    max-width: none;
    margin: 0 5%;
  }
}
</style>
