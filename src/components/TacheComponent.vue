<script>
// Fonction pour récupérer les tâches de l'utilisateur
async function getTaches() {
  const token = localStorage.getItem('token'); // Récupérer le token depuis le stockage local

  if (!token) {
    alert('Vous devez être connecté pour voir vos tâches');
    return;
  }
  try {
    const response = await fetch('/tache', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`, // Inclure le token dans l'en-tête Authorization
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des tâches.'); // Gestion des erreurs HTTP
    }

    const tasks = await response.json();
    const taskList = document.getElementById('taskList');

    // Vider la liste précédente
    taskList.innerHTML = '';

    // Afficher les tâches
    tasks.forEach((task) => {
      const listItem = document.createElement('li');
      listItem.textContent = task.NomTache; // Supposons que le nom de la tâche est dans le champ NomTache
      taskList.appendChild(listItem);
    });
  } catch (error) {
    console.error('Erreur:', error);
    alert('Impossible de récupérer les tâches.');
  }
}

// Appeler la fonction pour charger les tâches une fois la page chargée
window.onload = getTaches;
</script>
<template>
  <body>
    <h1>Mes Tâches</h1>
    <ul id="taskList">
      <!-- La liste des tâches s'affichera ici -->
    </ul>
  </body>
</template>
