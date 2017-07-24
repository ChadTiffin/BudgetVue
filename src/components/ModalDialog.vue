<template>
<transition
		name="modalOverlayFade"
		enter-active-class="fadeIn"
		leave-active-class="fadeOut" >

	<div class="modal is-active" v-show="modalVisible">

		<transition
			name="modalShowHide"
			enter-active-class="zoomIn"
			leave-active-class="zoomOut" >

		<div class="modal-dialog" v-show="modalVisible">
			<form class="modal-content form-horizontal" v-on:submit.prevent="confirm" :enctype="formEnctype">
				<div class="modal-header">
					<button type="button" class="close" v-on:click="closeModal"><span aria-hidden="true">&times;</span></button>
					<h2 class="modal-title">{{ title }}</h2>
				</div>
				<div class="modal-body">
					<slot></slot>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-default" v-on:click="closeModal">Cancel</button>
					<button type="submit" class="btn btn-primary" v-if="localSubmitVisible">{{ confirmButtonText }}</button>
				</div>
			</form>
		</div>
		</transition>
	</div>
	</transition>
</template>

<script type="text/javascript">
	export default {
		name: 'ModalDialog',
		props: ['modalVisible','title','confirmButtonText','formAction','formEnctype',"submitVisible"],
		data () {
			return {
				canceled: false,
				confirmed: false,
			}
		},
		computed: {
			localSubmitVisible() {
				if (typeof this.submitVisible == 'undefined')
					return true
				else
					return this.submitVisible
			}
		},
		methods : {
			closeModal () {
				this.$emit("closeModal");
			},
			confirm () {
				this.$emit("confirm")
			}
		}
	}
</script>

<style type="text/css" scoped>
	.modal.is-active {
		background-color: rgba(10,10,10,0.8);
		display: block;
	}

	.modal-content {
		border-radius: 3px;
	}

</style>