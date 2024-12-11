<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from 'vue';

// Types for form field definition
interface FormField {
  type: 'text' | 'email' | 'number' | 'checkbox' | 'select'| 'textarea';
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
    : props.fields.reduce((acc, field) => {
        acc[field.name] = field.type === 'checkbox' ? false : '';
        return acc;
      }, {} as Record<string, any>)
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
  props.fields.forEach(field => {
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
  <div class="dynamic-form">
    <form @submit.prevent="onSubmit">
      <div 
        v-for="field in fields" 
        :key="field.name" 
        class="form-group"
      >
        <label :for="field.name">{{ field.label }}</label>
        
        <!-- Text Input -->
        <input 
          v-if="field.type === 'text' || field.type === 'email' || field.type === 'number'"
          :type="field.type"
          :id="field.name"
          :name="field.name"
          :placeholder="field.placeholder"
          v-model="formData[field.name]"
          :class="{ 'input-error': errors[field.name] }"
        />
        
        <!-- Checkbox Input -->
        <div v-else-if="field.type === 'checkbox'" class="checkbox-group">
          <input 
            type="checkbox"
            :id="field.name"
            :name="field.name"
            v-model="formData[field.name]"
          />
          <label :for="field.name">{{ field.label }}</label>
        </div>
        
        <!-- Select Input -->
        <select 
          v-else-if="field.type === 'select'"
          :id="field.name"
          :name="field.name"
          v-model="formData[field.name]"
          :class="{ 'input-error': errors[field.name] }"
        >
          <option 
            v-for="option in field.options" 
            :key="option.value" 
            :value="option.value"
          >
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
        :class="{ 'input-error': errors[field.name] }"
        ></textarea>

        
        <!-- Error Message -->
        <p 
          v-if="errors[field.name]" 
          class="error-message"
        >
          {{ errors[field.name] }}
        </p>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="submit-btn">
          {{ submitLabel || 'Soumettre' }}
        </button>
        <button 
          type="button" 
          class="cancel-btn" 
          @click="onCancel"
        >
          Annuler
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>

.dynamic-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-group input {
  width: auto;
  margin-right: 10px;
}

.input-error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 0.8em;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.submit-btn,
.cancel-btn {
  flex-grow: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn {
  background-color: #2ecc71;
  color: white;
}

.cancel-btn {
  background-color: #e74c3c;
  color: white;
}

.submit-btn:hover {
  background-color: #27ae60;
}

.cancel-btn:hover {
  background-color: #c0392b;
}
</style>