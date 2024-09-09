<script setup lang="ts">

const props = defineProps<{
    todo: {
        done: boolean,
        todo: string
    }
}>();

const emit = defineEmits(['onInput'])
const onInput = (value: boolean) => {
    console.log('TodoComponent a détecté un changement ', value);
    emit('onInput', value)
}
</script>

<template>
    <span>
        {{ props.todo.todo }}
        <input type="checkbox" :checked="props.todo.done" @click="(event: any) => onInput(event.target?.checked)" />
        <br />
    </span>
</template>

<style lang="css" scoped>
.done {
    color: green;
}
</style>