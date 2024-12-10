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
  { label: "ID", key: "IdUser" },
  { label: "Nom", key: "NomUser" },
  { label: "Prénom", key: "PrenomUser" },
  { label: "Mail", key: "AdresseMailUser" },
  { label: "Admin", key: "AdminUser", isBoolean: true },
  { label: "Actif", key: "ActifUser", isBoolean: true },
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
  return rows.map(row => {
    const convertedRow = { ...row };
    columns.value.forEach(col => {
      if (col.isBoolean) {
        convertedRow[col.key] = row[col.key] ? 1 : 0; // Convert `true/false` to `1/0`
      }
    });
    return convertedRow;
  });
};

const saveData = async () => {
  if (!tableRef.value) {
    console.error("Référence au tableau introuvable !");
    return;
  }

  const updatedRows = prepareData(tableRef.value.rows || []);
  loading.value = true;
  errorMessage.value = null;

  try {
    const response = await fetch('/api/admin/users/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedRows),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la sauvegarde des données');
    }
    
    alert('Données sauvegardées avec succès !');
    await fetchUsers(); // Refresh data after successful save
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value = error instanceof Error ? error.message : 'Échec de la sauvegarde des données.';
  } finally {
    loading.value = false;
  }
};

  const newUser = ref({
    NomUser: '',
    PrenomUser: '',
    AdresseMailUser: '',
    AdminUser: false,
    ActifUser: true,
  });

  const addUser = async () => {
  try {
    const response = await fetch('/api/admin/users/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser.value), // Utiliser newUser.value pour accéder aux données
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur côté serveur :', errorData);
      throw new Error(errorData.error || 'Erreur lors de l\'ajout de l\'utilisateur');
    }

    const addedUser = await response.json();
    users.value.push(addedUser);
    alert('Utilisateur ajouté avec succès');

    newUser.value = {
      NomUser: '',
      PrenomUser: '',
      AdresseMailUser: '',
      AdminUser: false,
      ActifUser: true,
    };

  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value = error instanceof Error ? error.message : 'Impossible d\'ajouter l\'utilisateur.';
  }
};

</script>


<template>
    <div>
      <h1>Gestion des utilisateurs</h1>
      <div v-if="loading" class="loading-message">Chargement...</div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  
      <DynamicTable
        v-if="!loading && !errorMessage"
        title="Liste des utilisateurs"
        :columns="columns"
        :initialData="users"
        ref="tableRef"
      />
      <button @click="addUser" :disabled="loading">Ajouter un utilisateur</button>
      <button @click="saveData" :disabled="loading">Sauvegarder</button>
    </div>
    <div>
    <h1>Ajouter un nouvel utilisateur</h1>
    <form @submit.prevent="addUser">
      <input v-model="newUser.NomUser" placeholder="Nom" />
      <input v-model="newUser.PrenomUser" placeholder="Prénom" />
      <input v-model="newUser.AdresseMailUser" placeholder="Email" />
      <label>
        Admin:
        <input type="checkbox" v-model="newUser.AdminUser" />
      </label>
      <label>
        Actif:
        <input type="checkbox" v-model="newUser.ActifUser" />
      </label>
      <button type="submit">Ajouter</button>
    </form>
  </div>
  </template>

<style scoped>
.loading-message {
  color: blue;
  font-size: 1.2em;
  margin-bottom: 1em;
}
.error-message {
  color: red;
  font-size: 1.2em;
  margin-bottom: 1em;
}
button:disabled {
  background-color: gray;
  cursor: not-allowed;
}
</style>
