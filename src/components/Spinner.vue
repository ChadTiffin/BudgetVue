<template>
	<div class="spinner" v-if="spinnerVisible"><i class="fa fa-spin fa-spinner fa-4x"></i></div>
</template>

<script type="text/javascript">
	export default {
		name: "Spinner",
		props: ["spinnerVisible"]
	}
</script>

<style type="text/css" scoped>
	.spinner {
		position: fixed;
		top: calc(50% - 40px);
		bottom: 0;
		left: calc(50% - 40px);
		right: 0;
		height: 90px;
		width: 90px;
		padding: 10px;
		padding-top: 17px;
		text-align: center;
		z-index: 1000;
		color: white;
		background: rgba(10,10,10,0.5);
		border-radius: 8px;
		box-shadow: 0 0 10px black;
	}
</style>