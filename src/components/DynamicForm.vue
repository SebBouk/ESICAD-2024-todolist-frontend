<script setup lang="ts">
import { ref, computed } from 'vue';

// Types for form field definition
export interface FormField {
  type: 'text' | 'email' | 'number' | 'checkbox' | 'select' | 'textarea' | 'date';
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string | number; label: string }[];
  validation?: (value: any) => string | null;
}

// Props definition
const props = defineProps<{
  fields: FormField[];
  initialData?: Record<string, any>;
  submitLabel?: string;
}>();

// Dynamic form data
const formData = ref<Record<string, any>>(
  props.initialData
    ? { ...props.initialData }
    : props.fields.reduce(
        (acc, field) => {
          acc[field.name] = field.type === 'checkbox' ? false : '';
          return acc;
        },
        {} as Record<string, any>
      )
);

// Validation errors
const errors = ref<Record<string, string>>({});

const validateField = (field: FormField) => {
  if (field.required && !formData.value[field.name]) {
    return `${field.label} est requis`;
  }
  if (field.validation) {
    return field.validation(formData.value[field.name]);
  }
  return null;
};
const validateForm = () => {
  errors.value = {};
  props.fields.forEach((field) => {
    const error = validateField(field);
    if (error) {
      errors.value[field.name] = error;
    }
  });
  return Object.keys(errors.value).length === 0;
};

// Submit handler
const onSubmit = () => {
  if (validateForm()) {
    emit('submit', formData.value);
  }
};

// Cancel handler
const onCancel = () => {
  emit('cancel');
};

// Computed to check if form is valid
const isFormValid = computed(() => {
  return Object.keys(errors.value).length === 0;
});

// Emits definition
const emit = defineEmits<{
  (e: 'submit', data: Record<string, any>): void;
  (e: 'cancel'): void;
}>();
</script>

<template>
  <div class="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
    <form @submit.prevent="onSubmit">
      <div v-for="field in fields" :key="field.name" class="mb-4">
        <label :for="field.name" class="block text-sm font-semibold text-gray-700 mb-2">{{ field.label }}</label>

        <!-- Text Input -->
        <input
          v-if="field.type === 'text' || field.type === 'email' || field.type === 'number'"
          :type="field.type"
          :id="field.name"
          :name="field.name"
          :placeholder="field.placeholder"
          v-model="formData[field.name]"
          :class="{
            'block w-full px-3 py-2 border rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500': true,
            'border-red-500': errors[field.name]
          }"
        />

        <!-- Checkbox Input -->
        <div v-else-if="field.type === 'checkbox'" class="flex items-center mt-2">
          <input
            type="checkbox"
            :id="field.name"
            :name="field.name"
            v-model="formData[field.name]"
            class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label :for="field.name" class="ml-2 text-sm text-gray-700">{{ field.label }}</label>
        </div>

        <!-- Date Input -->
        <input
          v-else-if="field.type === 'date'"
          type="date"
          :id="field.name"
          :name="field.name"
          v-model="formData[field.name]"
          :class="{
            'block w-full px-3 py-2 border rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500': true,
            'border-red-500': errors[field.name]
          }"
        />

        <!-- Select Input -->
        <select
          v-else-if="field.type === 'select'"
          :id="field.name"
          :name="field.name"
          v-model="formData[field.name]"
          :class="{
            'block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500': true,
            'border-red-500': errors[field.name]
          }"
        >
          <option v-for="option in field.options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <!-- Textarea Input -->
        <textarea
          v-else-if="field.type === 'textarea'"
          :id="field.name"
          :name="field.name"
          :placeholder="field.placeholder"
          v-model="formData[field.name]"
          :class="{
            'block w-full px-3 py-2 border rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500': true,
            'border-red-500': errors[field.name]
          }"
        ></textarea>

        <!-- Error Message -->
        <p v-if="errors[field.name]" class="text-red-500 text-xs mt-1">
          {{ errors[field.name] }}
        </p>
      </div>

      <div class="flex justify-between gap-4">
        <button
          type="submit"
          :class="{
            'w-full py-2 px-4 rounded-md font-semibold text-white bg-green-500 hover:bg-green-600 focus:outline-none': true,
            'opacity-50 cursor-not-allowed': !isFormValid
          }"
          :disabled="!isFormValid"
        >
          {{ submitLabel || 'Soumettre' }}
        </button>
        <button
          type="button"
          @click="onCancel"
          class="w-full py-2 px-4 rounded-md font-semibold text-white bg-red-500 hover:bg-red-600 focus:outline-none"
        >
          Annuler
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Le style est désormais géré entièrement par TailwindCSS */
</style>
