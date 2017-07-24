<template>

	<select class="form-control" :name="name" v-on:change="change">
		<option v-for="cat in categories" :value="cat.id">{{ cat.description }}</option>
	</select>

</template>

<script type="text/javascript">
	export default {
		name: "CategoriesSelect",
		props: ["name", "categories"],
		methods: {
			change() {
				this.$emit("change")
			}
		}
	}
</script>