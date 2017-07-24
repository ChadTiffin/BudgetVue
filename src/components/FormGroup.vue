<template>
	<div class="form-group">
		<label class="control-label" :class="colClass">{{ label }}</label>

		<div :class="fieldClass">
			<slot></slot>
		</div>
	</div>
</template>

<script type="text/javascript">

    	export default {
    		name: "FormGroup",
    		props: ["label","colClass"],
    		methods: {
    			updateValue(value) {
    				this.$emit("input",value)
    			}
    		},
    		computed: {
    			fieldClass () {
    				//Compute the field column size from the label column size
    				let num_cols_arry = this.colClass.split("-")
    				let num_cols = parseInt(num_cols_arry[2])

    				let difference_cols = 12 - num_cols

    				return "col-md-"+difference_cols
    			}
    		}
    	}
</script>