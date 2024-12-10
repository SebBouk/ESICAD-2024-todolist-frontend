<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DynamicTable from '../components/DynamiqueTable.vue';
import { Users } from '@/models/Users';

interface Column {
  label: string;
  key: string;
  isBoolean?: boolean;
}

const columns = ref<Column[]>([
  { label: 'ID', key: 'IdUser' },
  { label: 'Nom', key: 'NomUser' },
  { label: 'Prénom', key: 'PrenomUser' },
  { label: 'Mail', key: 'AdresseMailUser' },
  { label: 'Admin', key: 'AdminUser', isBoolean: true },
  { label: 'Actif', key: 'ActifUser', isBoolean: true }
]);

const tableRef = ref<InstanceType<typeof DynamicTable> | null>(null);
const users = ref<Users[]>([]);
const loading = ref(false); // État de chargement
const errorMessage = ref<string | null>(null);

onMounted(async () => {
  await fetchUsers();
});

const fetchUsers = async () => {
  loading.value = true;
  errorMessage.value = null;
  try {
    const response = await fetch('/api/admin/users/get');
    if (!response.ok) throw new Error('Erreur lors de la récupération des données');
    users.value = await response.json();
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value = 'Impossible de charger les utilisateurs.';
  } finally {
    loading.value = false;
  }
};

const prepareData = (rows: any[]) => {
  return rows.map((row) => {
    const convertedRow = { ...row };
    columns.value.forEach((col) => {
      if (col.isBoolean) {
        convertedRow[col.key] = row[col.key] ? 1 : 0; // Convert `true/false` to `1/0`
        console.log(`Colonne ${col.key}:`, row[col.key], '=>', convertedRow[col.key]);
      }
    });
    return convertedRow;
  });
};

const saveData = async () => {
  if (!tableRef.value) {
    console.error('Référence au tableau introuvable !');
    return;
  }

  console.log('Rows avant préparation:', tableRef.value.rows);
  
  const updatedRows = prepareData(tableRef.value.rows || []);
  console.log('Rows après préparation:', updatedRows);
  loading.value = true;
  errorMessage.value = null;

  try {
    const response = await fetch('/api/admin/users/save', {
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

    alert('Données sauvegardées avec succès !');
    await fetchUsers(); // Refresh data after successful save
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value =
      error instanceof Error ? error.message : 'Échec de la sauvegarde des données.';
  } finally {
    loading.value = false;
  }
};

const newUser = ref({
  NomUser: '',
  PrenomUser: '',
  AdresseMailUser: '',
  AdminUser: false,
  ActifUser: true
});

const addUser = async () => {
  try {
    const response = await fetch('/api/admin/users/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser.value) // Utiliser newUser.value pour accéder aux données
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur côté serveur :', errorData);
      throw new Error(errorData.error || "Erreur lors de l'ajout de l'utilisateur");
    }

    const addedUser = await response.json();
    users.value.push(addedUser);
    alert('Utilisateur ajouté avec succès');

    newUser.value = {
      NomUser: '',
      PrenomUser: '',
      AdresseMailUser: '',
      AdminUser: false,
      ActifUser: true
    };
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value =
      error instanceof Error ? error.message : "Impossible d'ajouter l'utilisateur.";
  }
};

const updateRows = (newRows: any[]) => {
  users.value = [...newRows];
};

const isModalOpen = ref(false);

function openModal() {
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}
</script>

<template>
  <div class="user-management-container">
    <div class="user-management-content">
      <h1>Gestion des utilisateurs</h1>
      
      <div v-if="loading" class="loading-message">Chargement...</div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      
      <div class="dynamic-table-wrapper" v-if="!loading && !errorMessage">
        <DynamicTable 
          title="Liste des utilisateurs"
          :columns="columns"
          :initialData="users"
          ref="tableRef"
          @update:rows="updateRows"
        />
      </div>
      
      <div class="action-buttons">
        <button @click="saveData" class="BT" :disabled="loading">Sauvegarder</button>
        <button 
          v-if="!isModalOpen"
          @click="openModal"
          class="BT"
        >
          Ajouter un Employé
        </button>
      </div>
    </div>

    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h1>Ajouter un nouvel utilisateur</h1>
        <form @submit.prevent="addUser">
          <div class="form-group">
            <input v-model="newUser.NomUser" placeholder="Nom" />
            <input v-model="newUser.PrenomUser" placeholder="Prénom" />
            <input v-model="newUser.AdresseMailUser" placeholder="Email" />
          </div>
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="newUser.AdminUser" />
              Admin
            </label>
            <label>
              <input type="checkbox" v-model="newUser.ActifUser" />
              Actif
            </label>
          </div>
          <div class="modal-actions">
            <button type="submit" @click="closeModal">Ajouter</button>
            <button 
              type="button"
              @click="closeModal"
              class="cancel-button"
            >
              Annuler
            </button>
          </div>
        </form>
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

.modal-actions button[type="submit"] {
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