<template>

	<section>

		<p><button class="btn btn-success" v-on:click="newUser"><i class="fa fa-plus"></i> New User</button></p>

		<div style="clear: both;"></div>

		<table class="table table-striped table-condensed">
			<thead>
				<tr>
					<th>First Name</th>
					<th>Last Name</th>
					<th>Username</th>
					<th>Email</th>
					<th>Permissions</th>
					<th>Last Login</th>
					<th>API Key</th>
					<th class="btn-col"></th>
				</tr>	
			</thead>
			<tbody>
				<tr v-for="user in users">
					<td>{{ user.first_name }}</td>
					<td>{{ user.last_name }}</td>
					<td>{{ user.username }}</td>
					<td>{{ user.email }}</td>
					<td>{{ user.user_level }}</td>
					<td>{{ user.last_login }}</td>
					<td>{{ user.api_key }}</td>
					<td>
						<i class="fa fa-fw fa-pencil icon-button" v-on:click="editUser(user)"></i>
						<!--<i class="fa fa-fw fa-remove icon-button"></i>-->
					</td>
				</tr>
			</tbody>
		</table>

		<ModalDialog
			v-show="userDialog.visible" 
			title="Edit User" 
			:modal-visible="userDialog.visible" 
			confirm-button-text="Save"
			v-on:closeModal="userDialog.visible = false"
			v-on:confirm="submitUser">

			<p v-if="userDialog.newUser">
				The user will be emailed a welcome email with their login details.
			</p>

			<FormGroup label="Username" col-class="col-md-3">
				<p class="form-control-static">{{ userDialog.fields.username }}</p>
			</FormGroup>
			
			<FormGroup label="First Name" col-class="col-md-3">
				<input type="text" v-model='userDialog.fields.first_name' name="first_name" class="form-control">
			</FormGroup>

			<FormGroup label="Last Name" col-class="col-md-3">
				<input type="text" v-model='userDialog.fields.last_name' name="last_name" class="form-control">
			</FormGroup>

			<FormGroup label="Email" col-class="col-md-3">
				<input type="text" v-model='userDialog.fields.email' name="email" class="form-control">
			</FormGroup>

			<FormGroup label="Permission" col-class="col-md-3">
				<select class="form-control" v-model="userDialog.fields.user_level" name="user_level">
					<option>Admin</option>
					<option>User</option>
					<option>Suspended</option>
				</select>
			</FormGroup>

			<FormGroup v-if="!userDialog.newUser" label="API Key" col-class="col-md-3">
				<p v-show="userDialog.fields.api_key != ''" class="form-control-static" style="word-break: break-all;">{{ userDialog.fields.api_key }}</p>
				<button class="btn btn-danger" type="button" v-on:click="genNewAPIKey(userDialog.fields.id)"><i class="fa fa-refresh"></i> Generate New API Key</button>
			</FormGroup>

			<div class="alert" :class="userDialog.alert.class" v-if="userDialog.alert.visible">
				{{ userDialog.alert.msg }}
				<p v-if="userDialog.alert.hasErrors" v-for="error in userDialog.alert.errors">
					{{error}}
				</p>
			</div>

			<!--<FormGroup label="Password" col-class="col-md-3">
				<button class="btn btn-danger" type="button" v-on:click="genNewPassword(userDialog.fields.id)"><i class="fa fa-refresh"></i> Reset Password</button>
			</FormGroup>-->
		</ModalDialog>

		<ModalDialog
			v-if="confirmDialog.visible" 
			:title="confirmDialog.title" 
			:modal-visible="confirmDialog.visible" 
			:confirm-button-text="confirmDialog.buttonText"
			v-on:confirm="confirmationDialogResponse(true)"
			v-on:closeModal="confirmationDialogResponse(false)">
			{{ confirmDialog.message }}
		</ModalDialog>

		<spinner :spinner-visible="spinnerVisible"></spinner>
	</section>

</template>

<script type="text/javascript">
	import Spinner from '../components/Spinner'
	import ModalDialog from '../components/ModalDialog'
	import FormGroup from '../components/FormGroup'

	export default {
		name: "AccountManager",
		props: ["bankAccounts"],
		components: {
			Spinner,
			ModalDialog,
			FormGroup
		},
		data () {
			return {
				confirmDialog : {
					visible: false,
					title: "",
					message: "",
					successFunction : "",
					parameters: ""
				},
				userDialog : {
					visible: false,
					newUser: false,
					fields: {},
					alert : {
						visible: false,
						class : "",
						msg: "",
						hasErrors: false,
						errors: []
					}
				},
				spinnerVisible : false,
				users: []
			}
		},
		methods: {
			newUser() {
				this.userDialog.visible = true;
				this.userDialog.newUser = true;
				this.userDialog.fields = {
					last_name: "",
					first_name: "",
					email: "",
					user_level: "User",
					api_key: ""
				}
			},
			editUser(user) {
				this.userDialog.visible = true
				this.userDialog.newUser = false;

				this.userDialog.fields = user
			},
			deleteUser(user) {

			},
			submitUser() {
				let payload = this.userDialog.fields;
				let vm = this

				let url = window.apiBase+"user/save"
				if (this.userDialog.newUser) {
					url = window.apiBase+"user/new"
				}

				this.postData(url,payload).then(function(response){
					
					if (response.status == "success") {
						vm.userDialog.visible = false

						vm.$emit("alertUpdate",{
							class: "alert-success",
							msg: "User details saved",
							visible: true
						})

						vm.fetchUsers()
					}
					else {
						vm.userDialog.alert.visible = true
						vm.userDialog.alert.class = "alert-danger"
						vm.userDialog.alert.msg = response.msg

						if ("errors" in response) {
							vm.userDialog.alert.errors = response.errors
							vm.userDialog.alert.hasErrors = true
						}
					}

				})
			},
			genNewAPIKey(user_id) {
				let vm = this

				let payload = {
					user_id: user_id
				}

				this.postData(window.apiBase + "auth/new-api-key",payload).then(function(response){
					if (response.status == "success")
						vm.userDialog.fields.api_key = response.newKey


				})
			},
			fetchUsers() {
				let vm = this

				this.getJSON(window.apiBase + "user/get").then(function(response) {
					vm.users = response
				})
			}
		},
		created() {
			this.fetchUsers()
		}
	}
</script>

<style type="text/css" scoped>


	@media (max-width: 500px) {

	}
</style>

