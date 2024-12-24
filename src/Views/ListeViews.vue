<script setup lang="ts">
import { Listes } from '@/models/Listes';
import { onMounted, ref, computed } from 'vue';
import DynamicForm, { FormField } from '../components/DynamicForm.vue';
import DynamicTable from '../components/DynamicTable.vue';
import { useToast } from 'vue-toastification';
import NavComponent from '@/components/NavComponent.vue';
import { Categories } from '@/models/Categories';

const toast = useToast();

interface Column {
  label: string;
  key: string;
  isBoolean?: boolean;
  isDate?: boolean;
  options?: { value: string | number; label: string }[];
  activeLabel?: string;
  inactiveLabel?: string;
  formatter?: (row: any) => string;
}
const tableRef = ref<InstanceType<typeof DynamicTable> | null>(null);
const liste = ref<Listes[]>([]);
const categories = ref<Categories[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);



onMounted(async () => {
  await Promise.all([fetchListes(), fetchCategories()]);
  console.log('Listes après fetchListes:', liste.value);
  updateCategoryOptions();
});

const fetchListes = async () => {
  loading.value = true;
  errorMessage.value = null;
  try {
    const response = await fetch('/api/admin/listes/get');
    console.log('Response status:', response.status);
    if (!response.ok) {
      console.error('Fetch failed:', await response.text());
      throw new Error('Erreur lors de la récupération des données');
    }
    const data = await response.json();
    liste.value = data.map((item: any) => ({
      ...item,
      NomCategorie: categories.value.find(
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

const addListe = async (formData: any) => {
  try {
    console.log('Données du formulaire :', formData);
    const response = await fetch('/api/admin/listes/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur côté serveur :', errorData);
      throw new Error(errorData.error || "Erreur lors de l'ajout de la liste");
    }

    const addedListe = await response.json();
    liste.value.push(addedListe);
    toast.success('Liste ajouté avec succès');
    closeModal();
    fetchListes();
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value = error instanceof Error ? error.message : "Impossible d'ajouter la liste.";
  }
};

const deleteListe = async (IdListe: number) => {
  try {
    const response = await fetch(`/api/admin/listes/delete/${IdListe}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la suppression de la liste');
    }

    // Remove the user from the local list
    liste.value = liste.value.filter((liste) => liste.IdListe !== IdListe);

    toast.success('Liste supprimé avec succès');
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value =
      error instanceof Error ? error.message : 'Impossible de supprimer la liste.';
  }
};
const handleRowSave = async (row: any, originalRow: any) => {
  loading.value = true;
  errorMessage.value = null;

  try {
    if (row.listeArchive && row.listeArchive !== originalRow.listeArchive) {
      // Si la liste est archivée, définissez la date d'archivage
      row.dateArchivage = new Date().toISOString(); // Date actuelle au format ISO
    }
    const response = await fetch(`/api/admin/listes/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([row])
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la sauvegarde de la ligne');
    }

    toast.success('Ligne sauvegardée avec succès !');
    await fetchListes();
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value =
      error instanceof Error ? error.message : 'Échec de la sauvegarde de la ligne.';
    toast.error(errorMessage.value);
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await fetch('/api/admin/categories/get');
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des catégories');
    }
    const data = await response.json();
    categories.value = data;
    updateCategoryOptions();
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    errorMessage.value = 'Impossible de charger les catégories.';
  }
};

const updateCategoryOptions = () => {
  const categoryColumn = columns.value.find(column => column.key === 'IdCategorie');
  if (categoryColumn) {
    categoryColumn.options = categories.value.map(cat => ({
      value: cat.IdCategorie,
      label: cat.NomCategorie
    }));
  }
};

const updateRows = (newRows: any[]) => {
  liste.value = [...newRows];
};

const isModalOpen = ref(false);

async function openModal() {
  await fetchCategories();
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

const columns = ref<Column[]>([
  { label: 'ID', key: 'IdListe' },
  { label: 'Nom', key: 'NomListe' },
  { label: 'Creation', key: 'datecreaListe', isDate: true },
  { label: 'Mise a jour', key: 'dateMajListe', isDate: true },
  { label: 'Archivé', key: 'dateArchivage', isDate: true },
  {
    label: 'Etat',
    key: 'listeArchive',
    isBoolean: true,
    activeLabel: 'Archivé',
    inactiveLabel: 'En cours'
  },
  {
    label: 'Categorie',
    key: 'IdCategorie',
    formatter: (row) => {
      const category = categories.value.find((cat) => cat.IdCategorie === row.IdCategorie);
      return category ? category.NomCategorie : 'Non défini';
    },
    options: categories.value.map((cat) => ({
      value: cat.IdCategorie,
      label: cat.NomCategorie
    })), 
  }
]);

const listeFields = computed((): FormField[] => [
  {
    type: 'text',
    name: 'NomListe',
    label: 'Nom',
    required: true
  },
  {
    type: 'text',
    name: 'IdListe',
    label: 'N°',
    required: false,
    placeholder: 'Attribué automatiquement'
  },
  {
    type: 'checkbox',
    name: 'listePerso',
    label: 'Liste personnel ?'
  },
  {
    type: 'select',
    name: 'IdCategorie',
    label: 'Categorie',
    required: true,
    options: categories.value.map((cat) => ({
      value: cat.IdCategorie,
      label: cat.NomCategorie
    }))
  }
]);
</script>

<template>
  <NavComponent />
  <div class="user-management-container">
    <div class="user-management-content">
      <h1>Gestion des listes</h1>
      <div class="action-buttons">
        <button v-if="!isModalOpen" @click="openModal" class="BT">Ajouter une liste</button>
      </div>
      <div v-if="loading" class="loading-message">Chargement...</div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="dynamic-table-wrapper" v-if="!loading && !errorMessage">
        <DynamicTable
          title="Liste des listes"
          :columns="columns"
          :initialData="liste"
          ref="tableRef"
          @update:rows="updateRows"
          @delete-row="(index) => deleteListe(liste[index].IdListe)"
          @save-row="(row, originalRow) => handleRowSave(row, originalRow)"
        />
      </div>
    </div>

    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h1>Ajouter une nouvelle liste</h1>
        <DynamicForm
          :fields="listeFields"
          submit-label="Enregistrer la liste"
          @submit="addListe"
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
