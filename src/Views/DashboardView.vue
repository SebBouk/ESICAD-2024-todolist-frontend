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
const listePersonnelle = ref<Listes[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const route = useRoute();
const tableRef = ref<InstanceType<typeof DynamicTable> | null>(null);
const selectedCategorie = ref<Categories | null>(null);
const selectedListe = ref<Listes | null>(null);
const tache = ref<Taches[]>([]);
const router = useRouter();
const listeStats = ref(new Map());

const columns = ref<Column[]>([
  { label: 'Nom', key: 'NomCategorie', isClickable: true, isEditable: false, isDelete: false }
]);

const columnsListe = ref<Column[]>([
  { label: 'Nom', key: 'NomListe', isClickable: true, isEditable: false, isDelete: false },
  { label: 'Tâches terminées', key: 'tachesTerminees', isClickable: false, isEditable: false, isDelete: false },
  { label: 'Tâches totales', key: 'totalTaches', isClickable: false, isEditable: false, isDelete: false }  
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

// Modifier la fonction fetchListePersonnelle pour inclure les stats
const fetchListePersonnelle = async () => {
  loading.value = true;
  errorMessage.value = null;
  const IdUser = route.params.IdUser;
  try {
    const response = await fetch(`/api/user/utilisateur/getListePerso/${IdUser}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des données');
    }
    listePersonnelle.value = await response.json();
    
    // Récupérer les stats pour chaque liste
    await Promise.all(
      listePersonnelle.value.map(liste => fetchListeStats(liste.IdListe))
    );
    
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value = 'Impossible de charger les listes personnelles.';
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
    await Promise.all(
      liste.value.map(liste => fetchListeStats(liste.IdListe))
    );
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

const addListe = async (formData: any) => {
  try {
    
    if (!selectedCategorie.value) {
      toast.error('Aucune catégorie sélectionnée');
      return;
    }
      console.log('Données du formulaire :', formData);
    const response = await fetch(`/api/user/utilisateur/listes/add/${selectedCategorie.value.IdCategorie}`, {
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
    closeModalListe();
    fetchListes(selectedCategorie.value.IdCategorie);
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value = error instanceof Error ? error.message : "Impossible d'ajouter la liste.";
  }
};

const addListePerso = async (formData: any) => {
  try {
    const IdUser = route.params.IdUser;
    const response = await fetch(`/api/user/utilisateur/listesPerso/add/${IdUser}`, {
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

    const addedListePerso = await response.json();
    listePersonnelle.value.push(addedListePerso);
    toast.success('Liste ajouté avec succès');
    closeModalPerso();
    fetchListePersonnelle();
  } catch (error) {
    console.error('Erreur :', error);
    errorMessage.value = error instanceof Error ? error.message : "Impossible d'ajouter la liste.";
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

const fetchListeStats = async (IdListe: any) => {
  try {
    const response = await fetch(`/api/user/utilisateur/getListeStats/${IdListe}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
    const stats = await response.json();
    listeStats.value.set(IdListe, stats);
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// Computed property pour combiner les listes avec leurs stats
const listePersonnelleWithStats = computed(() => {
  return listePersonnelle.value.map(liste => ({
    ...liste,
    totalTaches: listeStats.value.get(liste.IdListe)?.totalTaches || 0,
    tachesTerminees: listeStats.value.get(liste.IdListe)?.tachesTerminees || 0
  }));
});

const listeWithStats = computed(() => {
  return liste.value.map(liste => ({
    ...liste,
    totalTaches: listeStats.value.get(liste.IdListe)?.totalTaches || 0,
    tachesTerminees: listeStats.value.get(liste.IdListe)?.tachesTerminees || 0
  }));
});

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
    options: [
      // Options pour les listes de la catégorie sélectionnée
      ...(selectedCategorie.value
        ? liste.value
            .filter((list) => list.IdCategorie === selectedCategorie.value?.IdCategorie)
            .map((list) => ({
              value: list.IdListe,
              label: list.NomListe + ' (Catégorie)'
            }))
        : []),
      // Options pour les listes personnelles
      ...listePersonnelle.value.map((list) => ({
        value: list.IdListe,
        label: list.NomListe + ' (Personnel)'
      }))
    ]
  }
]);

const listeFields = computed((): FormField[] => [
  {
    type: 'text',
    name: 'NomListe',
    label: 'Nom',
    required: true
  }
]);

const isModalOpen = ref(false);
const isModalOpenListe = ref(false);
const isModalOpenPerso = ref(false);

function openModal() {
  isModalOpen.value = true;
}

function openModalPerso() {
  isModalOpenPerso.value = true;
}

function openModalListe() {
  if (!selectedCategorie.value) {
    toast.error("Veuillez sélectionner une catégorie avant d'ajouter une liste");
    return;
  }
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

function closeModalPerso() {
  isModalOpenPerso.value = false;
}

function closeModalListe() {
  isModalOpenListe.value = false;
}

const listePersoFields = computed((): FormField[] => [
  {
    type: 'text',
    name: 'NomListe',
    label: 'Nom',
    required: true
  }
]);

onMounted(async () => {
  await fetchCategorie();
  await fetchListePersonnelle();

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
  <div class="dashboard-container">
    <div class="top-bar">
    <div class="top-bar-content">
      <div class="logout-section">
        <button
          @click="logout"
          class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 w-full md:w-auto"
        >
          Déconnexion
        </button>
      </div>
      <div class="title-section">
        <h1>Dashboard</h1>
        <p>Bienvenue sur le dashboard de l'application.</p>
      </div>
      <div class="spacer"></div> <!-- Pour maintenir la symétrie avec le bouton de déconnexion -->
    </div>
  </div>

    <div class="lists-container">
      <!-- Section Catégories -->
      <div class="list-section">
        <div class="list-content" v-if="!loading && !errorMessage && categorie.length > 0">
          <DynamicTable
            title="Liste des categories"
            :columns="columns"
            :initialData="categorie"
            ref="tableRef"
            @cell-click="handleCellClick"
          />
        </div>
      </div>

      <!-- Section Listes Personnelles -->
      <div class="list-section">
        <div class="list-content" v-if="!loading && !errorMessage">
          <DynamicTable
            title="Listes personnelles"
            :columns="columnsListe"
            :initialData="listePersonnelleWithStats"
            ref="tableRef"
            @cell-click="handleCellClickListe"
          />
          <div class="action-buttons">
            <button v-if="!isModalOpenPerso" @click="openModalPerso" class="BT">
              Ajouter une liste personnelle
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Affichage des listes de la catégorie sélectionnée -->
    <div v-if="!loading && !errorMessage && selectedCategorie" class="modal-like-container">
      <div class="modal-like-content">
        <DynamicTable
          title="Liste des listes"
          :columns="columnsListe"
          :initialData="listeWithStats"
          ref="tableRef"
          @cell-click="handleCellClickListe"
        />
        <div class="action-buttons">
          <button @click="closeListe" class="BT">Retour</button>
          <button 
            v-if="!isModalOpenListe" 
            @click="openModalListe" 
            class="BT" 
            :disabled="!selectedCategorie"
          >
            Ajouter une Liste
          </button>
        </div>
      </div>
    </div>

    <!-- Affichage des tâches -->
    <div v-if="!loading && !errorMessage && selectedListe" class="modal-like-container">
      <div class="modal-like-content">
        <DynamicTable
          title="Liste des taches en cours"
          :columns="columnsTache"
          :initialData="tachesEnCours"
          ref="tableRef"
          @update:rows="updateRows"
          @delete-row="(index) => deleteTache(tache[index].IdTache)"
          @save-row="(row) => handleRowSave(row)"
        />
        
        <div class="checkbox-container">
          <label>
            <input type="checkbox" v-model="showCompletedTasks"/>
            Afficher les tâches terminées
          </label>
        </div>

        <div v-if="showCompletedTasks">
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
          <button @click="closeTache" class="BT">Retour</button>
          <button v-if="!isModalOpen" @click="openModal" class="BT">
            Ajouter une Tache
          </button>
        </div>
      </div>
    </div>

    <!-- Les modals restent exactement les mêmes -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h2>Ajouter une nouvelle tache</h2>
        <DynamicForm
          :fields="tacheFields"
          submit-label="Enregistrer la tache"
          @submit="addTaches"
          @cancel="closeModal"
        />
      </div>
    </div>

    <div v-if="isModalOpenListe" class="modal-overlay">
      <div class="modal-content">
        <h1>Ajouter une nouvelle liste</h1>
        <DynamicForm
          :fields="listeFields"
          submit-label="Enregistrer la liste"
          @submit="formData => addListe(formData)"
          @cancel="closeModalListe"
        />
      </div>
    </div>

    <div v-if="isModalOpenPerso" class="modal-overlay">
      <div class="modal-content">
        <h2>Ajouter une nouvelle liste personnelle</h2>
        <DynamicForm
          :fields="listePersoFields"
          submit-label="Enregistrer la liste"
          @submit="formData => addListePerso(formData)"
          @cancel="closeModalPerso"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  font-family: 'Arial', sans-serif;
  background-color: #f4f6f9;
  padding: 1rem;
  min-height: 100vh;
}

.top-bar {
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.lists-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.list-section {
  flex: 1;
  min-width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.list-content {
  padding: 1rem;
}

.modal-like-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 800px;
  z-index: 900;
}

.modal-like-content {
  background: rgb(255, 255, 255);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  max-height: 80vh;
  overflow-y: auto;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: center;
}

.BT {
  background-color: #3498db;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.BT:hover {
  background-color: #2980b9;
}

.BT:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.checkbox-container {
  margin: 1rem 0;
}

/* Les styles pour les modals restent les mêmes */
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
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

@media screen and (max-width: 768px) {
  .lists-container {
    flex-direction: column;
  }

  .list-section {
    width: 100%;
  }
}
.top-bar {
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.top-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.logout-section {
  flex: 1;
}

.title-section {
  flex: 2;
  text-align: center;
}

.spacer {
  flex: 1;
}

h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
  padding: 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

p {
  color: #666;
  margin: 0;
  font-size: 1rem;
}

@media screen and (max-width: 768px) {
  .top-bar-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .logout-section {
    width: 100%;
    order: 2;
  }
  
  .title-section {
    order: 1;
  }
  
  .spacer {
    display: none;
  }
  
  h1 {
    font-size: 2rem;
  }
}
</style>