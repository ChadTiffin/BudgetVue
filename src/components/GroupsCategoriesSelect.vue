<template>

	<select class="form-control" :name="name" v-model="localValue" v-on:change="change" v-on:input="updateValue($event.target.value)">
		<option v-if="includeOffBudget == 'true'" value="2">Off Budget Transaction</option>
		<option v-if="includeIncome == 'true'" value="0">Income</option>
		<optgroup v-for="group in groups" :label="group.name">
			<option v-for="cat in group.categories" :value="cat.id">{{ cat.description }}</option>
		</optgroup>
	</select>

</template>

<script type="text/javascript">
	export default {
		name: "GroupCategoriesSelect",
		props: ["name", "groups","value","includeIncome","includeOffBudget"],
		methods: {
			change () {
				this.$emit("change")
			},
			updateValue(value) {
				this.$emit("input",value)
			}
		},
		computed: {
			localValue() {
				return this.value
			}
		}
	}
</script>