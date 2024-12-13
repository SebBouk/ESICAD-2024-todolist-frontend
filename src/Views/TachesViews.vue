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
  isDate?: boolean;
}

const columns = ref<Column[]>([
  { label: 'ID', key: 'IdTache' },
  { label: 'Nom', key: 'NomTache' },
  { label: 'Echeance', key: 'EcheanceTache', isDate: true },
  { label: 'Creation', key: 'datecreaTache', isBoolean: true },
  { label: 'Mise a jour', key: 'datemajTache', isDate: true },
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
    console.log('Données du formulaire :', formData);
    const response = await fetch('/api/admin/tache/add', {
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
    name: 'EcheanceTache',
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

<style scoped>
/* Global Container Styles */
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
