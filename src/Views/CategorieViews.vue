<script setup lang="ts">
import { Categories } from '@/models/Categories';
import { onMounted, ref } from 'vue';
import DynamicForm, { FormField } from '../components/DynamicForm.vue';
import DynamicTable from '../components/DynamicTable.vue';
import { useToast } from 'vue-toastification';
import NavComponent from '@/components/NavComponent.vue';
import { Users } from '@/models/Users';
import { Associer } from '@/models/Associer';
import { Column } from '@/models/Column';

const toast = useToast();


const tableRef = ref<InstanceType<typeof DynamicTable> | null>(null);
const categorie = ref<Categories[]>([]);
const users = ref<Users[]>([]);
const associations = ref<Associer[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);

const columns = ref<Column[]>([
  { label: 'ID', key: 'IdCategorie' },
  { label: 'Nom', key: 'NomCategorie', isClickable: true },
  {
    label: 'Utilisateur',
    key: 'IdUser',
    formatter: (row) => {
      return row.NomUser ? row.NomUser : 'Non défini';
    },
    options: users.value.map((cat) => ({
      value: cat.IdUser,
      label: cat.NomUser
    }))
  }
]);

const associationColumns = ref<Column[]>([
  { label: 'ID Categorie', key: 'IdCategorie', isEditable: false },
  { label: 'ID User', key: 'IdUser', isEditable: false },
  { label: 'Nom Categorie', key: 'NomCategorie', isEditable: false },
  { label: 'Nom User', key: 'NomUser', isEditable: false }
]);

onMounted(async () => {
  await fetchCategorie();
  await fetchassociation();
  await fetchUsers();
  console.log('Categories après fetchCategorie:', categorie.value);
});

const fetchCategorie = async () => {
  loading.value = true;
  errorMessage.value = null;
  try {
    const response = await fetch('/api/admin/categories/get');
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

const fetchassociation = async () => {
  loading.value = true;
  errorMessage.value = null;
  try {
    const response = await fetch('/api/admin/association/get');
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

const fetchUsers = async () => {
  loading.value = true;
  errorMessage.value = null;
  try {
    const response = await fetch('/api/admin/users/get');
    if (!response.ok) throw new Error('Erreur lors de la récupération des données');
    users.value = await response.json();
    updateUsersOptions();
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value = 'Impossible de charger les utilisateurs.';
  } finally {
    loading.value = false;
  }
};
const updateUsersOptions = () => {
  const UsersColumn = columns.value.find((column) => column.key === 'IdUser');
  if (UsersColumn) {
    UsersColumn.options = users.value.map((cat) => ({
      value: cat.IdUser,
      label: cat.NomUser
    }));
  }
};

const addCategorie = async (formData: any) => {
  try {
    console.log('Données du formulaire :', formData);
    const response = await fetch('/api/admin/categories/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur côté serveur :', errorData);
      throw new Error(errorData.error || "Erreur lors de l'ajout de la categorie");
    }

    const addedCategorie = await response.json();
    categorie.value.push(addedCategorie);
    toast.success('Categorie ajouté avec succès');
    closeModal();
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value =
      error instanceof Error ? error.message : "Impossible d'ajouter la categorie.";
  }
};

const deleteCategorie = async (IdCategorie: number) => {
  try {
    const response = await fetch(`/api/admin/categories/delete/${IdCategorie}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la suppression de la categorie');
    }

    // Remove the user from the local list
    categorie.value = categorie.value.filter((categorie) => categorie.IdCategorie !== IdCategorie);

    toast.success('Categorie supprimé avec succès');
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value =
      error instanceof Error ? error.message : 'Impossible de supprimer la categorie.';
  }
};

const deleteAssociation = async (IdCategorie: number, IdUser: number) => {
  try {
    const response = await fetch(`/api/admin/association/delete/${IdCategorie}/${IdUser}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la suppression de l\'association');
    }

    associations.value = associations.value.filter(
      (assoc) => !(assoc.IdCategorie === IdCategorie && assoc.IdUser === IdUser)
    );

    toast.success('Association supprimé avec succès');
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value =
      error instanceof Error ? error.message : "Impossible de supprimer l'association.";
  }
};

const handleRowSave = async (row: any) => {
  loading.value = true;
  errorMessage.value = null;

  try {
    const response = await fetch(`/api/admin/categories/save`, {
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
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value =
      error instanceof Error ? error.message : 'Échec de la sauvegarde de la ligne.';
    toast.error(errorMessage.value);
  } finally {
    loading.value = false;
  }
};

const isAssociationModalOpen = ref(false);
const selectedCategorie = ref<Categories | null>(null);

const openAssociationModal = async (row : any) => {
  selectedCategorie.value = row;
  try {
    const response = await fetch(`/api/admin/association/get/${row.IdCategorie}`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des associations');
    associations.value = await response.json();
    isAssociationModalOpen.value = true;
  } catch (error) {
    console.error('Erreur:', error);
    toast.error('Erreur lors de la récupération des associations');
  }
};

const closeAssociationModal = () => {
  isAssociationModalOpen.value = false;
  selectedCategorie.value = null;
};

const handleCellClick = ( row : any, column : any ) => {
  if (column.key === 'NomCategorie') {
    openAssociationModal(row);
  }
};

const updateRows = (newRows: any[]) => {
  categorie.value = [...newRows];
};

const isModalOpen = ref(false);

function openModal() {
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

const categorieFields: FormField[] = [
  {
    type: 'text',
    name: 'NomCategorie',
    label: 'Nom',
    required: true
  }
];
</script>

<template>
  <NavComponent />
  <div class="user-management-container">
    <div class="user-management-content">
      <h1>Gestion des categories</h1>
      <div class="action-buttons">
        <button v-if="!isModalOpen" @click="openModal" class="BT">Ajouter une categorie</button>
      </div>
      <div v-if="loading" class="loading-message">Chargement...</div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="dynamic-table-wrapper" v-if="!loading && !errorMessage">
        <DynamicTable
          title="Liste des categories"
          :columns="columns"
          :initialData="categorie"
          ref="tableRef"
          @update:rows="updateRows"
          @delete-row="(index) => deleteCategorie(categorie[index].IdCategorie)"
          @save-row="handleRowSave"
          @cell-click="handleCellClick"
        />
      </div>
    </div>
    <div
      v-if="isAssociationModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
        <h2 class="text-xl font-bold mb-4 text-gray-800">
          Associations pour {{ selectedCategorie?.NomCategorie ?? 'Catégorie non sélectionnée' }}
        </h2>
        <DynamicTable
          title="Liste des utilisateurs associés"
          :columns="associationColumns"
          :initialData="associations"
          ref="tableRef"
            @delete-row="(index) => selectedCategorie?.IdCategorie && deleteAssociation(selectedCategorie.IdCategorie, associations[index].IdUser)"
        />
        <button @click="closeAssociationModal" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200">Fermer</button>
      </div>
    </div>

    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h1>Ajouter une nouvelle categorie</h1>
        <DynamicForm
          :fields="categorieFields"
          submit-label="Enregistrer la categorie"
          @submit="addCategorie"
          @cancel="closeModal"
        />
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
