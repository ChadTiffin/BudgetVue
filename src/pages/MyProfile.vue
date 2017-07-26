<template>

	<section>

		<div class="row">
			<div class="col-md-6 avatar">
				<i class="fa fa-user-circle"></i>

			</div>
			<div class="col-md-6">

				<h2>Profile Details</h2>
				<table class="table table-striped">
					<tbody>
						<tr>
							<th>First Name</th>
							<td>{{ user.first_name }}</td>
						</tr>
						<tr>
							<th>Last Name</th>
							<td>{{ user.last_name }}</td>
						</tr>
						<tr>
							<th>Email</th>
							<td>{{ user.email }}</td>
						</tr>
						<tr>
							<th>Username</th>
							<td>{{ user.username }}</td>
						</tr>

					</tbody>
				</table>

				<h2 style="margin-top: 20px;">Change Password</h2>

				<form class="form-horizontal" 
					v-on:submit.prevent="changePassword" 
					id="change-password"
					:action="changePasswordUrl">
					<FormGroup label="Old Password" col-class="col-md-4">
						<input type="password" class="form-control" name="password">
					</FormGroup>
					<FormGroup label="New Password" col-class="col-md-4">
						<input type="password" class="form-control" name="new-password">
					</FormGroup>
					<FormGroup label="Confirm Password" col-class="col-md-4">
						<input type="password" class="form-control" name="confirm-password">
					</FormGroup>

					<button type="submit" class="btn btn-primary pull-right">Change Password</button>
				</form>
			</div>
		</div>

		<spinner :spinner-visible="spinnerVisible"></spinner>

		<!--<ModalDialog
			v-if="confirmDialog.visible" 
			:title="confirmDialog.title" 
			:modal-visible="confirmDialog.visible" 
			:confirm-button-text="confirmDialog.buttonText"
			v-on:confirm="confirmationDialogResponse(true)"
			v-on:closeModal="confirmationDialogResponse(false)">
			{{ confirmDialog.message }}
		</ModalDialog>-->
	</section>

</template>

<script type="text/javascript">
	import Spinner from '../components/Spinner'
	import ModalDialog from '../components/ModalDialog'
	import draggable from 'vuedraggable'
	import FormGroup from '../components/FormGroup'

	export default {
		name: "MyProfile",
		props: ["bankAccounts"],
		components: {
			Spinner,
			ModalDialog,
			draggable,
			FormGroup
		},
		data () {
			return {
				user: {},
				spinnerVisible: false,
				changePasswordUrl: window.apiBase+"auth/password/change",
			}
		},
		methods: {
			changePassword() {
				let vm = this

				this.postForm('change-password').then(function(response){
					
					let alert_msg = "Password changed successfully"
					let alert_class = "alert-success"

					if (response.status == "success") {
						document.getElementById('change-password').reset();
					}
					else {
						alert_msg = response.msg
						alert_class = "alert-danger"
					}

					vm.$emit("alertUpdate",{
						class: alert_class,
						msg: alert_msg,
						visible: true
					})

				})
			},
			fetchUser() {
				let key = localStorage.apiKey
				let vm = this

				this.getJSON(window.apiBase + "user/find/"+key+"/api_key").then(function(response) {
					
					vm.user = response
				})
			}
		},
		created() {
			this.fetchUser()
		}
	}
</script>

<style type="text/css" scoped>

.avatar {
	text-align: center;
}

.avatar i {
	font-size: 140pt
}

</style>

