<template>
	<div>
		<form class="form-horizontal login-form" v-on:submit="submit" id="login-form" :action="loginUrl">
			<div><i class="fa fa-user-circle-o fa-5x"></i></div>
			<h1>Log In</h1>
			<div class="alert"
				v-if="loginAlert.visible"
				:class="loginAlert.class">
				{{loginAlert.msg}}
			</div>
			<div class="form-group">
				<div class="col-md-12">
					<input type="text" name="email" placeholder="Username/Email" class="form-control">
				</div>
			</div>
			<div class="form-group">
				<div class="col-md-12">
					<input type="password" name="password" placeholder="Password" class="form-control">
				</div>
			</div>
			<button class="btn btn-primary" style="margin-bottom: 10px;">Login</button>
			
			<p><a href="#" v-on:click="passwordResetRequest">I forgot my password</a></p>
		</form>

		<ModalDialog
			title="Password Reset Request" 
			:modal-visible="resetRequest.visible" 
			confirm-button-text="Submit"
			v-on:confirm="submitResetRequest"
			v-on:closeModal="resetRequest.visible = false">
			
			<FormGroup label="Your Email" col-class="col-md-4">
				<input type="email" v-model="resetRequest.email" class="form-control">
			</FormGroup>

			<div class="alert"
				v-if="resetAlert.visible"
				:class="resetAlert.class">
				{{resetAlert.msg}}
			</div>

		</ModalDialog>

		<spinner :spinner-visible="spinnerVisible"></spinner>

	</div>
</template>

<script type="text/javascript">
	import ModalDialog from '../components/ModalDialog'
	import FormGroup from '../components/FormGroup'
	import Spinner from '../components/Spinner'

	export default {
		name: 'Login',
		components: {
			Spinner,
			ModalDialog,
			FormGroup
		},
		data () {
			return {
				loginUrl: window.apiBase+"auth/login",
				resetRequest : {
					visible: false,
					email: "",
				},
				loginAlert: {
					msg: "",
					visible: false,
					class: ""
				},
				resetAlert: {
					msg: "",
					visible: false,
					class: ""
				},
				spinnerVisible: false
			}
		},
		methods: {
			submit: function(e) {
				var vm = this;

				e.preventDefault();

				this.postForm("login-form")
					.then(function(response){
						if (response.status == "success") {
							localStorage.setItem("apiKey",response.apiKey);

							vm.loginAlert.visible = true;
							vm.loginAlert.msg = "Login successful, redirecting..."
							vm.loginAlert.class = "alert-success"

							window.location = "/budget"
						}
						else {
							vm.loginAlert.visible = true;
							vm.loginAlert.msg = response.msg
							vm.loginAlert.class = "alert-danger"
						}
					});
			},
			passwordResetRequest() {
				this.resetRequest.visible = true
			},
			submitResetRequest() {
				let vm = this
				let payload = {
					email: this.resetRequest.email
				}
				this.postData(window.apiBase+"auth/password/reset-request",payload).then(function(response){
					vm.resetAlert.visible = true;
					vm.resetAlert.msg = "Please check your email for password reset instructions"
					vm.resetAlert.class = "alert-success"

					vm.resetRequest.email = ""
				})
			}
		},
		computed: {
			transactionModalVisibleState : function(){
				return this.transactionModalVisible
			}
		},
		created() {
			//log user out
			localStorage.removeItem("apiKey");
		}
	}
</script>

<style type="text/css">
	.login-form {
		text-align: center;
		max-width: 500px;
		margin: auto;
		margin-top: 20px;
		background-color: #fff;
		padding: 20px;
	}
</style>