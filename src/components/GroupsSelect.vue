<template>
	
	<select class="form-control" :name="name" v-on:change="change" v-on:input="updateValue($event.target.value)">
		<option v-for="group in groups" :value="group.id">{{ group.name }}</option>
	</select>
	
</template>

<script type="text/javascript">
	export default {
		name: "GroupsSelect",
		props: ["name", "groups"],
		methods: {
			change () {
				this.$emit("change")
			},
			updateValue(value) {
				this.$emit("input",value)
			}
		}
	}
</script>