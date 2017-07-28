<template>

	<select class="form-control" :name="name" v-model="localValue" v-on:change="change" v-on:input="updateValue($event.target.value)">
		<slot></slot>
		<option v-if="includeOffBudget == 'true'" value="2">Off Budget Transaction</option>
		<optgroup v-if="includeIncome" label="Income">
			<option v-for="inc in incomes" :value="inc.source">{{ inc.source }}</option>
			<option value="0">Other Income</option>
		</optgroup>
		<optgroup v-for="group in groups" :label="group.name">
			<option v-for="cat in group.categories" :value="cat.id">{{ cat.description }}</option>
		</optgroup>
	</select>

</template>

<script type="text/javascript">
	export default {
		name: "GroupCategoriesSelect",
		props: ["name", "groups","incomes","value","includeIncome","includeOffBudget"],
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