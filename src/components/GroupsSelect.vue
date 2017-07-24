<template>
	
	<select class="form-control" :name="name" v-on:change="change">
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
			}
		}
	}
</script>