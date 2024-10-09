<script setup lang="ts">
import { ref } from 'vue';
import { Todo } from '../models/Todo';


const props = defineProps<{ todo: Todo}>();


const editMode = ref(false);

const newValue = ref(props.todo.label);


const emit = defineEmits(['onInput']);
const onInput = (value: boolean) => {
  console.log('TodoComponent a détecté un changement ', value);
  emit('onInput', { ...props.todo, done: value });
};

const onConfirmText = () => {
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
    <span class="color-box" :class="{ checked: props.todo.done }" @click="editMode = !editMode">
      {{ props.todo.label }}
    </span>
    <input
      class="checkboxs"
      type="checkbox"
      :checked="props.todo.done"
      @click="(event: any) => onInput(event.target?.checked)"
    />
  </span>
  <span v-else>
    <!-- mode edition -->
    <input type="text" v-model="newValue" />
    <button @click="onConfirmText">Confirmer</button>
    <button @click="onCancelText">Annuler</button>
    <br />
  </span>
</template>

<style lang="css" scoped>
.checkboxs {
  width: 20px;
  height: 20px;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: red;
  border: 2px solid #ccc;
  border-radius: 5px;
  vertical-align: -6px;
}

.color-box {
  width: 200px;
  height: 50px;
  border: 2px solid #ccc;
  padding: 10px;
  align-items: center;
  justify-content: center;
  color: rgb(0, 0, 0);
  font-size: 18px;
}

.checkboxs:checked {
  background-color: green;
}

.color-box.checked {
  background-color: green;
  color: white;
}
span.checked {
    margin-left: 50%;
    margin-right: auto;
}
</style>
