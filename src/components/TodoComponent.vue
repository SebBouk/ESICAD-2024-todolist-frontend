<script setup lang="ts">
import { Todo } from '@/models/Todo';
import { ref } from 'vue';

const props = defineProps<{
  todo: Todo;
}>();

const editMode = ref(false);

const newValue = ref(props.todo.label);

const emit = defineEmits(['onInput', 'onDelete']);
const onInput = (value: boolean) => {
  console.log('TodoComponent a détecté un changement ', value);
  emit('onInput', { ...props.todo, done: value });
};

const deleteTodo = () => {
  emit('onDelete');
};

const onConfirmText = () => {
  editMode.value = false;
  emit('onInput', { ...props.todo, label: newValue.value });
};
  editMode.value = false;
  emit('onInput', { ...props.todo, label: newValue.value });
};
const onCancelText = () => {
  editMode.value = false;
  newValue.value = props.todo.label;
};
</script>

<template>
  <span v-if="!editMode">
    <span @click="editMode = !editMode">
      {{ props.todo.label }}
    </span>
    <input
      type="checkbox"
      :checked="props.todo.done"
      @click="(event: any) => onInput(event.target?.checked)"
    />
    <button @click="deleteTodo()">Supprimer</button>
    <br />
  </span>
  <span v-else>
    <!-- mode edition -->
    <input type="text" v-model="newValue" />
    <button @click="onConfirmText">Confirmer</button>
    <button @click="onCancelText">Annuler</button>
    <br />
  </span>
</template>

<style lang="css"></style>
