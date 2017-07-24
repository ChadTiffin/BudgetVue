<template>
	<div>
		<form v-if="!changeSuccess" class="form-horizontal password-reset-form" v-on:submit="submit" id="password-reset-form" :action="resetUrl">
			<h1>Reset Your Password</h1>
			<div class="alert"
				v-if="alert.visible"
				:class="alert.class">
				{{alert.msg}}
			</div>
			<FormGroup label="New Password" col-class="col-md-4">
				<input type="password" name="password" class="form-control">
			</FormGroup>
			<FormGroup label="Confirm Password" col-class="col-md-4">
				<input type="password" name="confirm" class="form-control">
			</FormGroup>
			<input type="hidden" name="token" :value="token">
			<button class="btn btn-primary" style="margin-bottom: 10px;">Change Password</button>
			
		</form>
		<div class="success-box" v-if="changeSuccess">
			Password changed successfully. You can now <a href="/login">login</a>
		</div>

	</div>
</template>

<script type="text/javascript">
	import ModalDialog from '../components/ModalDialog'
	import FormGroup from '../components/FormGroup'

	export default {
		name: 'Login',
		components: {
			ModalDialog,
			FormGroup
		},
		data () {
			return {
				resetUrl: window.apiBase+"auth/password/reset",
				token: this.$route.params.token,
				alert: {
					msg: "",
					visible: false,
					class: ""
				},
				changeSuccess: false
			}
		},
		methods: {
			submit: function(e) {
				var vm = this;

				e.preventDefault();

				this.postForm("password-reset-form")
					.then(function(response){
						if (response.status == "success") {
							localStorage.setItem("apiKey",response.apiKey);

							vm.alert.visible = true;
							vm.alert.msg = "Password change successful"
							vm.alert.class = "alert-success"

							vm.changeSuccess = true

						}
						else {
							vm.alert.visible = true;
							vm.alert.msg = response.msg
							vm.alert.class = "alert-danger"
						}
					});
			}
		}
	}
</script>

<style type="text/css">
	.password-reset-form, .success-box {
		text-align: center;
		max-width: 500px;
		margin: auto;
		margin-top: 20px;
		background-color: #fff;
		padding: 20px;
	}

</style>