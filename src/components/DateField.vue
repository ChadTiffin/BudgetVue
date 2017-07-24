<template>

	<input type="date" :name="name" v-model="dateVal" class="form-control" :class="extraClasses" v-on:input="updateValue($event.target.value)">

</template>

<script type="text/javascript">
	export default {
		name: "DateField",
		props: ["name","extraClasses","value"],
		computed: {
			dateVal: function(e){
				if (this.value == null) {

					var today = new Date();

					var month = today.getMonth() + 1;
					var year = today.getFullYear();
					var day = today.getDate();

					if (month < 10)
						month = "0" + month;
					if (day < 10)
						day = "0" + day;

					var formatted = year + "-" + month + "-" + day;

					return formatted;
				}
				else
					return this.value
			}
		},
		methods: {
			updateValue(value) {
				this.$emit("input",value)
			}
		}
	}
</script>